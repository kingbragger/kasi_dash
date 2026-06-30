# Workspace

## Overview

pnpm workspace monorepo using TypeScript. "Kasi Dash" — a premium South African township delivery platform (no restaurants/grocery stores).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind + framer-motion + shadcn/ui
- **Maps**: react-leaflet + Leaflet.js (OpenStreetMap / CARTO dark tiles, no API key needed)
- **Payments**: Ozow (South African EFT)
- **Auth (customers)**: Clerk (`@clerk/react` + `@clerk/express`) — email/password + Google SSO, email verification on sign-up, password reset built-in
- **Auth (staff/drivers)**: Session-based (express-session) — separate sessions via STAFF_USERNAME/STAFF_PASSWORD env vars
- **Contact email**: unity@kasidash.co.za

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

| Artifact | Path | Description |
|---|---|---|
| `kasi-dash` | `/` | Public website + staff admin + driver portal |
| `api-server` | `/api` | Express REST API |

## Environment Variables

| Key | Purpose |
|---|---|
| `SESSION_SECRET` | Express session signing key |
| `STAFF_USERNAME` | Admin login username (default: `admin`) |
| `STAFF_PASSWORD` | Admin login password (default: `kasidash2025`) |
| `OZOW_SITE_CODE` | Ozow payment site code (optional, test mode if unset) |
| `OZOW_PRIVATE_KEY` | Ozow private key |
| `OZOW_API_KEY` | Ozow API key |
| `APP_BASE_URL` | Public base URL for payment callbacks |

## Database Tables

| Table | Purpose |
|---|---|
| `waitlist` | Email waitlist signups |
| `orders` | Delivery orders (includes `driver_id`, `driver_name` columns) |
| `payments` | Ozow payment records |
| `job_listings` | Admin-managed career listings |
| `driver_applications` | Driver applications from the public |
| `vendor_applications` | Vendor/partner applications from the public |
| `job_applications` | Job applications linked to job listings |
| `drivers` | Active driver accounts (created by staff from approved applications) |
| `driver_locations` | Live GPS coordinates per driver (upserted on each broadcast) |
| `catalogues` | Vendor store catalogues (vendorName, category, township, isActive) |
| `catalogue_items` | Products within a catalogue (name, price, imageUrl, category, inStock) |
| `buildforge_team` | BuildForge core team members (auth, bank details, profile) |
| `buildforge_projects` | Website projects assigned to team members by staff |

## Site Pages

### Public
| Route | Page |
|---|---|
| `/` | Landing page — hero, features, vendor pricing (R250/mo), ecosystem CTAs |
| `/shop` | Browse live vendor catalogues; add items to cart |
| `/cart` | Shopping cart — review items, place order via checkout |
| `/about` | About Us — mission, story, contact |
| `/privacy` | Privacy Policy (POPIA compliant) |
| `/terms` | Terms & Conditions (SA law, R250/month vendor pricing noted) |
| `/order` | Place a custom delivery order + Ozow payment |
| `/careers` | Job listings (admin-managed) |
| `/careers/:id` | Job detail + apply form |
| `/apply/driver` | Driver application form |
| `/apply/vendor` | Vendor/partner application form |
| `/payment/success` | Post-payment success screen |
| `/payment/failed` | Post-payment failure screen |
| `/track/:orderId` | Customer live order tracking with map |
| `/receipt/:orderId` | Printable branded order receipt |

### Driver Portal
| Route | Page |
|---|---|
| `/driver/login` | Driver login (email + password) |
| `/driver` | Driver dashboard — assigned orders, status updates, GPS broadcasting |

### BuildForge Team Portal
| Route | Page |
|---|---|
| `/buildforge` | Public BuildForge page — challenge link, website services, member login link |
| `/buildforge/login` | Email-first login (email check then password) |
| `/buildforge/change-password` | Forced on first login with temp password |
| `/buildforge/complete-profile` | ID number required before accessing portal |
| `/buildforge/portal` | Member dashboard: assigned projects, bank details form, account info |
| `/buildforge/contract` | Printable/downloadable team agreement with member name auto-filled |

### Staff Admin
| Route | Page |
|---|---|
| `/staff/login` | Staff login (username + password) |
| `/staff` | Dashboard — stats overview + quick links |
| `/staff/orders` | Orders manager — view all, assign drivers, track/receipt links |
| `/staff/map` | Live driver map — all active drivers with real-time GPS |
| `/staff/catalogues` | Catalogue manager — create/edit vendor catalogues & product items |
| `/staff/applications/drivers` | Driver applications (review + Activate Driver Account button) |
| `/staff/applications/vendors` | Vendor applications manager |
| `/staff/applications/jobs` | Job applications manager |
| `/staff/careers` | Create / edit / toggle job listings |
| `/staff/buildforge` | BuildForge admin: applications, projects (assign to members), team management |

## Shared Components

| Component | Purpose |
|---|---|
| `Navbar.tsx` | Sticky top nav with Shop, Careers, About, Become a Driver, Partner links + cart badge |
| `Footer.tsx` | Site footer with legal links (Privacy, T&C), R250/month vendor note, email |
| `CartContext.tsx` | Global cart state (localStorage-persisted); exposes `add`, `remove`, `update`, `clear`, `total`, `count` |
| `StaffLayout.tsx` | Sidebar shell for all `/staff/*` pages with auth guard |
| `KasiDashLogo.tsx` | Brand logo component |

## Catalogue / Shop System

- Staff create catalogues at `/staff/catalogues` → toggle live/hidden, add/edit/delete items with price, image, category, stock status
- Public shop at `/shop` fetches only `isActive: true` catalogues; customers add items to cart
- Cart persists to `localStorage` (`kasi_cart` key); cart icon in Navbar shows item count badge
- Cart checkout at `/cart` POSTs to `/api/orders` with items encoded in description field
- Vendor listing fee: **R250/month per active catalogue** (displayed in footer, pricing section, and Terms)

## Driver Workflow

1. Driver applies at `/apply/driver`
2. Staff reviews at `/staff/applications/drivers` and clicks **Activate Driver Account**
3. System creates a `drivers` record with a generated temp password (shown in a toast)
4. Driver logs in at `/driver/login` with their email + temp password
5. Driver sees assigned orders, taps "Go Live" to broadcast GPS every 10 seconds
6. Staff sees all live drivers on `/staff/map`
7. Staff assigns a driver to an order from `/staff/orders`
8. Customer tracks at `/track/:orderId` — live map refreshes every 8 seconds
9. Customer views receipt at `/receipt/:orderId` (also accessible from `/track` once delivered)

## Architecture Notes

- Staff routes are protected by `requireStaff` middleware (checks `req.session.staffUser`)
- Driver routes are protected by `requireDriver` middleware (checks `req.session.driverUser`)
- Staff catalogue API routes (`/api/staff/catalogues/*`) are protected by `requireStaff` — public (`/api/catalogues`) routes are open
- Driver passwords are hashed with bcrypt (10 rounds)
- All application forms POST to `/api/apply/*` endpoints
- Live tracking uses polling (no WebSockets): drivers POST to `/api/driver/location` every 10s; map pages poll GET endpoints every 8s
- Leaflet CSS loaded via CDN in `index.html`; dark tiles from CARTO (no API key)
- Careers are managed exclusively via the staff admin panel — no hardcoded data
- The frontend uses generated React Query hooks from `@workspace/api-client-react`
- The backend uses Zod schemas from `@workspace/api-zod` for request validation
- Session cookie is HttpOnly, 8 hours max age, secure in production
