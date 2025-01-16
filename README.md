# Authentication Server

## Overview

This server handles authentication-related operations such as login, registration, OTP verification, and device management.

## Endpoints

### Authentication

- **POST** `/api/auth/login`
  - Description: Logs in a user.
  - Request Body: `{ "username": "string", "password": "string" }`
  - Response: `{ "token": "string" }`

- **POST** `/api/auth/register`
  - Description: Registers a new user.
  - Request Body: `{ "username": "string", "password": "string", "email": "string" }`
  - Response: `{ "message": "User registered successfully" }`

### OTP

- **POST** `/api/auth/otp/login-with`
  - Description: Logs in a user with OTP.
  - Request Body: `{ "otp": "string" }`
  - Response: `{ "token": "string" }`

- **POST** `/api/auth/otp/verify`
  - Description: Verifies an OTP.
  - Request Body: `{ "otp": "string" }`
  - Response: `{ "message": "OTP verified successfully" }`

- **POST** `/api/auth/otp/send`
  - Description: Sends an OTP to the user.
  - Request Body: `{ "email": "string" }`
  - Response: `{ "message": "OTP sent successfully" }`

### Logout

- **DELETE** `/api/auth/logout`
  - Description: Logs out the current user.
  - Response: `{ "message": "Logged out successfully" }`

- **DELETE** `/api/auth/logout/:deviceId`
  - Description: Logs out a specific device.
  - Response: `{ "message": "Device logged out successfully" }`

- **POST** `/api/auth/logout/devices`
  - Description: Logs out all devices.
  - Response: `{ "message": "All devices logged out successfully" }`

- **helmet**
  - Description: Middleware to set various HTTP headers for security.### Device Management

- **PATCH** `/api/auth/register-primary-device/:deviceId`
  - Description: Registers a primary device.
  - Response: `{ "message": "Primary device registered successfully" }`

- **POST** `/api/auth/register-primary-device/verify-otp`
  - Description: Verifies OTP for registering a primary device.
  - Response: `{ "message": "OTP verified successfully" }`

### Passport Authentication

- **GET** `/api/auth/google`
  - Description: Initiates Google authentication.
  - Response: Redirects to Google authentication page.

- **GET** `/api/auth/google/callback`
  - Description: Handles Google authentication callback.
  - Response: Redirects to the application.

- **GET** `/api/auth/github`
  - Description: Initiates GitHub authentication.
  - Response: Redirects to GitHub authentication page.

- **GET** `/api/auth/github/callback`
  - Description: Handles GitHub authentication callback.
  - Response: Redirects to the application.

## Middleware

- **verifyUser**
  - Description: Middleware to verify the user before processing the request.
  - - **helmet**
  - Description: Middleware to set various HTTP headers for security.
  - Configuration: Configured with Content Security Policy, Referrer Policy, Frameguard, XSS Filter, NoSniff, and IENoOpen.

## Configuration

- **passport**
  - Description: Passport configuration for Google and GitHub authentication.
- **authenticateAndRedirect**
  - Description: Middleware to authenticate and redirect users after successful authentication.

## Error Handling

- **401 Unauthorized**
  - Description: Returned when the user is not authenticated.
- **400 Bad Request**
  - Description: Returned when the request is malformed or missing required parameters.
- **500 Internal Server Error**
  - Description: Returned when an unexpected error occurs on the server.

## License

This project is licensed under the MIT License.
