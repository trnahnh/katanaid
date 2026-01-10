package models

type User struct {
	ID            int
	Username      string
	Email         string
	PasswordHash  string
	EmailVerified bool
}

type SignupRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UsernameGenerationRequest struct {
	Count string `json:"count"`
	Vibe  string `json:"vibe"`
}

// Shared by both login and signup
type AuthSuccessResponse struct {
	Token         string `json:"token"`
	Username      string `json:"username"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
}

type VerificationSuccessResponse struct {
	Message string `json:"message"`
}

type UsernameGenerationSuccessResponse struct {
	Usernames string `json:"usernames"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type AvatarGenerationRequest struct {
	Style  string `json:"style"`
	Traits string `json:"traits"`
}

type AvatarGenerationSuccessResponse struct {
	Image string `json:"image"`
}
