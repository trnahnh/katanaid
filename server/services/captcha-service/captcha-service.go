package captchaservice

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
	"math"
	"net/http"
	"os"
	"time"

	"katanaid/database"
	"katanaid/models"
	"katanaid/util"

	"github.com/golang-jwt/jwt/v5"
)

// =============================================================================
// CONSTANTS
// =============================================================================

type ChallengeType string

const (
	SlashDownLeft     ChallengeType = "slash_down_left"     // ↘ Katana slash
	SlashDownRight    ChallengeType = "slash_down_right"    // ↙ Reverse katana
	SlashUp           ChallengeType = "slash_up"            // ↑ Rising strike
	SlashHorizontal   ChallengeType = "slash_horizontal"    // → Horizontal cut
	SlashDiagonalUp   ChallengeType = "slash_diagonal_up"   // ↗ Upward diagonal
	SlashVerticalDown ChallengeType = "slash_vertical_down" // ↓ Downward strike
)

const (
	SessionExpiry      = 2 * time.Minute
	CaptchaTokenExpiry = 5 * time.Minute
	AngleTolerance     = 35.0 // degrees
	MinDurationMs      = 100
	MaxDurationMs      = 5000
	MinPointCount      = 5
	MinGestureDistance = 50.0 // minimum pixel distance for valid gesture
)

// ChallengeConfig holds the configuration for each challenge type
type ChallengeConfig struct {
	ExpectedAngle float64
	Instruction   string
	Emoji         string
	StartX        float64 // Start position as percentage (0-1)
	StartY        float64
	EndX          float64 // End position as percentage (0-1)
	EndY          float64
}

// Challenge configurations with visual hints
var challengeConfigs = map[ChallengeType]ChallengeConfig{
	SlashDownLeft: {
		ExpectedAngle: 135,
		Instruction:   "Katana slash! Top-right to bottom-left",
		Emoji:         "⚔️",
		StartX:        0.85, StartY: 0.15,
		EndX: 0.15, EndY: 0.85,
	},
	SlashDownRight: {
		ExpectedAngle: 45,
		Instruction:   "Reverse slash! Top-left to bottom-right",
		Emoji:         "🗡️",
		StartX:        0.15, StartY: 0.15,
		EndX: 0.85, EndY: 0.85,
	},
	SlashUp: {
		ExpectedAngle: -90,
		Instruction:   "Rising strike! Bottom to top",
		Emoji:         "⬆️",
		StartX:        0.5, StartY: 0.85,
		EndX: 0.5, EndY: 0.15,
	},
	SlashHorizontal: {
		ExpectedAngle: 0,
		Instruction:   "Horizontal cut! Left to right",
		Emoji:         "➡️",
		StartX:        0.15, StartY: 0.5,
		EndX: 0.85, EndY: 0.5,
	},
	SlashDiagonalUp: {
		ExpectedAngle: -45,
		Instruction:   "Upward strike! Bottom-left to top-right",
		Emoji:         "↗️",
		StartX:        0.15, StartY: 0.85,
		EndX: 0.85, EndY: 0.15,
	},
	SlashVerticalDown: {
		ExpectedAngle: 90,
		Instruction:   "Downward strike! Top to bottom",
		Emoji:         "⬇️",
		StartX:        0.5, StartY: 0.15,
		EndX: 0.5, EndY: 0.85,
	},
}

var challengeTypes = []ChallengeType{
	SlashDownLeft,
	SlashDownRight,
	SlashUp,
	SlashHorizontal,
	SlashDiagonalUp,
	SlashVerticalDown,
}

// =============================================================================
// REQ / RES TYPES
// =============================================================================

type CreateChallengeResponse struct {
	SessionID   string     `json:"session_id"`
	Challenge   string     `json:"challenge"`
	Instruction string     `json:"instruction"`
	Emoji       string     `json:"emoji"`
	Hint        HintConfig `json:"hint"`
	ExpiresIn   int        `json:"expires_in"`
}

type HintConfig struct {
	StartX float64 `json:"start_x"`
	StartY float64 `json:"start_y"`
	EndX   float64 `json:"end_x"`
	EndY   float64 `json:"end_y"`
}

type VerifyRequest struct {
	SessionID  string  `json:"session_id"`
	StartX     float64 `json:"start_x"`
	StartY     float64 `json:"start_y"`
	EndX       float64 `json:"end_x"`
	EndY       float64 `json:"end_y"`
	DurationMs int     `json:"duration_ms"`
	PointCount int     `json:"point_count"`
}

type VerifyResponse struct {
	Success bool   `json:"success"`
	Token   string `json:"token,omitempty"`
}

// =============================================================================
// HANDLERS
// =============================================================================

