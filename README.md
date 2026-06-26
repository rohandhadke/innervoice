# InnerVoice

An anonymous thoughts & feelings platform where users can share what's on their mind, track their mood, and engage with a supportive community — all without revealing their identity.

## Features

- **Anonymous Posting** — Share thoughts and feelings without revealing your identity
- **Mood Journal** — Log and track your mood over time
- **Reactions & Comments** — Engage with other posts through reactions and comments
- **Tags** — Categorize posts with tags for easy discovery
- **Save Posts** — Bookmark posts to revisit later
- **Dashboard** — View mood trends and personal insights
- **User Profiles** — Manage your anonymous profile
- **Reporting** — Report inappropriate content to keep the community safe

## Tech Stack

### Frontend

- **React 19** with Vite
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for mood visualizations
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

### Backend

- **FastAPI** (Python)
- **SQLAlchemy** with Alembic for database & migrations
- **JWT** authentication (access + refresh tokens)
- **PostgreSQL** database

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Python** (3.10+)
- **PostgreSQL**

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file with:
#   DATABASE_URL=postgresql://user:password@localhost:5432/innervoice
#   SECRET_KEY=your-secret-key
#   ALGORITHM=HS256
#   ACCESS_TOKEN_EXPIRE_MINUTES=30
#   REFRESH_TOKEN_EXPIRE_DAYS=7

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend API on `http://localhost:8000`.

## Project Structure

```
innervoice/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Environment config
│   │   ├── database.py      # Database connection
│   │   ├── models/          # SQLAlchemy models
│   │   ├── routers/         # API route handlers
│   │   ├── schemas/         # Pydantic schemas
│   │   └── utils/           # Utility functions
│   ├── alembic/             # Database migrations
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── api/             # API service functions
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand state stores
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Root component & routing
│   │   └── main.jsx         # App entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```
