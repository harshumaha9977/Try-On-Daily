# Use Python 3.10 as base image
FROM python:3.10-slim

# Install system dependencies needed for OpenCV, MediaPipe, rembg
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgles2 \
    libegl1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements from backend folder
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files from backend folder
COPY backend/ .

# Ensure outputs directory exists
RUN mkdir -p outputs

# Unbuffered Python logs (so Railway shows logs in real time)
ENV PYTHONUNBUFFERED=1

# Railway sets $PORT dynamically — default to 8000 if not set
ENV PORT=8000

# Expose the port
EXPOSE $PORT

# Start command — Railway uses $PORT
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
