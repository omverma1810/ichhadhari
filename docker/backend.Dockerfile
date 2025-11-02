# ============================================================================
# Backend Dockerfile (Django)
# Multi-stage build for optimized production image
# ============================================================================

# Stage 1: Base
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# ============================================================================
# Stage 2: Dependencies
# ============================================================================
FROM base as dependencies

# Copy requirements
COPY requirements.txt .

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# ============================================================================
# Stage 3: Runtime
# ============================================================================
FROM base as runtime

# Copy virtual environment from dependencies stage
COPY --from=dependencies /opt/venv /opt/venv

# Set the virtual environment path
ENV PATH="/opt/venv/bin:$PATH"

# Create a non-root user
RUN useradd -m -u 1000 django && \
    mkdir -p /app/staticfiles /app/media && \
    chown -R django:django /app

# Copy application code
COPY --chown=django:django . .

# Switch to non-root user
USER django

# Collect static files
RUN python manage.py collectstatic --noinput || echo "No static files to collect"

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

# Start the application
CMD ["gunicorn", "dairy_management.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--threads", "2", \
     "--timeout", "60", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
