# SmartDine - Location-Aware Food Discovery Platform

SmartDine is a production-quality web application for discovering amazing food in Coimbatore. It combines conversational AI, real-time location awareness, and intelligent recommendation algorithms to help food lovers find their next great meal.

## Features

- **Conversational Food Search**: Chat-style interface that understands mood, cravings, and budget
- **Live Location Tracking**: Real-time user location with distance-based recommendations
- **Interactive Map**: Full-screen OpenStreetMap with restaurant markers
- **Smart Recommendations**: Rule-based scoring system with AI-powered explanations
- **Favorites System**: Save and track your favorite restaurants
- **Search History**: Remember past searches and avoid repetitive recommendations
- **Save Discoveries**: Manually save restaurants you discover elsewhere
- **Advanced Filters**: Budget, cuisine, dietary preferences, ratings, and travel time
- **Session-Based Authentication**: Secure user accounts with email/password

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Leaflet + OpenStreetMap (maps)
- Fetch API (HTTP requests)

### Backend
- Django 5.0
- Django REST Framework
- MySQL (local database)
- Session-based authentication
- Google Gemini AI (conversational responses)

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- MySQL Workbench (optional, for database management)

## Installation

### 1. Clone the Repository
```bash
git clone 
cd smartdine
```

### 2. Database Setup

Create a MySQL database:
```sql
CREATE DATABASE smartdine_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here

DB_NAME=smartdine_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

GEMINI_API_KEY_1=your-gemini-key-1
GEMINI_API_KEY_2=your-gemini-key-2
GEMINI_API_KEY_3=your-gemini-key-3
```

Run migrations and seed data:
```bash
python manage.py makemigrations
python manage.py migrate
python seed_data.py
```

Create a superuser (optional):
```bash
python manage.py createsuperuser
```

### 4. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

## Running the Application

### Start Backend
```bash
cd backend
python manage.py runserver
```

Backend will run at `http://localhost:8000`

### Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will run at `http://localhost:5173`

## Usage

1. Open `http://localhost:5173` in your browser
2. Sign up with your email and password
3. Allow location access when prompted
4. Start chatting to discover restaurants!

### Example Queries

- "cheap spicy food"
- "comfort food after a long day"
- "late night biryani under 300"
- "best south indian breakfast"
- "fancy dinner for anniversary"

## Project Structure
```
smartdine/
├── backend/
│   ├── smartdine_project/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── core/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── services/
│   │       ├── recommendation_engine.py
│   │       └── gemini_service.py
│   ├── manage.py
│   ├── seed_data.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── RestaurantDetail.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── SaveDiscoveryModal.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Architecture

### Authentication Flow

1. User signs up or logs in via email/password
2. Django creates a session and sends session cookie
3. Frontend stores cookie automatically (credentials: "include")
4. All subsequent requests include session cookie
5. Backend validates session on protected endpoints

### Recommendation Algorithm

The recommendation engine uses a hybrid approach:

1. **Rule-Based Scoring**: Primary system that scores restaurants based on:
   - Distance from user (closer is better)
   - Budget match (within user's budget)
   - Cuisine match (keyword matching)
   - Mood/tag match (comfort, spicy, etc.)
   - Rating (higher is better)
   - Recency bias (avoid recent selections)
   - Favorite bias (boost favorited restaurants)

2. **AI Explanations**: Secondary system using Google Gemini:
   - Generates conversational, friendly explanations
   - Explains why each restaurant was recommended
   - Fallback to generic text if AI fails

This ensures the app always works even if the AI service is unavailable.

### Data Flow
User Input → Frontend → Backend API → Recommendation Engine → MySQL
↓
Gemini AI (optional)
↓
Frontend ← Backend API ← Scored & Explained Results
↓
Map + Chat UI

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - Create account
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/status/` - Check auth status

### Restaurants
- `GET /api/restaurants/` - List all restaurants
- `POST /api/recommend/` - Get personalized recommendations
- `GET /api/surprise/` - Get a surprise recommendation

### User Data
- `GET /api/favorites/` - Get user's favorites
- `POST /api/favorites/` - Add to favorites
- `DELETE /api/favorites/` - Remove from favorites
- `GET /api/history/` - Get search history
- `GET /api/saved-discoveries/` - Get saved discoveries
- `POST /api/saved-discoveries/` - Save a discovery

## Database Schema

### Users
- Django's built-in User model

### Restaurants
- id, name, address, latitude, longitude
- cuisines, price_range, average_cost, rating
- tags, must_try_dishes, special_recognition
- google_maps_link, swiggy_link, zomato_link
- is_veg, is_open_late

### Favorites
- user_id, restaurant_id, created_at

### SearchHistory
- user_id, query, selected_restaurant_id
- user_location_lat, user_location_lng, created_at

### SavedDiscoveries
- user_id, restaurant_name, area, source
- google_maps_link, image_url, notes, created_at

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DEBUG | Django debug mode | Yes |
| SECRET_KEY | Django secret key | Yes |
| DB_NAME | MySQL database name | Yes |
| DB_USER | MySQL username | Yes |
| DB_PASSWORD | MySQL password | Yes |
| DB_HOST | MySQL host | Yes |
| DB_PORT | MySQL port | Yes |
| GEMINI_API_KEY_1 | First Gemini API key | Yes |
| GEMINI_API_KEY_2 | Second Gemini API key | Yes |
| GEMINI_API_KEY_3 | Third Gemini API key | Yes |
