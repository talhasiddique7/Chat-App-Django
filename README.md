# Real-time Chat Application

A real-time chat application built with Django (backend) and React (frontend) using WebSockets for real-time communication.

## Features

- User authentication (login/register)
- Real-time messaging using WebSockets
- Multiple chat rooms
- Online user list
- Responsive design

## UI Pictures

![UI](./UI%20Pictures/1.png)
![UI](./UI%20Pictures/2.png)
![UI](./UI%20Pictures/3.png)

## Prerequisites

- Python 3.8+
- Node.js 16+
- Docker and Docker Compose

## Project Setup

### Docker Setup (Recommended)

1.  Make sure you have Docker and Docker Compose installed.
2.  Clone the repository.
3.  From the root of the project, run the following command to build and start the containers:
    ```bash
    docker-compose up --build
    ```
4.  The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:8000`.

### Local Development Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run database migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser (admin) account:
   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```bash
   python -m uvicorn chatproject.asgi:application --host 0.0.0.0 --port 8000
   ```

   The backend will be available at `http://localhost:8000`

#### Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or log in with an existing one
3. Start chatting in the default room or create a new one by changing the URL to `http://localhost:3000/chat/your-room-name`

## Project Structure

```
chat-app/
├── backend/               # Django backend
│   ├── chat/              # Chat application
│   │   ├── migrations/    # Database migrations
│   │   ├── __init__.py
│   │   ├── admin.py       # Admin interface
│   │   ├── apps.py        # App configuration
│   │   ├── consumers.py   # WebSocket consumers
│   │   ├── models.py      # Database models
│   │   ├── routing.py     # WebSocket routing
│   │   ├── serializers.py # API serializers
│   │   ├── urls.py        # URL routing
│   │   └── views.py       # API views
│   ├── chatproject/       # Project settings
│   └── manage.py          # Django management script
└── frontend/              # React frontend
    ├── public/            # Static files
    └── src/               # Source code
        ├── components/     # React components
        ├── contexts/       # React contexts
        ├── services/       # API services
        ├── App.js          # Main component
        └── index.js        # Entry point
```
