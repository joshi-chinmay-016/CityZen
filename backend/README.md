# CityZen Backend

Backend API service for CityZen hazard reporting system.

## Owned by Person 2: backend/src/routes, backend/src/controllers, backend/src/services

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
   PORT=5000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Or start production server:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /report` - Add new hazard report
- `GET /reports` - Get all reports
- `GET /stress` - Get overall stress level
- `POST /simulate` - Simulate test reports
- `GET /area-stress` - Get area stress map

## Project Structure

- `src/routes/` - API route handlers
- `src/controllers/` - Business logic controllers
- `src/services/` - External service integrations
- `src/utils/` - Utility functions
- `src/config/` - Configuration files
- `src/constants/` - Application constants
- `src/validators/` - Input validation