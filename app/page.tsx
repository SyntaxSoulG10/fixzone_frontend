"use client";

import Link from "next/link";
import { FiLayout, FiShield, FiBriefcase } from "react-icons/fi";
import FeatureCard from "@/components/landing/FeatureCard";

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

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need to Run Your Shop</h2>
            <p className="text-slate-600">Powerful features designed to help you manage your workforce, track jobs, and grow your business.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FiLayout />}
              title="Multi-Tenant Architecture"
              desc="Manage multiple branches or separate companies from a single secure platform with isolated data."
            />
            <FeatureCard
              icon={<FiShield />}
              title="Role-Based Access"
              desc="Custom dashboards for Super Admins, Company Owners, Managers, and Customers."
            />
            <FeatureCard
              icon={<FiBriefcase />}
              title="Service Management"
              desc="Track vehicles, bookings, and service history with our intuitive job card system."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo-dark.png" alt="FixZone Logo" className="h-8 w-auto brightness-0 invert" />
              </div>
              <p className="text-slate-400 max-w-sm">
                Empowering automotive service providers with modern tools for better efficiency and customer satisfaction.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} FixZone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
