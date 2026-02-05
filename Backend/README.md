# HRM Backend API

A comprehensive Django REST API backend for the Human Resource Management (HRM) system. This API provides endpoints for employee management and attendance tracking with robust validation and error handling.

## Features

- ✅ RESTful API design
- ✅ Employee CRUD operations
- ✅ Attendance tracking and management
- ✅ Comprehensive validation (required fields, email format, duplicate handling)
- ✅ Meaningful error messages with proper HTTP status codes
- ✅ Search and filtering capabilities
- ✅ Dashboard statistics
- ✅ Support for both SQL (PostgreSQL/SQLite) and NoSQL (MongoDB)
- ✅ CORS enabled for frontend integration
- ✅ Admin panel for data management
- ✅ Comprehensive test suite

## Technology Stack

- **Framework**: Django 5.0.1
- **API**: Django REST Framework 3.14.0
- **Database**: PostgreSQL / MongoDB / SQLite
- **CORS**: django-cors-headers

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- PostgreSQL (for SQL database) OR MongoDB (for NoSQL database) OR SQLite (built-in)
- Virtual environment tool (recommended)

## Installation & Setup

### Step 1: Clone the Repository

```bash
cd hrmproj
# The backend code is already in the hrm_backend folder
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
cd hrm_backend
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your configuration
# See "Database Configuration" section below
```

## Database Configuration

You can use **SQL (PostgreSQL/SQLite)** or **NoSQL (MongoDB)**. Choose based on your requirements:

### Option 1: SQLite (Recommended for Development)

**Pros:**
- No installation required
- Zero configuration
- Perfect for development and testing
- File-based, portable

**Cons:**
- Not suitable for production with high concurrency
- Limited advanced features

**Configuration:**
```env
# In .env file
DB_ENGINE=sqlite
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Option 2: PostgreSQL (Recommended for Production)

**Pros:**
- Robust, production-ready
- ACID compliant
- Excellent performance
- Advanced query capabilities
- Strong data integrity
- Better for complex queries and relationships

**Cons:**
- Requires separate installation
- More complex setup

**Installation:**
```bash
# On Ubuntu/Debian:
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# On macOS (using Homebrew):
brew install postgresql

# On Windows:
# Download from https://www.postgresql.org/download/windows/
```

**Configuration:**
```env
# In .env file
DB_ENGINE=postgresql
DB_NAME=hrm_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Create Database:**
```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hrm_db;

# Exit PostgreSQL
\q
```

### Option 3: MongoDB (For NoSQL Requirements)

**Pros:**
- Flexible schema
- Horizontal scalability
- Good for unstructured data
- Fast for simple queries

**Cons:**
- No ACID transactions (before 4.0)
- Less suitable for complex relationships
- Requires additional driver (djongo)

**Installation:**
```bash
# On Ubuntu/Debian:
sudo apt-get install mongodb

# On macOS (using Homebrew):
brew tap mongodb/brew
brew install mongodb-community

# On Windows:
# Download from https://www.mongodb.com/try/download/community
```

**Configuration:**
```env
# In .env file
DB_ENGINE=mongodb
MONGO_DB_NAME=hrm_db
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=
MONGO_PASSWORD=
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Recommendation

**For this HRM System, we recommend PostgreSQL** because:

1. **Data Relationships**: The HRM system has clear relationships (Employee → Attendance)
2. **Data Integrity**: Employee and attendance data require strong consistency
3. **Query Complexity**: Dashboard statistics and filtering benefit from SQL capabilities
4. **Production Ready**: PostgreSQL is battle-tested for production environments
5. **Easy Development**: SQLite for dev, PostgreSQL for production (same ORM)

**Use MongoDB only if:**
- You need extreme horizontal scalability
- Your schema will change frequently
- You have unstructured data requirements
- You're already using MongoDB in your stack

### Step 5: Run Migrations

```bash
# Create migration files
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate
```

### Step 6: Create Superuser (Admin Access)

```bash
python manage.py createsuperuser

# Follow the prompts to create admin account
```

### Step 7: Run Development Server

```bash
python manage.py runserver

# Server will start at http://localhost:8000
```

### Step 8: Run Tests (Optional)

```bash
# Run all tests
python manage.py test

