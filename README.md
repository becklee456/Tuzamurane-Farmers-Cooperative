# Tuzamurane Farmers Cooperative Management System

A complete MERN stack web application for Tuzamurane Farmers Cooperative in Nyamagabe District. The system replaces paper-based farmer, crop delivery, and payment records with secure digital workflows, automated calculations, analytics, reports, receipts, and audit logs.

## Core Features

- JWT authentication with bcrypt password hashing and protected routes
- Role-based access control for `admin`, `manager`, and `staff`
- Cooperative CRUD: code, name, district, chairperson
- Farmer CRUD: farmer number, personal details, village, membership date, cooperative code
- Delivery CRUD with automatic total calculation:

```text
Total Amount = Weight in Kilograms x Price Per Kilogram
```

- Payment tracking from recorded deliveries, pending payment list, mark-as-paid flow, and printable receipts
- Dashboard analytics for farmers, deliveries, income, paid totals, pending totals, crop trends, and recent activity
- Reports for monthly income, payments, farmer deliveries, and crop performance
- PDF and Excel exports from the reports module
- Responsive Bootstrap 5 interface with dark mode, modals, tables, alerts, and mobile navigation
- MongoDB injection sanitization, validation, centralized error handling, pagination, and audit logs

## Project Structure

```text
backend/
  config/          MongoDB connection
  controllers/     REST controller logic
  middleware/      auth, validation, audit, error handling
  models/          Mongoose schemas
  routes/          Express API routes
  seed/            starter data
  utils/           shared helpers
  validators/      express-validator rules
frontend/
  src/components/  reusable UI components
  src/contexts/    auth and toast state
  src/hooks/       shared data hooks
  src/layouts/     protected app layout
  src/pages/       dashboard and modules
  src/services/    Axios API client
  src/utils/       formatting and export helpers
```

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Start MongoDB locally, then seed the database:

```bash
npm run seed
```

3. Start the frontend and backend:

```bash
npm run dev
```

4. Open the app:

```text
http://localhost:5173
```

Seed login:

```text
Email: admin@tuzamurane.rw
Password: Admin123!
```

## Environment Variables

Backend: `backend/.env`

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tuzamurane_cms
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Main API Endpoints

All protected endpoints require:

```text
Authorization: Bearer <jwt_token>
```

| Module | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| Auth | POST | `/api/auth/login` | Login by email or username |
| Auth | GET | `/api/auth/me` | Current authenticated user |
| Cooperatives | GET/POST | `/api/cooperatives` | List or create cooperatives |
| Cooperatives | GET/PUT/DELETE | `/api/cooperatives/:id` | View, update, delete |
| Farmers | GET/POST | `/api/farmers` | List or register farmers |
| Farmers | GET/PUT/DELETE | `/api/farmers/:id` | View, update, delete |
| Farmers | GET | `/api/farmers/history/:farmerNumber` | Full delivery and payment history |
| Deliveries | GET/POST | `/api/deliveries` | List or record deliveries |
| Deliveries | GET/PUT/DELETE | `/api/deliveries/:id` | View, update, delete |
| Payments | GET | `/api/payments` | List pending and paid payments |
| Payments | PATCH | `/api/payments/:id/pay` | Mark payment as paid |
| Payments | GET | `/api/payments/:id/receipt` | Generate receipt data |
| Dashboard | GET | `/api/dashboard` | Summary analytics |
| Reports | GET | `/api/reports/monthly-income` | Monthly income report |
| Reports | GET | `/api/reports/payments` | Payment report |
| Reports | GET | `/api/reports/farmer-deliveries` | Farmer delivery report |
| Reports | GET | `/api/reports/crop-performance` | Crop performance report |
| Audit | GET | `/api/audit-logs` | System audit logs |

## Screenshots

Run the project with `npm run dev`, then capture screenshots from:

- `/dashboard`
- `/farmers`
- `/deliveries`
- `/payments`
- `/reports`

## Production Notes

- Replace `JWT_SECRET` with a strong secret before deployment.
- Use a managed MongoDB connection string or protected self-hosted MongoDB instance.
- Serve the frontend build from a CDN or static host and set `CLIENT_URL` accordingly.
- Restrict CORS to the deployed frontend domain.
- Configure HTTPS and secure reverse proxy headers in production.
