# TravelKit — Smart Travel Planner

> A production-quality React SPA that helps travelers plan trips, manage itineraries, track budgets, and organize travel documents — all in one place.

---

## Problem Statement

**Who is the user?** Students, young professionals, and frequent travelers who plan their own trips without a travel agent.

**What problem does it solve?** Travelers struggle to manage trip budgets, itineraries, and documents across multiple disconnected tools (spreadsheets, notes apps, email threads). TravelKit unifies all of this into one cohesive, intuitive application.

**Why does it matter?** A poorly planned trip leads to overspending, missed bookings, and forgotten documents. A well-organized travel plan means more time enjoying the destination and less time scrambling.

---

## Features

- **Authentication** — Sign up, log in, log out with protected routes
- **Dashboard** — Overview of all trips with summary statistics (total trips, upcoming count, completed, total budget)
- **Trip Management** — Full CRUD for trips (title, destination, dates, budget, currency, emoji cover, status, notes)
- **Itinerary Builder** — Day-by-day activity planning with CRUD; activities organized by day with time/location/category
- **Budget Tracker** — Expense logging with category filter, running total vs. budget with color-coded progress bar, per-category breakdowns
- **Documents Vault** — Manage travel documents (passport, visa, insurance, tickets, hotel bookings) with expiry tracking
- **Demo Account** — Pre-loaded sample data for immediate exploration

---

## Tech Stack

| Category | Technology |
|---|---|
| Frontend Framework | React 19 with TypeScript |
| Build Tool | Vite 7 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| Component Library | shadcn/ui (Radix UI) |
| Form Handling | react-hook-form + Zod validation |
| State Management | React Context API |
| Persistence | localStorage (browser) |
| Icons | Lucide React |
| Date Utilities | date-fns |

---

## React Concepts Demonstrated

### Core Concepts
- **Functional Components** — All components are functional (no class components)
- **Props & Composition** — `TripCard`, `StatCard`, `ItineraryTab`, `BudgetTab`, `DocumentsTab` receive props and compose layouts
- **useState** — Used extensively for form state, dialog open/close, filter selection, loading states, error messages
- **useEffect** — Used for: checking auth on mount, syncing session storage, updating document title, auto-focusing inputs
- **Conditional Rendering** — Loading skeletons, empty states, error messages, protected routes all conditionally render
- **Lists & Keys** — All lists (trips, activities, expenses, documents) use unique IDs as keys

### Intermediate Concepts
- **Lifting State Up** — `TripDetail` fetches the trip and lifts it down to tab components (`ItineraryTab`, `BudgetTab`, `DocumentsTab`)
- **Controlled Components** — Every form field is a controlled input via `react-hook-form` with default values
- **Routing** — React Router with `<BrowserRouter>`, `<Routes>`, `<Route>`, `useParams`, `useNavigate`, `Link`
- **Context API** — `AuthContext` (auth state + login/register/logout) and `TripContext` (all trip data + CRUD operations) provide global state

### Advanced Concepts
- **useMemo** — Dashboard stats computed from trips/expenses, trip card budget percentage and color, filtered expense lists, grouped itinerary days, category totals
- **useCallback** — Form submit handlers in tab components, delete handlers passed as props to prevent unnecessary re-renders
- **useRef** — Auto-focus first input in all forms; `useDocumentTitle` custom hook uses `useRef` to track original title
- **React.lazy + Suspense** — All page components are lazy-loaded in `App.tsx` with a `<Suspense>` fallback
- **Performance Optimization** — Memoized computations, stable callbacks, proper dependency arrays

---

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── budget/
│   │   └── BudgetTab.tsx      # Budget tracker tab
│   ├── documents/
│   │   └── DocumentsTab.tsx   # Documents tab
│   ├── itinerary/
│   │   └── ItineraryTab.tsx   # Itinerary tab
│   ├── Layout.tsx             # App shell with top nav
│   ├── ProtectedRoute.tsx     # Auth guard wrapper
│   ├── StatCard.tsx           # Metric display card
│   └── TripCard.tsx           # Trip list card
├── context/
│   ├── AuthContext.tsx        # Authentication state & actions
│   └── TripContext.tsx        # Trip data & CRUD operations
├── hooks/
│   └── useDocumentTitle.ts    # Custom hook using useRef
├── pages/
│   ├── Dashboard.tsx          # Main overview page
│   ├── Login.tsx              # Login page
│   ├── Register.tsx           # Registration page
│   ├── TripNew.tsx            # Create trip form
│   ├── TripDetail.tsx         # Trip view with tabs
│   ├── TripEdit.tsx           # Edit trip form
│   └── not-found.tsx          # 404 page
├── services/
│   └── storage.ts             # localStorage CRUD helpers with seed data
├── types.ts                   # TypeScript interfaces
├── App.tsx                    # Router, providers, lazy loading
└── main.tsx                   # React entry point
```

---

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [pnpm](https://pnpm.io/) v8 or higher (`npm install -g pnpm`)

### Running locally

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd <repo-name>

# 2. Install dependencies (from repo root)
pnpm install

# 3. Start the development server
pnpm --filter @workspace/smart-travel run dev
```

The app will be available at `http://localhost:<PORT>` (port is auto-assigned).

### Building for production

```bash
pnpm --filter @workspace/smart-travel run build
```

Output will be in `artifacts/smart-travel/dist/`.

---

## Demo Account

| Field | Value |
|---|---|
| Email | `demo@travel.com` |
| Password | `demo123` |

The demo account comes with two pre-loaded sample trips:
- **Tokyo Adventure** — 7-day trip to Tokyo, Japan (status: Planning)
- **Bali Retreat** — 5-day trip to Bali, Indonesia (status: Completed)

Each trip includes sample activities, expenses, and documents to demonstrate all features.

---

## Authentication Notes

This project uses **localStorage** for persistence (suitable for a course project demonstrating React concepts). In a production application, you would replace `src/services/storage.ts` with Firebase Firestore calls and use Firebase Authentication for secure user management.

To integrate Firebase, install `firebase` package and update:
1. `src/services/firebase.ts` — Initialize Firebase app, Auth, and Firestore
2. `src/context/AuthContext.tsx` — Use `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`
3. `src/services/storage.ts` — Replace localStorage calls with Firestore `addDoc`, `updateDoc`, `deleteDoc`, `getDocs`

---

## License

MIT — Free to use for educational purposes.
