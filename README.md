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
- [ ] Connect auth end2end - Anh
- [ ] Setup OAuth (Google, GitHub) - Anh
- [ ] Add endpoint for contact - Anh
- [ ] POST /api/upload - Accept image/video/audio file - Anh
- [ ] POST /api/analyze - Send file to detection API, return result - Anh
- [ ] GET /api/history - List user's past analyses - Anh
- [ ] Store analysis results in PostgreSQL - Anh

### Frontend - React & Tailwind CSS
- [x] Add landing page - Khiem
- [X] Add navbar - Khiem
- [x] Add login, signup button - Khiem
- [ ] Add contact us section - Khiem
- [ ] Cursor effect on homepage - Khiem
- [ ] Add 404 page - Khiem
- [ ] Build upload dropzone component - Khiem
- [ ] Build analysis page (/analyze) - Khiem
- [ ] Build result card component (real/fake, confidence) - Khiem
- [ ] Build history page (/history) - Khiem
- [ ] Add loading state for analysis - Khiem

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