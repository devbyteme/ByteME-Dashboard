# Restaurant Management System

A modern, responsive restaurant management application built with React, Vite, and Tailwind CSS.

## Features

- **Dashboard**: Overview of restaurant performance and key metrics
- **Menu Management**: Add, edit, and manage menu items
- **Order Management**: Track and manage customer orders
- **QR Code Generation**: Generate QR codes for tables
- **Analytics**: Detailed insights and performance metrics
- **Customer Interface**: Customer-facing menu and ordering system

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Radix UI Components
- React Router DOM
- Recharts for data visualization

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

- `/src/components/` - Reusable UI components
- `/src/pages/` - Main application pages
- `/src/api/` - API service layer (ready for custom backend integration)
- `/src/utils/` - Utility functions
- `/src/hooks/` - Custom React hooks

## Backend Integration

This frontend is designed to work with any custom backend. The API layer in `/src/api/` contains service functions that can be easily modified to integrate with your preferred backend technology.