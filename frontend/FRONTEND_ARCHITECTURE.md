# Smilo AI - Frontend Architecture & Process Flow

## 🏗️ System Overview

Smilo is an AI-powered dental caries detection system built with React 18, TypeScript, and Vite. The application provides two distinct user interfaces: one for patients and one for doctors, each with role-specific functionality for dental X-ray analysis and management.

---

## 📁 Project Structure

```
smilo-ai/
├── public/                      # Static assets
│   └── robots.txt
├── src/
│   ├── assets/                  # Images, fonts, media files
│   ├── components/
│   │   ├── sections/           # Landing page components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── WhySmiloSection.tsx
│   │   │   ├── DoctorsSection.tsx
│   │   │   ├── CTASection.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                 # Reusable Shadcn UI components
│   │       ├── Navbar.tsx
│   │       ├── UserSidebar.tsx
│   │       ├── DoctorSidebar.tsx
│   │       └── [40+ UI components]
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                    # Utility functions
│   │   └── utils.ts           # cn() className merger, helpers
│   ├── pages/                  # Route components
│   │   ├── Index.tsx          # Landing page
│   │   ├── Auth.tsx           # Authentication page
│   │   ├── Dashboard.tsx      # Main dashboard router
│   │   ├── NotFound.tsx       # 404 page
│   │   ├── doctor/            # Doctor-specific pages
│   │   │   ├── DoctorDashboard.tsx    # Layout wrapper
│   │   │   ├── Overview.tsx            # Statistics & metrics
│   │   │   ├── PatientReports.tsx      # All patient reports
│   │   │   ├── ReportDetail.tsx        # Single report view
│   │   │   ├── XrayViewer.tsx          # Advanced X-ray viewer
│   │   │   └── AIPredictions.tsx       # AI analytics dashboard
│   │   └── user/              # Patient-specific pages
│   │       ├── UserDashboardLayout.tsx # Layout wrapper
│   │       └── UserOverview.tsx        # Main dashboard
│   ├── test/                   # Test files
│   │   ├── setup.ts
│   │   └── example.test.ts
│   ├── App.tsx                 # Root component with routing
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles
├── components.json             # Shadcn UI configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite bundler configuration
├── vitest.config.ts           # Testing configuration
└── package.json               # Dependencies & scripts
```

---

## 🎯 Application Architecture

### **Tech Stack**

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | React 18.3.1 | UI library with hooks & concurrent features |
| **Language** | TypeScript 5.8.3 | Type-safe JavaScript |
| **Build Tool** | Vite 5.4.19 | Fast development server & bundler |
| **Styling** | Tailwind CSS 3.4.17 | Utility-first CSS framework |
| **UI Components** | Shadcn UI + Radix UI | Accessible component library |
| **Animations** | Framer Motion 12.26.2 | Smooth transitions & animations |
| **Routing** | React Router DOM 6.30.1 | Client-side routing |
| **Forms** | React Hook Form 7.61.1 | Form state management |
| **Validation** | Zod 3.25.76 | Schema validation |
| **State Management** | TanStack Query 5.83.0 | Server state & caching |
| **Icons** | Lucide React 0.462.0 | Icon library |
| **Testing** | Vitest 3.2.4 | Unit testing framework |

---

## 🔄 User Flow & Process

### **1. Landing Page Flow** (`/`)

```
User visits website
    ↓
Loads Index.tsx with sections:
    ├─ HeroSection       → Welcome message, primary CTA
    ├─ FeaturesSection   → AI detection, doctor consultation, reports
    ├─ HowItWorksSection → 3-step process explanation
    ├─ WhySmiloSection   → Benefits & unique selling points
    ├─ DoctorsSection    → Meet our dental professionals
    ├─ CTASection        → Call to action
    └─ Footer            → Links, social media, contact
    ↓
User clicks "Get Started" or "Sign In"
    ↓
Navigates to /auth
```

---

### **2. Authentication Flow** (`/auth`)

