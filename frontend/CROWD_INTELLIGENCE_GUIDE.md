# Frontend Crowd-Intelligence Implementation Guide

## Overview
This document outlines the crowd-intelligence features implemented in the CityZen frontend. All features are built on the existing architecture without breaking changes.

## Architecture Changes

### Type System (`/types/route.ts`)
Extended with new route types to support multiple routes:
- `RouteType`: 'safe' | 'moderate' | 'risky'
- `RouteSeverity`: 'low' | 'medium' | 'high'
- `SingleRoute`: Individual route with stress score, distance, duration, hazards
- `SafeRouteResponse`: Wrapper containing array of routes

### State Management (`/context/RouteContext.tsx`)
**Enhanced from single route to multiple routes:**
```typescript
- routes: SingleRoute[]           // Array of available routes
- selectedRouteIndex: number      // Currently selected route
- selectRoute(index)              // Switch between routes
- fetchSafeRoutes()              // Fetch multiple routes
```

Maintains backward compatibility with legacy `routeResult` property.

## Services

### routeService.ts - Route Planning
```typescript
// NEW: Get multiple safe routes (sorted by stress score)
getSafeRoutes(params: RouteRequest): Promise<SingleRoute[]>

// Legacy support
getSafeRoute(params: RouteRequest): Promise<LegacySafeRouteResponse>

// Route stress analysis
calculateRouteStress(route: RouteCoordinate[]): Promise<RouteStressResponse>
```

### stressService.ts - NEW
Analyzes and categorizes route stress:
```typescript
calculateStress()        // Get stress score
analyzeStress()         // Detailed stress analysis
getSeverityColor()      // Get severity color code
getSeverityBgClass()    // Get Tailwind class for styling
```

Severity levels:
- **Low** (0-3): Green - Safe route
- **Medium** (3-7): Orange - Moderate hazards
- **High** (7-10): Red - Risky route

### feedbackService.ts - NEW
Journey feedback collection for crowd intelligence:
```typescript
submitJourneyFeedback(feedback: JourneyFeedback)
getFeedbackHistory(limit?: number)
```

**Flow:**
1. User completes journey
2. Rating popup appears (1-5 stars)
3. If rating ≤ 2, ask for issue details:
   - Issue type (pothole, crack, manhole, traffic, unsafe_road)
   - Nearby landmark
   - Comments
4. Submit to backend `/api/journey-feedback`

**Severity mapping:**
- 1 star → High
- 2 stars → Medium
- 3+ stars → Low

### analyticsService.ts - Extended
New journey analytics endpoint:
```typescript
getJourneyAnalytics(): Promise<JourneyAnalytics>

// Returns:
- totalJourneyReports: number
- lowRatings: number
- unsafeRoadComplaints: number
- mostCommonIssue: string
- averageRating: number
- highRiskZones: Zone[]
- issueBreakdown: Record<string, number>
- ratingDistribution: Record<number, number>
- trends: TrendData[]
```

## Components

### RouteLayer.tsx - Multi-Route Rendering
**Supports dynamic route count (1-3 routes)**

Polyline styling:
- **Safest route (index 0)**: Thick (weight: 6), solid, high opacity (0.9)
- **Selected route**: Medium weight (5), dashed, opacity 0.8
- **Other routes**: Thin (weight: 3), dashed, opacity 0.5

