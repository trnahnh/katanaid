package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"katanaid/database"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
)

// OAuth configs
var (
	googleOAuthConfig *oauth2.Config
	githubOAuthConfig *oauth2.Config
	jwtSecret         []byte
)

// In-memory state store (use Redis/DB in production)
var (
	oauthStates = make(map[string]time.Time)
	statesMutex sync.RWMutex
)

// Errors
var (
	ErrInvalidState  = errors.New("invalid OAuth state")
	ErrNoAuthCode    = errors.New("no authorization code received")
	ErrTokenExchange = errors.New("failed to exchange token")
	ErrUserInfoFetch = errors.New("failed to fetch user info")
	ErrNoEmail       = errors.New("no email provided by OAuth provider")
	ErrDatabaseError = errors.New("database operation failed")
	ErrJWTGeneration = errors.New("failed to generate JWT token")
)

// InitOAuth initializes OAuth configs and validates environment
func InitOAuth() error {
	// Validate required environment variables
	requiredVars := []string{
		"GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
		"GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET",
		"FRONTEND_URL", "BACKEND_URL", "JWT_SECRET",
	}

	for _, v := range requiredVars {
		if os.Getenv(v) == "" {
			return fmt.Errorf("missing required environment variable: %s", v)
		}
	}

	// Initialize JWT secret
	jwtSecret = []byte(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) < 32 {
		return errors.New("JWT_SECRET must be at least 32 characters")
	}

	backendURL := os.Getenv("BACKEND_URL")

	// Initialize Google OAuth
	googleOAuthConfig = &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  backendURL + "/auth/google/callback",
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}

	// Initialize GitHub OAuth
	githubOAuthConfig = &oauth2.Config{
		ClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		ClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		RedirectURL:  backendURL + "/auth/github/callback",
		Scopes:       []string{"user:email", "read:user"},
		Endpoint:     github.Endpoint,
	}

	// Start cleanup goroutine for expired states
	go cleanupExpiredStates()

	return nil
}

// generateStateToken creates a cryptographically secure random state token
func generateStateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	state := base64.URLEncoding.EncodeToString(b)

	// Store with 10-minute expiration
	statesMutex.Lock()
	oauthStates[state] = time.Now().Add(10 * time.Minute)
	statesMutex.Unlock()

	return state, nil
}

// validateStateToken checks if state token is valid and removes it
func validateStateToken(state string) bool {
	statesMutex.Lock()
	defer statesMutex.Unlock()

	expiry, exists := oauthStates[state]
	if !exists {
		return false
	}

	delete(oauthStates, state)

	return time.Now().Before(expiry)
}

// cleanupExpiredStates removes expired state tokens every minute
func cleanupExpiredStates() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()
		statesMutex.Lock()
		for state, expiry := range oauthStates {
			if now.After(expiry) {
				delete(oauthStates, state)
			}
		}
		statesMutex.Unlock()
	}
}

// ==================== GOOGLE ====================

