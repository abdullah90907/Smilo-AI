import { motion } from "framer-motion";
import { Upload, Cpu, FileCheck, Lightbulb } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload OPG Dental X-ray",
    description:
      "Upload a panoramic dental X-ray image in PNG, JPEG, or DICOM format.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Model Analyzes Image",
    description:
      "Our deep learning model processes the image using ResNet and EfficientNet architectures.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Disease Detection Result",
    description:
      "Receive detailed detection results highlighting potential dental caries and conditions.",
  },
  {
    icon: Lightbulb,
    step: "04",
    title: "Clinical Insights & Guidance",
    description:
      "Get actionable recommendations and treatment suggestions based on findings.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Process
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-3">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Simple 4-step process to get AI-powered dental diagnosis in seconds.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step circle */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center shadow-glow"
                >
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </motion.div>

                {/* Step number */}
                <span className="inline-block text-sm font-bold text-primary mb-2">
                  STEP {step.step}
                </span>

                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
