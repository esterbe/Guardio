# Design Decisions & Trade-offs

## Architecture Decisions

### Backend: FastAPI over Flask
**Decision**: Chose FastAPI for the backend framework.

**Reasoning**:
- Built-in OpenAPI documentation with automatic Swagger UI
- Native async support for better performance
- Type hints with Pydantic for request/response validation
- Modern Python conventions

**Trade-off**: Slightly more opinionated than Flask, but the benefits outweigh the learning curve.

### Database: Raw SQL over ORM
**Decision**: Used raw SQL queries with Python's sqlite3 module instead of SQLAlchemy or other ORMs.

**Reasoning**:
- Per requirements: demonstrate SQL proficiency
- More control over query optimization
- No abstraction layer overhead
- Easier to understand and debug queries

**Trade-off**: More verbose code, need to handle SQL injection manually (using parameterized queries), no migration support.

### State Management: URL Params + localStorage
**Decision**: Store filter state in URL params and theme in localStorage.

**Reasoning**:
- URL params make dashboard state shareable (copy URL to share current view)
- Theme preference persists across sessions via localStorage
- No need for complex state management libraries
- React Router's useSearchParams handles URL sync naturally

**Trade-off**: URL can get long with many filters, but this is acceptable for a dashboard.

## Frontend Decisions

### Component Library: shadcn/ui
**Decision**: Used shadcn/ui for UI components.

**Reasoning**:
- Copy-paste components (full control over code)
- Built on Radix UI primitives (accessibility)
- Tailwind CSS integration
- Consistent design system

**Trade-off**: Requires more initial setup than a traditional component library, but provides better long-term flexibility.

### Charts: Recharts
**Decision**: Used Recharts for data visualization.

**Reasoning**:
- Built specifically for React
- Declarative API matches React patterns
- Good TypeScript support
- Responsive by default

**Trade-off**: Larger bundle size than some alternatives, but the developer experience is worth it.

### Layout: Grid-based with Large Cards
**Decision**: Designed for hallway TV display with large, high-contrast elements.

**Reasoning**:
- Metrics should be visible from distance
- 4-column grid for key metrics on large screens
- Large font sizes (text-4xl for numbers)
- High contrast colors for success/fail states

## API Design Decisions

### Flexible Filtering on /metrics/checkins
**Decision**: Made the check-ins endpoint highly configurable with optional filters.

**Reasoning**:
- Single endpoint serves multiple use cases
- Frontend can customize views without backend changes
- Supports both overview and detailed analysis

### Comparison Feature on /metrics/machines/compare
**Decision**: Separate endpoint for machine comparison rather than computed client-side.

**Reasoning**:
- Server calculates deltas efficiently
- Reduces client-side computation
- Consistent calculation logic
- Could be extended with more complex comparisons

### Immediate UI Updates on Dismiss
**Decision**: Update local state immediately after successful dismiss, rather than refetching.

**Reasoning**:
- Faster perceived performance
- Reduces API calls
- Optimistic update pattern is standard practice

## What I Would Do Next

### Short-term Improvements
1. **Real-time Updates**: Add WebSocket support for live dashboard updates
2. **Caching**: Implement Redis caching for expensive aggregation queries
3. **Pagination**: Add pagination to the machines table for centers with many machines
4. **Export**: Add CSV/PDF export for reports

### Medium-term Improvements
1. **Authentication**: Add user authentication and role-based access
2. **Multi-center Support**: Support viewing data across multiple Pokemon Centers
3. **Notifications**: Alert system for machines with failing success rates
4. **Historical Comparisons**: Compare current period vs previous period

### Long-term Improvements
1. **Predictive Analytics**: ML model to predict healing outcomes
2. **Capacity Planning**: Forecast busy periods based on historical data
3. **Mobile App**: React Native companion app for staff on the floor
4. **Integration APIs**: Connect with external Pokemon tracking systems

## Known Limitations

1. **Time Zone Handling**: Assumes all timestamps are in the same timezone
2. **No Authentication**: Dashboard is publicly accessible
3. **Single Database**: No support for horizontal scaling
4. **No Caching**: Every request hits the database
5. **Limited Error Recovery**: Some edge cases may not have graceful fallbacks

## Performance Considerations

1. **SQL Optimization**: All queries use indexes where available (primary keys, foreign keys)
2. **Aggregation in Database**: Heavy calculations done in SQL, not Python
3. **Parallel Data Fetching**: Frontend fetches multiple endpoints concurrently
4. **Lazy Loading**: Charts only render when data is available
5. **Skeleton Loading**: Prevents layout shift during data loading
