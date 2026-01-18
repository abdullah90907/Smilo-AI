import { motion } from "framer-motion";
import { Brain, ScanSearch, ShieldCheck, Stethoscope } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Based X-ray Analysis",
    description:
      "Advanced deep learning models analyze panoramic dental X-rays with precision and speed.",
  },
  {
    icon: ScanSearch,
    title: "Dental Caries Detection",
    description:
      "Automatically identify cavities, decay patterns, and early-stage dental issues.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Patient Records",
    description:
      "All patient data and X-ray images are encrypted and stored securely with HIPAA compliance.",
  },
  {
    icon: Stethoscope,
    title: "Clinical Decision Support",
    description:
      "Get actionable insights and treatment recommendations based on AI analysis.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Core Features
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-3">
            Powerful AI Capabilities
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Our system combines cutting-edge machine learning with dental
            expertise to deliver accurate diagnoses.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-xl transition-all duration-300 border border-border/50"
            >
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:shadow-glow transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
