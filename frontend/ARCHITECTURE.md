# CityZen Frontend Architecture Diagram

## Component Hierarchy

```
App (Layout)
│
├─ RouteProvider (Context)
│  │
│  └─ LeafletMap Component
│     ├─ Map
│     ├─ RouteLayer (NEW)
│     │  └─ Multiple Polylines
│     │     ├─ Safest Route (Green, Thick)
│     │     ├─ Selected Route (Selected Color)
│     │     └─ Other Routes (Dashed, Thin)
│     ├─ HeatmapLayer
│     │  └─ Hazard Heatmap
│     ├─ MarkerLayer
│     │  └─ Hazard Markers
│     ├─ SafeRoutePanel (ENHANCED)
│     │  ├─ Input Form
│     │  │  ├─ Source Location Input
│     │  │  └─ Destination Input
│     │  ├─ Routes Display (NEW)
│     │  │  └─ RouteCard[] (NEW)
│     │  │     ├─ Route Metrics
│     │  │     ├─ Stress Score
│     │  │     └─ Hazard Count
│     │  ├─ Selected Route Details
│     │  │  ├─ Path Analysis
│     │  │  ├─ Safety Rating
│     │  │  └─ Complete Journey Button
│     │  └─ RatingPopup (NEW)
│     │     ├─ Star Rating
│     │     ├─ Issue Form (Conditional)
│     │     └─ Submit Button
│     └─ SeverityBadge (NEW)
│
└─ Dashboard
   └─ JourneyAnalyticsDashboard (NEW)
      ├─ Stat Cards
      ├─ High Risk Zones
      ├─ Issue Breakdown Chart
      ├─ Rating Distribution
      └─ Trends Chart
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SafeRoutePanel                RatingPopup                        │
│      ↓                              ↓                             │
│  RouteCard[]              feedbackService                        │
│      ↓                              ↓                             │
│  RouteLayer              POST /api/journey-feedback             │
│  (Rendering)                        ↓                             │
│      ↓                         [Feedback Stored]                 │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                      State Management Layer                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  RouteContext                    useSafeRoute()                  │
│  ├─ routes[]                     ├─ fetchSafeRoutes()           │
│  ├─ selectedRouteIndex           ├─ selectRoute()               │
│  ├─ sourceCoords                 └─ resetRoute()                │
│  └─ destinationCoords                                            │
│                                                                   │
│  useFeedback()                   useJourneyAnalytics()          │
│  ├─ submitFeedback()            ├─ fetchAnalytics()            │
│  └─ resetFeedback()             └─ polling(30s)                 │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                        Services Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  routeService                  feedbackService                  │
│  ├─ getSafeRoutes()           ├─ submitJourneyFeedback()       │
│  ├─ calculateRouteStress()    └─ getFeedbackHistory()          │
│  └─ getRatingSeverity()                                         │
│                                                                   │
│  stressService                 analyticsService                 │
│  ├─ calculateStress()         ├─ getJourneyAnalytics()        │
│  ├─ analyzeStress()           └─ getCrowdData()               │
│  ├─ getSeverityColor()                                         │
│  └─ getSeverityBgClass()                                       │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                        HTTP Client Layer                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Axios API Instance                                             │
│  ├─ Base URL: NEXT_PUBLIC_API_BASE_URL                         │
│  ├─ Timeout: 10s                                               │
│  ├─ Error Handling: Comprehensive                              │
│  └─ Interceptors: Response validation                          │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                        Backend API Layer                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /api/safe-route                                           │
│  ├─ Input: [start, destination, preferences]                   │
│  └─ Output: {routes: SingleRoute[]}                            │
│                                                                   │
│  POST /api/route-stress                                         │
│  ├─ Input: {route: RouteCoordinate[]}                          │
│  └─ Output: {stressScore, severity, recommended}               │
│                                                                   │
│  POST /api/journey-feedback                                     │
│  ├─ Input: {start, destination, rating, issueType, ...}       │
│  └─ Output: {success, message, feedbackId}                     │
│                                                                   │
│  GET /api/journey-analytics                                     │
│  ├─ Output: {totalReports, lowRatings, trends, ...}            │
│  └─ Polling: 30s interval                                      │
│                                                                   │
│  GET /api/reports                                               │
│  ├─ Output: [HazardReport]                                      │
│  └─ Polling: 5s interval                                       │
│                                                                   │
│  GET /api/heatmap                                               │
│  ├─ Output: [[lat, lng, intensity], ...]                       │
│  └─ Polling: 5s interval                                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
User Action
    ↓
Event Handler
    ↓
dispatch to RouteContext
    ↓
Update State
    ├─ routes: SingleRoute[]
    ├─ selectedRouteIndex: number
    ├─ sourceCoords: [lat, lng]
    ├─ destinationCoords: [lat, lng]
    ├─ isLoading: boolean
    └─ error: string | null
    ↓
Re-render Components
    ├─ SafeRoutePanel (shows loading state)
    ├─ RouteCard (displays routes)
    ├─ RouteLayer (updates map)
    └─ JourneyAnalyticsDashboard (updates analytics)
    ↓
User Sees Updates
```

