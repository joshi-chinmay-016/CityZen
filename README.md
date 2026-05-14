# 🚦 CityZen

**AI-Powered Smart Road Safety & Safe Navigation Platform**

CityZen is a smart-city road intelligence platform designed to detect, visualize, and avoid hazardous road conditions such as potholes, cracks, and open manholes using AI-powered analysis, crowdsourced reporting, and geospatial visualization.

---

## 🌍 Problem Statement

Urban road infrastructure issues such as potholes, road cracks, and open manholes are major causes of:

- Vehicle damage
- Traffic slowdowns
- Road accidents
- Unsafe navigation
- Increased maintenance costs

Traditional reporting systems are:
- Slow
- Manual
- Difficult to scale
- Lacking real-time visualization

**CityZen solves this problem** using AI-powered detection, live map intelligence, and hazard-aware route analysis.

---

## 💡 Key Features

### 🚧 Hazard Detection & Classification
- **Detects:** Potholes, Road Cracks, Open Manholes
- **Technology:** YOLOv8-based ML classification
- **Includes:** Confidence scoring and severity mapping

### 🗺️ Interactive Smart Map
Built with React Leaflet and OpenStreetMap
- Live map interaction with hazard markers
- Custom hazard icons for different severity levels
- Current location tracking
- Real-time hazard overlays

### 🔥 Heatmap Visualization
- Visualizes hazard density across regions
- Identifies high-risk roads and dense hazard zones
- Highlights stress-heavy travel corridors

### 🛣️ Safe Route Intelligence
- Stress-aware route visualization
- Route stress scoring and analysis
- Safer navigation suggestions
- Hazard-aware route analysis

### 📍 Real-Time Location Tracking
- Browser geolocation integration
- Centered map navigation
- Dynamic route interaction

---

## 🧠 Tech Stack

### Frontend
- **Framework:** Next.js 15 with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Mapping:** React Leaflet, Leaflet, Leaflet Heat
- **HTTP:** Axios
- **UI Components:** Lucide React, Framer Motion, React Hot Toast
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** Google Firestore
- **Auth & Cloud:** Firebase Admin SDK
- **HTTP Utilities:** Axios, CORS

### Machine Learning Service
- **Language:** Python 3.8+
- **Framework:** FastAPI with Uvicorn
- **ML Model:** YOLOv8 (Ultralytics)
- **Computer Vision:** OpenCV
- **Dependencies:** NumPy
- **Cloud:** Firebase Admin SDK for data storage

### Mapping & Geospatial
- **Base Map:** OpenStreetMap
- **Visualization:** Leaflet.js
- **Heatmap:** Leaflet.heat

---

## 🏗️ System Architecture

```
┌─────────────────┐
│   User/Vehicle  │
└────────┬────────┘
         │
┌────────▼──────────────────────┐
│  Frontend (Next.js + Leaflet)  │
│  - Interactive Map             │
│  - Route Planning              │
│  - Report Upload               │
└────────┬──────────────────────┘
         │ (HTTPS/REST API)
         │
┌────────▼──────────────────────┐
│  Backend (Node.js + Express)   │
│  - Report Management           │
│  - Route Intelligence          │
│  - Heatmap Data                │
│  - API Gateway                 │
└────────┬──────────────────────┘
         │
    ┌────┴────┐
    │          │
┌───▼──┐  ┌───▼──────────────────────┐
│      │  │  ML Service (FastAPI)    │
│      │  │  - YOLO Classification   │
│      │  │  - Severity Mapping      │
│      │  │  - Analytics             │
│      │  │  - Heatmap Generation    │
│      │  └───┬──────────────────────┘
│      │      │
│      │      │ (Predictions + Heatmaps)
│      │      │
│FS DB │◄─────┘
│      │
└──────┘
```

---

## 📂 Project Structure

