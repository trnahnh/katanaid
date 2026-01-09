# KatanaID

AI-integrated authentication toolkit - Open to contribution.

**Checkout the app live:** [katanaid.com](https://katanaid.com)
**Our documentations:** [docs.katanaid.com](https://docs.katanaid.com)

## Tech Stack

- **Frontend:** React
- **Backend:** Go
- **Database:** PostgreSQL

## Development & Contribution
We are open to contribution to the project. Contact us via khiem@sukaseven.com or tran3ah@mail.uc.edu to get invited to the project.  
### Prerequisites

- Node.js 18+
- Go 1.21+
- PostgreSQL (pgAdmin 4)

### Backend

```bash
cd backend
cp .env.example .env  # Copy and configure your env
go run main.go
```

### Frontend
Can either be ran with `npm` or `pnpm`
```bash
cd frontend
cp .env.example .env # Copy and configure your env
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:8080`.