## Type System

```
RouteCoordinate = [number, number]

RouteType = 'safe' | 'moderate' | 'risky'
RouteSeverity = 'low' | 'medium' | 'high'

SingleRoute {
  type: RouteType
  stress_score: number
  safe: boolean
  distance: number
  duration: number
  route: RouteCoordinate[]
  nearby_hazards: Hazard[]
}

SafeRouteResponse {
  routes: SingleRoute[]
}

RouteStressResponse {
  stressScore: number
  severity: RouteSeverity
  recommended: boolean
}

JourneyFeedback {
  start: string
  destination: string
  rating: JourneyRating (1-5)
  issueType?: IssueType
  severity?: RouteSeverity
  landmark?: string
  comments?: string
}

JourneyAnalytics {
  totalJourneyReports: number
  lowRatings: number
  unsafeRoadComplaints: number
  mostCommonIssue: string
  averageRating: number
  highRiskZones: Zone[]
  issueBreakdown: Record<string, number>
  ratingDistribution: Record<number, number>
  trends: TrendData[]
}
```

## Component Props & State

```
SafeRoutePanel
├─ Props: none (uses context)
├─ State:
│  ├─ sourceText: string
│  ├─ destText: string
│  ├─ showFeedbackPopup: boolean
│  ├─ sourceSuggestions: GeocodingResult[]
│  └─ destSuggestions: GeocodingResult[]
└─ Context:
   ├─ routes
   ├─ selectedRouteIndex
   ├─ isLoading
   ├─ fetchSafeRoutes()
   └─ selectRoute()

RouteCard
├─ Props:
│  ├─ route: SingleRoute
│  ├─ isSelected: boolean
│  ├─ isSafest: boolean
│  ├─ index: number
│  └─ onClick: () => void
└─ State: none (pure component)

RatingPopup
├─ Props:
│  ├─ isOpen: boolean
│  ├─ onClose: () => void
│  ├─ startLocation: string
│  ├─ endLocation: string
│  └─ onSuccess?: () => void
└─ State:
   ├─ rating: JourneyRating | null
   ├─ showDetails: boolean
   ├─ issueType: IssueType | ''
   ├─ landmark: string
   └─ comments: string

JourneyAnalyticsDashboard
├─ Props: none
├─ State: none (uses hook)
└─ Hook:
   ├─ analytics: JourneyAnalytics | null
   ├─ isLoading: boolean
   └─ error: string | null
```

## Polling Architecture

```
useHeatmap (5s)
    ├─ Initial Fetch
    └─ Poll every 5s
       └─ Background update (no UI block)
           └─ Error handling (preserve old data)

useReports (5s)
    ├─ Initial Fetch
    └─ Poll every 5s
       └─ Background update
           └─ Error handling

useJourneyAnalytics (30s)
    ├─ Initial Fetch
    └─ Poll every 30s
       └─ Background update
           └─ Error handling
```

## Loading State Flow

```
User clicks "Plan Safe Routes"
    ↓
isLoading = true
    ↓
RouteCardSkeleton displayed
    ↓
API request sent
    ↓
Response received
    ↓
isLoading = false
    ↓
RouteCard components displayed
    ↓
Smooth transition animation
```

## Error Handling Flow

```
API Request
    ├─ Network error
    │  └─ Timeout (10s)
    │     └─ User message: "Request timeout"
    ├─ Invalid response
    │  └─ Parse error
    │     └─ User message: "Invalid data received"
    ├─ Server error (4xx, 5xx)
    │  └─ HTTP status code
    │     └─ User message: "Server error: {status}"
    └─ Success (2xx)
       └─ Process data
          └─ Update UI

All errors show in:
- Error state in context
- Error toast notification
- User-friendly message
```

## Performance Optimization

```
Memoization
├─ useMemo()
│  ├─ Route coordinate filtering
│  ├─ Route sorting
│  └─ Analytics calculations
└─ React.memo()
   └─ RouteCard (expensive rendering)

Code Splitting
├─ Dynamic imports
│  └─ LeafletMap
└─ Lazy loading
   └─ JourneyAnalyticsDashboard

Polling Optimization
├─ Background updates (non-blocking)
├─ Configurable intervals
└─ Cleanup on unmount

Bundle Size
├─ Tree-shaking unused code
├─ Lazy load heavy libraries
└─ Gzip compression
```

## Browser Storage

```
localStorage
├─ User preferences
├─ Recent locations (optional)
└─ Feedback history (optional)

sessionStorage
├─ Current route selection
├─ Form state
└─ API responses cache
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Scalability for future features
- ✅ Performance optimization
- ✅ Error resilience
- ✅ Type safety
- ✅ Easy testing
