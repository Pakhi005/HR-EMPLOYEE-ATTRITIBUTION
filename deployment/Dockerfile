# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /code

# Install deps first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and model artifacts
COPY app ./app
COPY models ./models

# IBM Cloud Code Engine (and most PaaS platforms) inject a $PORT env var.
# Default to 8080 for local `docker run` testing.
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
