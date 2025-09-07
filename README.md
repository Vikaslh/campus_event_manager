
# Campus Event Manager

A comprehensive event management system for educational campuses to manage events, registrations, and attendees.

## Quick Start

### Prerequisites
- frontend  react/react native
- backend fastapi
- database sqlite

### Clone the Repository
```bash
git clone https://github.com/yourusername/campus-event-manager.git
cd campus-event-manager
```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Features
- Event creation and management
- User registration and authentication
- Event registration and ticketing
- Attendee management
- Event calendar and scheduling

## Project Structure
```
|
├── backend/  
       |--Database         # FastAPI backend
├──  src/         # React frontend
├── mobile/            # React Native mobile app
└── src            # Project documentation
```



## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "full_name": "John Doe",
    "role": "student"
  }
  ```

- `POST /api/auth/login` - User login
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
  Returns:
  ```json
  {
    "access_token": "jwt_token_here",
    "token_type": "bearer"
  }
  ```

### Events
- `GET /api/events` - List all events
- `GET /api/events/{event_id}` - Get event details
- `POST /api/events` - Create new event (Admin only)
- `PUT /api/events/{event_id}` - Update event (Admin only)
- `DELETE /api/events/{event_id}` - Delete event (Admin only)

### Registrations
- `POST /api/events/{event_id}/register` - Register for an event
- `GET /api/users/me/registrations` - Get user's event registrations
- `DELETE /api/registrations/{registration_id}` - Cancel registration

## Project Flow

### User Registration Flow
1. User submits registration form with email and password
2. Backend validates input and creates new user
3. Verification email sent to user's email
4. User clicks verification link to activate account

### Login Flow
1. User submits email and password
2. Backend verifies credentials
3. JWT token issued upon successful authentication
4. Token stored in client-side storage (secure HTTP-only cookie)

### Event Management Flow
1. Admin creates event with details (title, description, date, location, capacity)
2. Event is saved to database
3. Users can browse and register for events
4. System enforces registration limits and deadlines
5. Users receive confirmation and event reminders

### Registration Flow
1. Authenticated user selects an event
2. System checks event availability
3. If available, registration is created
4. Confirmation email sent to user
5. User can view/manage registrations in their dashboard

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
