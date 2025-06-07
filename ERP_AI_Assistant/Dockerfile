# Multi-stage build for ERP AI Assistant
# Stage 1: Base Python environment
FROM python:3.10-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Dependencies installation
FROM base as dependencies

# Create app directory
WORKDIR /app

# Copy requirements first for better Docker layer caching
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download pl_core_news_sm || echo "spaCy model download failed, will continue"

# Stage 3: Application
FROM dependencies as application

# Copy application code
COPY backend/ .
COPY BazaWiedzy/ ./BazaWiedzy/
COPY frontend/ ./frontend/
COPY *.html ./
COPY *.js ./
COPY *.css ./

# Create necessary directories
RUN mkdir -p data/chroma_db data/knowledge_base logs

# Set proper permissions
RUN chmod +x *.py

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Default command
CMD ["python", "app.py"]

# Alternative commands (uncomment as needed):
# CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
# CMD ["python", "install_and_run.py"]
