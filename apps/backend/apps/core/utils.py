"""
Utility functions for the Ichhadhari Dairy Management System.

This module provides reusable utility functions that can be used
throughout the application.
"""

import re
import uuid
from typing import Optional, Any, Dict
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.text import slugify
import hashlib


def generate_unique_code(prefix: str = '', length: int = 8) -> str:
    """
    Generate a unique alphanumeric code.
    
    Args:
        prefix (str): Optional prefix for the code
        length (int): Length of the random part
        
    Returns:
        str: Unique code
        
    Example:
        >>> generate_unique_code('VEN')
        'VEN12345ABC'
    """
    import random
    import string
    
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
    return f"{prefix}{random_part}" if prefix else random_part


def generate_vendor_code() -> str:
    """
    Generate a unique vendor code.
    
    Returns:
        str: Vendor code in format VEN-XXXXXX
        
    Example:
        >>> generate_vendor_code()
        'VEN-A1B2C3'
    """
    return f"VEN-{generate_unique_code(length=6)}"


def generate_batch_number() -> str:
    """
    Generate a unique production batch number.
    
    Returns:
        str: Batch number in format BATCH-YYYYMMDD-XXXX
        
    Example:
        >>> generate_batch_number()
        'BATCH-20231215-A1B2'
    """
    date_str = datetime.now().strftime('%Y%m%d')
    return f"BATCH-{date_str}-{generate_unique_code(length=4)}"


def validate_phone_number(phone: str) -> bool:
    """
    Validate phone number format.
    
    Args:
        phone (str): Phone number to validate
        
    Returns:
        bool: True if valid, False otherwise
        
    Example:
        >>> validate_phone_number('+919876543210')
        True
    """
    # Indian phone number pattern
    pattern = r'^(\+91|91)?[6-9]\d{9}$'
    return bool(re.match(pattern, phone.replace(' ', '').replace('-', '')))


def format_phone_number(phone: str) -> str:
    """
    Format phone number to standard format.
    
    Args:
        phone (str): Phone number to format
        
    Returns:
        str: Formatted phone number
        
    Example:
        >>> format_phone_number('9876543210')
        '+91-9876543210'
    """
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    
    # Add country code if missing
    if len(digits) == 10:
        digits = '91' + digits
    
    # Format with separators
    if len(digits) == 12:
        return f"+{digits[:2]}-{digits[2:]}"
    
    return phone


