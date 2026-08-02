import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { XrayDataProvider } from "@/hooks/useXrayData";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Overview from "./pages/doctor/Overview";
import PatientReports from "./pages/doctor/PatientReports";
import ReportDetail from "./pages/doctor/ReportDetail";
import XrayViewer from "./pages/doctor/XrayViewer";
import AIPredictions from "./pages/doctor/AIPredictions";
import ProXrayStudio from "./pages/doctor/ProXrayStudio";
import DoctorProfile from "./pages/doctor/MyProfile";
import UserDashboardLayout from "./pages/user/UserDashboardLayout";
import PatientProfile from "./pages/user/MyProfile";
import UserOverview from "./pages/user/UserOverview";
import UserReports from "./pages/user/UserReports";
import UserReportDetail from "./pages/user/UserReportDetail";
import XrayScan from "./pages/user/XrayScan";
import PhotoAnalysis from "./pages/user/PhotoAnalysis";
import AssistantChat from "./pages/user/AssistantChat";
import ReportAnalysis from "./pages/user/ReportAnalysis";
import FindDoctors from "./pages/user/FindDoctors";
import PatientAppointments from "./pages/user/Appointments";
import DoctorAppointments from "./pages/doctor/Appointments";
import Consultation from "./pages/user/Consultation";
import DoctorConsultation from "./pages/doctor/Consultation";

const queryClient = new QueryClient();

const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Failed to parse user from localStorage:', e);
  }
  return null;
};

const RoleProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode; 
  requiredRole: 'patient' | 'doctor'; 
}) => {
  const user = getUserFromStorage();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (user.role !== requiredRole) {
    return <Navigate to={requiredRole === 'patient' ? '/auth' : '/auth'} replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <XrayDataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* User Dashboard Routes */}
          <Route path="/dashboard" element={
            <RoleProtectedRoute requiredRole="patient">
              <UserDashboardLayout />
            </RoleProtectedRoute>
          }>
            <Route index element={<UserOverview />} />
            <Route path="xray" element={<XrayScan />} />
            <Route path="photo-analysis" element={<PhotoAnalysis />} />
            <Route path="report-analysis" element={<ReportAnalysis />} />
            <Route path="assistant" element={<AssistantChat />} />
            <Route path="reports" element={<UserReports />} />
            <Route path="reports/:id" element={<UserReportDetail />} />
            <Route path="history" element={<UserReports />} />
            <Route path="doctors" element={<FindDoctors />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="consultation" element={<Consultation />} />
            <Route path="consultation/:id" element={<Consultation />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="settings" element={<UserOverview />} />
          </Route>
          
          {/* Doctor Dashboard Routes */}
          <Route path="/doctor-dashboard" element={
            <RoleProtectedRoute requiredRole="doctor">
              <DoctorDashboard />
            </RoleProtectedRoute>
          }>
            <Route index element={<Overview />} />
            <Route path="reports" element={<PatientReports />} />
            <Route path="reports/:id" element={<ReportDetail />} />
            <Route path="xrays" element={<XrayViewer />} />
            <Route path="ai-predictions" element={<AIPredictions />} />
            <Route path="pro-studio" element={<ProXrayStudio />} />
            <Route path="consultations" element={<DoctorConsultation />} />
            <Route path="consultations/:id" element={<DoctorConsultation />} />
            <Route path="cases" element={<Overview />} />
            <Route path="feedback" element={<Overview />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="settings" element={<Overview />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </XrayDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
