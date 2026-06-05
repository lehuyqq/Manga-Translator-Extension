# Dockerfile for MangaTranslator Extension Backend
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Copy standalone backend code, vendored core, models, and fonts
COPY backend /app/backend

WORKDIR /app/backend

# Install backend and vendored pipeline dependencies
RUN pip install --no-cache-dir -e .

EXPOSE 7677

ENV MT_PORT=7677
ENV MT_HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7677"]