The authentication page (`Auth.tsx`) provides a **3-tab interface**:

#### **Tab 1: Patient Login**
```
Patient enters:
    ├─ Email
    ├─ Password
    └─ Remember me (optional)
    ↓
Clicks "Sign In"
    ↓
Simulates authentication (1.5s delay)
    ↓
Redirects to /dashboard
```

#### **Tab 2: Patient Registration**
```
New patient enters:
    ├─ Full Name
    ├─ Email
    ├─ Password
    ├─ Age
    ├─ Gender (dropdown)
    └─ City
    ↓
Clicks "Create Account"
    ↓
Creates user account
    ↓
Redirects to /dashboard
```

#### **Tab 3: Doctor Login**
```
Doctor enters:
    ├─ Professional Email
    ├─ Password
    └─ Clinic Name
    ↓
Clicks "Access Portal"
    ↓
Authenticates as doctor
    ↓
Redirects to /doctor-dashboard
```

---

### **3. Patient Dashboard Flow** (`/dashboard`)

#### **Layout Structure**
- **Left Sidebar** (UserSidebar.tsx): Fixed navigation panel
- **Main Content** (UserOverview.tsx): Dynamic content area

#### **Dashboard Features**

```
UserDashboardLayout
├─ UserSidebar (Fixed left panel)
│   ├─ Dashboard
│   ├─ Upload X-ray
│   ├─ My Reports
│   ├─ History
│   ├─ Find Doctors
│   ├─ Appointments
│   ├─ Profile
│   └─ Settings
└─ Main Content Area
    └─ UserOverview
        ├─ Statistics Cards (4)
        │   ├─ Total X-rays
        │   ├─ Health Score
        │   ├─ Reports Ready
        │   └─ Next Checkup
        ├─ Upload X-ray CTA Card
        ├─ Recent Scans Table
        ├─ Upcoming Appointments
        └─ Quick Actions Menu
```

---

### **4. X-ray Upload Process** (Patient Side)

```
Step 1: Patient clicks "Upload X-ray" from dashboard
    ↓
Step 2: Upload modal/page appears
    ├─ Select X-ray image file (.jpg, .png, .dicom)
    ├─ Add optional notes
    └─ Choose urgency level
    ↓
Step 3: File validation
    ├─ Check file format
    ├─ Check file size (max 10MB)
    └─ Check image quality
    ↓
Step 4: Upload to server
    ├─ Display upload progress bar
    ├─ Generate unique report ID
    └─ Store metadata
    ↓
Step 5: AI Processing (Backend)
    ├─ Preprocessing: Image normalization
    ├─ AI Model: Dental caries detection
    ├─ Heatmap generation
    ├─ Severity classification
    └─ Generate confidence scores
    ↓
Step 6: Report generation
    ├─ Create detailed report
    ├─ Include AI predictions
    ├─ Add recommendations
    └─ Store in database
    ↓
Step 7: Notification
    ├─ Patient receives notification
    ├─ Report added to "Reports Ready"
    └─ Doctor notified for review
    ↓
Step 8: Patient views report
    └─ Navigate to /dashboard/reports/{id}
```

---

### **5. Doctor Dashboard Flow** (`/doctor-dashboard`)

#### **Layout Structure**
- **Left Sidebar** (DoctorSidebar.tsx): Professional navigation panel
- **Main Content**: Role-specific views

#### **Dashboard Pages**

