# CityZen

AI-powered urban hazard detection and reporting system.

## Architecture

- **Frontend**: React application for user interface
- **Backend**: Node.js/Express API server
- **ML Service**: FastAPI service for AI hazard detection
- **Database**: Firebase Firestore

## Team Ownership

- **Person 1**: frontend/src/components/map, frontend/src/components/reports, frontend/src/hooks
- **Person 2**: backend/src/routes, backend/src/controllers, backend/src/services
- **Person 3**: ml-service/app
- **Person 4**: frontend/src/components/dashboard, frontend integration and polish

## Getting Started

1. Clone the repository
2. Set up each service according to their README files
3. Start services in order: ML Service → Backend → Frontend

## Development Workflow

- Use `develop` branch for development
- Create feature branches from `develop`
- Merge feature branches via pull requests
- Never commit directly to `main`

## Project Structure

```
cityzen/
├── frontend/          # React frontend
├── backend/           # Node.js backend
├── ml-service/        # Python ML service
├── docs/              # Documentation
└── README.md
```