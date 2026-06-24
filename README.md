# Digital Krishi Mytra

Digital Krishi Mytra is a production-oriented MERN smart agricultural advisory platform. It brings weather-aware crop planning, government scheme discovery, community support, and crop-leaf disease screening into a dashboard designed for Indian farmers.

![Digital Krishi Mytra dashboard](client/public/farm-landscape.png)

## Features

- JWT authentication with farmer/admin roles, password reset email flow, protected client routes, and secure password hashing.
- Personal farmer dashboard with activity, crop-health, weather, and recommendation insights.
- Rule-scored crop recommendation engine using soil, land area, water availability, season, and region.
- Weather intelligence UI with seven-day forecast, rain alert, irrigation notes, and field work guidance.
- Searchable government schemes with eligibility tags and bookmarking interface.
- Community forum API with posts, categories, comments model, and secure upvote toggling.
- Disease module with validated image uploads, assessment reports, confidence scores, prevention, and treatment guidance.
- Admin-only analytics and user-management API endpoints.
- Responsive dashboard, dark-ready neutral visual system, charting, loading skeletons, error boundary, toasts, pagination-ready APIs, and deploy manifests.

> The disease result is a deterministic demo workflow intended for portfolio use. Connect a trained vision service before representing it as a clinical or agronomic diagnostic model.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Client | React 18, Vite, Tailwind CSS, React Router, TanStack Query, Axios, React Hook Form, Recharts, jsPDF |
| Server | Node.js, Express, JWT, Bcrypt, Multer, Nodemailer, Zod |
| Database | MongoDB Atlas, Mongoose |
| Hosting | Vercel client, Render API |

## Project Structure

```text
digital-krishi-mytra/
├── client/                 # Vite React application
│   ├── public/             # Production assets
│   └── src/
│       ├── components/     # Shared UI and error boundary
│       ├── context/        # Authentication context
│       ├── lib/            # Axios client and constants
│       └── pages/          # Feature routes
├── server/
│   └── src/
│       ├── config/         # MongoDB configuration
│       ├── controllers/    # MVC controllers
│       ├── middleware/     # Auth, validation, errors, uploads
│       ├── models/         # Mongoose collections
│       ├── routes/         # API routes
│       └── utils/          # Shared helpers
├── render.yaml
└── vercel.json
```

## Local Installation

### 1. Prerequisites

- Node.js 20 or newer
- MongoDB Atlas database
- An SMTP account for password reset emails (Gmail app password, Resend SMTP, Mailtrap, etc.)

### 2. Clone and install

```bash
git clone https://github.com/<your-username>/digital-krishi-mytra.git
cd digital-krishi-mytra
npm install
```

### 3. Configure environment variables

```bash
copy client\.env.example client\.env
copy server\.env.example server\.env
```

Set `MONGODB_URI`, `JWT_SECRET`, and email variables in `server/.env`. Set `VITE_API_URL=http://localhost:5000/api` in `client/.env`.

### 4. Seed schemes and run

```bash
npm run seed --workspace server
npm run dev
```

- Web app: `http://localhost:5173`
- API health check: `http://localhost:5000/api/health`

### Production build

```bash
npm run build
npm run start
```

## MongoDB Atlas Setup

1. Create an Atlas organization, project, and free M0 cluster.
2. Add a database user with a long generated password.
3. In Network Access, permit your local IP while developing. Use `0.0.0.0/0` only for hosted environments when necessary.
4. Click **Connect > Drivers**, copy the Node.js connection URI, replace `<password>`, and set it as `MONGODB_URI`.
5. Run `npm run seed --workspace server` after adding the URI.

## API Documentation

All responses use `{ success, data }` on success and `{ success, message }` on error. Protected routes require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Register farmer |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/auth/forgot-password` | No | Send reset email |
| PATCH | `/api/auth/reset-password/:token` | No | Reset password |
| GET | `/api/dashboard` | Yes | Dashboard overview |
| POST | `/api/recommendations` | Yes | Generate crop recommendations |
| GET | `/api/schemes?search=` | No | List/filter schemes |
| GET / POST | `/api/forum` | GET public, POST yes | List/create discussions |
| PATCH | `/api/forum/:id/upvote` | Yes | Toggle upvote |
| POST | `/api/diseases/detect` | Yes | Analyze `image` file |
| GET | `/api/admin/analytics` | Admin | Admin totals |
| GET | `/api/admin/users` | Admin | Paginated users |

Example recommendation request:

```json
{
  "soilType": "Black soil",
  "landArea": 3,
  "waterAvailability": "Moderate",
  "season": "Kharif",
  "region": "Maharashtra"
}
```

## Deployment

### Render API

1. Push the repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository. `render.yaml` configures the service.
3. Add secret environment variables: `MONGODB_URI`, `CLIENT_URL`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, and `EMAIL_FROM`.
4. Deploy, then copy the Render API URL, such as `https://digital-krishi-mytra-api.onrender.com`.

### Vercel Client

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `client`.
3. Build command: `npm run build`; output directory: `dist`.
4. Add `VITE_API_URL=https://<your-render-service>.onrender.com/api`.
5. Deploy and set the resulting Vercel URL as `CLIENT_URL` on Render.

`vercel.json` keeps React Router routes working on refresh.

## GitHub Setup

```bash
git init
git add .
git commit -m "feat: build Digital Krishi Mytra platform"
git branch -M main
git remote add origin https://github.com/<your-username>/digital-krishi-mytra.git
git push -u origin main
```

Never commit `client/.env`, `server/.env`, real JWT secrets, Atlas passwords, or email credentials.

## Contribution Guide

1. Create a branch: `git checkout -b feat/your-feature`
2. Keep controllers, routes, models, and client features scoped to the module being changed.
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Include a concise description, screen capture for UI work, and test notes in the pull request.

## Screenshot Notes

The interface contains dashboard, crop advisor, weather intelligence, schemes, community, disease detection, and admin console screens. Capture final deployed screenshots and replace this section with your GitHub-hosted image links when publishing your portfolio.

## Roadmap

- Replace deterministic disease screening with a trained image-classification inference service.
- Connect a licensed weather source and regional market-price data provider.
- Add persisted saved schemes, recommendation exports, notifications, full Hindi/Marathi translations, and automated API/client tests.

## License

MIT
