# ☁️ CloudNotes — Cloud Computing Project

A full-stack Notes application built to demonstrate core cloud computing concepts:
REST API design, cloud database hosting (MongoDB Atlas), containerization (Docker),
authentication (JWT), and deployment to a cloud platform (AWS / Render / Heroku / Azure).


#### HOW TO UN THE PROJECT

cd backend
npm install
npm run dev

cd frontend
npx http-server -p 3000

broswer:
http://localhost:3000




---

## 🏗️ Architecture

```
Browser (Frontend: HTML/CSS/JS)
        │  REST API calls (JWT auth)
        ▼
Node.js + Express Backend (hosted on cloud VM / PaaS)
        │  Mongoose ODM
        ▼
MongoDB Atlas (Cloud Database, fully managed)
```

**Cloud computing concepts demonstrated:**
- **IaaS/PaaS deployment** — backend deployed to a cloud compute service (EC2, Render, Heroku, Azure App Service)
- **DBaaS** — MongoDB Atlas as a fully managed cloud database
- **Containerization** — Docker + Docker Compose for portable, reproducible deployment
- **Scalability** — stateless REST API (JWT, no server sessions) so it can scale horizontally behind a load balancer
- **Security** — password hashing (bcrypt), JWT auth, rate limiting, environment-based secrets

---

## 📁 Project Structure

```
notes-app-cloud/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT auth middleware
│   ├── models/
│   │   ├── User.js            # User schema (with password hashing)
│   │   └── Note.js            # Note schema
│   ├── routes/
│   │   ├── auth.js            # /api/auth (register, login, me)
│   │   └── notes.js           # /api/notes (CRUD)
│   ├── .env.example           # Environment variable template
│   ├── package.json
│   └── server.js              # Express app entry point
├── frontend/
│   ├── css/style.css
│   ├── js/app.js              # Calls the backend REST API
│   └── index.html
├── Dockerfile                 # Container image for backend
├── docker-compose.yml         # Runs mongo + backend + frontend together
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup

### 1. Prerequisites
- Node.js 18+
- A MongoDB connection — either:
  - Free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), or
  - Local MongoDB via Docker (see Option B below)

### Option A — Run backend directly with Node

```bash
cd backend
cp .env.example .env
# edit .env and paste your MongoDB Atlas connection string + a JWT secret
npm install
npm run dev        # starts on http://localhost:5000
```

Then open `frontend/index.html` in your browser (or serve it with any static
server, e.g. `npx serve frontend`).

### Option B — Run everything with Docker Compose (recommended)

This spins up MongoDB, the backend API, and the frontend together:

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017 (internal to the containers)

No `.env` file needed for this mode — the compose file sets the environment
variables for you (edit `docker-compose.yml` to change the JWT secret).

---

## ☁️ Deploying to the Cloud

### Step 1 — Database: MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and allow network access (0.0.0.0/0 for testing, or your server's IP for production)
3. Copy the connection string into `MONGO_URI`

### Step 2 — Backend: choose a platform

**Render / Railway / Heroku (easiest — PaaS):**
1. Push this project to a GitHub repo
2. Create a new Web Service, point it at `backend/`
3. Set environment variables (`MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN`)
4. Build command: `npm install` — Start command: `npm start`

**AWS EC2 (IaaS, more hands-on):**
1. Launch an Ubuntu EC2 instance, open port 5000 (or 80/443 behind Nginx)
2. SSH in, install Docker
3. Clone the repo, copy `.env.example` to `.env` and fill in values
4. `docker build -t notes-backend -f Dockerfile .`
5. `docker run -d -p 5000:5000 --env-file backend/.env notes-backend`

**Azure App Service / Google Cloud Run:**
- Both support deploying directly from the included `Dockerfile` — push the
  image to a container registry (ACR / Artifact Registry) and deploy from there.

### Step 3 — Frontend
- Host `frontend/` as a static site on **Netlify**, **Vercel**, **AWS S3 + CloudFront**,
  or **GitHub Pages**.
- Update `API_BASE` in `frontend/js/app.js` to point to your deployed backend URL.

---

## 🔑 API Reference

| Method | Endpoint            | Auth | Description               |
|--------|----------------------|------|----------------------------|
| POST   | `/api/auth/register`| No   | Create a new account       |
| POST   | `/api/auth/login`   | No   | Login, returns JWT         |
| GET    | `/api/auth/me`      | Yes  | Get current user profile   |
| GET    | `/api/notes`        | Yes  | List notes (`?search=&tag=`)|
| GET    | `/api/notes/:id`    | Yes  | Get a single note          |
| POST   | `/api/notes`        | Yes  | Create a note              |
| PUT    | `/api/notes/:id`    | Yes  | Update a note              |
| DELETE | `/api/notes/:id`    | Yes  | Delete a note              |
| GET    | `/api/health`       | No   | Health check                |

Authenticated requests need the header: `Authorization: Bearer <token>`

---

## 🧩 Possible Extensions (for extra credit / depth)
- Add a load balancer + 2 backend replicas to demonstrate horizontal scaling
- Add Redis caching layer for frequently accessed notes
- Add CI/CD pipeline (GitHub Actions) that auto-deploys on push
- Add file/image attachments using cloud object storage (AWS S3)
- Deploy MongoDB replica set for high availability

## 📄 License
MIT — free to use for academic/educational purposes.
