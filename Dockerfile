# Use Python 3.10 as base image
FROM python:3.10-slim

# Install system dependencies for OpenCV and MediaPipe
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgles2 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY backend/ ./backend/
COPY auth.py ./backend/
COPY database.py ./backend/

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose the port
EXPOSE 10000

# Start command
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "10000"]
