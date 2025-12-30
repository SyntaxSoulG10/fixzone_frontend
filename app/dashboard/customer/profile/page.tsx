"use client";

import React from "react";
import Image from "next/image";
import { Edit2, Plus, Moon, Bell, ChevronDown, Eye, CreditCard } from "lucide-react";
import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";

export default function CustomerProfilePage() {
  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Top Profile Header Section */}
      <div className="flex items-center gap-8 mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=128" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800">Emirhan Boruch</h2>
          <p className="text-slate-500 text-sm font-medium">emirhan@gmail.com</p>
          <p className="text-slate-500 text-sm font-medium">+94 77 8989455</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          
          {/* Payment Method Section */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Payment Method</h3>
              <button className="text-orange-500"><Plus size={18} /></button>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 flex items-center justify-between border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-5 bg-red-500 rounded-sm" /> {/* Mastercard Icon Placeholder */}
                  <span className="text-sm font-medium text-slate-600">*********7852</span>
                </div>
                <Edit2 size={14} className="text-slate-400 cursor-pointer" />
              </div>
              <div className="flex-1 flex items-center justify-between border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-5 bg-blue-600 rounded-sm" /> {/* Visa Icon Placeholder */}
                  <span className="text-sm font-medium text-slate-600">*********5248</span>
                </div>
                <Edit2 size={14} className="text-slate-400 cursor-pointer" />
              </div>
            </div>
          </section>

          {/* Personal Information Form */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <h3 className="font-bold text-slate-800 mb-6">Personal Information</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">First Name</label>
                <input type="text" className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Second Name</label>
                <input type="text" className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">E-Mail</label>
                <input type="email" className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Phone Number</label>
                <input type="text" className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div className="pt-4">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold shadow-md shadow-orange-200">
                  Save Changes
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* Platform Settings */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <h3 className="font-bold text-orange-500 mb-6">Platform Settings</h3>
            
            <div className="space-y-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
                <span className="text-sm text-slate-500">Notification</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Language</label>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer">
                  <span className="text-sm text-slate-600 font-medium">English</span>
                  <ChevronDown size={16} className="text-slate-400" />
                </div>
              </div>

              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Current password" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none" 
                />
                <Eye size={16} className="absolute right-4 top-3.5 text-slate-400" />
              </div>
            </div>
          </section>

          {/* My Vehicles Section */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-6">My Vehicles</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Vehicle Card 1 */}
              <div className="border border-slate-100 rounded-xl overflow-hidden group hover:border-orange-100 transition-all">
                <div className="h-24 bg-slate-100 relative">
                  <img src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200" alt="Car" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-white">
                  <p className="text-[10px] font-bold text-slate-800 truncate">BMW 2022-PW 8976</p>
                </div>
              </div>
              {/* Vehicle Card 2 */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="h-24 bg-slate-100 relative">
                  <img src="https://images.unsplash.com/photo-1562141989-c5c79ac8f576?auto=format&fit=crop&q=80&w=200" alt="Car" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-white">
                  <p className="text-[10px] font-bold text-slate-800 truncate">Range Rover 2022-PW 8976</p>
                </div>
              </div>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl transition-colors text-slate-600 text-sm font-bold">
              <Plus size={16} />
              Add Vehicle
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}