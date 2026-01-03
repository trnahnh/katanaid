# KatanaID

Deepfake detection for images and videos.

**Checkout the app live:** [katanaid.com](https://katanaid.com)

## Tech Stack

- **Frontend:** React
- **Backend:** Go
- **Database:** PostgreSQL

## Development & Contributing
We are open to contribution to the project. Contact us via khiem@sukaseven.com or tran3ah@mail.uc.edu to get invited to the project.  
### Prerequisites

- Node.js 18+
- Go 1.21+
- PostgreSQL (pgAdmin 4)

### Backend

```bash
cd backend
cp .env.example .env  # Configure your environment variables
go run main.go
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:8080`.