# Flagged Posts Review Tool

Simple full-stack app for analysts to view, filter, and edit flagged social posts.

## Tech Stack

- **Express** (TypeScript) backend API
- **React** (TypeScript) frontend
- **Tailwind CSS** (minimal styling)

## Quick Start

### 1. Install dependencies (root and backend)

```bash
# In project root
npm install
# In express-backend
cd express-backend
npm install
```

### 2. Run both servers

```bash
# Start Express backend (port 4000)
cd express-backend
npm run dev
# In a separate terminal, start frontend (port 3000)
cd ..
# (If you have a React frontend, start it here)
npm run dev
# open http://localhost:3000
```

### 3. API integration

Frontend fetches data from Express backend at `http://localhost:4000/api/posts`.
You can switch API base URL in `src/lib/apiConfig.ts`.

## Dataset

- Source of truth: `src/mock-posts.json`
- Loaded in-memory on server start (no persistence by design)

## API Endpoints

Base path: `/api`

### `GET /posts`

List posts with filters, search, and pagination.

**Query params**

- `status`: `FLAGGED | UNDER_REVIEW | DISMISSED`
- `platform`: e.g. `twitter`, `instagram`, `facebook`, `tiktok`, `reddit`, `telegram`
- `tag`: exact tag match (case-insensitive)
- `search`: text search over `text` (case-insensitive substring)
- `limit`: 1..100 (default 20)
- `offset`: 0..n (default 0)

**Response**

```json
{
  "total": 20,
  "limit": 10,
  "offset": 0,
  "hasMore": true,
  "nextOffset": 10,
  "data": [
    /* Post[] */
  ]
}
```

### `PATCH /posts/:id/status`

Update a post status.

**Body**

```json
{ "status": "FLAGGED | UNDER_REVIEW | DISMISSED" }
```

**Response**: updated `Post`.

### `POST /posts/:id/tags`

Add a tag (idempotent: duplicates ignored).

**Body**

```json
{ "tag": "some-tag" }
```

**Response**: updated `Post`.

### `DELETE /posts/:id/tags/:tag`

Remove a tag.

**Response**: updated `Post`.

## Frontend Features

- Table with: **Text, Platform, Status, Tags, Created date**
- Filters: **Status, Platform, Search**, and **Per-page**
- **Inline status edit** (dropdown → PATCH)
- **Inline tags**: add (input + “+ Add”) and remove (× button)
- Pagination: Prev/Next
- Loading, error, and “No posts found” empty states

## Behavior & Assumptions

- Input dataset normalized: `created_at` → `createdAt` (camelCase).
- Allowed statuses: `FLAGGED`, `UNDER_REVIEW`, `DISMISSED`.
- Search is **case-insensitive substring** on `text`.
- Tag filter is **case-insensitive**; tags stored as provided.
- Sorting: **createdAt DESC**, tie-break by **id DESC** for stable pagination.
- No persistence: edits reset on server restart (as required).
- No auth (per instructions).

## Project Structure

```
src/
  components/
    PostsView.tsx                 # Frontend table + actions
  lib/
    data.ts                       # In-memory repository + types
  mock-posts.json                 # Dataset
express-backend/
  src/
    routes/
      posts.ts                    # Express API endpoints
    data.ts                       # In-memory repository + types
    server.ts                     # Express server entrypoint
  package.json
  README.md
```

## Example cURL

```bash
# List flagged instagram posts, 5 per page
curl "http://localhost:3000/api/posts?status=FLAGGED&platform=instagram&limit=5"

# Search "virus"
curl "http://localhost:3000/api/posts?search=virus"

# Update status
curl -X PATCH "http://localhost:3000/api/posts/2/status"   -H "Content-Type: application/json"   -d '{"status":"DISMISSED"}'

# Add tag
curl -X POST "http://localhost:3000/api/posts/2/tags"   -H "Content-Type: application/json"   -d '{"tag":"reviewed"}'

# Remove tag
curl -X DELETE "http://localhost:3000/api/posts/2/tags/reviewed"
```

## Notes / Future Improvements

- Input validation with Zod on Express API
- Cursor-based pagination (opaque cursor) for large datasets
- Unit tests for filter/sort/pagination logic
- Toast notifications for actions; optimistic updates with rollback

```

```
