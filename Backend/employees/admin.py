"""
Django admin configuration for Employee and Attendance models.
"""
from django.contrib import admin
from .models import Employee, Attendance


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    """
    Admin interface for Employee model.
    """
    list_display = ['employee_id', 'name', 'email', 'department', 'created_at']
    list_filter = ['department', 'created_at']
    search_fields = ['employee_id', 'name', 'email', 'department']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Employee Information', {
            'fields': ('employee_id', 'name', 'email', 'department')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    """
    Admin interface for Attendance model.
    """
    list_display = ['employee', 'date', 'status', 'created_at']
    list_filter = ['status', 'date', 'created_at']
    search_fields = ['employee__name', 'employee__employee_id']
    ordering = ['-date', 'employee__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Attendance Information', {
            'fields': ('employee', 'date', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
