# Pokemon Center Dashboard

A mini internal dashboard for Pokemon Centers that visualizes healing activity, shows machine performance, and allows managing Pokemon currently being treated.

## Tech Stack

- **Backend**: Python + FastAPI
- **Frontend**: React + TypeScript + shadcn/ui + Recharts
- **Database**: SQLite (raw SQL queries, no ORM)

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm

## Getting Started

### 1. Start the Backend

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8001
```

The API will be available at `http://localhost:8001`

### 2. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## Features

### Overview Dashboard (/)
- Key metrics: total check-ins, success rate, active check-ins, top machine
- Interactive trend chart with filters:
  - Date range picker
  - Group by day/hour
  - Segment by Pokemon type or individual Pokemon
- Leaderboards for top Pokemon and types by successful heals
- Designed for hallway TV display with large, readable cards

### Machine Metrics (/machines)
- Table showing all machines with:
  - Total check-ins and success rate
  - Average healing time
  - Current Pokemon being treated
- Baseline comparison feature: select a machine to compare all others against
- Performance deltas shown for success rate, check-ins, and healing time

### Active Check-ins (/active)
- Grid of Pokemon currently being treated
- Each card shows:
  - Pokemon name and type
  - Machine and location
  - Arrival time and duration
  - HP bar visualization
- Dismiss button with confirmation dialog
- Choose outcome (success/fail) when dismissing
- Immediate UI updates after dismissal

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/metrics/checkins` | GET | Check-ins over time with optional filters |
| `/metrics/machines` | GET | Machine success rates and totals |
| `/metrics/machines/compare` | GET | Compare all machines vs a baseline |
| `/leaderboards` | GET | Top Pokemon and types by successful heals |
| `/checkins/active` | GET | Pokemon currently being treated |
| `/checkins/dismiss/:id` | POST | Mark a Pokemon as healed |

## UX Features

- **Theme Support**: Respects system dark/light mode preference
- **Theme Toggle**: Manual override via dropdown in header
- **Persistent State**: Filters and theme stored in URL params and localStorage
- **Loading States**: Skeleton loaders for all async data
- **Empty States**: Friendly messages when no data available
- **Error States**: Clear error messages with retry options

## Assumptions

1. The `clinic.sqlite` database is present in the project root
2. "Active" check-ins are those where `healed_at IS NULL`
3. Success rate is calculated as `(successful / total) * 100`
4. "Top performing machine" is determined by highest success rate
5. Leaderboards show top 5 entries by default (configurable via API)
6. Time zones are handled as local time from the database timestamps