Color coding:
- Safe → Green (#16a34a)
- Moderate → Orange (#ea8c1f)
- Risky → Red (#ef4444)

### RouteCard.tsx - NEW
Individual route display card with:
- Route type badge + "Recommended" indicator
- Distance, ETA, stress score
- Severity color-coded badge
- Hazard count
- Smooth animations and hover effects

### SafeRoutePanel.tsx - Enhanced
**New features:**
- Display all returned routes in a grid
- Route selection with visual feedback
- "Complete Journey" button
- Integration with RatingPopup
- Enhanced error handling
- Loading skeletons (recommended for UX polish)

### RatingPopup.tsx - NEW
Journey completion feedback UI:
- **Visual elements:**
  - Large 5-star rating selector
  - Emoji feedback (😞 → 🎉)
  - Smooth collapse/expand of detail form
  - Toast notifications

- **Conditional fields:**
  - Issue type dropdown (only if rating ≤ 2)
  - Landmark input (optional, for rating ≤ 2)
  - Comments textarea (optional)

- **Submission:**
  - Form validation
  - Loading state
  - Success/error handling

### JourneyAnalyticsDashboard.tsx - NEW
Comprehensive crowd analytics visualization:
- **Stat cards**: Journey reports, low ratings, complaints, avg rating
- **High risk zones**: Map of dangerous areas with risk scores
- **Issue breakdown**: Bar chart of common issues
- **Rating distribution**: Pie chart showing 1-5 star distribution
- **Trends**: Line chart of incidents and ratings over time

**Data handling:**
- Loading skeleton display
- Error fallback UI
- Empty state handling
- Responsive grid layout

## Hooks

### useJourneyAnalytics() - NEW
```typescript
const { analytics, isLoading, error, refetch } = useJourneyAnalytics(
  pollingIntervalMs // Default 30s
);
```

### useFeedback() - NEW
```typescript
const { isSubmitting, error, submitFeedback, resetFeedback } = useFeedback();
```

### useHeatmap() - Enhanced
Already supports polling for real-time hazard data

### useReports() - Enhanced
Already supports polling for real-time reports

## User Flow

```
User Opens Map
    ↓
Enters source & destination
    ↓
Clicks "Plan Safe Routes"
    ↓
Backend returns 1-3 routes sorted by stress_score
    ↓
Frontend displays routes in RouteCard grid
    ↓
Safest route highlighted (thick green line)
    ↓
User sees stress scores, distance, ETA, hazards
    ↓
User starts journey (can select alternate route)
    ↓
Journey complete → "Complete Journey" button appears
    ↓
RatingPopup appears with 1-5 star rating
    ↓
If rating ≤ 2 → ask for issue details
    ↓
Submit feedback to backend
    ↓
Toast success notification
    ↓
Analytics update in real-time
    ↓
Next user benefits from crowd intelligence
```

## API Integration

### Required Endpoints

**POST /api/safe-route**
```json
Request:
{
  "start": [lat, lng],
  "destination": [lat, lng],
  "preferences": { "avoidHighStress": true }
}

Response:
{
  "routes": [
    {
      "type": "safe",
      "stress_score": 12,
      "safe": true,
      "distance": 8972.9,
      "duration": 766.8,
      "route": [[lat, lng], ...],
      "nearby_hazards": [...]
    }
  ]
}
```

**POST /api/route-stress**
```json
Response:
{
  "stressScore": 18,
  "severity": "high",
  "recommended": false
}
```

**POST /api/journey-feedback**
```json
Request:
{
  "start": "Kundalahalli Gate",
  "destination": "Koramangala",
  "rating": 1,
  "issueType": "pothole",
  "severity": "high",
  "landmark": "Near Sony Signal",
  "comments": "..."
}

Response:
{
  "success": true,
  "message": "Feedback recorded",
  "feedbackId": "..."
}
```

**GET /api/journey-analytics**
```json
Response:
{
  "totalJourneyReports": 42,
  "lowRatings": 18,
  "unsafeRoadComplaints": 9,
  "mostCommonIssue": "pothole",
  "averageRating": 2.4,
  "highRiskZones": [...],
  "issueBreakdown": {...},
  "ratingDistribution": {...},
  "trends": [...]
}
```

## Coordinate System

**IMPORTANT:** OSRM returns coordinates as `[lng, lat]`, but Leaflet expects `[lat, lng]`.

RouteLayer.tsx handles the conversion automatically:
```typescript
.map((coord) => [coord[0], coord[1]] as LatLngTuple)
```

Ensure backend API is consistent with this format.

## Responsive Design

All new components are fully responsive:
- **Mobile**: Single column layout, full-width cards
- **Tablet**: 2-column grid for analytics
- **Desktop**: 4-column stat cards, side-by-side charts

Tailwind breakpoints used:
- `md:` (768px)
- `lg:` (1024px)

## Error Handling

**Comprehensive error handling throughout:**
- Network timeouts (10s default)
- Missing data validation
- Graceful fallbacks for failed requests
- User-friendly error messages
- Toast notifications for feedback

## Performance Optimizations

1. **Memoization**: Routes and positions memoized with `useMemo`
2. **Polling**: Configurable intervals (default 5-30s)
3. **Background updates**: Don't block UI during data refresh
4. **Code splitting**: Dynamic imports for map components
5. **Lazy loading**: Analytics loaded on demand

## UI/UX Enhancements

- **Animations**: Framer Motion for smooth transitions
- **Loading states**: Skeleton screens for better perceived performance
- **Toast notifications**: React Hot Toast for feedback
- **Accessibility**: Semantic HTML, ARIA labels
- **Dark mode ready**: CSS variables for theming

## Testing Recommendations

```typescript
// Test multiple route rendering
- Verify 1, 2, and 3 routes display correctly
- Check route selection and highlighting

// Test severity coloring
- Verify color codes match stress scores
- Test mobile responsiveness

// Test feedback flow
- Submit rating with and without issues
- Verify all issue types save correctly
- Test landmark and comments fields

// Test analytics
- Verify data loads on dashboard
- Check chart rendering with empty data
- Test date range filtering
```

## Future Enhancements

1. **Route previews**: Hover to see route details
2. **Real-time sharing**: Share route with friends
3. **Caching**: Persist routes for offline access
4. **Advanced filters**: Filter routes by criteria
5. **AR navigation**: Augmented reality directions
6. **Social features**: Share feedback, achievements
7. **Predictive routing**: ML-based route recommendations

## Configuration

Environment variables (`.env.local`):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Deployment Checklist

- [ ] All TypeScript types properly defined
- [ ] Error handling tested
- [ ] Mobile responsive verified
- [ ] API endpoints configured
- [ ] Toast notifications working
- [ ] Loading states visible
- [ ] Analytics dashboard displays data
- [ ] Feedback form validates input
- [ ] Route rendering works with 1-3 routes
- [ ] Coordinate conversion working (lng,lat → lat,lng)
- [ ] CORS properly configured on backend
- [ ] Rate limiting considered
- [ ] Analytics polling doesn't overwhelm server
