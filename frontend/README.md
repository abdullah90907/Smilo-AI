# Smilo - AI-Powered Dental Disease Detection System

An intelligent web-based healthcare platform for AI-powered dental caries detection using deep learning models. The system provides instant X-ray analysis, professional doctor consultation, and comprehensive dental health management.

> 📖 **For detailed frontend architecture and flow documentation, see [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)**

## ✨ Features

- 🤖 **AI-Powered Analysis**: Deep learning model for dental caries detection with 95%+ accuracy
- 📊 **Detailed Reports**: Comprehensive analysis with heatmaps, severity levels, and clinical guidance
- 👨‍⚕️ **Doctor Panel**: Professional dashboard for X-ray review and patient management
- 📱 **User Dashboard**: Patient portal for upload history, reports, and appointments
- 🔒 **Secure & Private**: HIPAA-compliant data handling with role-based access control
- 🎨 **Modern UI**: Beautiful, responsive interface built with React & Tailwind CSS
- ⚡ **Fast Performance**: Lightning-fast development and build with Vite

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd smilo-bright-smile-ai-main

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Project Structure

```
smilo-bright-smile-ai-main/
├── src/
│   ├── components/
│   │   ├── sections/        # Landing page sections
│   │   └── ui/              # Reusable UI components (Shadcn)
│   ├── pages/
│   │   ├── doctor/          # Doctor dashboard pages
│   │   ├── user/            # User dashboard pages
│   │   ├── Auth.tsx         # Authentication page
│   │   └── Index.tsx        # Landing page
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utility functions
├── public/                  # Static assets
└── docs/                    # Documentation files
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Available Routes

### Public Routes
- `/` - Landing page
- `/auth` - Login/Register page

### User Routes
- `/dashboard` - User dashboard
- `/dashboard/upload` - X-ray upload
- `/dashboard/reports` - View reports
- `/dashboard/doctors` - Find doctors
- `/dashboard/appointments` - Appointments

### Doctor Routes
- `/doctor-dashboard` - Doctor overview
- `/doctor-dashboard/reports` - Patient reports
- `/doctor-dashboard/xrays` - X-ray viewer
- `/doctor-dashboard/ai-predictions` - AI analytics

## 🛠️ Scripts

```sh
npm run dev         # Start development server at http://localhost:8080
npm run build       # Build for production
npm run build:dev   # Build for development with source maps
npm run preview     # Preview production build locally
npm run lint        # Run ESLint for code quality
npm run test        # Run all tests once
npm run test:watch  # Run tests in watch mode
```

## 📚 Documentation

- **[FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)** - Complete frontend structure, user flows, and upload process
- **[COMPLETE_WORKFLOW.md](./COMPLETE_WORKFLOW.md)** - End-to-end workflow documentation
- **[SYSTEM_FLOW.md](./SYSTEM_FLOW.md)** - System architecture and data flow

## 🔄 User Flow Summary

### For Patients:
1. **Sign Up/Login** → `/auth`
2. **Upload X-ray** → `/dashboard/upload`
3. **AI Processing** → Automatic analysis
4. **View Report** → `/dashboard/reports/:id`
5. **Consult Doctor** → `/dashboard/doctors`

### For Doctors:
1. **Login** → `/auth` (Doctor tab)
2. **Review Reports** → `/doctor-dashboard/reports`
3. **Analyze X-rays** → Advanced viewer with zoom/contrast controls
4. **Verify AI Results** → Add professional notes
5. **Manage Patients** → Appointments & consultations

## 🎯 Key Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **State**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library

## 📄 License

This project is part of a Final Year Project (FYP) for educational purposes.

## 👥 Team

For questions, support, or contributions, please contact the development team.

---

**Made with ❤️ by the Smilo Team**
