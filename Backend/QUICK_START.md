# Quick Start Guide

Get your HRM backend up and running in 5 minutes!

## Prerequisites

- Python 3.8+ installed
- pip installed
- Terminal/Command Prompt access

## Step-by-Step Setup

### 1. Extract the Backend Code

```bash
# Navigate to your project folder
cd hrmproj

# Extract the backend zip (if not already extracted)
# The backend should be in: hrmproj/hrm_backend/
```

### 2. Create Virtual Environment

```bash
# Navigate to backend folder
cd hrm_backend

# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# For quick start (SQLite - no database installation needed):
# The .env file is already configured for SQLite by default!
# Just make sure DB_ENGINE=sqlite or leave it out
```

### 5. Run Migrations

```bash
# Create database tables
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Admin User

```bash
python manage.py createsuperuser

# Enter username, email, and password when prompted
```

### 7. Start the Server

```bash
python manage.py runserver

# Server runs at: http://localhost:8000
```

### 8. Test the API

Open a new terminal and test:

```bash
# Test employee endpoint
curl http://localhost:8000/api/employees/

# Or open in browser:
# http://localhost:8000/api/employees/
```

### 9. Access Admin Panel

Open browser: `http://localhost:8000/admin/`

Login with superuser credentials.

## Connect Frontend

Update your React frontend to use:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

Replace localStorage calls with API calls:

```javascript
// Instead of:
localStorage.setItem('employees', JSON.stringify(employees));

// Use:
const response = await fetch(`${API_BASE_URL}/employees/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(employeeData)
});
```

## Common Commands

```bash
# Start server
python manage.py runserver

# Run tests
python manage.py test

# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Open Django shell
python manage.py shell
```

## API Endpoints Quick Reference

### Employees
- `GET /api/employees/` - List all
- `POST /api/employees/` - Create new
- `GET /api/employees/{id}/` - Get one
- `PUT /api/employees/{id}/` - Update
- `DELETE /api/employees/{id}/` - Delete

### Attendance
- `GET /api/attendance/` - List all
- `POST /api/attendance/` - Mark attendance
- `GET /api/attendance/by-date/?date=2024-01-15` - Get by date
- `GET /api/attendance/by-employee/?employee_id=EMP001` - Get history
- `GET /api/attendance/statistics/` - Dashboard stats

## Troubleshooting

### Port Already in Use?
```bash
# Use a different port
python manage.py runserver 8001
```

### Import Errors?
```bash
# Make sure virtual environment is activated
# Should see (venv) in prompt

# Reinstall dependencies
pip install -r requirements.txt
```

### Database Errors?
```bash
# Delete database and start fresh
rm db.sqlite3

# Run migrations again
python manage.py migrate
```

## Need Help?

1. Check `README.md` for detailed documentation
2. Check `API_DOCUMENTATION.md` for API details
3. Check `DATABASE_GUIDE.md` for database configuration
4. Check Django logs in terminal

## Production Deployment

For production, see:
- `README.md` - Section "Production Deployment"
- `DATABASE_GUIDE.md` - Switch to PostgreSQL
- Set `DEBUG=False` in `.env`

---

## Success! 🎉

Your backend is now running. Test it by:

1. Opening http://localhost:8000/api/employees/ in browser
2. Accessing admin panel at http://localhost:8000/admin/
3. Testing with curl or Postman
4. Connecting your React frontend

Happy coding!
