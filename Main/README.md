# CineMatch

CineMatch is now split into clear frontend and backend layers:

- `Frontend/`: React + Vite application
- `Backend/`: Express server, API routes, middleware, and schema

## Project Structure

```text
Main/
  Frontend/
    index.html
    vite.config.js
    tsconfig.json
    src/
  Backend/
    server.js
    src/
      config/
      middleware/
      routes/
      schemas/
      state/
      utils/
```

## Run Locally

Prerequisites: Node.js

1. Install dependencies:
   `npm install`
2. Configure environment variables in `.env` (at `Main/.env`):
   - `TMDB_API_KEY`
   - `MONGODB_URI` (optional, fallback mode runs in memory)
   - `JWT_SECRET`
3. Start in development mode:
   `npm run dev`

## Build

Build frontend assets into `Backend/dist`:

`npm run build`

For production, run the same backend server with `NODE_ENV=production` so it serves `Backend/dist`.