def validate_email_address(email: str) -> bool:
    """
    Validate email address format.
    
    Args:
        email (str): Email address to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False


def calculate_fat_snf_value(quantity: float, fat: float, snf: float) -> Dict[str, float]:
    """
    Calculate milk value based on fat and SNF content.
    
    This is a simplified calculation. In production, you would use
    actual pricing formulas provided by the dairy.
    
    Args:
        quantity (float): Milk quantity in liters
        fat (float): Fat percentage
        snf (float): SNF (Solid Not Fat) percentage
        
    Returns:
        dict: Calculated values
        
    Example:
        >>> calculate_fat_snf_value(100, 4.5, 8.5)
        {'fat_value': 450.0, 'snf_value': 850.0, 'total_value': 1300.0}
    """
    # Base rates (these should come from settings or database)
    fat_rate = 10.0  # ₹ per kg of fat
    snf_rate = 5.0   # ₹ per kg of SNF
    
    # Calculate fat and SNF in kg
    fat_kg = (quantity * fat) / 100
    snf_kg = (quantity * snf) / 100
    
    # Calculate values
    fat_value = fat_kg * fat_rate
    snf_value = snf_kg * snf_rate
    total_value = fat_value + snf_value
    
    return {
        'fat_value': round(fat_value, 2),
        'snf_value': round(snf_value, 2),
        'total_value': round(total_value, 2)
    }


def get_date_range(period: str) -> tuple:
    """
    Get date range for common periods.
    
    Args:
        period (str): Period name ('today', 'yesterday', 'this_week', 'last_week', 
                                   'this_month', 'last_month', 'this_year')
        
    Returns:
        tuple: (start_date, end_date)
        
    Example:
        >>> get_date_range('today')
        (datetime(2023, 12, 15, 0, 0), datetime(2023, 12, 15, 23, 59, 59))
    """
    now = timezone.now()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    if period == 'today':
        start = today
        end = today.replace(hour=23, minute=59, second=59)
    
    elif period == 'yesterday':
        start = today - timedelta(days=1)
        end = start.replace(hour=23, minute=59, second=59)
    
    elif period == 'this_week':
        start = today - timedelta(days=today.weekday())
        end = now
    
    elif period == 'last_week':
        start = today - timedelta(days=today.weekday() + 7)
        end = start + timedelta(days=6, hours=23, minutes=59, seconds=59)
    
    elif period == 'this_month':
        start = today.replace(day=1)
        end = now
    
    elif period == 'last_month':
        first_of_this_month = today.replace(day=1)
        end = first_of_this_month - timedelta(seconds=1)
        start = end.replace(day=1, hour=0, minute=0, second=0)
    
    elif period == 'this_year':
        start = today.replace(month=1, day=1)
        end = now
    
    else:
        raise ValueError(f"Invalid period: {period}")
    
    return start, end


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe storage.
    
    Args:
        filename (str): Original filename
        
    Returns:
        str: Sanitized filename
        
    Example:
        >>> sanitize_filename('My File (1).pdf')
        'my-file-1.pdf'
    """
    # Get file extension
    parts = filename.rsplit('.', 1)
    name = parts[0]
    ext = parts[1] if len(parts) > 1 else ''
    
    # Slugify the name
    clean_name = slugify(name)
    
    # Add extension
    return f"{clean_name}.{ext}" if ext else clean_name


def generate_file_hash(file_obj) -> str:
    """
    Generate MD5 hash of a file.
    
    Args:
        file_obj: File object
        
    Returns:
        str: MD5 hash
    """
    md5_hash = hashlib.md5()
    
    # Read file in chunks
    for chunk in iter(lambda: file_obj.read(4096), b''):
        md5_hash.update(chunk)
    
    # Reset file pointer
    file_obj.seek(0)
    
    return md5_hash.hexdigest()


def mask_sensitive_data(data: str, visible_chars: int = 4) -> str:
    """
    Mask sensitive data like phone numbers, emails, etc.
    
    Args:
        data (str): Data to mask
        visible_chars (int): Number of characters to keep visible
        
    Returns:
        str: Masked data
        
    Example:
        >>> mask_sensitive_data('9876543210')
        '******3210'
    """
    if len(data) <= visible_chars:
        return '*' * len(data)
    
    masked_length = len(data) - visible_chars
    return '*' * masked_length + data[-visible_chars:]


def format_currency(amount: float, currency: str = '₹') -> str:
    """
    Format amount as currency.
    
    Args:
        amount (float): Amount to format
        currency (str): Currency symbol
        
    Returns:
        str: Formatted currency string
        
    Example:
        >>> format_currency(1234.56)
        '₹1,234.56'
    """
    return f"{currency}{amount:,.2f}"


def get_client_ip(request) -> Optional[str]:
    """
    Get client IP address from request.
    
    Args:
        request: Django request object
        
    Returns:
        str: IP address or None
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def truncate_string(text: str, max_length: int = 100, suffix: str = '...') -> str:
    """
    Truncate string to specified length.
    
    Args:
        text (str): Text to truncate
        max_length (int): Maximum length
        suffix (str): Suffix to add if truncated
        
    Returns:
        str: Truncated string
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def calculate_percentage(part: float, total: float, decimal_places: int = 2) -> float:
    """
    Calculate percentage safely.
    
    Args:
        part (float): Part value
        total (float): Total value
        decimal_places (int): Number of decimal places
        
    Returns:
        float: Percentage
    """
    if total == 0:
        return 0.0
    
    percentage = (part / total) * 100
    return round(percentage, decimal_places)
