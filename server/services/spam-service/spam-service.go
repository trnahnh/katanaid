package spamservice

import (
	"bufio"
	"bytes"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"encoding/json"
	"log"
	"net"
	"net/http"
	"regexp"
	"strings"
	"unicode"

	"katanaid/models"
	"katanaid/util"
)

//go:embed data/disposable_email_blocklist.conf
var blocklist embed.FS

var disposableDomains map[string]bool

func init() {
	disposableDomains = make(map[string]bool)

	data, err := blocklist.ReadFile("data/disposable_email_blocklist.conf")
	if err != nil {
		log.Print("Failed to load disposable email blocklist:", err)
	}

	scanner := bufio.NewScanner(bytes.NewReader(data))
	for scanner.Scan() {
		domain := strings.TrimSpace(scanner.Text())
		if domain != "" && !strings.HasPrefix(domain, "#") {
			disposableDomains[strings.ToLower(domain)] = true
		}
	}

	log.Printf("Loaded %d disposable email domains", len(disposableDomains))
}

type EmailCheckRequest struct {
	Email string `json:"email"`
}

type BulkEmailCheckRequest struct {
	Emails []string `json:"emails"`
}

type EmailCheckResult struct {
	Email      string   `json:"email"`
	RiskScore  float64  `json:"risk_score"`
	Flags      []string `json:"flags"`
	Suggestion string   `json:"suggestion"`
}

type BulkEmailCheckResponse struct {
	Results []EmailCheckResult `json:"results"`
	Summary BulkSummary        `json:"summary"`
}

type BulkSummary struct {
	Total      int `json:"total"`
	Safe       int `json:"safe"`
	Suspicious int `json:"suspicious"`
	Risky      int `json:"risky"`
}

var emailRegex = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

var typosquatPatterns = map[string]string{
	"gmial.com":  "gmail.com",
	"gmal.com":   "gmail.com",
	"gnail.com":  "gmail.com",
	"gamil.com":  "gmail.com",
	"gmail.co":   "gmail.com",
	"yahooo.com": "yahoo.com",
	"yaho.com":   "yahoo.com",
	"hotmal.com": "hotmail.com",
	"hotmai.com": "hotmail.com",
	"outloo.com": "outlook.com",
	"outlok.com": "outlook.com",
}

func CheckEmail(w http.ResponseWriter, r *http.Request) {
	var req EmailCheckRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Email is required"})
		return
	}

	result := analyzeEmail(email)
	util.WriteJSON(w, http.StatusOK, result)
}

func CheckEmailBulk(w http.ResponseWriter, r *http.Request) {
	var req BulkEmailCheckRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}

	if len(req.Emails) == 0 {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "At least one email is required"})
		return
	}

	if len(req.Emails) > 100 {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Maximum 100 emails allowed"})
		return
	}

	results := make([]EmailCheckResult, 0, len(req.Emails))
	summary := BulkSummary{Total: len(req.Emails)}

	for _, email := range req.Emails {
		email = strings.ToLower(strings.TrimSpace(email))
		if email == "" {
			continue
		}

		result := analyzeEmail(email)
		results = append(results, result)

		switch result.Suggestion {
		case "allow":
			summary.Safe++
		case "review":
			summary.Suspicious++
		case "block":
			summary.Risky++
		}
	}

	util.WriteJSON(w, http.StatusOK, BulkEmailCheckResponse{
		Results: results,
		Summary: summary,
	})
}

func analyzeEmail(email string) EmailCheckResult {
	result := EmailCheckResult{
		Email:     email,
		RiskScore: 0.0,
		Flags:     []string{},
	}

	// Validate format
	if !emailRegex.MatchString(email) {
		result.Flags = append(result.Flags, "invalid_format")
		result.RiskScore = 1.0
		result.Suggestion = "block"
		return result
	}

	parts := strings.Split(email, "@")
	localPart := parts[0]
	domain := parts[1]

	// Check disposable domain
	if disposableDomains[strings.ToLower(domain)] {
		result.Flags = append(result.Flags, "disposable")
		result.RiskScore += 0.8
	}

	// Check typosquatting
	if correctDomain, isTypo := typosquatPatterns[domain]; isTypo {
		result.Flags = append(result.Flags, "typosquat:"+correctDomain)
		result.RiskScore += 0.6
	}

	// Check plus addressing
	if strings.Contains(localPart, "+") {
		result.Flags = append(result.Flags, "plus_addressing")
		result.RiskScore += 0.2
	}

	// Check random pattern
	if hasRandomPattern(localPart) {
		result.Flags = append(result.Flags, "random_pattern")
		result.RiskScore += 0.4
	}

	// Check numeric heavy
	if isNumericHeavy(localPart) {
		result.Flags = append(result.Flags, "numeric_heavy")
		result.RiskScore += 0.3
	}

	// Check MX records
	if !hasMXRecords(domain) {
		result.Flags = append(result.Flags, "no_mx_record")
		result.RiskScore += 0.5
	}

	// Cap at 1.0
	if result.RiskScore > 1.0 {
		result.RiskScore = 1.0
	}

	// Set suggestion
	switch {
	case result.RiskScore >= 0.7:
		result.Suggestion = "block"
	case result.RiskScore >= 0.3:
		result.Suggestion = "review"
	default:
		result.Suggestion = "allow"
	}

	return result
}

func hasMXRecords(domain string) bool {
	mxRecords, err := net.LookupMX(domain)
	return err == nil && len(mxRecords) > 0
}

func hasRandomPattern(localPart string) bool {
	cleaned := strings.ReplaceAll(localPart, ".", "")
	cleaned = strings.ReplaceAll(cleaned, "_", "")
	cleaned = strings.ReplaceAll(cleaned, "-", "")

	if len(cleaned) < 8 {
		return false
	}

	vowels := "aeiou"
	consecutiveConsonants := 0
	maxConsecutive := 0

	for _, char := range strings.ToLower(cleaned) {
		if unicode.IsLetter(char) {
			if !strings.ContainsRune(vowels, char) {
				consecutiveConsonants++
				if consecutiveConsonants > maxConsecutive {
					maxConsecutive = consecutiveConsonants
				}
			} else {
				consecutiveConsonants = 0
			}
		}
	}

	return maxConsecutive >= 5
}

func isNumericHeavy(localPart string) bool {
	if len(localPart) < 6 {
		return false
	}

	digitCount := 0
	for _, char := range localPart {
		if unicode.IsDigit(char) {
			digitCount++
		}
	}

	return float64(digitCount)/float64(len(localPart)) > 0.6
}

func HashEmail(email string) string {
	hash := sha256.Sum256([]byte(strings.ToLower(email)))
	return hex.EncodeToString(hash[:])
}
