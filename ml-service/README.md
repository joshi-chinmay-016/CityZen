# CityZen ML Service

Machine learning service for hazard detection using YOLOv8.

## Owned by Person 3: ml-service/app

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the service:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Endpoints

- `POST /predict` - Detect hazards in image
- `GET /analytics` - Get hazard analytics
- `GET /heatmap` - Get hazard heatmap

## Project Structure

- `app/routes/` - API route handlers
- `app/services/` - ML model services
- `app/utils/` - Utility functions
- `app/models/` - Trained models
- `app/schemas/` - Pydantic schemas
- `app/constants/` - Constants