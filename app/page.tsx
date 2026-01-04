"use client";

import Link from "next/link";
import { FiShield, FiCalendar, FiBell, FiSmartphone, FiClock, FiBarChart2 } from "react-icons/fi";
import KeyFeatureCard from "@/components/landing/KeyFeatureCard";
import TargetAudienceSection from "@/components/landing/TargetAudienceSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans relative">


      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex flex-col">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/HeroBg.png')" }}
        >
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, 
                rgba(234, 88, 12, 0.05) 0%, 
                rgba(234, 88, 12, 0.40) 23%, 
                rgba(234, 88, 12, 0.60) 44%, 
                rgba(133, 50, 7, 0.70) 62%, 
                rgba(20, 8, 2, 0.80) 80%, 
                rgba(20, 8, 2, 1.00) 100%
              )`
            }}
          ></div>
        </div>

        {/* Navbar */}
        <nav className="relative z-50 w-full px-6 py-6 max-w-7xl mx-auto flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <img src="/logo-dark.png" alt="FixZone Logo" className="h-14 w-auto object-contain" />
          </div>

          <div className="hidden md:flex items-center gap-10 font-medium text-lg">
            <Link href="/" className="text-[#F2994A] hover:text-[#F2994A] transition-colors">Home</Link>
            <Link href="#features" className="text-white hover:text-primary transition-colors">Features</Link>
            <Link href="#about" className="text-white hover:text-primary transition-colors">About Us</Link>
            <Link href="#contact" className="text-white hover:text-primary transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="px-8 py-2.5 bg-gradient-to-b from-[#FFFFFF] to-[#D1D5DB] text-slate-900 rounded-lg font-bold hover:from-white hover:to-white transition-all shadow-lg border border-slate-200/50">
              Login
            </Link>
            <Link href="/signup" className="px-8 py-2.5 bg-gradient-to-b from-[#EA580C] to-[#C2410C] text-white rounded-lg font-bold hover:from-[#EA580C] hover:to-[#EA580C] transition-all shadow-lg shadow-orange-900/20 border border-orange-600/20">
              SignUp
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 pt-10">
          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-bold text-white mb-6 leading-[1.1] max-w-6xl drop-shadow-2xl tracking-tight">
            Manage Your Vehicle Service <br /> the Smart Way
          </h1>
          <p className="text-xl md:text-2xl text-slate-100 mb-12 max-w-3xl leading-relaxed drop-shadow-lg font-medium">
            Track, book, and manage all your vehicle service needs in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <button className="px-8 py-3.5 bg-gradient-to-b from-[#FFFFFF] to-[#B0B0B0] text-slate-900 rounded-lg font-bold hover:from-white hover:to-white transition-all shadow-xl min-w-[160px] border border-slate-300">
              View more
            </button>
            <Link href="/signup" className="px-8 py-3.5 bg-gradient-to-b from-[#E66412] to-[#B54204] text-white rounded-lg font-bold hover:from-[#E66412] hover:to-[#E66412] transition-all shadow-xl shadow-orange-900/40 min-w-[160px] border border-orange-700/20">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Black Spacer & Stats */}
      <div className="relative w-full h-auto md:h-40 bg-black z-30">
        <div className="w-full px-4 py-12 md:p-0 md:absolute md:top-full md:left-0 md:right-0 md:-translate-y-1/2">
          <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl py-12 px-8 flex flex-col md:flex-row justify-around text-center border border-slate-100">
            <div className="space-y-3">
              <h3 className="text-4xl font-extrabold text-[#E65100]">1M+</h3>
              <p className="text-slate-600 font-bold text-xl">Active Users</p>
              <p className="text-slate-400 text-sm max-w-[200px] mx-auto leading-relaxed">Happy customers using our platform every day.</p>
            </div>

            <div className="hidden md:block w-px bg-slate-200"></div>

            <div className="space-y-3">
              <h3 className="text-4xl font-extrabold text-[#E65100]">1M+</h3>
              <p className="text-slate-600 font-bold text-xl">Registered<br />Service Centers</p>
              <p className="text-slate-400 text-sm max-w-[200px] mx-auto leading-relaxed">Trusted partners across the country.</p>
            </div>

            <div className="hidden md:block w-px bg-slate-200"></div>

            <div className="space-y-3">
              <h3 className="text-4xl font-extrabold text-[#E65100]">1M+</h3>
              <p className="text-slate-600 font-bold text-xl">Services<br />Completed</p>
              <p className="text-slate-400 text-sm max-w-[200px] mx-auto leading-relaxed">Fast, smooth, and fully digital service handling.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buffer to push About Section down */}
      <div className="w-full h-24 bg-black"></div>

      {/* About Us Section */}
      <section id="about" className="w-full flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 h-[300px] md:h-[600px] relative">
          <img
            src="/AboutUs_Pic.jpeg"
            alt="Mechanic working on car"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 bg-[#FFF9F4] flex flex-col justify-center px-12 md:px-20 pt-36 pb-20">
          <span className="text-[#FF6B00] font-bold text-lg mb-4">About Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8 leading-tight">
            Where Technology Meets Trusted Service.
          </h2>
          <p className="text-slate-500 leading-relaxed text-lg mb-6">
            FixZone is built to make vehicle servicing easier, faster, and more transparent for everyone.
          </p>
          <p className="text-slate-500 leading-relaxed text-lg">
            We understand that managing vehicle service records, tracking repairs, and waiting for updates can be stressful — so we created a smart solution to fix that.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      {/* Key Features Section */}
      <section id="features" className="py-24 bg-[#140802] relative overflow-hidden">
        {/* Background Gradient */}
        <div
          className="absolute left-0 right-0 top-[35%] bottom-[25%] pointer-events-none"
          style={{
            background: `linear-gradient(180deg, rgba(20, 8, 2, 0.5) 1%, rgba(238, 121, 61, 0.5) 51%, rgba(20, 8, 2, 0.5) 100%)`
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[#FF6B00] font-bold text-lg mb-4 block">Key Features</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <KeyFeatureCard
              icon={<FiCalendar />}
              title="Easy Online Booking"
              description="Book your vehicle service in just a few clicks — no waiting in line!"
            />
            <KeyFeatureCard
              icon={<FiBell />}
              title="Real-Time Notifications"
              description="Get instant alerts when your vehicle status changes or service is completed."
            />
            <KeyFeatureCard
              icon={<FiSmartphone />}
              title="Mobile & Web Access"
              description="Access your account anywhere, anytime, from mobile or desktop."
            />
            <KeyFeatureCard
              icon={<FiClock />}
              title="Digital Service History"
              description="All past services, bills, and reports stored safely for quick reference."
            />
            <KeyFeatureCard
              icon={<FiShield />}
              title="Secure Authentication"
              description="Safe and reliable login using JWT technology."
            />
            <KeyFeatureCard
              icon={<FiBarChart2 />}
              title="Analytics Dashboard for Service Centers"
              description="Owners can track bookings, revenue, and customer trends in real time."
            />
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <TargetAudienceSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
