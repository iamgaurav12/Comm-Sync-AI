# Comm-Sync-AI

Comm-Sync-AI is a collaborative platform that integrates AI-powered assistance for project management and communication. It allows users to create projects, manage file structures, and interact with AI for development-related queries.

## Features
- User authentication (register, login, logout, profile management).
- Project management (create projects, add users, update file trees).
- AI-powered assistance for development queries.
- Real-time communication using Socket.IO.

---

## Installation Guide

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Redis

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/iamgaurav12/Comm-Sync-AI
   cd Comm-Sync-AI
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the `backend` directory and configure the following variables:
   ```properties
   MONGODB_URI=mongodb://localhost:27017/Comm-Sync-AI
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
   PORT=5000
   GOOGLE_AI_KEY=your_google_ai_key
   JWT_SECRET=your_jwt_secret
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

6. Access the application at `http://localhost:5000`.

---

## Backend API Routes Overview

The backend exposes RESTful APIs for user management, project management, and AI-powered assistance. Below is a summary table of all available routes, grouped by their functionality.

### All Routes Table

| Group   | Method | Endpoint                                 | Description                                 | Middleware                    |
|---------|--------|------------------------------------------|---------------------------------------------|-------------------------------|
| User    | POST   | `/users/register`                        | Register a new user                         | express-validator             |
| User    | POST   | `/users/login`                           | Login a user                                | express-validator             |
| User    | GET    | `/users/profile`                         | Get logged-in user's profile                | authMiddleware.authUser        |
| User    | GET    | `/users/logout`                          | Logout the user                             | authMiddleware.authUser        |
| User    | GET    | `/users/all`                             | Get all users except logged-in              | authMiddleware.authUser        |
| Project | POST   | `/projects/create`                       | Create a new project                        | authMiddleware.authUser        |
| Project | GET    | `/projects/all`                          | Get all projects for a user                 | authMiddleware.authUser        |
| Project | PUT    | `/projects/add-user`                     | Add users to a project                      | authMiddleware.authUser        |
| Project | GET    | `/projects/get-project/:projectId`       | Get project details by ID                   | authMiddleware.authUser        |
| Project | PUT    | `/projects/update-file-tree`             | Update the file tree of a project           | authMiddleware.authUser        |
| AI      | GET    | `/ai/get-result`                         | Get AI-generated result for a prompt        | None                          |

---

## User Routes

User routes handle authentication and user management. All sensitive routes require authentication via JWT, except registration and login.

| Method | Endpoint           | Description                       | Middleware                |
|--------|--------------------|-----------------------------------|---------------------------|
| POST   | `/users/register`  | Register a new user               | express-validator         |
| POST   | `/users/login`     | Login a user                      | express-validator         |
| GET    | `/users/profile`   | Get logged-in user's profile      | authMiddleware.authUser   |
| GET    | `/users/logout`    | Logout the user                   | authMiddleware.authUser   |
| GET    | `/users/all`       | Get all users except logged-in    | authMiddleware.authUser   |

### User Route Details
- **POST `/users/register`**: Register a new user. Requires user details in the request body. Validates input.
- **POST `/users/login`**: Authenticate a user and return a JWT token. Requires email and password.
- **GET `/users/profile`**: Returns the profile of the currently authenticated user. Requires a valid JWT.
- **GET `/users/logout`**: Logs out the current user (token invalidation handled client-side).
- **GET `/users/all`**: Returns a list of all users except the currently logged-in user. Requires authentication.

---

## Project Routes

Project routes allow users to create and manage projects, add users, and update project file structures. All routes require authentication.

| Method | Endpoint                         | Description                           | Middleware                |
|--------|-----------------------------------|---------------------------------------|---------------------------|
| POST   | `/projects/create`                | Create a new project                  | authMiddleware.authUser   |
| GET    | `/projects/all`                   | Get all projects for a user           | authMiddleware.authUser   |
| PUT    | `/projects/add-user`              | Add users to a project                | authMiddleware.authUser   |
| GET    | `/projects/get-project/:projectId`| Get project details by ID             | authMiddleware.authUser   |
| PUT    | `/projects/update-file-tree`      | Update the file tree of a project     | authMiddleware.authUser   |

### Project Route Details
- **POST `/projects/create`**: Create a new project. Requires project details in the request body. Only authenticated users can create projects.
- **GET `/projects/all`**: Retrieve all projects associated with the authenticated user.
- **PUT `/projects/add-user`**: Add one or more users to an existing project. Requires project ID and user IDs in the request body.
- **GET `/projects/get-project/:projectId`**: Get detailed information about a specific project by its ID.
- **PUT `/projects/update-file-tree`**: Update the file structure (tree) of a project. Requires project ID and new file tree data.

---

## AI Routes

AI routes provide access to AI-powered features, such as generating responses or code suggestions. No authentication is required for these endpoints.

| Method | Endpoint         | Description                              | Middleware |
|--------|------------------|------------------------------------------|------------|
| GET    | `/ai/get-result` | Get AI-generated result for a prompt     | None       |

### AI Route Details
- **GET `/ai/get-result`**: Accepts a prompt as a query parameter and returns an AI-generated response using Google Generative AI. Useful for code suggestions, explanations, or other AI-powered assistance.

---

## Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Caching**: Redis
- **Authentication**: JWT
- **Real-time Communication**: Socket.IO
- **AI Integration**: Google Generative AI

---

## Contributing
1. Fork the repository.
2. Create a new branch for your feature/bug fix.
3. Commit your changes and push to your branch.
4. Submit a pull request.

---

## License
This project is licensed under the MIT License.