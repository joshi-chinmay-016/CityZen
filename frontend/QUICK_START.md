# CityZen Frontend - Quick Start Guide

## 🚀 Getting Started

### Installation
```bash
cd frontend
npm install
npm run dev
```

### Environment Setup
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

---

## 💡 Key Features at a Glance

### 1️⃣ Multi-Route Planning
**Location**: `SafeRoutePanel.tsx`

```typescript
// User enters source and destination
// Backend returns up to 3 routes sorted by stress score

Routes displayed:
├─ Safest Route (Green, thick line on map)
├─ Alternative Route (Orange, medium line)
└─ Risky Route (Red, thin line)
```

### 2️⃣ Route Selection
**Location**: `RouteCard.tsx`

Click any route card to:
- Highlight route on map
- Show detailed metrics
- View hazards along route

### 3️⃣ Journey Completion
**Location**: `RatingPopup.tsx`

After journey completes:
1. Click "Complete Journey"
2. Rate journey (1-5 stars)
3. If rating ≤ 2, describe issues:
   - Issue type (pothole, crack, etc.)
   - Nearby landmark
   - Comments

### 4️⃣ Analytics Dashboard
**Location**: `JourneyAnalyticsDashboard.tsx`

View community intelligence:
- High-risk zones
- Most common issues
- Rating distribution
- Trends over time

---

## 📂 Project Structure

```
frontend/
├─ src/
│  ├─ components/
│  │  ├─ map/
│  │  │  ├─ RouteLayer.tsx          (Multi-route rendering)
│  │  │  ├─ SafeRoutePanel.tsx       (Main control panel)
│  │  │  ├─ RouteCard.tsx            (Route display card)
│  │  │  ├─ RatingPopup.tsx          (Feedback form)
│  │  │  ├─ RouteCardSkeleton.tsx    (Loading state)
│  │  │  └─ HeatmapLayer.tsx         (Hazard visualization)
│  │  ├─ dashboard/
│  │  │  └─ JourneyAnalyticsDashboard.tsx  (Analytics)
│  │  └─ common/
│  │     └─ SeverityBadge.tsx        (Severity indicator)
│  ├─ services/
│  │  ├─ routeService.ts            (Route planning)
│  │  ├─ stressService.ts           (Route stress analysis)
│  │  ├─ feedbackService.ts         (Feedback submission)
│  │  └─ analyticsService.ts        (Analytics)
│  ├─ hooks/
│  │  ├─ useSafeRoute.ts            (Route state)
│  │  ├─ useFeedback.ts             (Feedback logic)
│  │  ├─ useJourneyAnalytics.ts     (Analytics polling)
│  │  ├─ useHeatmap.ts              (Heatmap data)
│  │  └─ useReports.ts              (Reports data)
│  ├─ context/
│  │  └─ RouteContext.tsx           (Route state management)
│  └─ types/
│     └─ route.ts                   (Type definitions)
│
├─ CROWD_INTELLIGENCE_GUIDE.md      (Full docs)
├─ IMPLEMENTATION_CHECKLIST.md      (Testing/deployment)
└─ IMPLEMENTATION_SUMMARY.md        (Overview)
```

---

## 🔌 Using the Services

### Route Service
```typescript
import { routeService, RouteRequest } from '@/services/routeService';

const params: RouteRequest = {
  startLat: 12.9716,
  startLng: 77.5946,
  endLat: 12.9698,
  endLng: 77.6061,
  preferences: { avoidHighStress: true }
};

const routes = await routeService.getSafeRoutes(params);
// Returns: SingleRoute[] sorted by stress_score
```

### Stress Service
```typescript
import { stressService } from '@/services/stressService';

const stress = await stressService.calculateStress(routeCoordinates);
// Returns: { stressScore, severity, recommended }

const color = stressService.getSeverityColor('high'); // #ef4444
const bgClass = stressService.getSeverityBgClass('high'); // 'bg-red-100 text-red-800'
```

### Feedback Service
```typescript
import { feedbackService, getRatingSeverity } from '@/services/feedbackService';

const feedback = {
  start: 'Kundalahalli Gate',
  destination: 'Koramangala',
  rating: 2,
  issueType: 'pothole',
  severity: getRatingSeverity(2), // 'medium'
  landmark: 'Near Sony Signal'
};

await feedbackService.submitJourneyFeedback(feedback);
```

