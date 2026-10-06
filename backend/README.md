# SmartFleet Backend

This backend is matched to the SmartFleet React frontend contract and uses a SQLite-backed local data model for rapid integration.

## Quick start

1. Copy `.env.example` to `.env`
2. Install dependencies: `npm install`
3. Run in dev mode: `npm run dev`
4. Build the project: `npm run build`
5. Run tests: `npm test`
6. Server runs at `http://localhost:5000`

## Environment and database behavior

- Default API port: `5000`
- JWT secret: configured through `JWT_SECRET` in `.env`
- Frontend origin: configured through `FRONTEND_ORIGIN` in `.env`
- SQLite database: defaults to `./smartfleet.db` in development
- Test mode: when `NODE_ENV=test`, the backend uses an in-memory SQLite database so repeated test runs stay isolated and deterministic

## Groq chatbot

Set `GROQ_API_KEY` and `GROQ_MODEL` in `backend/.env`. The key is read only by the backend and must not be added to frontend variables. The existing authenticated endpoint is `POST /api/ai/chat`; it accepts `{ "message": "..." }` and uses the JWT identity to select role-authorized database context. Groq uses the configured chat-completions model. If the key/model is missing or the provider is unavailable, the endpoint returns a deterministic response based only on that same authorized context.

The frontend uses `VITE_API_BASE_URL=http://localhost:5000/api` by default. Backend sign-in persists its JWT separately and sends it as a bearer token for chat requests. Mock sign-in remains available when the backend cannot be reached and `VITE_USE_MOCK_API` is enabled, but mock-only sessions cannot authenticate with the backend chatbot.

## Demo accounts

- Customer: customer@smartfleet.io / password123
- Driver: driver@smartfleet.io / password123
- Manager: manager@smartfleet.io / password123

Additional seeded driver accounts are also available for fleet operations demos:

- lahiru@smartfleet.io / password123
- shanaka@smartfleet.io / password123
- mithun@smartfleet.io / password123

## API base URL

- `http://localhost:5000/api`

## Core modules

- Authentication and session management: `src/controllers/authController.ts`
- User data and profile access: `src/controllers/userController.ts`
- Shipment lifecycle, assignment, and access control: `src/controllers/shipmentController.ts`
- Driver and vehicle inventory APIs: `src/controllers/driverController.ts`, `src/controllers/vehicleController.ts`
- Trip actions and lifecycle updates: `src/controllers/tripController.ts`
- AI route, prediction, and recommendation services: `src/controllers/aiController.ts` and `src/utils/ai.ts`
- Routing optimization: `src/utils/dijkstra.ts`

## Verification

The backend is validated with a Vitest suite covering:

- user registration and JWT issuance
- shipment access protection for unauthorized users
- maintenance risk prediction
- shortest-path route optimization via Dijkstra

To validate locally:

```bash
npm test
npm run build
```

## Notes

- Frontend is the source of truth for the field names and role model.
- The backend preserves mock field names such as `estimatedDelivery`, `currentLocation`, `maintenanceRisk`, `assignedDriver`, and `fuelEfficiency`.
- All protected routes require a valid JWT bearer token in the `Authorization` header.
- Fleet analytics and stored AI recommendations are restricted to managers.
