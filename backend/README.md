# SmartFleet Backend

This backend is matched to the SmartFleet React frontend contract and uses a SQLite-backed local data model for rapid integration.

## Quick start

1. Copy `.env.example` to `.env`
2. Install dependencies: `npm install`
3. Run in dev mode: `npm run dev`
4. Server runs at `http://localhost:5000`

## Demo accounts

- Customer: customer@smartfleet.io / password123
- Driver: driver@smartfleet.io / password123
- Manager: manager@smartfleet.io / password123

## API base URL

- `http://localhost:5000/api`

## Notes

- Frontend is the source of truth for the field names and role model.
- The backend preserves mock field names such as `estimatedDelivery`, `currentLocation`, `maintenanceRisk`, `assignedDriver`, and `fuelEfficiency`.
