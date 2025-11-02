"""
Custom pagination classes for the Ichhadhari Dairy Management System.

This module provides reusable pagination classes that can be used across
different API endpoints for consistent pagination behavior.
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict
from typing import Dict, Any


class CustomPagination(PageNumberPagination):
    """
    Custom pagination class with configurable page size.
    
    This pagination class provides a consistent pagination response format
    across all API endpoints. It includes metadata about the pagination
    and allows clients to customize the page size.
    
    Attributes:
        page_size (int): Default number of items per page
        page_size_query_param (str): Query parameter for custom page size
        max_page_size (int): Maximum allowed page size
        page_query_param (str): Query parameter for page number
    
    Example API calls:
        GET /api/vendors/?page=2
        GET /api/vendors/?page=2&page_size=50
        
    Response format:
        {
            "count": 100,
            "next": "http://api.example.com/api/vendors/?page=3",
            "previous": "http://api.example.com/api/vendors/?page=1",
            "total_pages": 10,
            "current_page": 2,
            "page_size": 10,
            "results": [...]
        }
    """
    
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'
    
    def get_paginated_response(self, data: list) -> Response:
        """
        Return a paginated response with additional metadata.
        
        Args:
            data (list): The paginated data to return
            
        Returns:
            Response: DRF Response with pagination metadata
        """
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.get_page_size(self.request)),
            ('results', data)
        ]))
    
    def get_paginated_response_schema(self, schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Return the pagination schema for API documentation.
        
        Args:
            schema (dict): The schema for the results
            
        Returns:
            dict: Complete schema including pagination fields
        """
        return {
            'type': 'object',
            'properties': {
                'count': {
                    'type': 'integer',
                    'example': 100,
                    'description': 'Total number of items'
                },
                'next': {
                    'type': 'string',
                    'nullable': True,
                    'format': 'uri',
                    'example': 'http://api.example.com/api/items/?page=3',
                    'description': 'URL to the next page'
                },
                'previous': {
                    'type': 'string',
                    'nullable': True,
                    'format': 'uri',
                    'example': 'http://api.example.com/api/items/?page=1',
                    'description': 'URL to the previous page'
                },
                'total_pages': {
                    'type': 'integer',
                    'example': 10,
                    'description': 'Total number of pages'
                },
                'current_page': {
                    'type': 'integer',
                    'example': 2,
                    'description': 'Current page number'
                },
                'page_size': {
                    'type': 'integer',
                    'example': 20,
                    'description': 'Number of items per page'
                },
                'results': schema,
            },
        }


class LargeResultsSetPagination(PageNumberPagination):
    """
    Pagination class for large datasets.
    
    Use this for endpoints that typically return large amounts of data
    and where users might want to fetch more items per page.
    
    Example:
        class ReportViewSet(viewsets.ReadOnlyModelViewSet):
            pagination_class = LargeResultsSetPagination
    """
    
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000


class SmallResultsSetPagination(PageNumberPagination):
    """
    Pagination class for small datasets or mobile apps.
    
    Use this for mobile endpoints or where smaller page sizes are preferred
    for performance reasons.
    
    Example:
        class MobileVendorViewSet(viewsets.ReadOnlyModelViewSet):
            pagination_class = SmallResultsSetPagination
    """
    
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class NoPagination(PageNumberPagination):
    """
    Pagination class that effectively disables pagination.
    
    Use this for endpoints that should return all results without pagination.
    Be careful with this on large datasets as it can cause performance issues.
    
    Example:
        class SimpleListViewSet(viewsets.ReadOnlyModelViewSet):
            pagination_class = NoPagination
    """
    
    page_size = None
    max_page_size = None
