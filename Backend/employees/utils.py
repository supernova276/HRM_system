"""
Utility functions and custom exception handlers.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError


def custom_exception_handler(exc, context):
    """
    Custom exception handler to return meaningful error messages.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the response format
        custom_response_data = {
            'success': False,
            'error': None,
            'errors': None,
            'message': None,
        }

        # Handle validation errors
        if hasattr(response, 'data'):
            if isinstance(response.data, dict):
                # Check if it's a field validation error
                if any(key not in ['detail', 'non_field_errors'] for key in response.data.keys()):
                    custom_response_data['errors'] = response.data
                    custom_response_data['message'] = 'Validation failed.'
                else:
                    # Generic error
                    custom_response_data['error'] = response.data.get('detail', str(response.data))
                    custom_response_data['message'] = response.data.get('detail', 'An error occurred.')
            elif isinstance(response.data, list):
                custom_response_data['error'] = response.data[0] if response.data else 'An error occurred.'
                custom_response_data['message'] = custom_response_data['error']
            else:
                custom_response_data['error'] = str(response.data)
                custom_response_data['message'] = str(response.data)

        response.data = custom_response_data

    # Handle Django validation errors
    elif isinstance(exc, DjangoValidationError):
        custom_response_data = {
            'success': False,
            'error': None,
            'errors': None,
            'message': 'Validation failed.',
        }

        if hasattr(exc, 'message_dict'):
            custom_response_data['errors'] = exc.message_dict
        elif hasattr(exc, 'messages'):
            custom_response_data['error'] = exc.messages[0] if exc.messages else 'Validation error.'
        else:
            custom_response_data['error'] = str(exc)

        response = Response(custom_response_data, status=status.HTTP_400_BAD_REQUEST)

    return response


def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
    """
    Helper function to create consistent success responses.
    """
    return Response({
        'success': True,
        'message': message,
        'data': data
    }, status=status_code)


def error_response(error, message='Error', status_code=status.HTTP_400_BAD_REQUEST):
    """
    Helper function to create consistent error responses.
    """
    return Response({
        'success': False,
        'message': message,
        'error': error
    }, status=status_code)
