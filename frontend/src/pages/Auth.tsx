import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Calendar,
  MapPin,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  Stethoscope,
  UserRound,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { register, login, seedDB } from "@/lib/api";

type TabType = "login" | "register";
type RoleType = "patient" | "doctor";

export default function Auth() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabType>("login");
  const [selectedRole, setSelectedRole] = useState<RoleType>("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const [patientRegisterForm, setPatientRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
  });
  
  const [doctorRegisterForm, setDoctorRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
    specialization: "",
    experience_years: "",
    city: "",
    qualifications: "",
    clinic_name: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(loginForm.email, loginForm.password, selectedRole);
      // Store user data in localStorage for now
      localStorage.setItem('user', JSON.stringify(res));
      if (res.role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = { ...patientRegisterForm, role: "patient" };
      const res = await register(data);
      localStorage.setItem("user", JSON.stringify(res));
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Registration failed: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = { ...doctorRegisterForm, role: "doctor" };
      const res = await register(data);
      localStorage.setItem("user", JSON.stringify(res));
      navigate("/doctor-dashboard");
    } catch (err) {
      console.error(err);
      alert("Registration failed: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginTabs = [
    { id: "patient" as RoleType, label: "Patient Login", icon: UserRound },
    { id: "doctor" as RoleType, label: "Doctor Login", icon: Stethoscope },
  ];

  const registerTabs = [
    { id: "patient" as RoleType, label: "I'm a Patient", icon: UserRound },
    { id: "doctor" as RoleType, label: "I'm a Doctor", icon: Stethoscope },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ backgroundColor: "#21b2c0" }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full blur-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              className="flex items-center justify-center gap-3 mb-8"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <span className="text-5xl font-bold text-white">
                Smilo
              </span>
            </motion.div>

            {/* Tagline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-2xl lg:text-3xl font-semibold text-white mb-4"
            >
              Smart AI for Smarter Smiles
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-white/80 text-lg max-w-md"
            >
              Experience the future of dental diagnostics with our AI-powered
              detection system.
            </motion.p>

            {/* Decorative dental illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12"
            >
              <div className="w-48 h-48 mx-auto relative">
                <motion.div
                  className="absolute inset-0 rounded-full border-4"
                  style={{ borderColor: "rgba(255,255,255,0.2)" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border-4 border-dashed"
                  style={{ borderColor: "rgba(255,255,255,0.3)" }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">🦷</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Form Section */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden flex items-center justify-center gap-2 mb-8"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#21b2c0" }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Smilo</span>
          </motion.div>

          {/* Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl"
          >
            {/* Main Tabs (Login/Register) */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-2xl">
              {["login" as TabType, "register" as TabType].map((tab) => (
                  <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          activeTab === tab
                              ? "bg-white text-[#21b2c0] shadow-md"
                              : "text-gray-500 hover:text-gray-800"
                      }`}
                  >
                      {tab === "login" ? "Sign In" : "Sign Up"}
                  </button>
              ))}
          </div>
          
          {/* Quick Test Buttons */}
          <div className="flex gap-2 mb-6 flex-wrap">
              <button
                  onClick={async () => {
                      setIsLoading(true);
                      try {
                          // Login directly without seeding
                          console.log("🔑 Logging in as patient...");
                          const res = await login("patient@test.com", "test1234", "patient");
                          console.log("✅ Login complete!", res);
                          localStorage.setItem("user", JSON.stringify(res));
                          navigate("/dashboard");
                      } catch(err) { 
                          console.error("❌ Error:", err); 
                          alert("Error! Check console for details! Error: " + (err as any).message);
                      } finally { 
                          setIsLoading(false); 
                      }
                  }}
                  className="flex-1 bg-[#21b2c0] hover:opacity-90 text-white py-2 px-4 rounded-xl font-medium transition-all duration-200 text-sm"
              >
                  Test as Patient
              </button>
              <button
                  onClick={async () => {
                      setIsLoading(true);
                      try {
                          // Login directly without seeding
                          console.log("🔑 Logging in as doctor...");
                          const res = await login("doctor@test.com", "test1234", "doctor");
                          console.log("✅ Login complete!", res);
                          localStorage.setItem("user", JSON.stringify(res));
                          navigate("/doctor-dashboard");
                      } catch(err) { 
                          console.error("❌ Error:", err); 
                          alert("Error! Check console for details! Error: " + (err as any).message);
                      } finally { 
                          setIsLoading(false); 
                      }
                  }}
                  className="flex-1 bg-gray-800 hover:opacity-90 text-white py-2 px-4 rounded-xl font-medium transition-all duration-200 text-sm"
              >
                  Test as Doctor
              </button>
          </div>

            {/* Role Toggle */}
            <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl">
              {(activeTab === "login" ? loginTabs : registerTabs).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRole(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedRole === tab.id
                      ? "bg-white text-[#21b2c0] shadow-md"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
              {activeTab === "login" && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground">
                      Welcome Back
                    </h3>
                    <p className="text-gray-500 mt-1">
                      {selectedRole === "doctor" ? "Sign in to your doctor portal" : "Sign in to your patient dashboard"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@email.com"
                        className="pl-10 h-12 bg-gray-50 border-gray-200"
                        style={{
                          "--tw-ring-color": "#21b2c0",
                          "--tw-border-opacity": 1,
                        } as React.CSSProperties}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#21b2c0";
                          e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                          e.target.style.boxShadow = "";
                        }}
                        value={loginForm.email}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#21b2c0";
                          e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                          e.target.style.boxShadow = "";
                        }}
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, password: e.target.value })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-white hover:opacity-90 transition-all duration-300 text-lg"
                    style={{ backgroundColor: "#21b2c0" }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}

              {activeTab === "register" && selectedRole === "patient" && (
                <motion.form
                  key="patient-register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handlePatientRegister}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground">
                      Create Patient Account
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Start your dental health journey with Smilo
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="patient-name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 h-11 bg-gray-50 border-gray-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#21b2c0";
                          e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                          e.target.style.boxShadow = "";
                        }}
                        value={patientRegisterForm.full_name}
                        onChange={(e) =>
                          setPatientRegisterForm({ ...patientRegisterForm, full_name: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="patient-email"
                        type="email"
                        placeholder="patient@email.com"
                        className="pl-10 h-11 bg-gray-50 border-gray-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#21b2c0";
                          e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                          e.target.style.boxShadow = "";
                        }}
                        value={patientRegisterForm.email}
                        onChange={(e) =>
                          setPatientRegisterForm({ ...patientRegisterForm, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="patient-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#21b2c0";
                          e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                          e.target.style.boxShadow = "";
                        }}
                        value={patientRegisterForm.password}
                        onChange={(e) =>
                          setPatientRegisterForm({ ...patientRegisterForm, password: e.target.value })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="patient-age">Age</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="patient-age"
                          type="number"
                          placeholder="25"
                          min="1"
                          max="120"
                          className="pl-10 h-11 bg-gray-50 border-gray-200"
                          onFocus={(e) => {
                            e.target.style.borderColor = "#21b2c0";
                            e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "";
                            e.target.style.boxShadow = "";
                          }}
                          value={patientRegisterForm.age}
                          onChange={(e) =>
                            setPatientRegisterForm({ ...patientRegisterForm, age: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="patient-gender">Gender</Label>
                      <Select
                        value={patientRegisterForm.gender}
                        onValueChange={(value) =>
                          setPatientRegisterForm({ ...patientRegisterForm, gender: value })
                        }
                      >
                        <SelectTrigger className="h-11 bg-gray-50 border-gray-200"
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#21b2c0";
                            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "";
                            e.currentTarget.style.boxShadow = "";
                          }}
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-white hover:opacity-90 transition-all duration-300 text-lg mt-2"
                    style={{ backgroundColor: "#21b2c0" }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}

              {activeTab === "register" && selectedRole === "doctor" && (
                <motion.form
                  key="doctor-register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleDoctorRegister}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground">
                      Create Doctor Account
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Join our professional network
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="doctor-name"
                        type="text"
                        placeholder="Dr. John Doe"
                        className="pl-10 h-11 bg-gray-50 border-gray-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#21b2c0";
                          e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                          e.target.style.boxShadow = "";
                        }}
                        value={doctorRegisterForm.full_name}
                        onChange={(e) =>
                          setDoctorRegisterForm({ ...doctorRegisterForm, full_name: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="doctor-email"
                        type="email"
                        placeholder="doctor@clinic.com"
                        className="pl-10 h-11 bg-gray-50 border-gray-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#21b2c0";
                          e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                          e.target.style.boxShadow = "";
                        }}
                        value={doctorRegisterForm.email}
                        onChange={(e) =>
                          setDoctorRegisterForm({ ...doctorRegisterForm, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="doctor-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#21b2c0";
                          e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                          e.target.style.boxShadow = "";
                        }}
                        value={doctorRegisterForm.password}
                        onChange={(e) =>
                          setDoctorRegisterForm({ ...doctorRegisterForm, password: e.target.value })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-specialization">Specialization</Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="doctor-specialization"
                        type="text"
                        placeholder="Orthodontist, Endodontist, etc."
                        className="pl-10 h-11 bg-gray-50 border-gray-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#21b2c0";
                          e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                          e.target.style.boxShadow = "";
                        }}
                        value={doctorRegisterForm.specialization}
                        onChange={(e) =>
                          setDoctorRegisterForm({ ...doctorRegisterForm, specialization: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-experience">Experience (Years)</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="doctor-experience"
                          type="number"
                          placeholder="5"
                          min="0"
                          max="60"
                          className="pl-10 h-11 bg-gray-50 border-gray-200"
                          onFocus={(e) => {
                            e.target.style.borderColor = "#21b2c0";
                            e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "";
                            e.target.style.boxShadow = "";
                          }}
                          value={doctorRegisterForm.experience_years}
                          onChange={(e) =>
                            setDoctorRegisterForm({ ...doctorRegisterForm, experience_years: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor-city">City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="doctor-city"
                          type="text"
                          placeholder="City"
                          className="pl-10 h-11 bg-gray-50 border-gray-200"
                          onFocus={(e) => {
                            e.target.style.borderColor = "#21b2c0";
                            e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "";
                            e.target.style.boxShadow = "";
                          }}
                          value={doctorRegisterForm.city}
                          onChange={(e) =>
                            setDoctorRegisterForm({ ...doctorRegisterForm, city: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-qualifications">Qualifications</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="doctor-qualifications"
                        type="text"
                        placeholder="BDS, MDS, etc."
                        className="pl-10 h-11 bg-gray-50 border-gray-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#21b2c0";
                          e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                          e.target.style.boxShadow = "";
                        }}
                        value={doctorRegisterForm.qualifications}
                        onChange={(e) =>
                          setDoctorRegisterForm({ ...doctorRegisterForm, qualifications: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-clinic">Clinic Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="doctor-clinic"
                        type="text"
                        placeholder="Smile Care Dental Clinic"
                        className="pl-10 h-11 bg-gray-50 border-gray-200"
                        onFocus={(e) => {
                          e.target.style.borderColor = "#21b2c0";
                          e.target.style.boxShadow = "0 0 0 2px rgba(33,178,192,0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "";
                          e.target.style.boxShadow = "";
                        }}
                        value={doctorRegisterForm.clinic_name}
                        onChange={(e) =>
                          setDoctorRegisterForm({ ...doctorRegisterForm, clinic_name: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-white hover:opacity-90 transition-all duration-300 text-lg mt-2"
                    style={{ backgroundColor: "#21b2c0" }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
