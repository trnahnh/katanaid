# KatanaID - Requirements

## What is it?

A plug-and-play identity toolkit for developers. Auth, avatars, usernames, bot protection - use what you need.

---

## Features

### 1. Auth
Standard auth that just works.
- Email/password signup/login
- Google + GitHub OAuth
- Session management
- Password reset

```html
<script src="https://js.katanaid.com/v1/auth.js" data-site-key="xxx"></script>
<katana-login></katana-login>
```

### 2. AI Avatars
Every user gets a unique generated avatar on signup.
- Multiple styles (anime, pixel, abstract, minimal)
- Regenerate if they don't like it
- API: `POST /api/avatar/generate`

### 3. AI Usernames
Suggest cool usernames when users can't think of one.
- Based on name/email or random
- Returns 5 options
- API: `POST /api/username/suggest`

### 4. Katana CAPTCHA
Bot protection with a blade.
- Slash gesture to verify (quick, memorable)
- "Protected by KatanaID" badge
- Returns risk score, dev decides what to do

```html
<katana-captcha data-site-key="xxx"></katana-captcha>
```

---

## Use it your way

| Need | Use |
|------|-----|
| Full auth flow | Auth + Avatars + Usernames |
| Just bot protection | CAPTCHA only |
| Just avatars for existing auth | Avatars API only |
| Mix and match | Whatever you want |

---

## Pricing

Free. We want traffic, not money.

| Tier | Limits |
|------|--------|
| Free | 10k requests/month |
| Need more? | Ask us |

---

## Tech Stack

- **Frontend:** React (dashboard, components)
- **Backend:** Node or Python
- **AI Avatars:** Replicate API or DiceBear (fallback)
- **AI Usernames:** GPT API or local generation
- **Database:** SQLite → Postgres
- **Hosting:** Vercel + Railway/Fly

---

## MVP Milestones

### Week 1-2: Core
- [ ] Auth flow working (have this mostly)
- [ ] API key generation
- [ ] Basic dashboard

### Week 2-3: AI Features
- [ ] Avatar generation endpoint
- [ ] Username suggestion endpoint
- [ ] Hook into signup flow

### Week 3-4: CAPTCHA
- [ ] Slash gesture widget
- [ ] Scoring logic
- [ ] Verification endpoint

### Week 4+: Polish
- [ ] Landing page with demos
- [ ] Docs
- [ ] Ship it

---

## Success

- Friends/family using it
- 10 external sites within 3 months
- Something real to show on resume

---

## Notes

- Ship fast, iterate later
- Perfect is the enemy of done
- If no one cares in 3 months, pivot or kill it
