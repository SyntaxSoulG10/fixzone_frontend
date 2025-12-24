"use client";

import Link from "next/link";
import { FiActivity, FiBriefcase, FiCheckCircle, FiLayout, FiUsers, FiShield } from "react-icons/fi";
import FeatureCard from "@/components/landing/FeatureCard";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-orange-100/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              F
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-600">
              FixZone
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg hover:shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-orange-50/50 blur-3xl opacity-60 rounded-bl-[100px]"></div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
              Multi-tenant Platform
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-slate-900">
              Manage Your <br />
              <span className="text-primary relative">
                Service Center
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-orange-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5 L 100 0 Q 50 5 0 0 Z" fill="currentColor" />
                </svg>
              </span>
              <br /> Like a Pro.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              The all-in-one platform for vehicle service centers. Handle bookings,
              jobs, customers, and multi-branch details in one unified dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/signup" className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-xl shadow-orange-500/20 transition-all transform hover:-translate-y-1 text-center">
                Start Free Trial
              </Link>
              <Link href="/demo" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 hover:border-primary hover:text-primary rounded-xl font-semibold transition-all text-center">
                View Live Demo
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-primary" />
                <span>14-day free trial</span>
              </div>
            </div>
          </div>

          <div className="relative animate-float delay-100 hidden lg:block">
            <div className="relative z-10 glass rounded-2xl p-2 shadow-2xl skew-y-1 transform transition-all hover:skew-y-0 duration-500">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2670"
                alt="Dashboard Preview"
                className="rounded-xl w-full h-auto object-cover"
              />

              {/* Floating Cards */}
              <div className="absolute -left-12 bottom-12 bg-white p-4 rounded-xl shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <FiActivity />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Revenue</p>
                    <p className="font-bold text-slate-800">+$12,450</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-8 top-12 bg-white p-4 rounded-xl shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FiUsers />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Active Customers</p>
                    <p className="font-bold text-slate-800">1,204</p>
                  </div>
                </div>
              </div>
            </div>
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
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                  F
                </div>
                <span className="text-2xl font-bold text-white">
                  FixZone
                </span>
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
