# API Documentation

Complete reference for all API endpoints with request/response examples.

## Base URL

```
http://localhost:8000/api/
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Descriptive success message",
  "data": {} or []
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details" or {"field": ["error message"]}
}
```

## Authentication

Currently, the API does not require authentication. This can be added in future versions.

## Employee Endpoints

### 1. List All Employees

**Endpoint:** `GET /api/employees/`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | No | Search query (name, ID, email, department) |
| department | string | No | Filter by department |

**Example Requests:**

```bash
# Get all employees
curl http://localhost:8000/api/employees/

# Search employees
curl "http://localhost:8000/api/employees/?q=john"

# Filter by department
curl "http://localhost:8000/api/employees/?department=Engineering"
```

**Success Response (200 OK):**

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
    },
    {
      "id": 2,
      "employee_id": "EMP002",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "department": "Marketing",
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

### 2. Create Employee

**Endpoint:** `POST /api/employees/`

**Request Body:**

```json
{
  "employee_id": "EMP001",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering"
}
```

**Field Validation:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| employee_id | string | Yes | Unique, max 20 chars |
| name | string | Yes | Letters and spaces only, max 100 chars |
| email | string | Yes | Valid email format, unique |
| department | string | Yes | Must be from: Engineering, Marketing, Human Resources, Sales, Finance, Operations |

**Example Request:**

```bash
curl -X POST http://localhost:8000/api/employees/ \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "department": "Engineering"
  }'
```

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
    "email": ["Enter a valid email address."],
    "name": ["Full name is required."],
    "department": ["Department is required."]
  }
}
```

---

### 3. Retrieve Employee

**Endpoint:** `GET /api/employees/{id}/`

Can use either database ID or employee_id.

**Example Requests:**

```bash
# By database ID
curl http://localhost:8000/api/employees/1/

# By employee_id
curl http://localhost:8000/api/employees/EMP001/
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Employee retrieved successfully.",
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

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "Employee not found.",
  "error": "No Employee matches the given query."
}
```

---

### 4. Update Employee (Full Update)

**Endpoint:** `PUT /api/employees/{id}/`

**Request Body:**

```json
{
  "employee_id": "EMP001",
  "name": "John Updated",
  "email": "john.updated@example.com",
  "department": "Marketing"
}
```

**Example Request:**

```bash
curl -X PUT http://localhost:8000/api/employees/1/ \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "department": "Marketing"
  }'
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Employee updated successfully.",
  "data": {
    "id": 1,
    "employee_id": "EMP001",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "department": "Marketing",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T15:45:00Z"
  }
}
```

---

### 5. Partial Update Employee

**Endpoint:** `PATCH /api/employees/{id}/`

**Request Body (any subset of fields):**

```json
{
  "department": "Sales"
}
```

**Example Request:**

```bash
curl -X PATCH http://localhost:8000/api/employees/1/ \
  -H "Content-Type: application/json" \
  -d '{"department": "Sales"}'
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Employee updated successfully.",
  "data": {
    "id": 1,
    "employee_id": "EMP001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "department": "Sales",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T16:00:00Z"
  }
}
```

---

### 6. Delete Employee

**Endpoint:** `DELETE /api/employees/{id}/`

**Example Request:**

```bash
curl -X DELETE http://localhost:8000/api/employees/1/
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

**Note:** Deleting an employee also deletes all their attendance records (CASCADE).

---

## Attendance Endpoints

### 1. List Attendance Records

**Endpoint:** `GET /api/attendance/`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string (YYYY-MM-DD) | No | Filter by specific date |
| employee_id | string | No | Filter by employee |
| status | string | No | Filter by status (Present/Absent) |

**Example Requests:**

```bash
# Get all attendance
curl http://localhost:8000/api/attendance/

# Filter by date
curl "http://localhost:8000/api/attendance/?date=2024-01-15"

# Filter by employee
curl "http://localhost:8000/api/attendance/?employee_id=EMP001"

# Filter by status
curl "http://localhost:8000/api/attendance/?status=Present"

# Multiple filters
curl "http://localhost:8000/api/attendance/?date=2024-01-15&status=Present"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Attendance records retrieved successfully.",
  "data": [
    {
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
      "created_at": "2024-01-15T09:00:00Z",
      "updated_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

---

### 2. Mark Attendance

**Endpoint:** `POST /api/attendance/`

**Request Body:**

```json
{
  "employee_id": "EMP001",
  "date": "2024-01-15",
  "status": "Present"
}
```

**Field Validation:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| employee_id | string | Yes | Must exist in database |
| date | string (YYYY-MM-DD) | Yes | Cannot be future date |
| status | string | Yes | Must be "Present" or "Absent" |

**Important:** If attendance already exists for the employee on the given date, it will be **updated** instead of creating a duplicate.

**Example Request:**

```bash
curl -X POST http://localhost:8000/api/attendance/ \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "date": "2024-01-15",
    "status": "Present"
  }'
