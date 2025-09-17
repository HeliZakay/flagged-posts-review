# Express Backend for Flagged Posts Review Tool

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Run in development mode:
   ```sh
   npm run dev
   ```
3. Build and run in production mode:
   ```sh
   npm run build
   npm start
   ```

## API Endpoints

Base path: `/api/posts`

- `GET /api/posts` — List posts with filters: status, platform, tag, search, limit, offset
- `PATCH /api/posts/:id/status` — Update the status of a post
- `POST /api/posts/:id/tags` — Add a tag to a post
- `DELETE /api/posts/:id/tags/:tag` — Remove a tag from a post

## Notes

- Data is loaded in-memory from `src/mock-posts.json` on server start. No persistence: changes are lost on server restart (per assignment requirements).
- CORS is enabled for local frontend development.

- **Input validation:** All API endpoints validate request parameters and bodies using [Zod](https://zod.dev/). Invalid `status`, `tag`, or `id` values return clear error responses with proper HTTP status codes.
- **Error handling:** Consistent error messages and status codes for invalid input, missing resources, and duplicate tags.

## Project Structure

```
express-backend/
  src/
    server.ts         # Express server entry point
    routes/
      posts.ts        # API routes for posts
    data.ts           # In-memory data management
  package.json
  tsconfig.json
```