// GoogleLogin redirects to Google OAuth
func GoogleLogin(w http.ResponseWriter, r *http.Request) {
	state, err := generateStateToken()
	if err != nil {
		log.Printf("Failed to generate state token: %v", err)
		redirectWithError(w, r, "Internal server error")
		return
	}

	url := googleOAuthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// GoogleCallback handles the OAuth callback from Google
func GoogleCallback(w http.ResponseWriter, r *http.Request) {
	// Validate state parameter
	state := r.URL.Query().Get("state")
	if !validateStateToken(state) {
		log.Printf("Invalid or expired state token")
		redirectWithError(w, r, "Invalid request")
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		log.Printf("No code in Google callback")
		redirectWithError(w, r, "No authorization code received")
		return
	}

	// Exchange code for token with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	token, err := googleOAuthConfig.Exchange(ctx, code)
	if err != nil {
		log.Printf("Google token exchange error: %v", err)
		redirectWithError(w, r, "Failed to exchange token")
		return
	}

	// Get user info from Google
	userInfo, err := fetchGoogleUserInfo(ctx, token)
	if err != nil {
		log.Printf("Failed to get Google user info: %v", err)
		redirectWithError(w, r, "Failed to get user info")
		return
	}

	// Create or get user
	jwtToken, err := findOrCreateOAuthUser(userInfo.Email, userInfo.Name, "google", userInfo.EmailVerified)
	if err != nil {
		log.Printf("Failed to create/find user: %v", err)
		redirectWithError(w, r, "Failed to create user")
		return
	}

	// Redirect to frontend with token
	frontendURL := os.Getenv("FRONTEND_URL")
	http.Redirect(w, r, fmt.Sprintf("%s/auth/callback?token=%s", frontendURL, jwtToken), http.StatusTemporaryRedirect)
}

// GoogleUserInfo represents Google user data
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"verified_email"`
	Name          string `json:"name"`
}

// fetchGoogleUserInfo fetches user info from Google
func fetchGoogleUserInfo(ctx context.Context, token *oauth2.Token) (*GoogleUserInfo, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &oauth2.Transport{
			Source: googleOAuthConfig.TokenSource(ctx, token),
		},
	}

	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var userInfo GoogleUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, fmt.Errorf("failed to parse user info: %w", err)
	}

	if userInfo.Email == "" {
		return nil, ErrNoEmail
	}

	return &userInfo, nil
}

// ==================== GITHUB ====================

// GitHubLogin redirects to GitHub OAuth
func GitHubLogin(w http.ResponseWriter, r *http.Request) {
	state, err := generateStateToken()
	if err != nil {
		log.Printf("Failed to generate state token: %v", err)
		redirectWithError(w, r, "Internal server error")
		return
	}

	url := githubOAuthConfig.AuthCodeURL(state)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// GitHubCallback handles the OAuth callback from GitHub
func GitHubCallback(w http.ResponseWriter, r *http.Request) {
	// Validate state parameter
	state := r.URL.Query().Get("state")
	if !validateStateToken(state) {
		log.Printf("Invalid or expired state token")
		redirectWithError(w, r, "Invalid request")
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		log.Printf("No code in GitHub callback")
		redirectWithError(w, r, "No authorization code received")
		return
	}

	// Exchange code for token with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	token, err := githubOAuthConfig.Exchange(ctx, code)
	if err != nil {
		log.Printf("GitHub token exchange error: %v", err)
		redirectWithError(w, r, "Failed to exchange token")
		return
	}

	// Get user info from GitHub
	userInfo, err := fetchGitHubUserInfo(ctx, token)
	if err != nil {
		log.Printf("Failed to get GitHub user info: %v", err)
		redirectWithError(w, r, "Failed to get user info")
		return
	}

	// Create or get user
	jwtToken, err := findOrCreateOAuthUser(userInfo.Email, userInfo.Name, "github", userInfo.EmailVerified)
	if err != nil {
		log.Printf("Failed to create/find user: %v", err)
		redirectWithError(w, r, "Failed to create user")
		return
	}

	// Redirect to frontend with token
	frontendURL := os.Getenv("FRONTEND_URL")
	http.Redirect(w, r, fmt.Sprintf("%s/auth/callback?token=%s", frontendURL, jwtToken), http.StatusTemporaryRedirect)
}

// GitHubUserInfo represents GitHub user data
type GitHubUserInfo struct {
	ID            int    `json:"id"`
	Login         string `json:"login"`
	Email         string `json:"email"`
	Name          string `json:"name"`
	EmailVerified bool
}

// fetchGitHubUserInfo fetches user info from GitHub
func fetchGitHubUserInfo(ctx context.Context, token *oauth2.Token) (*GitHubUserInfo, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &oauth2.Transport{
			Source: githubOAuthConfig.TokenSource(ctx, token),
		},
	}

	// Get basic user info
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var userInfo GitHubUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, fmt.Errorf("failed to parse user info: %w", err)
	}

	// GitHub email might be private, fetch separately
	if userInfo.Email == "" {
		email, verified := getGitHubEmail(client)
		userInfo.Email = email
		userInfo.EmailVerified = verified
	} else {
		userInfo.EmailVerified = true
	}

	if userInfo.Email == "" {
		return nil, ErrNoEmail
	}

	// Use name or login as username
	if userInfo.Name == "" {
		userInfo.Name = userInfo.Login
	}

	return &userInfo, nil
}

// getGitHubEmail fetches primary verified email from GitHub
func getGitHubEmail(client *http.Client) (string, bool) {
	resp, err := client.Get("https://api.github.com/user/emails")
	if err != nil {
		return "", false
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", false
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", false
	}

	var emails []struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}

	if err := json.Unmarshal(body, &emails); err != nil {
		return "", false
	}

	// Prefer primary verified email
	for _, e := range emails {
		if e.Primary && e.Verified {
			return e.Email, true
		}
	}

	// Fallback to any verified email
	for _, e := range emails {
		if e.Verified {
			return e.Email, true
		}
	}

	return "", false
}

// ==================== HELPERS ====================

// findOrCreateOAuthUser finds existing user or creates new one
func findOrCreateOAuthUser(email, name, provider string, emailVerified bool) (string, error) {
	// Require verified email for security (relaxed for GitHub as their API is inconsistent)
	if !emailVerified && provider != "github" {
		log.Printf("Email not verified: provider=%s, email=%s, verified=%v", provider, email, emailVerified)
		return "", errors.New("email not verified by OAuth provider")
	}

	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return "", ErrNoEmail
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Use transaction to avoid race conditions
	tx, err := database.DB.Begin(ctx)
	if err != nil {
		return "", fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}
	defer tx.Rollback(ctx)

	var userID int
	var username string

	// Check if user exists
	err = tx.QueryRow(ctx,
		"SELECT id, username FROM users WHERE email = $1",
		email,
	).Scan(&userID, &username)

	if err != nil {
		// User doesn't exist, create new one
		// Use OAuth name as username, fallback to email prefix
		username = sanitizeUsername(name)
		if username == "" {
			username = sanitizeUsername(strings.Split(email, "@")[0])
		}

		// Generate secure random token for OAuth users (not a password)
		randomBytes := make([]byte, 32)
		if _, err := rand.Read(randomBytes); err != nil {
			return "", fmt.Errorf("failed to generate random token: %w", err)
		}
		oauthToken := base64.StdEncoding.EncodeToString(randomBytes)

		err = tx.QueryRow(ctx,
			`INSERT INTO users (username, email, password_hash, email_verified)
			 VALUES ($1, $2, $3, TRUE)
			 RETURNING id`,
			username,
			email,
			"oauth:"+provider+":"+oauthToken,
		).Scan(&userID)

		if err != nil {
			return "", fmt.Errorf("%w: %v", ErrDatabaseError, err)
		}

		log.Printf("New OAuth user created: %s (%s) via %s", username, email, provider)
	} else {
		log.Printf("OAuth user logged in: %s (%s) via %s", username, email, provider)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return "", fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	// Generate JWT token
	return generateSignedToken(userID, username, email, true)
}

// sanitizeUsername removes invalid characters from username
func sanitizeUsername(username string) string {
	username = strings.ToLower(username)
	// Keep only alphanumeric and underscore
	var result strings.Builder
	for _, r := range username {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '_' {
			result.WriteRune(r)
		}
	}

	sanitized := result.String()
	if sanitized == "" {
		sanitized = "user"
	}

	return sanitized
}

// redirectWithError redirects to frontend with error message
func redirectWithError(w http.ResponseWriter, r *http.Request, message string) {
	frontendURL := os.Getenv("FRONTEND_URL")
	encodedMessage := url.QueryEscape(message)
	http.Redirect(w, r, fmt.Sprintf("%s/auth/callback?error=%s", frontendURL, encodedMessage), http.StatusTemporaryRedirect)
}
