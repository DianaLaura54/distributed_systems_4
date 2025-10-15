This project is a full-stack application that includes role-based authentication, real-time chat, device-user management, and integration of multiple microservices using Docker and Traefik. It supports both admin and user roles, offering different access levels and features depending on the role.
The front-end was implemented using React, and the back-end was implemented with Spring Boot. The classes and data are stored in PostgreSQL. The application uses RabbitMQ for messaging and WebSockets for real-time communication.
The back-end exposes a RESTful API, following standard CRUD operations using HTTP methods like GET, POST, PUT, and DELETE to manage resources such as users and devices, allowing seamless interaction between the frontend and backend.

Frontend: React, Axios

Backend: Spring Boot, RESTful APIs, JWT authentication

Database: PostgreSQL

Real-time Communication: WebSockets

Messaging: RabbitMQ

Containers & Orchestration: Docker, Traefik

Role-Based Authentication: Admin & User roles with different access levels
