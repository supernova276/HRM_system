"""
Tests for Employee and Attendance APIs.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Employee, Attendance
from datetime import date


class EmployeeAPITestCase(TestCase):
    """
    Test cases for Employee API endpoints.
    """
    
    def setUp(self):
        self.client = APIClient()
        self.employee_data = {
            'employee_id': 'EMP001',
            'name': 'John Doe',
            'email': 'john.doe@example.com',
            'department': 'Engineering'
        }
        self.employee = Employee.objects.create(**self.employee_data)

    def test_create_employee(self):
        """Test creating a new employee."""
        new_employee = {
            'employee_id': 'EMP002',
            'name': 'Jane Smith',
            'email': 'jane.smith@example.com',
            'department': 'Marketing'
        }
        response = self.client.post('/api/employees/', new_employee, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])

    def test_create_employee_duplicate_id(self):
        """Test creating employee with duplicate ID."""
        response = self.client.post('/api/employees/', self.employee_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_list_employees(self):
        """Test listing all employees."""
        response = self.client.get('/api/employees/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreater(len(response.data['data']), 0)

    def test_retrieve_employee(self):
        """Test retrieving a specific employee."""
        response = self.client.get(f'/api/employees/{self.employee.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_update_employee(self):
        """Test updating an employee."""
        updated_data = self.employee_data.copy()
        updated_data['name'] = 'John Updated'
        response = self.client.put(
            f'/api/employees/{self.employee.id}/',
            updated_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_delete_employee(self):
        """Test deleting an employee."""
        response = self.client.delete(f'/api/employees/{self.employee.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_search_employees(self):
        """Test searching employees."""
        response = self.client.get('/api/employees/?q=John')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])


class AttendanceAPITestCase(TestCase):
    """
    Test cases for Attendance API endpoints.
    """
    
    def setUp(self):
        self.client = APIClient()
        self.employee = Employee.objects.create(
            employee_id='EMP001',
            name='John Doe',
            email='john.doe@example.com',
            department='Engineering'
        )
        self.attendance_data = {
            'employee_id': 'EMP001',
            'date': date.today().isoformat(),
            'status': 'Present'
        }

    def test_mark_attendance(self):
        """Test marking attendance."""
        response = self.client.post('/api/attendance/', self.attendance_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])

    def test_mark_attendance_invalid_employee(self):
        """Test marking attendance for non-existent employee."""
        invalid_data = self.attendance_data.copy()
        invalid_data['employee_id'] = 'INVALID'
        response = self.client.post('/api/attendance/', invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_list_attendance(self):
        """Test listing attendance records."""
        Attendance.objects.create(
            employee=self.employee,
            date=date.today(),
            status='Present'
        )
        response = self.client.get('/api/attendance/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_get_attendance_by_date(self):
        """Test getting attendance for a specific date."""
        Attendance.objects.create(
            employee=self.employee,
            date=date.today(),
            status='Present'
        )
        response = self.client.get(f'/api/attendance/by-date/?date={date.today().isoformat()}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_get_attendance_by_employee(self):
        """Test getting attendance history for an employee."""
        Attendance.objects.create(
            employee=self.employee,
            date=date.today(),
            status='Present'
        )
        response = self.client.get(f'/api/attendance/by-employee/?employee_id={self.employee.employee_id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_get_statistics(self):
        """Test getting attendance statistics."""
        response = self.client.get('/api/attendance/statistics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
