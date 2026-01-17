import { motion } from "framer-motion";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

const doctors = [
  {
    name: "Dr. Sarah Ahmed",
    city: "Lahore",
    specialty: "Oral Surgeon",
    rating: 4.9,
  },
  {
    name: "Dr. Ali Hassan",
    city: "Karachi",
    specialty: "Orthodontist",
    rating: 4.8,
  },
  {
    name: "Dr. Fatima Khan",
    city: "Islamabad",
    specialty: "Periodontist",
    rating: 4.9,
  },
  {
    name: "Dr. Usman Malik",
    city: "Faisalabad",
    specialty: "Endodontist",
    rating: 4.7,
  },
];

export const DoctorsSection = () => {
  return (
    <section id="doctors" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Our Network
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-3">
            Find Verified Dental Professionals
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Connect with experienced dentists in your city for follow-up
            consultations and treatments.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-xl transition-all duration-300"
            >
              {/* Avatar placeholder */}
              <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {doctor.name.split(" ")[1][0]}
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  {doctor.name}
                </h3>
                <p className="text-primary font-medium text-sm mt-1">
                  {doctor.specialty}
                </p>

                <div className="flex items-center justify-center gap-2 mt-3 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.city}</span>
                </div>

                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-foreground font-medium">
                    {doctor.rating}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full border-primary/30 hover:bg-accent"
                >
                  View Profile
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
