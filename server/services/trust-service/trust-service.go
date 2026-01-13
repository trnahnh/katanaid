package trustservice

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"log"
	"net"
	"net/http"
	"strings"
	"time"

	"katanaid/database"
	"katanaid/models"
	"katanaid/util"
)

// =============================================================================
// CONSTANTS
// =============================================================================

const (
	// Thresholds
	MaxSignupsPerIPPerDay      = 5
	MaxSignupsPerIPPerWeek     = 10
	SuspiciousFingerprintCount = 3

	// Score weights (total = 1.0)
	WeightFingerprint    = 0.35
	WeightIPReputation   = 0.30
	WeightEmailPattern   = 0.20
	WeightBrowserSignals = 0.15
)

// =============================================================================
// TYPES
// =============================================================================

type FingerprintData struct {
	CanvasHash          string `json:"canvas_hash"`
	WebGLHash           string `json:"webgl_hash"`
	AudioHash           string `json:"audio_hash"`
	ScreenResolution    string `json:"screen_resolution"`
	Timezone            string `json:"timezone"`
	Language            string `json:"language"`
	Platform            string `json:"platform"`
	UserAgent           string `json:"user_agent"`
	ColorDepth          int    `json:"color_depth"`
	HardwareConcurrency int    `json:"hardware_concurrency"`
}

type TrustScoreRequest struct {
	Fingerprint FingerprintData `json:"fingerprint"`
	Email       string          `json:"email"`
}

type Signal struct {
	Name   string  `json:"name"`
	Score  float64 `json:"score"`
	Reason string  `json:"reason"`
}

type TrustScoreResponse struct {
	Score          float64  `json:"score"`
	Signals        []Signal `json:"signals"`
	Recommendation string   `json:"recommendation"`
	FingerprintID  string   `json:"fingerprint_id"`
}

// =============================================================================
// HANDLERS
// =============================================================================

func CalculateTrustScore(w http.ResponseWriter, r *http.Request) {
	var req TrustScoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}

	// Get client IP
	ip := getClientIP(r)

	// Generate fingerprint hash
	fingerprintHash := generateFingerprintHash(req.Fingerprint)

	// Calculate individual signal scores
	signals := []Signal{}
	totalScore := 0.0

	// 1. Fingerprint uniqueness check
	fpSignal := checkFingerprintHistory(fingerprintHash)
	signals = append(signals, fpSignal)
	totalScore += fpSignal.Score * WeightFingerprint

	// 2. IP reputation check
	ipSignal := checkIPReputation(ip)
	signals = append(signals, ipSignal)
	totalScore += ipSignal.Score * WeightIPReputation

	// 3. Email pattern check
	emailSignal := checkEmailPattern(req.Email)
	signals = append(signals, emailSignal)
	totalScore += emailSignal.Score * WeightEmailPattern

	// 4. Browser signals check
	browserSignal := checkBrowserSignals(req.Fingerprint)
	signals = append(signals, browserSignal)
	totalScore += browserSignal.Score * WeightBrowserSignals

	// Determine recommendation
	recommendation := "allow"
	if totalScore < 0.3 {
		recommendation = "block"
	} else if totalScore < 0.6 {
		recommendation = "captcha"
	}

	util.WriteJSON(w, http.StatusOK, TrustScoreResponse{
		Score:          totalScore,
		Signals:        signals,
		Recommendation: recommendation,
		FingerprintID:  fingerprintHash[:16], // Short ID for reference
	})
}

func RecordFingerprint(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Fingerprint FingerprintData `json:"fingerprint"`
		UserID      *int            `json:"user_id,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}

	ip := getClientIP(r)
	fingerprintHash := generateFingerprintHash(req.Fingerprint)

	// Store fingerprint
	_, err := database.DB.Exec(
		context.Background(),
		`INSERT INTO device_fingerprints 
		 (fingerprint_hash, user_id, ip_address, user_agent, screen_resolution, timezone, language, platform)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		fingerprintHash,
		req.UserID,
		ip,
		req.Fingerprint.UserAgent,
		req.Fingerprint.ScreenResolution,
		req.Fingerprint.Timezone,
		req.Fingerprint.Language,
		req.Fingerprint.Platform,
	)

	if err != nil {
		log.Print("Error storing fingerprint:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to record"})
		return
	}

	// Update IP signup count
	_, err = database.DB.Exec(
		context.Background(),
		`INSERT INTO ip_signups (ip_address, signup_count, first_signup_at, last_signup_at)
		 VALUES ($1, 1, NOW(), NOW())
		 ON CONFLICT (ip_address) DO UPDATE SET
		 signup_count = ip_signups.signup_count + 1,
		 last_signup_at = NOW()`,
		ip,
	)

	if err != nil {
		log.Print("Error updating IP signups:", err)
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{
		"status":      "recorded",
		"fingerprint": fingerprintHash[:16],
	})
}

// =============================================================================
// SIGNAL CHECKERS
// =============================================================================

