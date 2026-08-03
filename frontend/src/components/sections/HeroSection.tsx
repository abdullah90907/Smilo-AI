import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Stethoscope, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../ui/button";
import heroImage from "@/assets/hero-illustration.jpg";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center gradient-hero overflow-hidden pt-20"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-Powered Dental Analysis
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
            >
              AI-Powered{" "}
              <span className="text-gradient">Dental Disease</span>{" "}
              Detection
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Detect dental caries and oral conditions from panoramic X-rays
              using advanced deep learning. Fast, accurate, and designed for
              dental professionals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
            >
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                Login as Patient
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 hover:bg-accent transition-all duration-300 text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                <Stethoscope className="mr-2 w-5 h-5" />
                For Doctors
              </Button>

              {/* Pulsating Interactive Watch Demo Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsVideoOpen(true)}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[#21b2c0] bg-[#21b2c0]/10 border border-[#21b2c0]/30 hover:bg-[#21b2c0]/20 font-semibold shadow-sm transition-all duration-300 relative group overflow-visible"
              >
                {/* Soft pulse outline effect */}
                <span className="absolute inset-0 bg-[#21b2c0]/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none opacity-75" />
                <Play className="w-5 h-5 fill-[#21b2c0] text-[#21b2c0]" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50"
            >
              {[
                { value: "95%+", label: "Accuracy" },
                { value: "10K+", label: "X-rays Analyzed" },
                { value: "<3s", label: "Detection Time" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-20 scale-90" />
              <img
                src={heroImage}
                alt="AI Dental X-ray Analysis"
                className="relative rounded-3xl shadow-xl w-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Demo Video/Walkthrough Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-card border border-border/80 rounded-3xl overflow-hidden shadow-2xl p-4 md:p-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#21b2c0]" />
                    Smilo AI Platform Walkthrough
                  </h3>
                  <p className="text-xs text-muted-foreground">See U-Net Segmentation & YOLOv8 Caries Detection in action</p>
                </div>
                <button
                  onClick={() => setIsVideoOpen(false)}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Walkthrough Video/GIF content container */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/40 border border-border flex items-center justify-center">
                <img
                  src="/smiloai.gif"
                  alt="Smilo AI Demo Video"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
