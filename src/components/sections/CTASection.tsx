import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-cta" />

      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 left-10 w-40 h-40 bg-primary-foreground/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-60 h-60 bg-primary-foreground/10 rounded-full blur-3xl"
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </motion.div>

          <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Experience AI-Assisted Dental Diagnosis Today
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of dental professionals using Smilo to enhance their
            diagnostic capabilities and patient care.
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              className="bg-background text-primary hover:bg-background/90 text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={() => navigate("/auth")}
            >
              Get Started with Smilo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
