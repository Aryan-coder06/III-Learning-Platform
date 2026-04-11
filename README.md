# StudySync AI

Stage 1 is a frontend-first hackathon build that migrates the provided Swiss Minimalist HTML theme into a reusable Next.js product landing page and protected dashboard shell for a collaborative student workspace.

## Included in Stage 1

- Next.js App Router frontend in `frontend/`
- Theme migration inspired by the provided Swiss HTML export and extracted assets
- Reusable Tailwind + shadcn-style UI primitives
- Mock login flow with protected routes and dashboard redirect
- Polished landing page, login screen, dashboard, and placeholder product routes
- Future backend scaffold in `backend/node-api/`
- Future FastAPI AI service scaffold in `backend/ai-service/`

## Frontend routes

- `/`
- `/login`
- `/dashboard`
- `/rooms`
- `/messages`
- `/documents`
- `/whiteboard`
- `/sessions`
- `/notifications`
- `/settings`

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Mock auth behavior

- Login is frontend-only in Stage 1
- Successful sign-in writes mock auth state to local storage
- A cookie is also written so Next middleware can protect workspace routes
- Direct access to protected routes redirects to `/login`

## Architecture notes

- `frontend/components/landing`: landing page sections derived from the supplied theme direction
- `frontend/components/dashboard`: dashboard-specific modules and summaries
- `frontend/components/shared`: app shell, auth form, footer, logo, placeholders
- `frontend/lib/mock`: centralized mock data for landing and dashboard content
- `frontend/lib/auth`: mock auth store, cookie helpers, and bootstrap logic
- `backend/node-api`: reserved Express + Socket.IO + MongoDB entry points
- `backend/ai-service`: reserved FastAPI surface for future AI integration

## Theme assets used

- Source export: `Swiss _ Design Prompts.html`
- Extracted assets copied into `frontend/public/theme/`
- Key visual cues preserved: Swiss grid patterns, strong borders, off-white surfaces, dark panels, and red accent hierarchy

## Next build stages

1. Replace mock auth with real API auth
2. Implement room CRUD and messaging over Express + Socket.IO
3. Add document upload pipeline
4. Connect whiteboard and live sessions
5. Introduce FastAPI-powered AI workflows after the core collaboration stack is stable