```

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
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T09:00:00Z"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "employee_id": ["Employee with ID EMP999 does not exist."],
    "date": ["Cannot mark attendance for future dates."],
    "status": ["Status must be either Present or Absent."]
  }
}
```

---

### 3. Get Attendance by Date

**Endpoint:** `GET /api/attendance/by-date/`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string (YYYY-MM-DD) | No | Date to filter (defaults to today) |

**Example Requests:**

```bash
# Today's attendance
curl http://localhost:8000/api/attendance/by-date/

# Specific date
curl "http://localhost:8000/api/attendance/by-date/?date=2024-01-15"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Attendance records for 2024-01-15 retrieved successfully.",
  "data": [
    {
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
      "created_at": "2024-01-15T09:00:00Z",
      "updated_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

---

### 4. Get Employee Attendance History

**Endpoint:** `GET /api/attendance/by-employee/`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| employee_id | string | Yes | Employee ID to get history for |

**Example Request:**

```bash
curl "http://localhost:8000/api/attendance/by-employee/?employee_id=EMP001"
```

**Success Response (200 OK):**

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
    "records": [
      {
        "id": 20,
        "employee": {...},
        "date": "2024-01-15",
        "status": "Present",
        "created_at": "2024-01-15T09:00:00Z",
        "updated_at": "2024-01-15T09:00:00Z"
      },
      // ... more records (sorted by date descending)
    ]
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation failed.",
  "error": "employee_id parameter is required."
}
```

---

### 5. Get Dashboard Statistics

**Endpoint:** `GET /api/attendance/statistics/`

Returns comprehensive statistics for the dashboard.

**Example Request:**

```bash
curl http://localhost:8000/api/attendance/statistics/
```

**Success Response (200 OK):**

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
      },
      {
        "department": "Human Resources",
        "count": 2
      }
    ]
  }
}
```

**Field Descriptions:**
- `total_employees`: Total number of employees in the system
- `present_today`: Number of employees marked present today
- `absent_today`: Number of employees marked absent today
- `not_marked_today`: Employees without attendance record for today
- `attendance_rate`: Overall attendance percentage for current month
- `department_breakdown`: Employee count per department

---

## HTTP Status Codes

| Code | Description | When Used |
|------|-------------|-----------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors, invalid data |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side errors |

---

## Common Error Scenarios

### 1. Duplicate Employee ID

**Request:**
```json
POST /api/employees/
{
  "employee_id": "EMP001",  // Already exists
  "name": "Jane Doe",
  "email": "jane@example.com",
  "department": "Marketing"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "employee_id": ["Employee with ID EMP001 already exists."]
  }
}
```

### 2. Invalid Email Format

**Request:**
```json
POST /api/employees/
{
  "employee_id": "EMP002",
  "name": "Jane Doe",
  "email": "invalid-email",  // Invalid format
  "department": "Marketing"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "email": ["Enter a valid email address."]
  }
}
```

### 3. Missing Required Fields

**Request:**
```json
POST /api/employees/
{
  "employee_id": "EMP002"
  // Missing name, email, department
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "name": ["Full name is required."],
    "email": ["Email is required."],
    "department": ["Department is required."]
  }
}
```

### 4. Invalid Department

**Request:**
```json
POST /api/employees/
{
  "employee_id": "EMP002",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "department": "InvalidDept"  // Not in choices
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "department": ["Select a valid department."]
  }
}
```

### 5. Future Date for Attendance

**Request:**
```json
POST /api/attendance/
{
  "employee_id": "EMP001",
  "date": "2025-12-31",  // Future date
  "status": "Present"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "date": ["Cannot mark attendance for future dates."]
  }
}
```

### 6. Non-existent Employee

**Request:**
```json
POST /api/attendance/
{
  "employee_id": "EMP999",  // Doesn't exist
  "date": "2024-01-15",
  "status": "Present"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "employee_id": ["Employee with ID EMP999 does not exist."]
  }
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. This can be added in future versions using packages like `django-ratelimit`.

---

## CORS Configuration

The API allows requests from:
- `http://localhost:3000`
- `http://localhost:3001`

Additional origins can be added in the `.env` file:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

---

## Postman Collection

You can import these endpoints into Postman for easy testing. Create a new collection with the base URL `http://localhost:8000/api/` and add all endpoints listed above.

---

## Notes

1. All dates should be in ISO format: `YYYY-MM-DD`
2. All timestamps are in ISO 8601 format with UTC timezone
3. Employee IDs are case-sensitive
4. Email addresses are automatically converted to lowercase
5. Attendance records enforce unique constraint per employee per date
6. Deleting an employee cascades to delete all their attendance records