### Analytics Service
```typescript
import { analyticsService } from '@/services/analyticsService';

const analytics = await analyticsService.getJourneyAnalytics();
// Returns: {
//   totalJourneyReports,
//   lowRatings,
//   unsafeRoadComplaints,
//   mostCommonIssue,
//   averageRating,
//   highRiskZones,
//   issueBreakdown,
//   ratingDistribution,
//   trends
// }
```

---

## 🪝 Using the Hooks

### useSafeRoute
```typescript
import { useSafeRoute } from '@/hooks/useSafeRoute';

const {
  routes,              // SingleRoute[]
  selectedRouteIndex,  // number
  isLoading,          // boolean
  error,              // string | null
  fetchSafeRoutes,    // (params) => Promise<void>
  selectRoute,        // (index) => void
  resetRoute,         // () => void
  sourceCoords,       // [lat, lng] | null
  destinationCoords   // [lat, lng] | null
} = useSafeRoute();

// Fetch routes
await fetchSafeRoutes({
  startLat: 12.9716,
  startLng: 77.5946,
  endLat: 12.9698,
  endLng: 77.6061
});

// Select a route
selectRoute(0); // Selects safest route

// Access current route
const currentRoute = routes[selectedRouteIndex];
```

### useFeedback
```typescript
import { useFeedback } from '@/hooks/useFeedback';

const { isSubmitting, error, submitFeedback, resetFeedback } = useFeedback();

try {
  await submitFeedback({
    start: 'Location A',
    destination: 'Location B',
    rating: 3,
    comments: 'Good route'
  });
} catch (err) {
  console.error(err);
}
```

### useJourneyAnalytics
```typescript
import { useJourneyAnalytics } from '@/hooks/useJourneyAnalytics';

const { analytics, isLoading, error, refetch } = useJourneyAnalytics(
  30000 // 30s polling interval
);

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;

return <div>{analytics.averageRating}</div>;
```

---

## 🎨 Type Definitions

### SingleRoute
```typescript
interface SingleRoute {
  type: 'safe' | 'moderate' | 'risky';
  stress_score: number;
  safe: boolean;
  distance: number;
  duration: number;
  route: RouteCoordinate[];
  nearby_hazards: Hazard[];
}
```

### JourneyAnalytics
```typescript
interface JourneyAnalytics {
  totalJourneyReports: number;
  lowRatings: number;
  unsafeRoadComplaints: number;
  mostCommonIssue: string;
  averageRating: number;
  highRiskZones: Zone[];
  issueBreakdown: Record<string, number>;
  ratingDistribution: Record<number, number>;
  trends: TrendData[];
}
```

---

## ⚠️ Common Issues & Solutions

### Routes not displaying?
```typescript
// Check coordinates are valid [lat, lng]
// Verify API base URL is set
// Check browser console for errors
```

### Feedback not submitting?
```typescript
// Ensure all required fields filled
// Check issue type is from allowed list
// Verify backend endpoint exists
```

### Animations not smooth?
```typescript
// Use Framer Motion's layout prop
// Avoid re-renders with useMemo
// Check browser performance
```

### Mobile layout broken?
```typescript
// Use Tailwind responsive prefixes (md:, lg:)
// Test on actual device
// Check viewport meta tag
```

---

## 🧪 Testing

### Manual Testing
1. Enter source and destination
2. Verify 1-3 routes display
3. Select each route
4. Verify map updates
5. Rate journey (1-5 stars)
6. Check feedback submits
7. Verify analytics update

### Debug Mode
```typescript
// Enable detailed logging
localStorage.setItem('DEBUG_ROUTES', 'true');

// In console
window.routeDebug = {
  lastFetch: ...,
  currentRoutes: ...,
  analytics: ...
};
```

---

## 📚 Further Reading

- **Full Guide**: See `CROWD_INTELLIGENCE_GUIDE.md`
- **Deployment**: See `IMPLEMENTATION_CHECKLIST.md`
- **Overview**: See `IMPLEMENTATION_SUMMARY.md`

---

## 🚀 Deployment

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.cityzen.com/api
```

---

## 💬 Need Help?

1. Check the documentation files
2. Review component comments
3. Look at browser console for errors
4. Check backend API responses
5. Review test files for usage examples

---

**Version**: 1.0.0 - Production Ready ✅
**Last Updated**: 2026-05-14

