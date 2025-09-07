# CityWatch - Community Safety Platform

CityWatch is a full-stack community safety platform where citizens can report city issues and authorities can manage and respond to these reports efficiently.

## 🏗️ Project Structure

```
CityWatch-Web/
├── backend/                 # Node.js + Express API
│   ├── controllers/         # Route controllers
│   ├── routes/             # API routes
│   ├── models/             # Prisma schema
│   ├── services/           # Business logic
│   ├── middleware/         # Custom middleware
│   ├── prisma/             # Database schema and migrations
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM and database toolkit
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server auto-restart

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v12 or higher)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CityWatch-Web
```

### 2. Database Setup

1. Install and start PostgreSQL on your system
2. Create a new database for the project:
   ```sql
   CREATE DATABASE citywatch_db;
   ```

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Update the `.env` file with your database credentials and JWT secrets:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/citywatch_db"
   PORT=5000
   NODE_ENV=development
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:5000`

### 4. Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 🧪 Testing the Setup

### Backend Health Check

Visit `http://localhost:5000/api/health` in your browser or use curl:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok"
}
```

### Authentication System

The authentication system includes:

#### Backend API Endpoints:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user (protected)

#### Frontend Features:
- **Signup Form**: Username, email, password, city selection
- **Login Form**: Email and password
- **Protected Dashboard**: Shows user info and role
- **JWT Token Management**: Automatic token storage and refresh
- **Role-based Access**: Citizen, Authority, Admin roles

#### Test Authentication:
1. Open `http://localhost:5173` in your browser
2. Click "Sign Up" to create a new account
3. Fill in the form with valid data (password must be 8+ chars with number and special char)
4. After signup, you'll be redirected to the dashboard
5. The dashboard shows your username and role (always "Citizen" for new signups)
6. Use the navbar to logout and test login functionality

### Frontend Navigation

1. Open `http://localhost:5173` in your browser
2. You should see the CityWatch homepage
3. Navigate between pages using the navbar:
   - Home (public)
   - Login (public)
   - Sign Up (public)
   - Dashboard (protected - requires authentication)

## 📝 Available Scripts

### Backend Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run lint       # Run ESLint
npm run lint:fix   # Run ESLint and fix issues
npm run format     # Format code with Prettier
```

### Frontend Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Run ESLint and fix issues
npm run format     # Format code with Prettier
```

## 🔧 Development Workflow

1. **Backend Development**: Make changes in the `backend/` directory
2. **Frontend Development**: Make changes in the `frontend/` directory
3. **Database Changes**: Update the Prisma schema in `backend/prisma/schema.prisma` and run migrations
4. **Code Quality**: Run linting and formatting before committing changes

## 📁 Key Files

- `backend/server.js` - Main server entry point
- `backend/prisma/schema.prisma` - Database schema
- `frontend/src/App.jsx` - Main React component with routing
- `frontend/src/components/Navbar.jsx` - Navigation component
- `frontend/src/pages/` - Page components (Home, Login, Signup, Dashboard)

## 🚧 Next Steps

This is Stage 2 of CityWatch with authentication system complete. Future development will include:

- Report creation and management system
- Admin dashboard for authorities
- Real-time notifications
- File upload for report images
- Email notifications
- API documentation
- Password reset functionality
- User profile management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting
5. Test your changes
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
Stage 1
