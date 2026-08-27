import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import AboutSection from "@/components/landing/AboutSection";
import KeyFeaturesSection from "@/components/landing/KeyFeaturesSection";
import FeaturedPackagesSection from "@/components/landing/FeaturedPackagesSection";
import TargetAudienceSection from "@/components/landing/TargetAudienceSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import DownloadAppSection from "@/components/landing/DownloadAppSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <KeyFeaturesSection />
      <FeaturedPackagesSection />
      <TargetAudienceSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <DownloadAppSection />
      <Footer />
    </div>
  );
}
