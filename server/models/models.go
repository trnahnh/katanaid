package models

type User struct {
	ID            int
	Username      string
	Email         string
	PasswordHash  string
	EmailVerified bool
	FirstName     *string
	LastName      *string
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

// Shared by both login and signup
type AuthSuccessResponse struct {
	Token         string  `json:"token"`
	Username      string  `json:"username"`
	Email         string  `json:"email"`
	EmailVerified bool    `json:"email_verified"`
	FirstName     *string `json:"first_name,omitempty"`
	LastName      *string `json:"last_name,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type UpdateProfileRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type ProfileResponse struct {
	Username      string  `json:"username"`
	Email         string  `json:"email"`
	EmailVerified bool    `json:"email_verified"`
	FirstName     *string `json:"first_name,omitempty"`
	LastName      *string `json:"last_name,omitempty"`
}
