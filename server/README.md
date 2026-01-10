# KatanaID Backend & Database
Go backend API and PostgreSQL

## Prerequisites

- Go 1.21+
- PostgreSQL

## Setup

1. Create the database

```bash
sudo -u postgres psql
CREATE DATABASE katanaid;
```

2. Create `.env`

See example in `.env.example`

```
DATABASE_URL=postgres://postgres:superpassword123@localhost:5432/katanaid
JWT_SECRET=supersecret123
```

3. Run the server

```bash
cd backend
go run .
```

User table migration included.

## Endpoints

`GET /health` for health check.

`POST /signup` to create a new user.
```json
{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
}
```
`POST /login` to authenticate and receive JWT token
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

Returns:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "message": "Login successful"
}
```