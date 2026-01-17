import { motion } from "framer-motion";
import { Check, Zap, Shield, Award } from "lucide-react";

const benefits = [
  "Designed for dental professionals and clinics",
  "Uses state-of-the-art deep learning models (ResNet, EfficientNet)",
  "Trained on real dental radiograph datasets",
  "Assists early diagnosis of dental caries",
  "Reduces diagnostic time by up to 80%",
  "Continuous model improvements based on feedback",
];

const highlights = [
  {
    icon: Zap,
    title: "Fast Analysis",
    description: "Results in under 3 seconds",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "End-to-end encryption",
  },
  {
    icon: Award,
    title: "High Accuracy",
    description: "95%+ detection rate",
  },
];

export const WhySmiloSection = () => {
  return (
    <section id="why-smilo" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Why Choose Us
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-3 mb-6">
              Built for Dental Professionals
            </h2>
            <p className="text-muted-foreground mb-8">
              Smilo combines cutting-edge AI research with practical clinical
              needs to provide reliable dental disease detection.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right content - Highlights cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-6"
          >
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ x: 10, transition: { duration: 0.3 } }}
                className="flex items-center gap-6 bg-card rounded-2xl p-6 shadow-card border border-border/50"
              >
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <highlight.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {highlight.title}
                  </h3>
                  <p className="text-muted-foreground">{highlight.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
