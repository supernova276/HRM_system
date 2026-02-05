"""
Models for Employee and Attendance management.
"""
from django.db import models
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError


class Employee(models.Model):
    """
    Employee model representing employees in the HRM system.
    """
    DEPARTMENT_CHOICES = [
        ('Engineering', 'Engineering'),
        ('Marketing', 'Marketing'),
        ('Human Resources', 'Human Resources'),
        ('Sales', 'Sales'),
        ('Finance', 'Finance'),
        ('Operations', 'Operations'),
    ]

    # employee_id is the custom ID (e.g., EMP001)
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text="Unique employee identifier (e.g., EMP001)"
    )
    name = models.CharField(
        max_length=100,
        help_text="Full name of the employee"
    )
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()],
        help_text="Email address of the employee"
    )
    department = models.CharField(
        max_length=50,
        choices=DEPARTMENT_CHOICES,
        help_text="Department where the employee works"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['email']),
            models.Index(fields=['department']),
        ]

    def __str__(self):
        return f"{self.name} ({self.employee_id})"

    def clean(self):
        """
        Validate model fields.
        """
        # Validate employee_id is not empty
        if not self.employee_id or not self.employee_id.strip():
            raise ValidationError({'employee_id': 'Employee ID is required.'})

        # Validate name is not empty
        if not self.name or not self.name.strip():
            raise ValidationError({'name': 'Name is required.'})

        # Validate email format
        if not self.email or not self.email.strip():
            raise ValidationError({'email': 'Email is required.'})

        # Validate department
        if not self.department:
            raise ValidationError({'department': 'Department is required.'})

        # Check for duplicate employee_id
        if self.pk is None:  # Only check on creation
            if Employee.objects.filter(employee_id=self.employee_id).exists():
                raise ValidationError({
                    'employee_id': f'Employee with ID {self.employee_id} already exists.'
                })

            # Check for duplicate email
            if Employee.objects.filter(email=self.email).exists():
                raise ValidationError({
                    'email': f'Employee with email {self.email} already exists.'
                })


class Attendance(models.Model):
    """
    Attendance model for tracking employee attendance.
    """
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
    ]

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='attendance_records',
        help_text="The employee this attendance record belongs to"
    )
    date = models.DateField(
        db_index=True,
        help_text="Date of attendance"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        help_text="Attendance status (Present/Absent)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendance Records'
        unique_together = ['employee', 'date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['employee', 'date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.employee.name} - {self.date} - {self.status}"

    def clean(self):
        """
        Validate model fields.
        """
        # Validate date is not empty
        if not self.date:
            raise ValidationError({'date': 'Date is required.'})

        # Validate status
        if not self.status:
            raise ValidationError({'status': 'Status is required.'})

        # Prevent future dates
        from datetime import date as dt_date
        if self.date > dt_date.today():
            raise ValidationError({'date': 'Cannot mark attendance for future dates.'})
