# KatanaID
Deepfake detection for all forms of media

See the app live at: [katanaid.com](https://www.katanaid.com/)

## Development Todos
Anh Tran & Khiem Nguyen
### Backend - Go & PostgreSQL
- [x] Set up health/ - Anh
- [x] Set up login/ - Anh
- [x] Set up signup/ - Anh
- [x] Connect PostgreSQL - Anh
- [x] Connect auth end2end - Anh
- [x] Add endpoint for contact - Anh
- [x] POST /api/upload - Accept image/video/audio file - Anh
- [x] POST /api/analyze - Send file to detection API, return result - Anh
- [x] GET /api/history - List user's past analyses - Anh
- [x] Store analysis results in PostgreSQL - Anh
- [ ] Setup OAuth (Google, GitHub) - Anh

### Frontend - React & Tailwind CSS
- [x] Add landing page - Khiem
- [X] Add navbar - Khiem
- [x] Add login, signup button - Khiem
- [x] Connect login, signup to backend - Khiem
- [x] Add dashboard - Khiem
- [x] Add logout - Khiem
- [ ] Cursor effect on homepage - Khiem
- [ ] Add contact us section - Khiem
- [ ] Build result card component (real/fake, confidence) - Khiem
- [ ] Build history page (/history) - Khiem
- [ ] Dashboard - Display history - Khiem
- [ ] Dashboard - Display user settings - Khiem
- [ ] Add loading state for analysis - Khiem
- [ ] Build upload dropzone component - Khiem
- [ ] Build analysis page (/analyze) - Khiem
- [ ] Add 404 page - Khiem

### AI/ML Integration
- [ ] Research deepfake detection APIs (Sightengine, Sensity, Hive)
- [ ] Sign up for API free tier
- [ ] Integrate detection API with /api/analyze endpoint
- [ ] Support image detection first
- [ ] Add video detection
- [ ] Add audio detection

### Deployment
- [x] Deploy frontend - Khiem
- [ ] Deploy backend - Anh
- [ ] Dockerize backend
- [ ] Dockerize frontend