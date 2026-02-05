"""
API Views for Employee and Attendance management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from datetime import date, datetime, timedelta
from .models import Employee, Attendance
from .serializers import (
    EmployeeSerializer,
    AttendanceSerializer,
    AttendanceHistorySerializer,
    DashboardStatsSerializer
)
from .utils import success_response, error_response


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Employee CRUD operations.
    
    Endpoints:
    - GET /api/employees/ - List all employees
    - POST /api/employees/ - Create a new employee
    - GET /api/employees/{id}/ - Retrieve an employee
    - PUT /api/employees/{id}/ - Update an employee
    - PATCH /api/employees/{id}/ - Partial update an employee
    - DELETE /api/employees/{id}/ - Delete an employee
    - GET /api/employees/search/?q=query - Search employees
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def list(self, request):
        """
        List all employees with optional search.
        """
        try:
            queryset = self.get_queryset()
            
            # Search functionality
            search_query = request.query_params.get('q', None)
            if search_query:
                queryset = queryset.filter(
                    Q(employee_id__icontains=search_query) |
                    Q(name__icontains=search_query) |
                    Q(email__icontains=search_query) |
                    Q(department__icontains=search_query)
                )

            # Department filter
            department = request.query_params.get('department', None)
            if department:
                queryset = queryset.filter(department=department)

            serializer = self.get_serializer(queryset, many=True)
            return success_response(
                data=serializer.data,
                message='Employees retrieved successfully.'
            )
        except Exception as e:
            return error_response(
                error=str(e),
                message='Failed to retrieve employees.',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request):
        """
        Create a new employee.
        """
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return success_response(
                    data=serializer.data,
                    message='Employee created successfully.',
                    status_code=status.HTTP_201_CREATED
                )
            return error_response(
                error=serializer.errors,
                message='Validation failed.',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                error=str(e),
                message='Failed to create employee.',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        """
        Retrieve a single employee by ID or employee_id.
        """
        try:
            # Try to get by primary key first
            if pk.isdigit():
                employee = get_object_or_404(Employee, pk=pk)
            else:
                # Try to get by employee_id
                employee = get_object_or_404(Employee, employee_id=pk)

            serializer = self.get_serializer(employee)
            return success_response(
                data=serializer.data,
                message='Employee retrieved successfully.'
            )
        except Exception as e:
            return error_response(
                error=str(e),
                message='Employee not found.',
                status_code=status.HTTP_404_NOT_FOUND
            )

    def update(self, request, pk=None):
        """
        Update an employee (full update).
        """
        try:
            if pk.isdigit():
                employee = get_object_or_404(Employee, pk=pk)
            else:
                employee = get_object_or_404(Employee, employee_id=pk)

            serializer = self.get_serializer(employee, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return success_response(
                    data=serializer.data,
                    message='Employee updated successfully.'
                )
            return error_response(
                error=serializer.errors,
                message='Validation failed.',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                error=str(e),
                message='Failed to update employee.',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, pk=None):
        """
        Partially update an employee.
        """
        try:
            if pk.isdigit():
                employee = get_object_or_404(Employee, pk=pk)
            else:
                employee = get_object_or_404(Employee, employee_id=pk)

            serializer = self.get_serializer(employee, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return success_response(
                    data=serializer.data,
                    message='Employee updated successfully.'
                )
            return error_response(
                error=serializer.errors,
                message='Validation failed.',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                error=str(e),
                message='Failed to update employee.',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, pk=None):
        """
        Delete an employee and their attendance records.
        """
        try:
            if pk.isdigit():
                employee = get_object_or_404(Employee, pk=pk)
            else:
                employee = get_object_or_404(Employee, employee_id=pk)

            employee_data = self.get_serializer(employee).data
            employee.delete()
            
            return success_response(
                data=employee_data,
                message='Employee deleted successfully.'
            )
        except Exception as e:
            return error_response(
                error=str(e),
                message='Failed to delete employee.',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search employees by query parameter.
        """
        return self.list(request)


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Attendance CRUD operations.
    
    Endpoints:
    - GET /api/attendance/ - List all attendance records
    - POST /api/attendance/ - Mark attendance
    - GET /api/attendance/{id}/ - Retrieve an attendance record
    - PUT /api/attendance/{id}/ - Update attendance
    - DELETE /api/attendance/{id}/ - Delete attendance record
    - GET /api/attendance/by-date/?date=YYYY-MM-DD - Get attendance by date
    - GET /api/attendance/by-employee/?employee_id=EMP001 - Get employee attendance history
    - GET /api/attendance/statistics/ - Get attendance statistics
    """
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def list(self, request):
        """
        List all attendance records with optional filters.
        """
        try:
            queryset = self.get_queryset()

            # Filter by date
            date_param = request.query_params.get('date', None)
            if date_param:
                queryset = queryset.filter(date=date_param)

            # Filter by employee
            employee_id = request.query_params.get('employee_id', None)
            if employee_id:
                queryset = queryset.filter(employee__employee_id=employee_id)

            # Filter by status
            status_param = request.query_params.get('status', None)
            if status_param:
                queryset = queryset.filter(status=status_param)

            serializer = self.get_serializer(queryset, many=True)
            return success_response(
                data=serializer.data,
                message='Attendance records retrieved successfully.'
            )
        except Exception as e:
            return error_response(
                error=str(e),
                message='Failed to retrieve attendance records.',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request):
        """
        Mark attendance for an employee.
        """
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return success_response(
                    data=serializer.data,
                    message='Attendance marked successfully.',
                    status_code=status.HTTP_201_CREATED
                )
            return error_response(
                error=serializer.errors,
                message='Validation failed.',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                error=str(e),
                message='Failed to mark attendance.',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """
        Get attendance records for a specific date.
        """
        try:
            date_param = request.query_params.get('date', None)
            if not date_param:
                date_param = date.today().isoformat()

            queryset = self.get_queryset().filter(date=date_param)
            serializer = self.get_serializer(queryset, many=True)
            
            return success_response(
                data=serializer.data,
                message=f'Attendance records for {date_param} retrieved successfully.'
            )
        except Exception as e:
            return error_response(
                error=str(e),
                message='Failed to retrieve attendance records.',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_employee(self, request):
        """
        Get attendance history for a specific employee.
        """
        try:
            employee_id = request.query_params.get('employee_id', None)
            if not employee_id:
                return error_response(
                    error='employee_id parameter is required.',
                    message='Validation failed.',
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            employee = get_object_or_404(Employee, employee_id=employee_id)
            queryset = self.get_queryset().filter(employee=employee)
            serializer = self.get_serializer(queryset, many=True)

            # Calculate statistics
            total_days = queryset.count()
            present_count = queryset.filter(status='Present').count()
            absent_count = queryset.filter(status='Absent').count()
            attendance_rate = (present_count / total_days * 100) if total_days > 0 else 0

            history_data = {
                'employee_id': employee.employee_id,
                'employee_name': employee.name,
                'total_days': total_days,
                'present_count': present_count,
                'absent_count': absent_count,
                'attendance_rate': round(attendance_rate, 1),
                'records': serializer.data
            }

            return success_response(
                data=history_data,
                message='Attendance history retrieved successfully.'
            )
        except Exception as e:
            return error_response(
                error=str(e),
                message='Failed to retrieve attendance history.',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get overall attendance statistics for dashboard.
        """
        try:
            today = date.today()
            this_month = today.replace(day=1)

            # Total employees
            total_employees = Employee.objects.count()

            # Today's attendance
            today_attendance = Attendance.objects.filter(date=today)
            present_today = today_attendance.filter(status='Present').count()
            absent_today = today_attendance.filter(status='Absent').count()
            not_marked_today = total_employees - today_attendance.count()

            # This month's attendance rate
            month_attendance = Attendance.objects.filter(date__gte=this_month)
            month_present = month_attendance.filter(status='Present').count()
            total_records = month_attendance.count()
            attendance_rate = (month_present / total_records * 100) if total_records > 0 else 0

            # Department breakdown
            department_stats = Employee.objects.values('department').annotate(
                count=Count('id')
            ).order_by('-count')

            stats_data = {
                'total_employees': total_employees,
                'present_today': present_today,
                'absent_today': absent_today,
                'not_marked_today': not_marked_today,
                'attendance_rate': round(attendance_rate, 1),
                'department_breakdown': list(department_stats)
            }

            return success_response(
                data=stats_data,
                message='Statistics retrieved successfully.'
            )
        except Exception as e:
            return error_response(
                error=str(e),
                message='Failed to retrieve statistics.',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
