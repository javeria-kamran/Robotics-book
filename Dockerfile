FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the scripts folder
COPY scripts/ ./scripts/

# Set working directory to scripts
WORKDIR /app/scripts

# Expose port
EXPOSE 8000

# Run the API
CMD ["python", "api.py"]
