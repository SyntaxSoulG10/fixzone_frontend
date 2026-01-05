"use client";

import React from 'react';
import Link from 'next/link';
import { FiTwitter, FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-[#140802] text-slate-400 py-16 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">

                    {/* Column 1: Logo & Description (Wide) */}
                    <div className="col-span-2 lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            {/* Using standard img tag as per previous patterns */}
                            <img src="/logo-dark.png" alt="FixZone Logo" className="h-10 w-auto" />
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm">
                            With lots of unique blocks, you can easily build a page without coding. Build your next landing page.
                        </p>
                        <div className="flex items-center gap-4 text-slate-500">
                            <Link href="#" className="hover:text-[#EA580C] transition-colors"><FiTwitter size={20} /></Link>
                            <Link href="#" className="hover:text-[#EA580C] transition-colors"><FiFacebook size={20} /></Link>
                            <Link href="#" className="hover:text-[#EA580C] transition-colors"><FiInstagram size={20} /></Link>
                            <Link href="#" className="hover:text-[#EA580C] transition-colors"><FiLinkedin size={20} /></Link>
                        </div>
                    </div>

                    {/* Column 2: Company */}
                    <div className="col-span-1">
                        <h4 className="text-slate-200 font-semibold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="#about" className="hover:text-[#EA580C] transition-colors">About us</Link></li>
                            <li><Link href="#contact" className="hover:text-[#EA580C] transition-colors">Contact us</Link></li>
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">Press</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Product */}
                    <div className="col-span-1">
                        <h4 className="text-slate-200 font-semibold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="#features" className="hover:text-[#EA580C] transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">News</Link></li>
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">Help desk</Link></li>
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">Support</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Services */}
                    <div className="col-span-1">
                        <h4 className="text-slate-200 font-semibold mb-6">Services</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">Digital Marketing</Link></li>
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">Content Writing</Link></li>
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">SEO for Business</Link></li>
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">UI Design</Link></li>
                        </ul>
                    </div>

                    {/* Column 5: Legal */}
                    <div className="col-span-1">
                        <h4 className="text-slate-200 font-semibold mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="#" className="hover:text-[#EA580C] transition-colors">Return Policy</Link></li>
                        </ul>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
