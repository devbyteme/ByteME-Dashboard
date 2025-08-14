# Backend Integration Guide

This document explains how to integrate this restaurant management frontend with your custom backend.

## Overview

The frontend has been completely decoupled from Base44 and is now designed to work with any backend technology. All API calls are made through a generic HTTP client that can be configured to work with your preferred backend.

## API Structure

The frontend expects a RESTful API with the following endpoints:

### Authentication (`/auth`)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Forgot password
- `POST /auth/reset-password` - Reset password

### Menu Items (`/menu-items`)
- `GET /menu-items` - List all menu items
- `GET /menu-items/:id` - Get menu item by ID
- `POST /menu-items` - Create new menu item
- `PUT /menu-items/:id` - Update menu item
- `DELETE /menu-items/:id` - Delete menu item
- `GET /menu-items?category=:category` - Get items by category
- `PATCH /menu-items/:id` - Partial update (e.g., availability)

### Orders (`/orders`)
- `GET /orders` - List all orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order
- `GET /orders?status=:status` - Get orders by status
- `GET /orders?table=:table` - Get orders by table
- `GET /orders/today` - Get today's orders
- `PATCH /orders/:id` - Partial update (e.g., status)

### Tables (`/tables`)
- `GET /tables` - List all tables
- `GET /tables/:id` - Get table by ID
- `POST /tables` - Create new table
- `PUT /tables/:id` - Update table
- `DELETE /tables/:id` - Delete table
- `GET /tables?number=:number` - Get table by number
- `PATCH /tables/:id` - Partial update (e.g., status)
- `POST /tables/:id/qr-code` - Generate QR code
- `GET /tables/availability` - Get table availability

### Customers (`/customers`)
- `GET /customers` - List all customers
- `GET /customers/:id` - Get customer by ID
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `GET /customers?email=:email` - Get customer by email
- `GET /customers?phone=:phone` - Get customer by phone
- `PATCH /customers/:id` - Partial update (e.g., preferences)
- `GET /customers/:id/orders` - Get customer order history
- `POST /customers/:id/loyalty` - Add to loyalty program

### Analytics (`/analytics`)
- `GET /analytics/revenue` - Revenue analytics
- `GET /analytics/orders` - Order analytics
- `GET /analytics/popular-items` - Popular items analytics
- `GET /analytics/customer-stats` - Customer statistics

## Data Models

### Menu Item
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "available": "boolean",
  "image": "string (URL)",
  "ingredients": ["string"],
  "allergens": ["string"],
  "nutritionalInfo": {
    "calories": "number",
    "protein": "number",
    "carbs": "number",
    "fat": "number"
  },
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Order
```json
{
  "id": "string",
  "tableNumber": "string",
  "customerId": "string (optional)",
  "items": [
    {
      "menuItemId": "string",
      "name": "string",
      "price": "number",
      "quantity": "number",
      "notes": "string (optional)"
    }
  ],
  "totalAmount": "number",
  "status": "string (pending|preparing|ready|served|cancelled)",
  "paymentStatus": "string (pending|paid|refunded)",
  "paymentMethod": "string (cash|card|mobile)",
  "notes": "string (optional)",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Table
```json
{
  "id": "string",
  "number": "string",
  "capacity": "number",
  "status": "string (available|occupied|reserved|maintenance)",
  "location": "string (optional)",
  "qrCode": "string (URL, optional)",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Customer Profile
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "string (ISO date, optional)",
  "preferences": {
    "dietaryRestrictions": ["string"],
    "favoriteItems": ["string"],
    "allergies": ["string"]
  },
  "loyaltyPoints": "number",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### User (Authentication)
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string (vendor|admin|staff)",
  "permissions": ["string"],
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

## Authentication

The frontend uses JWT tokens for authentication. Your backend should:

1. Issue JWT tokens upon successful login/registration
2. Validate JWT tokens on protected endpoints
3. Support token refresh for long-lived sessions
4. Return user data along with the token

### Login Response
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string"
  }
}
```

## Configuration

### Environment Variables
Create a `.env` file in the frontend root:

```bash
# Development
VITE_API_BASE_URL=http://localhost:3000/api

# Production
VITE_API_BASE_URL=https://your-backend-domain.com/api

# Debug mode
VITE_DEBUG=true
```

### API Client Configuration
The API client is configured in `src/config/api.js`. You can modify:

- Base URL
- Endpoints
- Timeout settings
- Authentication settings

## Error Handling

Your backend should return appropriate HTTP status codes and error messages:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "string",
  "message": "string",
  "details": "object (optional)"
}
```

## CORS Configuration

Ensure your backend allows requests from the frontend domain:

```javascript
// Express.js example
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

## Testing the Integration

1. Start your backend server
2. Set the `VITE_API_BASE_URL` environment variable
3. Start the frontend: `npm run dev`
4. Check the browser console for any API errors
5. Test authentication flow
6. Test CRUD operations for each entity

## Common Issues

### CORS Errors
- Ensure your backend allows requests from the frontend domain
- Check that credentials are properly configured

### Authentication Issues
- Verify JWT token format and expiration
- Check that the `Authorization` header is properly set
- Ensure token refresh is working

### API Endpoint Mismatches
- Verify that your backend endpoints match the expected structure
- Check that HTTP methods (GET, POST, PUT, DELETE) are correct
- Ensure response formats match the expected data models

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your backend API endpoints
3. Test API calls using tools like Postman or curl
4. Check the network tab in browser dev tools
5. Review the API configuration in `src/config/api.js`

## Example Backend Implementations

### Node.js/Express
```javascript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Protected routes
app.get('/api/menu-items', authenticateToken, (req, res) => {
  // Return menu items
});

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});
```

### Python/Flask
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])

# Authentication decorator
def token_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token.split(' ')[1], app.config['SECRET_KEY'])
            current_user = data
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/menu-items', methods=['GET'])
@token_required
def get_menu_items(current_user):
    # Return menu items
    pass

if __name__ == '__main__':
    app.run(debug=True, port=3000)
```

This frontend is now completely independent and ready to work with any backend technology you choose! 