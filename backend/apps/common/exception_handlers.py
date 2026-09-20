from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        custom_response = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': response.data.get('detail', 'Xatolik yuz berdi'),
                'errors': response.data
            }
        }
        response.data = custom_response
        if response.status_code >= 500:
            logger.error(f"Server error: {exc}", exc_info=True)
    return response