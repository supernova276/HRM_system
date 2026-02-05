"""
Serializers for Employee and Attendance models.
"""
from rest_framework import serializers
from .models import Employee, Attendance
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError as DjangoValidationError
import re


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Serializer for Employee model with comprehensive validation.
    """
    id = serializers.IntegerField(read_only=True)
    employee_id = serializers.CharField(
        max_length=20,
        required=True,
        error_messages={
            'required': 'Employee ID is required.',
            'blank': 'Employee ID cannot be blank.',
        }
    )
    name = serializers.CharField(
        max_length=100,
        required=True,
        error_messages={
            'required': 'Full name is required.',
            'blank': 'Full name cannot be blank.',
        }
    )
    email = serializers.EmailField(
        required=True,
        error_messages={
            'required': 'Email is required.',
            'blank': 'Email cannot be blank.',
            'invalid': 'Enter a valid email address.',
        }
    )
    department = serializers.ChoiceField(
        choices=Employee.DEPARTMENT_CHOICES,
        required=True,
        error_messages={
            'required': 'Department is required.',
            'invalid_choice': 'Select a valid department.',
        }
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id',
            'employee_id',
            'name',
            'email',
            'department',
            'created_at',
            'updated_at'
        ]

    def validate_employee_id(self, value):
        """
        Validate employee_id field.
        """
        if not value or not value.strip():
            raise serializers.ValidationError('Employee ID is required.')

        # Check if employee_id already exists (only on creation)
        if self.instance is None:
            if Employee.objects.filter(employee_id=value).exists():
                raise serializers.ValidationError(
                    f'Employee with ID {value} already exists.'
                )

        return value.strip()

    def validate_name(self, value):
        """
        Validate name field.
        """
        if not value or not value.strip():
            raise serializers.ValidationError('Full name is required.')

        # Check if name contains only letters and spaces
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError(
                'Name should only contain letters and spaces.'
            )

        return value.strip()

    def validate_email(self, value):
        """
        Validate email field.
        """
        if not value or not value.strip():
            raise serializers.ValidationError('Email is required.')

        # Validate email format
        validator = EmailValidator()
        try:
            validator(value)
        except DjangoValidationError:
            raise serializers.ValidationError('Enter a valid email address.')

        # Check if email already exists (only on creation)
        if self.instance is None:
            if Employee.objects.filter(email__iexact=value).exists():
                raise serializers.ValidationError(
                    f'Employee with email {value} already exists.'
                )

        return value.strip().lower()

    def validate_department(self, value):
        """
        Validate department field.
        """
        if not value:
            raise serializers.ValidationError('Department is required.')

        valid_departments = [choice[0] for choice in Employee.DEPARTMENT_CHOICES]
        if value not in valid_departments:
            raise serializers.ValidationError('Select a valid department.')

        return value


class AttendanceSerializer(serializers.ModelSerializer):
    """
    Serializer for Attendance model with validation.
    """
    id = serializers.IntegerField(read_only=True)
    employee_id = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            'required': 'Employee ID is required.',
            'blank': 'Employee ID cannot be blank.',
        }
    )
    employee = EmployeeSerializer(read_only=True)
    date = serializers.DateField(
        required=True,
        error_messages={
            'required': 'Date is required.',
            'invalid': 'Enter a valid date.',
        }
    )
    status = serializers.ChoiceField(
        choices=Attendance.STATUS_CHOICES,
        required=True,
        error_messages={
            'required': 'Status is required.',
            'invalid_choice': 'Status must be either Present or Absent.',
        }
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id',
            'employee_id',
            'employee',
            'date',
            'status',
            'created_at',
            'updated_at'
        ]

    def validate_employee_id(self, value):
        """
        Validate that employee exists.
        """
        if not value or not value.strip():
            raise serializers.ValidationError('Employee ID is required.')

        try:
            Employee.objects.get(employee_id=value)
        except Employee.DoesNotExist:
            raise serializers.ValidationError(
                f'Employee with ID {value} does not exist.'
            )

        return value.strip()

    def validate_date(self, value):
        """
        Validate date field.
        """
        if not value:
            raise serializers.ValidationError('Date is required.')

        # Prevent future dates
        from datetime import date as dt_date
        if value > dt_date.today():
            raise serializers.ValidationError(
                'Cannot mark attendance for future dates.'
            )

        return value

    def validate_status(self, value):
        """
        Validate status field.
        """
        if not value:
            raise serializers.ValidationError('Status is required.')

        valid_statuses = [choice[0] for choice in Attendance.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                'Status must be either Present or Absent.'
            )

        return value

    def create(self, validated_data):
        """
        Create or update attendance record.
        """
        employee_id = validated_data.pop('employee_id')
        employee = Employee.objects.get(employee_id=employee_id)

        # Check if attendance already exists for this employee and date
        attendance, created = Attendance.objects.update_or_create(
            employee=employee,
            date=validated_data['date'],
            defaults={'status': validated_data['status']}
        )

        return attendance


class AttendanceHistorySerializer(serializers.Serializer):
    """
    Serializer for attendance history with statistics.
    """
    employee_id = serializers.CharField()
    employee_name = serializers.CharField()
    total_days = serializers.IntegerField()
    present_count = serializers.IntegerField()
    absent_count = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
    records = AttendanceSerializer(many=True)


class DashboardStatsSerializer(serializers.Serializer):
    """
    Serializer for dashboard statistics.
    """
    total_employees = serializers.IntegerField()
    present_today = serializers.IntegerField()
    absent_today = serializers.IntegerField()
    not_marked_today = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
    department_breakdown = serializers.ListField()
