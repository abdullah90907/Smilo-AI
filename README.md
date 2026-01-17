# Smilo - AI-Powered Dental Disease Detection System

An intelligent web-based healthcare platform for AI-powered dental caries detection using deep learning models. The system provides instant X-ray analysis, professional doctor consultation, and comprehensive dental health management.

## Features

- 🤖 **AI-Powered Analysis**: Deep learning model for dental caries detection with 95%+ accuracy
- 📊 **Detailed Reports**: Comprehensive analysis with heatmaps, severity levels, and clinical guidance
- 👨‍⚕️ **Doctor Panel**: Professional dashboard for X-ray review and patient management
- 📱 **User Dashboard**: Patient portal for upload history, reports, and appointments
- 🔒 **Secure & Private**: HIPAA-compliant data handling with role-based access control

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

## Scripts

```sh
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run test       # Run tests
```

## License

This project is part of a Final Year Project (FYP) for educational purposes.

## Contact

For questions or support, please contact the development team.
