# MicroCourses API Documentation

## API Summary

This project provides a backend API and frontend for managing online courses, users, and creator applications.

### Key API Endpoints

- **User Authentication & Management**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login user and get token
  - `GET /api/auth/me` - Get current logged-in user info

- **Course Management**
  - `GET /api/courses` - Get all published courses
  - `GET /api/courses/creator` - Get courses created by the logged-in creator
  - `POST /api/courses` - Create a new course (Creator only)
  - `PUT /api/courses/:id` - Update course details
  - `DELETE /api/courses/:id` - Delete a course
  - `PUT /api/admin/courses/:id/status` - Admin updates course status (Publish/Reject)

- **Creator Application**
  - `POST /api/creators/apply` - Submit creator application form
  - `GET /api/admin/creators/pending` - Admin fetches pending creator applications
  - `PUT /api/admin/creators/:id/status` - Admin approves or rejects creator application

- **Lesson Management**
  - `POST /api/lessons` - Add lesson to a course
  - `GET /api/lessons/:courseId` - Get lessons for a course

- **Transcript Management**
  - `POST /api/transcripts` - Generate or upload transcript for a lesson
  - `GET /api/transcripts/:lessonId` - Get transcript for a lesson

## Example Requests and Responses

### Get Pending Creator Applications (Admin)

**Request:**

```
GET /api/admin/creators/pending
Authorization: Bearer <admin_token>
```

**Response:**

```json
[
  {
    "_id": "1234567890",
    "name": "Anjana Singh",
    "email": "anjanasingh945@gmail.com",
    "experience": "5 years teaching experience",
    "motivation": "Passionate about sharing knowledge",
    "portfolio": "https://portfolio.example.com/anjana",
    "creatorApplicationStatus": "Pending",
    "role": "Learner"
  }
]
```

### Approve Creator Application (Admin)

**Request:**

```
PUT /api/admin/creators/1234567890/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "Approved"
}
```

**Response:**

```json
{
  "_id": "1234567890",
  "name": "Anjana Singh",
  "email": "anjanasingh945@gmail.com",
  "creatorApplicationStatus": "Approved",
  "role": "Creator"
}
```

## Test User Credentials

- **Admin User**
  - Email: admin@example.com
  - Password: adminpassword

- **Creator User**
  - Email: creator@example.com
  - Password: creatorpassword

- **Learner User**
  - Email: learner@example.com
  - Password: learnerpassword

## Seed Data

If you want to seed the database with test users and courses, you can run the provided seed scripts:

- `node createTestCreator.js` - Creates a test creator user
- `node createTestCourses.js` - Creates sample courses for testing
- `node retrieveAdminUser.js` - Retrieves or creates an admin user

Make sure your MongoDB connection is configured correctly in the environment variables before running seed scripts.

---


