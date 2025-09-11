# CityWatch 🏙️

A comprehensive civic engagement platform that connects citizens with local authorities to report and track community issues in real-time.

## 🌟 Overview

CityWatch is a full-stack web application designed to streamline civic reporting and improve community engagement. Citizens can report issues like garbage problems, road damage, water issues, and power outages, while authorities can respond with updates and track resolution progress.

## 🚀 Key Features

### 👥 User Management
- **Multi-role System**: Citizens, Authorities, and Admins with distinct permissions
- **City-based Scoping**: Users are assigned to specific cities for localized reporting
- **Profile Management**: Customizable user profiles with pictures and bios
- **Account Security**: JWT-based authentication with refresh tokens

### 📋 Report System
- **Issue Reporting**: Citizens can create detailed reports with categories:
  - 🗑️ Garbage Collection
  - 🛣️ Road Maintenance
  - 💧 Water Issues
  - ⚡ Power Problems
  - 📝 Other Issues
- **Status Tracking**: Reports progress through states (Open → In Progress → Resolved → Closed)
- **File Attachments**: Support for images and PDFs with organized storage
- **Geographic Filtering**: Reports are automatically scoped to user's city

### 💬 Communication Features
- **Comments System**: Citizens and authorities can discuss reports
- **Authority Updates**: Official responses with status changes
- **Real-time Notifications**: Instant alerts for report activity
- **Timeline View**: Complete history of report interactions

### 🔔 Notification System
- **Smart Notifications**: Users receive alerts for:
  - New reports in their city (for authorities)
  - Comments on their reports
  - Status updates from authorities
  - Report closures
- **Real-time Updates**: 30-second polling for instant notifications
- **Notification Management**: Mark as read, view all, and manage preferences

### 🛠️ Admin Dashboard
- **User Management**: Promote/demote users, ban/unban accounts
- **Report Oversight**: View all reports across cities, soft delete inappropriate content
- **Audit Logging**: Complete trail of admin actions for accountability
- **System Monitoring**: Overview of platform usage and statistics

### 📱 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Intuitive Interface**: Clean, modern design with Tailwind CSS
- **Real-time Updates**: Dynamic content without page refreshes
- **Accessibility**: Screen reader friendly with proper ARIA labels

## 🏗️ Technical Architecture

### Backend (Node.js + Express)
- **Database**: SQLite with Prisma ORM for type-safe database operations
- **Authentication**: JWT tokens with refresh mechanism
- **File Storage**: Organized asset management with automatic cleanup
- **API Design**: RESTful endpoints with proper error handling
- **Security**: Role-based access control and input validation

### Frontend (React + Vite)
- **State Management**: React Context for global state
- **Routing**: React Router for seamless navigation
- **HTTP Client**: Custom authenticated request wrapper
- **Real-time Features**: Polling-based updates for notifications
- **Component Architecture**: Reusable, modular components

### Database Schema
- **Users**: Profile data, roles, city assignments
- **Reports**: Issue details, status, attachments
- **Comments**: Discussion threads on reports
- **Notifications**: User alerts and read status
- **Audit Logs**: Admin action tracking
- **Cities**: Geographic organization

## 📁 Project Structure

```
CityWatch-Web/
├── backend/
│   ├── assets/           # Organized file storage
│   │   ├── profiles/     # User profile pictures
│   │   ├── reports/      # Report attachments
│   │   └── icons/        # System icons
│   ├── controllers/      # API route handlers
│   ├── middleware/       # Authentication & validation
│   ├── routes/          # API endpoint definitions
│   ├── services/        # Business logic & utilities
│   └── prisma/          # Database schema & migrations
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React context providers
│   │   ├── pages/       # Main application pages
│   │   └── utils/       # Helper functions
└── README.md
```

## 🔧 Core Workflows

### Report Creation Flow
1. Citizen logs in and navigates to "Create Report"
2. Fills out report details (title, description, category)
3. Optionally uploads supporting images/documents
4. Report is automatically assigned to their city
5. All authorities in the city receive notifications

### Authority Response Flow
1. Authority views new reports in their city
2. Can add official updates with status changes
3. Citizens receive notifications of authority responses
4. Report status progresses through workflow stages

### Notification Flow
1. System detects report activity (new reports, comments, updates)
2. Relevant users are identified based on city and role
3. Notifications are created and stored in database
4. Frontend polls for new notifications every 30 seconds
5. Users see notification badges and can manage alerts

## 🎯 User Roles & Permissions

### 👤 Citizens
- Create and manage their own reports
- Comment on reports in their city
- Upload supporting files
- Close their resolved reports
- View city-wide report feed

### 🏛️ Authorities
- View all reports in their assigned city
- Add official updates and status changes
- Comment on reports with authority badge
- Cannot create new reports
- Receive notifications for new reports

### 👑 Admins
- Full system access across all cities
- User management (promote, demote, ban)
- Report oversight and soft deletion
- Audit log access
- System statistics and monitoring

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Granular permissions by user role
- **City Scoping**: Data isolation by geographic boundaries
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Type and size restrictions
- **Audit Logging**: Complete trail of sensitive operations

## 📊 Data Management

- **Organized Storage**: Files stored in categorized folders
- **Automatic Cleanup**: Old files removed when updated
- **Database Migrations**: Version-controlled schema changes
- **Backup Strategy**: SQLite database with migration history
- **Asset Optimization**: Efficient file serving and caching

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Current user data

### Reports
- `GET /api/reports` - List reports (city-scoped)
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get report details
- `PATCH /api/reports/:id/close` - Close report
- `POST /api/reports/:id/updates` - Add authority update

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### User Management
- `GET /api/users/me` - Get profile
- `PATCH /api/users/me` - Update profile
- `PATCH /api/users/me/city` - Change city

## 🎨 Design Philosophy

CityWatch is built with a focus on:
- **Simplicity**: Intuitive interface that anyone can use
- **Efficiency**: Fast, responsive interactions
- **Transparency**: Clear status updates and communication
- **Accessibility**: Inclusive design for all users
- **Scalability**: Architecture that grows with the community

## 🏆 Team

**Team Name**: DeVOTeS

**Members**:
- Darshdeep
- Varad
-  Omkar
- Shivam
- Tanmay

## 📄 License

**All Rights Reserved**

This project and its source code are proprietary and confidential. 

**Copyright © 2024 Team Devoted. All rights reserved.**

### Usage Restrictions

- ❌ **No Commercial Use**: This software may not be used for commercial purposes without explicit written permission
- ❌ **No Distribution**: You may not distribute, copy, or share this code without authorization
- ❌ **No Modification**: You may not modify, adapt, or create derivative works without permission
- ❌ **No Reverse Engineering**: You may not attempt to reverse engineer or decompile this software
- ❌ **No Public Display**: You may not display this project publicly without consent

### Permissions

- ✅ **Personal Learning**: You may view the code for educational purposes only
- ✅ **Team Collaboration**: Team members may use and modify the code for project development

### Contact

For permissions, licensing inquiries, or collaboration opportunities, please contact varaddigraskar21@gmail.com

**Unauthorized use of this software is strictly prohibited and may result in legal action.**

---

