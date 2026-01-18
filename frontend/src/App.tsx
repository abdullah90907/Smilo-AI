import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { XrayDataProvider } from "@/hooks/useXrayData";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Overview from "./pages/doctor/Overview";
import PatientReports from "./pages/doctor/PatientReports";
import ReportDetail from "./pages/doctor/ReportDetail";
import XrayViewer from "./pages/doctor/XrayViewer";
import AIPredictions from "./pages/doctor/AIPredictions";
import UserDashboardLayout from "./pages/user/UserDashboardLayout";
import UserOverview from "./pages/user/UserOverview";
import UserReports from "./pages/user/UserReports";
import UserReportDetail from "./pages/user/UserReportDetail";

const queryClient = new QueryClient();

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
          <Route path="/dashboard" element={<UserDashboardLayout />}>
            <Route index element={<UserOverview />} />
            <Route path="upload" element={<UserOverview />} />
            <Route path="reports" element={<UserReports />} />
            <Route path="reports/:id" element={<UserReportDetail />} />
            <Route path="history" element={<UserReports />} />
            <Route path="doctors" element={<UserOverview />} />
            <Route path="appointments" element={<UserOverview />} />
            <Route path="profile" element={<UserOverview />} />
            <Route path="settings" element={<UserOverview />} />
          </Route>
          
          {/* Doctor Dashboard Routes */}
          <Route path="/doctor-dashboard" element={<DoctorDashboard />}>
            <Route index element={<Overview />} />
            <Route path="reports" element={<PatientReports />} />
            <Route path="reports/:id" element={<ReportDetail />} />
            <Route path="xrays" element={<XrayViewer />} />
            <Route path="ai-predictions" element={<AIPredictions />} />
            <Route path="cases" element={<Overview />} />
            <Route path="feedback" element={<Overview />} />
            <Route path="appointments" element={<Overview />} />
            <Route path="profile" element={<Overview />} />
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
