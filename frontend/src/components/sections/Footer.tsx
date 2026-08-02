import { motion } from "framer-motion";
import { Sparkles, Mail, Phone, MapPin } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "#home" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Features", href: "#features" },
  { name: "Find Doctors", href: "#doctors" },
  { name: "About", href: "#why-smilo" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms of Service", href: "#" },
  { name: "HIPAA Compliance", href: "#" },
];

export const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <a href="#home" className="flex items-center mb-4">
              <img src="/smilo.png" alt="Smilo Logo" className="h-28 md:h-32 w-auto object-contain " />
            </a>
            <p className="text-background/70 mb-4 text-sm leading-relaxed">
              AI-Powered Dental Disease Detection System. Empowering dental
              professionals with advanced diagnostic tools.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Mail className="w-5 h-5 text-primary" />
                contact@smilo.ai
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Phone className="w-5 h-5 text-primary" />
                +92 300 1234567
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <MapPin className="w-5 h-5 text-primary" />
                Lahore, Pakistan
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-background/20 text-center space-y-3">
          <p className="text-background/60 text-sm">
            © 2026 Smilo – AI-Powered Dental Disease Detection & Diagnostics. All Rights Reserved.
          </p>
          <p className="text-background/80 text-sm">
            Senior Year Project developed by{" "}
            <a 
              href="https://abdullahsiddique.co.uk" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline font-semibold"
            >
              Abdullah Siddique
            </a>
            . Connect on{" "}
            <a 
              href="https://www.linkedin.com/in/mr-abdullah-siddique/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline font-semibold"
            >
              LinkedIn
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};
