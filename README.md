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
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/citywatch_db"
   PORT=5000
   NODE_ENV=development
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

### Frontend Navigation

1. Open `http://localhost:5173` in your browser
2. You should see the CityWatch homepage
3. Navigate between pages using the navbar:
   - Home
   - Login
   - Sign Up
   - Dashboard

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

This is the base setup for CityWatch. Future development will include:

- User authentication and authorization
- Report creation and management
- Admin dashboard for authorities
- Real-time notifications
- File upload for report images
- Email notifications
- API documentation

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
