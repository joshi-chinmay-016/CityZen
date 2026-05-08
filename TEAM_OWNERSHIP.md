# CityZen Team Ownership Structure

This document outlines the ownership and responsibilities for each team member in the CityZen hackathon project.

## Team Members & Responsibilities

| Team Member | Module | Responsibilities | Folder Ownership |
|-------------|--------|------------------|------------------|
| **Sushanth** | Maps & Route Visualization | - Map Rendering<br>- Heatmaps<br>- Route Visualization<br>- Current Location Tracking<br>- Report Markers<br>- Upload Report Components | - `frontend/src/components/map/`<br>- `frontend/src/components/reports/`<br>- `frontend/src/hooks/` |
| **Chinmay** | ML Services & AI Inference | - YOLOv8 Inference<br>- Prediction APIs<br>- Severity Mapping<br>- Heatmap Data Generation<br>- ML Processing<br>- AI Pipeline | - `ml-service/app/` |
| **Vishal** | Backend Logic & APIs | - Express APIs<br>- Route Stress Engine<br>- Firestore Integration<br>- OSRM Integration<br>- Backend Services<br>- API Controllers | - `backend/src/routes/`<br>- `backend/src/controllers/`<br>- `backend/src/services/`<br>- `backend/src/middleware/`<br>- `backend/src/utils/`<br>- `backend/src/config/` |
| **Loki** | Dashboard & Frontend Integration | - Dashboard UI<br>- Analytics<br>- Shared UI Components<br>- Frontend Integration<br>- UI Polish<br>- Final Integration | - `frontend/src/components/dashboard/`<br>- `frontend/src/components/common/`<br>- `frontend/src/components/ui/`<br>- `frontend/src/context/`<br>- `frontend/src/styles/` |

## Development Guidelines

- **Branch Strategy**: Use `develop` as base branch, create feature branches for individual work
- **Merge Conflicts**: Minimize conflicts by working within assigned ownership areas
- **Code Reviews**: Required for all merges to `develop`
- **Communication**: Coordinate with team members when working on shared interfaces

## Contact & Coordination

- Use the team chat for coordination
- Tag relevant team members when working on shared components
- Regular standups to track progress and blockers