# Run specific test
python manage.py test employees.tests.EmployeeAPITestCase
```

## API Endpoints

### Base URL
```
http://localhost:8000/api/
```

### Employee Endpoints

#### 1. List All Employees
```http
GET /api/employees/
```

**Query Parameters:**
- `q` (optional): Search query (searches name, ID, email, department)
- `department` (optional): Filter by department

**Response:**
```json
{
  "success": true,
  "message": "Employees retrieved successfully.",
  "data": [
    {
      "id": 1,
      "employee_id": "EMP001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "department": "Engineering",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 2. Create Employee
```http
POST /api/employees/
Content-Type: application/json

{
  "employee_id": "EMP001",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering"
}
```

**Validation Rules:**
- `employee_id`: Required, unique
- `name`: Required, letters and spaces only
- `email`: Required, valid email format, unique
- `department`: Required, must be from valid choices

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Employee created successfully.",
  "data": {
    "id": 1,
    "employee_id": "EMP001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "department": "Engineering",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "employee_id": ["Employee with ID EMP001 already exists."],
    "email": ["Enter a valid email address."]
  }
}
```

#### 3. Retrieve Employee
```http
GET /api/employees/{id}/
# or
GET /api/employees/{employee_id}/
```

#### 4. Update Employee
```http
PUT /api/employees/{id}/
Content-Type: application/json

{
  "employee_id": "EMP001",
  "name": "John Updated",
  "email": "john.updated@example.com",
  "department": "Marketing"
}
```

#### 5. Partial Update Employee
```http
PATCH /api/employees/{id}/
Content-Type: application/json

{
  "department": "Sales"
}
```

#### 6. Delete Employee
```http
DELETE /api/employees/{id}/
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Employee deleted successfully.",
  "data": {
    "id": 1,
    "employee_id": "EMP001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "department": "Engineering"
  }
}
```

#### 7. Search Employees
```http
GET /api/employees/search/?q=john
```

### Attendance Endpoints

#### 1. List Attendance Records
```http
GET /api/attendance/
```

**Query Parameters:**
- `date` (optional): Filter by date (YYYY-MM-DD)
- `employee_id` (optional): Filter by employee
- `status` (optional): Filter by status (Present/Absent)

#### 2. Mark Attendance
```http
POST /api/attendance/
Content-Type: application/json

{
  "employee_id": "EMP001",
  "date": "2024-01-15",
  "status": "Present"
}
```

**Validation Rules:**
- `employee_id`: Required, must exist
- `date`: Required, cannot be future date
- `status`: Required, must be "Present" or "Absent"

**Note:** If attendance already exists for the employee on the given date, it will be updated.

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Attendance marked successfully.",
  "data": {
    "id": 1,
    "employee": {
      "id": 1,
      "employee_id": "EMP001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "department": "Engineering"
    },
    "date": "2024-01-15",
    "status": "Present",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### 3. Get Attendance by Date
```http
GET /api/attendance/by-date/?date=2024-01-15
```

#### 4. Get Employee Attendance History
```http
GET /api/attendance/by-employee/?employee_id=EMP001
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance history retrieved successfully.",
  "data": {
    "employee_id": "EMP001",
    "employee_name": "John Doe",
    "total_days": 20,
    "present_count": 18,
    "absent_count": 2,
    "attendance_rate": 90.0,
    "records": [...]
  }
}
```

#### 5. Get Dashboard Statistics
```http
GET /api/attendance/statistics/
```

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully.",
  "data": {
    "total_employees": 10,
    "present_today": 8,
    "absent_today": 1,
    "not_marked_today": 1,
    "attendance_rate": 85.5,
    "department_breakdown": [
      {
        "department": "Engineering",
        "count": 5
      },
      {
        "department": "Marketing",
        "count": 3
      }
    ]
  }
}
```

## Error Handling

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, PATCH, DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Validation errors
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

### Error Response Format

```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "field_name": ["Error message"]
  }
}
```

## Admin Panel

Access the Django admin panel at: `http://localhost:8000/admin/`

Features:
- Manage employees
- Manage attendance records
- View statistics
- Search and filter data

## Testing

Run the test suite:

```bash
# Run all tests
python manage.py test

# Run with verbose output
python manage.py test --verbosity=2

# Run specific test class
python manage.py test employees.tests.EmployeeAPITestCase

# Run specific test method
python manage.py test employees.tests.EmployeeAPITestCase.test_create_employee
```

## Frontend Integration

### CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:3001`

Update `CORS_ALLOWED_ORIGINS` in `.env` to add more origins.

### API Base URL in Frontend

Update your frontend to use:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### Example Frontend Integration

```javascript
// Fetch all employees
const response = await fetch('http://localhost:8000/api/employees/');
const data = await response.json();

if (data.success) {
  console.log(data.data); // Array of employees
}

// Create employee
const response = await fetch('http://localhost:8000/api/employees/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    employee_id: 'EMP001',
    name: 'John Doe',
    email: 'john@example.com',
    department: 'Engineering'
  })
});

const data = await response.json();
if (data.success) {
  console.log('Employee created:', data.data);
} else {
  console.error('Validation errors:', data.error);
}
```

## Production Deployment

### Environment Variables

Update `.env` for production:
```env
DEBUG=False
SECRET_KEY=your-strong-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_ENGINE=postgresql
# ... other production settings
```

### Security Checklist

- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Use PostgreSQL (not SQLite)
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure static files serving
- [ ] Set up database backups
- [ ] Use environment variables for secrets
- [ ] Enable Django security middleware

### Collect Static Files

```bash
python manage.py collectstatic
```

## Troubleshooting

### Database Connection Issues

**PostgreSQL:**
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart
```

**MongoDB:**
```bash
# Check if MongoDB is running
sudo service mongodb status

# Restart MongoDB
sudo service mongodb restart
```

### Migration Issues

```bash
# Reset migrations (development only!)
python manage.py migrate employees zero
python manage.py makemigrations
python manage.py migrate
```

### CORS Issues

Ensure your frontend origin is listed in `CORS_ALLOWED_ORIGINS` in `.env`.

## Support

For issues and questions:
1. Check the error messages in the API response
2. Review the validation rules in this README
3. Check Django logs for detailed errors
4. Run tests to identify issues

## License

This project is created for the HRM system frontend integration.
