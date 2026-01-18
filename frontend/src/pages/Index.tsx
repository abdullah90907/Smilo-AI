import { Navbar } from "@/components/ui/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { WhySmiloSection } from "@/components/sections/WhySmiloSection";
import { DoctorsSection } from "@/components/sections/DoctorsSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/sections/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhySmiloSection />
      <DoctorsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