```
CityZen/
│
├── 📁 frontend/                    # Next.js React App
│   ├── src/
│   │   ├── app/                    # Next.js app directory
│   │   ├── components/             # React components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API & service integrations
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── lib/                    # Utilities & libraries
│   │   └── styles/                 # CSS & styling
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
│
├── 📁 backend/                     # Express.js API Server
│   ├── src/
│   │   ├── routes/                 # API route handlers
│   │   ├── services/               # Business logic
│   │   ├── controllers/            # Request controllers
│   │   ├── middleware/             # Express middleware
│   │   ├── config/                 # Configuration files
│   │   ├── constants/              # Constants
│   │   ├── utils/                  # Helper functions
│   │   ├── validators/             # Input validators
│   │   └── app.js / server.js      # Express app setup
│   ├── package.json
│   └── .env                        # Environment variables
│
├── 📁 ml-service/                  # FastAPI ML Service
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── routes/                 # API endpoints
│   │   ├── services/               # ML inference logic
│   │   ├── schemas/                # Pydantic models
│   │   ├── models/                 # YOLO model files
│   │   ├── constants/              # ML constants
│   │   └── config/                 # Configuration
│   ├── requirements.txt            # Python dependencies
│   ├── main.py                     # Entry point
│   └── venv/                       # Virtual environment
│
├── 📁 docs/                        # Documentation
│   ├── api/                        # API documentation
│   ├── architecture/               # Architecture docs
│   ├── presentation/               # Presentations
│   └── screenshots/                # UI screenshots
│
├── serviceAccountKey.json          # Firebase credentials
├── TEAM_OWNERSHIP.md               # Team assignments
└── package.json                    # Root dependencies
```

---

## 🔄 Core Workflows

### Hazard Reporting Flow

```
User reports hazard (image/location)
            ↓
Frontend validates & sends to backend
            ↓
Backend validates request
            ↓
ML service analyzes image (YOLO)
            ↓
Confidence & severity calculated
            ↓
Hazard record stored in Firestore
            ↓
Map & Heatmap updated in real-time
            ↓
Frontend displays new hazard marker
```

### Safe Route Planning Flow

```
User selects source + destination
            ↓
Backend fetches hazards in region
            ↓
Route engine analyzes stress points
            ↓
Hazard avoidance scoring applied
            ↓
Multiple routes ranked by safety
            ↓
Safer route visualized on map
            ↓
User navigates with hazard alerts
```

---

## 📌 API Response Examples

### Hazard Prediction Response

```json
{
  "predictions": [
    {
      "id": "pred_12345",
      "latitude": 12.9352,
      "longitude": 77.6245,
      "hazard_type": "pothole",
      "severity": "high",
      "confidence": 0.98,
      "timestamp": "2026-05-14T10:30:00Z"
    }
  ]
}
```

### Heatmap Data Response

```json
[
  [12.9352, 77.6245, 0.85],
  [12.9360, 77.6255, 0.65],
  [12.9345, 77.6240, 0.45]
]
```

---

# 🚀 Installation & Setup Guide

## Prerequisites

- **Node.js** 18+ (for frontend & backend)
- **Python** 3.8+ (for ML service)
- **npm** or **yarn** (for Node dependencies)
- **Firebase Project** with Firestore enabled
- **Git** (for version control)

---

## Step 1️⃣: Clone Repository

```bash
git clone https://github.com/joshi-chinmay-016/CityZen.git
cd CityZen
```

---

## Step 2️⃣: Frontend Setup

### Navigate to Frontend Directory

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
```

### Create Environment File

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Run Frontend Development Server

```bash
npm run dev
```

**Frontend will be available at:** `http://localhost:3000`

---

## Step 3️⃣: Backend Setup

### Navigate to Backend Directory

```bash
cd ../backend
```

### Install Dependencies

```bash
npm install
```

### Configure Firebase Credentials

1. Get `serviceAccountKey.json` from Firebase Console
2. Place it in the `backend/` directory
3. Ensure `.gitignore` includes `serviceAccountKey.json`

### Create Environment File

Create `backend/.env`:

```env
PORT=5000
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

### Run Backend Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

**Backend API will be available at:** `http://localhost:5000`

---

## Step 4️⃣: ML Service Setup

### Navigate to ML Service Directory

```bash
cd ../ml-service
```

### Create Python Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Download YOLOv8 Model

The model file (`best.pt`) should be placed in `ml-service/app/models/`

### Run ML Service

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**ML Service will be available at:** `http://localhost:8000`

**API Documentation:** `http://localhost:8000/docs`

---

## 🔐 Environment Variables Reference

### Frontend (`frontend/.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Optional: Analytics/Tracking
# NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Backend (`backend/.env`)

```env
# Server Configuration
PORT=5000

# Firebase Configuration
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# Optional: Database Configuration
# FIRESTORE_COLLECTION=hazards
```

### ML Service (`ml-service/.env`)

```env
# FastAPI Configuration
UVICORN_HOST=0.0.0.0
UVICORN_PORT=8000

# Model Configuration
MODEL_PATH=app/models/best.pt
```

---

## 🛡️ .gitignore Configuration

Ensure your root `.gitignore` contains:

```gitignore
# Dependencies
node_modules/
venv/
env/
*.egg-info/

# Environment Files
.env
.env.local
.env.*.local

# Firebase & Credentials
serviceAccountKey.json
google-credentials.json

# IDE & OS
.vscode/
.idea/
*.swp
.DS_Store
Thumbs.db

# Build Output
.next/
dist/
build/
__pycache__/

# Python Cache
*.pyc
*.pyo
*.pyd
*.egg

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# ML Models (Large Files)
*.h5
*.pkl
*.pt
models/
```

---

## ✅ Verification Checklist

After setup, verify all services are running:

### 1. Frontend Verification

```bash
curl http://localhost:3000
# Should return Next.js app HTML
```

### 2. Backend Health Check

```bash
curl http://localhost:5000/health
# Should return: {"status": "healthy"}
```

### 3. ML Service Health Check

```bash
curl http://localhost:8000/
# Should return: {"message": "CityZen ML Service is running"}
```

### 4. ML Service API Documentation

Visit: `http://localhost:8000/docs`

Should display interactive FastAPI Swagger UI with all endpoints.

---

## 🧪 Testing the Full Pipeline

### Step 1: Report a Hazard

```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 12.9352,
    "longitude": 77.6245,
    "description": "Pothole on road"
  }'
```

### Step 2: Fetch Hazards

```bash
curl http://localhost:5000/api/reports
```

### Step 3: View Heatmap

Visit: `http://localhost:3000/dashboard`

Should display interactive map with hazard markers.

---

## 📊 Current Functionalities

### ✅ Working Features

- ✓ Hazard detection with YOLO classification
- ✓ Multi-severity hazard reporting
- ✓ Firestore database integration
- ✓ Real-time heatmap visualization
- ✓ Custom hazard icons & markers
- ✓ Current location tracking
- ✓ Route visualization on map
- ✓ Frontend-backend API integration
- ✓ Modular routing architecture
- ✓ Severity analysis & scoring
- ✓ Safe route UI & visualization
- ✓ CORS-enabled API access

---

## ⚠️ Known Limitations

- Safe routing currently visualizes stress-aware routes based on historical data
- Graph-optimized hazard-aware pathfinding is under development
- Passive detection system (dashcam integration) is planned for future release
- Real-time traffic updates not yet integrated

---

## 🔮 Planned Improvements

### Phase 2: Advanced Features

#### Passive Detection Ecosystem
- Dashcam scanning integration
- Delivery fleet vehicle scanning
- Municipal vehicle integration
- Automated road surveillance

#### Advanced Safe Routing
- Real road network graph optimization
- Dijkstra-based hazard-aware pathfinding
- Dynamic road weighting algorithm
- Shortest-safe-path implementation

#### Real-Time Features
- Live traffic integration
- Weather-based route adaptation
- Incident reporting & alerts
- User behavior analytics

---

## 🐛 Troubleshooting

### Frontend Issues

**Problem:** Port 3000 already in use
```bash
# Kill the process on port 3000
# Windows: netstat -ano | findstr :3000
# Linux: lsof -i :3000
```

**Problem:** API calls failing (CORS error)
- Ensure backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Backend Issues

**Problem:** Firebase authentication failed
- Verify `serviceAccountKey.json` exists in backend directory
- Check Firebase project credentials are valid
- Ensure environment variable path is correct

**Problem:** Port 5000 already in use
```bash
# Windows: netstat -ano | findstr :5000
# Linux: lsof -i :5000
```

### ML Service Issues

**Problem:** Virtual environment not activating
```bash
# Try explicit Python path
python -m pip install -r requirements.txt
```

**Problem:** YOLO model not found
- Ensure `best.pt` exists in `ml-service/app/models/`
- Check file path in configuration

**Problem:** Port 8000 already in use
```bash
# Use different port
python -m uvicorn app.main:app --port 8001
```

---


---

## 👨‍💻 Team Ownership & Responsibilities

See [TEAM_OWNERSHIP.md](TEAM_OWNERSHIP.md) for detailed team member assignments.

**Key Roles:**
- **Frontend:** UI/UX development, map visualization
- **Backend:** API design, database management, route intelligence
- **ML:** YOLO model training, inference optimization, severity classification

---

## 📚 Documentation

- [API Documentation](docs/api/README.md)
- [Architecture Details](docs/architecture/README.md)
- [Presentations](docs/presentation/README.md)

---

## ❤️ Vision

CityZen aims to evolve into a scalable **smart-city infrastructure intelligence platform** capable of:

✨ Improving urban mobility
🛡️ Reducing road accidents
🗺️ Enhancing travel safety
📊 Enabling data-driven infrastructure maintenance
🏙️ Building smarter transportation ecosystems

---

## 📝 License

This project is part of a smart-city initiative. Refer to repository for license details.

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create pull request with description

---

---