// CreateChallenge generates a new CAPTCHA challenge
func CreateChallenge(w http.ResponseWriter, r *http.Request) {
	// Generate random session ID
	sessionID, err := generateSessionID()
	if err != nil {
		log.Print("Error generating session ID:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create challenge"})
		return
	}

	// Pick random challenge type
	challengeType := pickRandomChallenge()
	config := challengeConfigs[challengeType]

	// Store in database
	expiresAt := time.Now().Add(SessionExpiry)
	_, err = database.DB.Exec(
		context.Background(),
		`INSERT INTO captcha_sessions (session_id, challenge_type, expected_angle, expires_at) 
		 VALUES ($1, $2, $3, $4)`,
		sessionID, string(challengeType), int(config.ExpectedAngle), expiresAt,
	)
	if err != nil {
		log.Print("Error storing captcha session:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create challenge"})
		return
	}

	util.WriteJSON(w, http.StatusOK, CreateChallengeResponse{
		SessionID:   sessionID,
		Challenge:   string(challengeType),
		Instruction: config.Instruction,
		Emoji:       config.Emoji,
		Hint: HintConfig{
			StartX: config.StartX,
			StartY: config.StartY,
			EndX:   config.EndX,
			EndY:   config.EndY,
		},
		ExpiresIn: int(SessionExpiry.Seconds()),
	})
}

// VerifyChallenge validates the user's gesture
func VerifyChallenge(w http.ResponseWriter, r *http.Request) {
	var req VerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}

	// Validate request fields
	if req.SessionID == "" {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Session ID required"})
		return
	}

	// Fetch session from database
	var challengeType string
	var expectedAngle int
	var expiresAt time.Time
	var used bool

	err := database.DB.QueryRow(
		context.Background(),
		`SELECT challenge_type, expected_angle, expires_at, used 
		 FROM captcha_sessions WHERE session_id = $1`,
		req.SessionID,
	).Scan(&challengeType, &expectedAngle, &expiresAt, &used)

	if err != nil {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Invalid session"})
		return
	}

	// Check if already used
	if used {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Session already used"})
		return
	}

	// Check if expired
	if time.Now().After(expiresAt) {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Session expired"})
		return
	}

	// Mark as used immediately to prevent replay attacks
	_, err = database.DB.Exec(
		context.Background(),
		`UPDATE captcha_sessions SET used = TRUE WHERE session_id = $1`,
		req.SessionID,
	)
	if err != nil {
		log.Print("Error marking session as used:", err)
	}

	// Validate gesture
	validationError := validateGesture(req, float64(expectedAngle))
	if validationError != "" {
		util.WriteJSON(w, http.StatusOK, VerifyResponse{Success: false})
		return
	}

	// Generate verification token
	token, err := generateCaptchaToken(req.SessionID)
	if err != nil {
		log.Print("Error generating captcha token:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Verification failed"})
		return
	}

	util.WriteJSON(w, http.StatusOK, VerifyResponse{
		Success: true,
		Token:   token,
	})
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

func validateGesture(req VerifyRequest, expectedAngle float64) string {
	// Check duration (human-like timing)
	if req.DurationMs < MinDurationMs {
		return "too_fast"
	}
	if req.DurationMs > MaxDurationMs {
		return "too_slow"
	}

	// Check point count (bots often have very few points)
	if req.PointCount < MinPointCount {
		return "insufficient_points"
	}

	// Check gesture distance
	distance := calculateDistance(req.StartX, req.StartY, req.EndX, req.EndY)
	if distance < MinGestureDistance {
		return "gesture_too_short"
	}

	// Check angle
	actualAngle := calculateAngle(req.StartX, req.StartY, req.EndX, req.EndY)
	angleDiff := normalizeAngleDiff(actualAngle, expectedAngle)

	if angleDiff > AngleTolerance {
		return "wrong_direction"
	}

	return ""
}

func calculateAngle(startX, startY, endX, endY float64) float64 {
	deltaX := endX - startX
	deltaY := endY - startY
	radians := math.Atan2(deltaY, deltaX)
	degrees := radians * (180 / math.Pi)
	return degrees
}

func calculateDistance(startX, startY, endX, endY float64) float64 {
	deltaX := endX - startX
	deltaY := endY - startY
	return math.Sqrt(deltaX*deltaX + deltaY*deltaY)
}

func normalizeAngleDiff(angle1, angle2 float64) float64 {
	diff := math.Abs(angle1 - angle2)
	if diff > 180 {
		diff = 360 - diff
	}
	return diff
}

// =============================================================================
// UTILITY HELPERS
// =============================================================================

func generateSessionID() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func pickRandomChallenge() ChallengeType {
	bytes := make([]byte, 1)
	rand.Read(bytes)
	return challengeTypes[int(bytes[0])%len(challengeTypes)]
}

func generateCaptchaToken(sessionID string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"type":       "captcha_verified",
		"session_id": sessionID,
		"iat":        time.Now().Unix(),
		"exp":        time.Now().Add(CaptchaTokenExpiry).Unix(),
	})
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