func checkFingerprintHistory(hash string) Signal {
	var count int
	err := database.DB.QueryRow(
		context.Background(),
		`SELECT COUNT(*) FROM device_fingerprints WHERE fingerprint_hash = $1`,
		hash,
	).Scan(&count)

	if err != nil {
		return Signal{Name: "fingerprint", Score: 0.5, Reason: "Unable to verify"}
	}

	if count == 0 {
		return Signal{Name: "fingerprint", Score: 1.0, Reason: "New device"}
	}

	if count >= SuspiciousFingerprintCount {
		return Signal{Name: "fingerprint", Score: 0.1, Reason: "Device seen multiple times"}
	}

	// Seen 1-2 times
	score := 1.0 - (float64(count) * 0.3)
	return Signal{Name: "fingerprint", Score: score, Reason: "Device previously seen"}
}

func checkIPReputation(ip string) Signal {
	var signupCount int
	var lastSignup time.Time

	err := database.DB.QueryRow(
		context.Background(),
		`SELECT signup_count, last_signup_at FROM ip_signups WHERE ip_address = $1`,
		ip,
	).Scan(&signupCount, &lastSignup)

	if err != nil {
		// New IP - good sign
		return Signal{Name: "ip_reputation", Score: 1.0, Reason: "New IP address"}
	}

	// Check daily limit
	if time.Since(lastSignup) < 24*time.Hour && signupCount >= MaxSignupsPerIPPerDay {
		return Signal{Name: "ip_reputation", Score: 0.1, Reason: "Too many signups from this IP today"}
	}

	// Check weekly limit
	if time.Since(lastSignup) < 7*24*time.Hour && signupCount >= MaxSignupsPerIPPerWeek {
		return Signal{Name: "ip_reputation", Score: 0.2, Reason: "High signup volume from this IP"}
	}

	// Calculate score based on signup count
	score := 1.0 - (float64(signupCount) * 0.1)
	if score < 0.3 {
		score = 0.3
	}

	return Signal{Name: "ip_reputation", Score: score, Reason: "Known IP with some history"}
}

func checkEmailPattern(email string) Signal {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return Signal{Name: "email_pattern", Score: 0.0, Reason: "Invalid email format"}
	}

	localPart := parts[0]
	domain := parts[1]

	// Check for plus addressing
	if strings.Contains(localPart, "+") {
		return Signal{Name: "email_pattern", Score: 0.4, Reason: "Plus addressing detected"}
	}

	// Check for similar emails in database (Levenshtein-like)
	var similarCount int
	err := database.DB.QueryRow(
		context.Background(),
		`SELECT COUNT(*) FROM device_fingerprints df
		 JOIN users u ON df.user_id = u.id
		 WHERE u.email LIKE $1 AND u.email != $2`,
		localPart[:min(3, len(localPart))]+"%@"+domain,
		email,
	).Scan(&similarCount)

	if err != nil || similarCount == 0 {
		return Signal{Name: "email_pattern", Score: 1.0, Reason: "Unique email pattern"}
	}

	if similarCount >= 3 {
		return Signal{Name: "email_pattern", Score: 0.2, Reason: "Similar emails detected"}
	}

	return Signal{Name: "email_pattern", Score: 0.6, Reason: "Some similar emails exist"}
}

func checkBrowserSignals(fp FingerprintData) Signal {
	score := 1.0
	reasons := []string{}

	// Check for headless browser indicators
	if strings.Contains(strings.ToLower(fp.UserAgent), "headless") {
		score -= 0.5
		reasons = append(reasons, "headless browser")
	}

	// Check for automation tools
	automationKeywords := []string{"phantom", "selenium", "puppeteer", "playwright"}
	for _, keyword := range automationKeywords {
		if strings.Contains(strings.ToLower(fp.UserAgent), keyword) {
			score -= 0.4
			reasons = append(reasons, "automation detected")
			break
		}
	}

	// Check for missing fingerprint components
	if fp.CanvasHash == "" || fp.WebGLHash == "" {
		score -= 0.2
		reasons = append(reasons, "incomplete fingerprint")
	}

	// Check for suspicious hardware
	if fp.HardwareConcurrency == 0 || fp.HardwareConcurrency > 128 {
		score -= 0.1
		reasons = append(reasons, "unusual hardware")
	}

	if score < 0 {
		score = 0
	}

	reason := "Normal browser"
	if len(reasons) > 0 {
		reason = strings.Join(reasons, ", ")
	}

	return Signal{Name: "browser_signals", Score: score, Reason: reason}
}

// =============================================================================
// HELPERS
// =============================================================================

func generateFingerprintHash(fp FingerprintData) string {
	// Combine stable fingerprint components
	data := strings.Join([]string{
		fp.CanvasHash,
		fp.WebGLHash,
		fp.AudioHash,
		fp.ScreenResolution,
		fp.Timezone,
		fp.Platform,
	}, "|")

	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header (for proxies/load balancers)
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		ips := strings.Split(forwarded, ",")
		return strings.TrimSpace(ips[0])
	}

	// Check X-Real-IP header
	realIP := r.Header.Get("X-Real-IP")
	if realIP != "" {
		return realIP
	}

	// Fall back to RemoteAddr
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