```
DoctorDashboard
├─ DoctorSidebar (Fixed left panel)
│   ├─ Overview
│   ├─ Patient Reports
│   ├─ X-ray Viewer
│   ├─ AI Predictions
│   ├─ Cases
│   ├─ Feedback
│   ├─ Appointments
│   ├─ Profile
│   └─ Settings
└─ Main Content Area
    ├─ Overview.tsx
    │   ├─ Key metrics (patients, reports, accuracy)
    │   ├─ Recent activity
    │   └─ Pending reviews
    ├─ PatientReports.tsx
    │   ├─ Filterable report table
    │   ├─ Search functionality
    │   └─ Status indicators
    ├─ ReportDetail.tsx
    │   ├─ Full X-ray view
    │   ├─ AI analysis results
    │   ├─ Heatmap overlay
    │   ├─ Doctor's notes section
    │   └─ Approval/rejection controls
    ├─ XrayViewer.tsx
    │   ├─ Advanced image viewer
    │   ├─ Zoom/rotate controls
    │   ├─ Brightness/contrast adjustment
    │   └─ Multi-image comparison
    └─ AIPredictions.tsx
        ├─ Model performance metrics
        ├─ Prediction accuracy charts
        └─ Detection statistics
```

---

### **6. Doctor Review Process**

```
Step 1: Doctor logs into /doctor-dashboard
    ↓
Step 2: Views "Patient Reports" page
    ├─ Filters by status (Pending, Reviewed, All)
    ├─ Sorts by date, severity, or patient
    └─ Selects a report
    ↓
Step 3: Opens ReportDetail.tsx
    ├─ Views original X-ray image
    ├─ Reviews AI detection results
    │   ├─ Detected areas highlighted
    │   ├─ Severity levels (None, Mild, Moderate, Severe)
    │   ├─ Confidence scores
    │   └─ Heatmap visualization
    └─ Reads patient information
    ↓
Step 4: Uses X-ray Viewer tools
    ├─ Zoom in/out (50-200%)
    ├─ Rotate image (90° increments)
    ├─ Adjust brightness (50-150%)
    └─ Adjust contrast (50-150%)
    ↓
Step 5: Doctor analysis
    ├─ Validates AI predictions
    ├─ Identifies additional findings
    ├─ Adds professional notes
    └─ Writes treatment recommendations
    ↓
Step 6: Decision & Action
    ├─ Option A: Approve AI report
    │   └─ Mark as "Doctor Verified"
    ├─ Option B: Modify report
    │   ├─ Update severity
    │   ├─ Add corrections
    │   └─ Request additional X-rays
    └─ Option C: Schedule consultation
        └─ Create appointment for patient
    ↓
Step 7: Notification sent
    ├─ Patient notified of results
    ├─ Report status updated
    └─ Available in patient dashboard
```

---

## 🔐 Route Structure

### **Public Routes**
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Index.tsx | Landing page with marketing content |
| `/auth` | Auth.tsx | Login/Register for patients & doctors |
| `*` | NotFound.tsx | 404 error page |

### **Patient Routes** (Protected)
| Path | Component | Description |
|------|-----------|-------------|
| `/dashboard` | UserOverview.tsx | Main dashboard overview |
| `/dashboard/upload` | UserOverview.tsx | X-ray upload interface |
| `/dashboard/reports` | UserOverview.tsx | All reports list |
| `/dashboard/reports/:id` | UserOverview.tsx | Single report detail |
| `/dashboard/history` | UserOverview.tsx | Upload history |
| `/dashboard/doctors` | UserOverview.tsx | Find doctors |
| `/dashboard/appointments` | UserOverview.tsx | Appointment management |
| `/dashboard/profile` | UserOverview.tsx | User profile settings |
| `/dashboard/settings` | UserOverview.tsx | Account settings |

### **Doctor Routes** (Protected)
| Path | Component | Description |
|------|-----------|-------------|
| `/doctor-dashboard` | Overview.tsx | Doctor overview dashboard |
| `/doctor-dashboard/reports` | PatientReports.tsx | All patient reports |
| `/doctor-dashboard/reports/:id` | ReportDetail.tsx | Single report review |
| `/doctor-dashboard/xrays` | XrayViewer.tsx | Advanced X-ray viewer |
| `/doctor-dashboard/ai-predictions` | AIPredictions.tsx | AI model analytics |
| `/doctor-dashboard/cases` | Overview.tsx | Case management |
| `/doctor-dashboard/feedback` | Overview.tsx | Patient feedback |
| `/doctor-dashboard/appointments` | Overview.tsx | Doctor's appointments |
| `/doctor-dashboard/profile` | Overview.tsx | Doctor profile |
| `/doctor-dashboard/settings` | Overview.tsx | Account settings |

