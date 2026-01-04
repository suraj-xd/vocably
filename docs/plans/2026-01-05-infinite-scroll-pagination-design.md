# Infinite Scroll Pagination + Date Filtering Design

**Date**: 2026-01-05
**Status**: Approved
**Branch**: `feat/infinite-scroll-pagination`

## Overview

Implement infinite scroll pagination with date filtering and fix the loading state bug where "No words yet" appears during initial data load.

## Problems

1. **Loading State Bug**: WordGrid shows "No words yet" when `words.length === 0`, which happens during initial load before data arrives
2. **Scalability**: Current implementation loads all words with hardcoded `limit: 50, offset: 0`, won't scale beyond 100-1000 words
3. **Missing Pagination**: No way to browse large vocabulary lists efficiently
4. **No Date Filtering**: Can't filter words by when they were added

## Solution

### 1. Loading State Fix

**Goal**: Distinguish between loading, empty, and search-no-results states.

**Implementation**:
- Pass `isLoading` prop from Dashboard to WordGrid
- Show skeleton cards during initial load (6 placeholder cards using shadcn Skeleton)
- Show "No words yet" only when loaded AND empty
- Show "No results for..." when searching AND empty

**Files to modify**:
- `apps/web/src/app/dashboard/dashboard.tsx` - Pass isLoading prop
- `apps/web/src/components/vocab/word-grid.tsx` - Add loading/empty state logic
- Create `apps/web/src/components/vocab/skeleton-cards.tsx` - Skeleton component

### 2. Infinite Scroll Pagination

**Goal**: Load words in batches as user scrolls, with configurable page size.

**Architecture**:
- Use **react-intersection-observer** to detect scroll to bottom
- Store page size preference in localStorage (25, 50, or 100)
- Accumulate words in state as more batches load
- Track `hasMore` flag to stop loading when all words fetched

**Frontend State** (Dashboard.tsx):
```tsx
const [pageSize, setPageSize] = useLocalStorage('vocab-page-size', 50)
const [allWords, setAllWords] = useState<Word[]>([])
const [hasMore, setHasMore] = useState(true)

// Load initial batch
const listQuery = useQuery({
  queryKey: ['words', 'list', pageSize, dateFilter],
  queryFn: () => client.words.list({
    limit: pageSize,
    offset: 0,
    startDate,
    endDate
  }),
  onSuccess: (data) => {
    setAllWords(data.words)
    setHasMore(data.hasMore)
  }
})

// Load more function
const loadMore = async () => {
  const result = await client.words.list({
    limit: pageSize,
    offset: allWords.length,
    startDate,
    endDate
  })
  setAllWords(prev => [...prev, ...result.words])
  setHasMore(result.hasMore)
}

// Sentinel element at bottom
const { ref: sentinelRef } = useInView({
  onChange: (inView) => {
    if (inView && hasMore && !isFetching) {
      loadMore()
    }
  }
})
```

**API Changes** (packages/api/src/routers/words.ts):
```ts
// Return total count and hasMore flag
const total = await db.select({ count: count() })
  .from(word)
  .where(/* same filters */)

return {
  words,
  total: total[0].count,
  hasMore: input.offset + words.length < total[0].count
}
```

**UI Components**:
- Page size selector: `<Select>` with options [25, 50, 100]
- Loading indicator at bottom when fetching more
- "Showing X of Y words" counter in header

**Files to create**:
- `apps/web/src/components/vocab/page-size-select.tsx` - Page size dropdown
- `apps/web/src/hooks/use-local-storage.ts` - localStorage hook (if not exists)

**Files to modify**:
- `apps/web/src/app/dashboard/dashboard.tsx` - Add infinite scroll logic
- `packages/api/src/routers/words.ts` - Add total count to response

### 3. Date Filter

**Goal**: Filter words by creation date with presets and custom range.

**UI Components** (shadcn):
- **Button** + **Popover** for filter trigger
- **RadioGroup** for preset options
- **Calendar** (date-range-picker pattern) for custom dates

**Preset Options**:
- All time (default)
- Last 7 days
- Last 30 days
- Last 3 months
- Custom range (opens dual calendar picker)

**State Management**:
```tsx
// URL query params for shareability
const [dateRange, setDateRange] = useQueryState('date', {
  defaultValue: 'all'
})
const [customStart, setCustomStart] = useQueryState('start')
const [customEnd, setCustomEnd] = useQueryState('end')

// localStorage for preference
const [preferredFilter, setPreferredFilter] = useLocalStorage(
  'vocab-date-filter',
  'all'
)

// Convert to actual dates for API
const { startDate, endDate } = useMemo(() => {
  if (dateRange === 'all') return {}
  if (dateRange === '7d') return { startDate: subDays(new Date(), 7) }
  if (dateRange === '30d') return { startDate: subDays(new Date(), 30) }
  if (dateRange === '3m') return { startDate: subMonths(new Date(), 3) }
  if (dateRange === 'custom') return { startDate: customStart, endDate: customEnd }
}, [dateRange, customStart, customEnd])
```

**API Changes** (packages/api/src/routers/words.ts):
```ts
// Input schema
const listWordsInput = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().default(0),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),  // NEW
  endDate: z.string().datetime().optional(),    // NEW
})

// Query with date filtering
where: and(
  eq(word.userId, userId),
  input.startDate ? gte(word.createdAt, new Date(input.startDate)) : undefined,
  input.endDate ? lte(word.createdAt, new Date(input.endDate)) : undefined,
)
```

**Files to create**:
- `apps/web/src/components/vocab/date-filter.tsx` - Date filter popover component

**Files to modify**:
- `apps/web/src/app/dashboard/dashboard.tsx` - Add date filter state and UI
- `packages/api/src/routers/words.ts` - Add date filtering to query

## Implementation Order

1. **Install dependencies**: `bun add react-intersection-observer date-fns`
2. **Fix loading state** (quick win)
3. **Add API total count** (backend)
4. **Implement infinite scroll** (frontend)
5. **Add page size selector** (frontend)
6. **Add date filter API** (backend)
7. **Add date filter UI** (frontend)
8. **Test with large dataset** (100+ words)

## Trade-offs

### Infinite Scroll (vs. Classic Pagination)
- ✅ Natural browsing experience
- ✅ Scales smoothly to 1000+ words
- ✅ Less UI complexity (no page numbers)
- ⚠️ Can't jump to specific page
- ⚠️ Harder to bookmark specific position

### Date Filter in URL (vs. localStorage only)
- ✅ Shareable filtered views
- ✅ Browser back/forward works
- ⚠️ URL gets longer with custom dates

### User-selectable page size
- ✅ Users can optimize for their screen size
- ✅ Power users can load 100 at once
- ⚠️ More UI elements in header

## Testing Checklist

- [ ] Initial load shows skeletons, not "No words"
- [ ] Empty state shows when 0 words exist
- [ ] Search empty state shows when no results
- [ ] Infinite scroll loads more on scroll to bottom
- [ ] Page size selector persists to localStorage
- [ ] Date presets filter correctly (7d, 30d, 3m)
- [ ] Custom date range works with calendar picker
- [ ] URL params update when date filter changes
- [ ] "Showing X of Y" counter is accurate
- [ ] No duplicate words when loading more
- [ ] Works with search + date filter combined
- [ ] Works with category filter + date filter combined

## Future Enhancements

- Virtual scrolling for 10,000+ words (react-window)
- "Jump to top" button when scrolled far down
- Export filtered word list to CSV
- Saved filter presets (e.g., "Words from this week")
