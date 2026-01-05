# Smart Restaurant System

A comprehensive full-stack web application designed to streamline restaurant operations, including table management, reservations, queue handling, and an AI-powered customer service agent.

## Features

### 👥 User Management
- **Role-Based Access**: Specialized views and capabilities for **Customers** and **Managers**.
- **Secure Authentication**: JWT-based login and registration system.
- **Dynamic Registration**: Select your role (Customer/Manager) during sign-up.

### 🍽️ Table & Queue Management
- **Interactive Floor Plan**: Managers can view, add, update, and delete restaurant tables.
- **Real-time Queue**: Customers can join the waitlist, providing party size and preferences.
- **Status Tracking**: Live updates on queue position and table readiness.

### 📅 Reservations
- **Booking System**: Customers can request reservations for specific dates and times.
- **Manager Approval**: dedicated dashboard for managers to approve or decline reservation requests.

### 🤖 AI Chat Agent ("The Grand Hotelier")
- **Intelligent Assistant**: A context-aware chatbot available to answer customer inquiries.
- **Modern UI**: Polished chat interface with animations, gradients, and a premium fee.
- **Powered by LLMs**: content generation using advanced language models (LangChain, Google GenAI/Groq).

## Tech Stack

### Client
- **Framework**: Angular 18+
- **Styling**: Angular Material, TailwindCSS, Custom CSS
- **HTTP**: RxJS for reactive API handling

### Server
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (with `mysql2` driver)
- **Authentication**: `bcryptjs` & `jsonwebtoken`
- **AI/ML**: LangChain, Google Generative AI, Groq SDK

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server

### 1. Database Setup
1.  Create a MySQL database names `restaurant_db`.
2.  Run the initialization script located at `database/schema.sql` to create the necessary tables (`users`, `restaurant_tables`, `queue_entries`, `reservations`).

### 2. Server Setup
```bash
cd server
npm install
# Create a .env file with your DB credentials and API keys
npm run dev
```

### 3. Client Setup
```bash
cd client
npm install
npm start
```

### 4. Access
Open your browser and navigate to `http://localhost:4200` to view the application.

## Project Structure
- `client/`: Angular frontend application.
- `server/`: Node.js/Express backend API.
- `database/`: SQL scripts for database schema and setup.

## License
[ISC](https://opensource.org/licenses/ISC)