---

## 🎨 UI/UX Components

### **Design System**

- **Color Scheme**: Gradient primary (blue/purple), clean backgrounds
- **Typography**: Modern sans-serif, hierarchical sizing
- **Spacing**: Consistent padding/margins using Tailwind
- **Components**: Shadcn UI + Radix UI for accessibility
- **Animations**: Framer Motion for smooth transitions

### **Key UI Elements**

1. **Cards** - Information containers with hover effects
2. **Buttons** - Multiple variants (primary, secondary, outline, ghost)
3. **Forms** - Validated inputs with icons and error states
4. **Badges** - Status indicators (severity, status, types)
5. **Tables** - Sortable, filterable data tables
6. **Modals** - Dialog boxes for actions and confirmations
7. **Toasts** - Non-intrusive notifications
8. **Sliders** - Range controls for image adjustments
9. **Tabs** - Content organization
10. **Scroll Areas** - Smooth scrolling containers

---

## 📊 Data Flow

```
User Input
    ↓
React Component State
    ↓
React Hook Form (Validation)
    ↓
Zod Schema Validation
    ↓
TanStack Query (API Call)
    ↓
Backend API (Future: FastAPI/Django)
    ↓
AI Model Processing (Future: TensorFlow/PyTorch)
    ↓
Database Storage (Future: PostgreSQL/MongoDB)
    ↓
Response returned through TanStack Query
    ↓
UI Updates with new state
    ↓
Framer Motion animations triggered
    ↓
Toast notification shown
```

---

## 🚀 Development Workflow

### **Available Scripts**

```bash
# Development
npm run dev        # Start dev server (http://localhost:8080)

# Building
npm run build      # Production build
npm run build:dev  # Development build with source maps

# Testing
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode

# Linting
npm run lint       # Check code quality

# Preview
npm run preview    # Preview production build locally
```

---

## 🔮 Future Enhancements

### **Planned Features**

1. **Real File Upload**
   - Integration with backend API
   - AWS S3/Azure Blob storage
   - DICOM format support

2. **Real-time AI Processing**
   - WebSocket connections for live updates
   - Progress tracking during analysis
   - Multiple X-ray batch processing

3. **Doctor-Patient Communication**
   - In-app messaging system
   - Video consultation integration
   - Notification system (email, SMS, push)

4. **Advanced Analytics**
   - Treatment outcome tracking
   - Patient health trends over time
   - AI model improvement feedback loop

5. **Mobile Responsiveness**
   - Progressive Web App (PWA)
   - Native mobile app (React Native)
   - Offline mode support

6. **Security Enhancements**
   - HIPAA compliance
   - End-to-end encryption
   - Two-factor authentication
   - Role-based access control (RBAC)

---

## 📝 Development Guidelines

### **Code Standards**

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Styling**: Tailwind utility classes + cn() helper
- **State**: React Query for server state, useState for local
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router with nested routes
- **Testing**: Vitest for unit tests

### **File Naming Conventions**

- Components: `PascalCase.tsx` (e.g., `UserDashboard.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-mobile.tsx`)
- Utils: `kebab-case.ts` (e.g., `utils.ts`)
- Tests: `*.test.ts` or `*.test.tsx`

---

## 🤝 Contributing

1. Create feature branch from `main`
2. Follow existing code structure and naming conventions
3. Add TypeScript types for all props and functions
4. Test your changes locally
5. Submit pull request with detailed description

---

## 📄 License

Educational use only - Final Year Project (FYP)

---

## 📞 Support

For questions or issues, contact the development team.

---

**Last Updated**: January 18, 2026
**Version**: 1.0.0
**Status**: Active Development
