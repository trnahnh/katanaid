# KatanaID - Requirements

## What is it?

A plug-and-play identity toolkit for developers. Auth, avatars, usernames, bot protection.

---

## Internal

### Auth
- [ ] Email verification - **Khiem**
- [ ] Forgot password - Note: build frontend as well **Khiem**
- [ ] Rate limiting frontend `LoginPage` - `SignupPage` - Note: client can send req only upon changing information - add 3 second debounce - **Anh**
- [ ] Rate limiting backend `/login` - `/signup` - Note: Limit password retry attempts - "Too many failed attempts - Please try again later" - **Anh**

### Interface
- [ ] Interface to send contact info via "Contact" - Rate limit as well

### Documentation
- [X] Contribution guide + `/docs/contribution` endpoint

### Chores
- [ ] Find replacement for Hero Image bento

## Features

### 1. Username & AI avatar generation service
Gemini API
We have text fields where we can enter a prompt of 100 words or less for a profile picture and a username, the user would receive the equivalent in return.

For username, the user can select vibes (cool, gamer, gamergirl, anime) or "Give me anything", set the number of usernames they want returned (up to 10 usernames) and receive a list of usernames in return.
The `selections` are from a given list, the `number of username` is between 1 and 10.
- [ ] End point `/identity/username` - POST { selections, number of username } return in either CSV or JSON arrays to be parsed
Similarly, avatar preferences are also selected from a list of stuff.
- [ ] End point `/identity/avatar` - POST { selections } returns image
- [ ] Dashboard card for username prompt & display
- [ ] Dashboard card for avatar prompt & display

### 2. Fraud detection

- [ ] End point --- - POST { prompt + email list }
- [ ] Dashboard card for email list upload

### 3. CAPTCHA
---
End of text