"use client";

import Image from "next/image";
import { FiPhone, FiNavigation, FiShare2, FiMapPin, FiStar, FiClock } from "react-icons/fi";
import { LuBadgeCheck } from "react-icons/lu";

interface BookingHeaderProps {
  station: {
    name: string;
    location: string;
    image: string;
    rating: number;
    reviews: number;
    openStatus: string;
  };
}

export default function BookingHeader({ station }: BookingHeaderProps) {
  return (
    <div className="relative w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      {/* Banner / Image Area */}
      <div className="relative h-64 md:h-80 w-full">
        <Image
          src={station.image}
          alt={station.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Overlaid Info */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Safe Center
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
            {station.name}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-slate-300 text-sm">
            <div className="flex items-center gap-1.5">
              <FiMapPin className="text-orange-500" />
              <span>{station.location}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                <FiStar className="text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-white">{station.rating}</span>
                <span className="text-slate-400">({station.reviews} Reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 font-medium">{station.openStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around py-6 border-t border-slate-50 bg-slate-50/30">
        <button className="flex flex-col items-center gap-2 group transition-all">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white group-hover:border-primary shadow-sm transition-all shadow-slate-200">
            <FiPhone className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">Call</span>
        </button>
        
        <button className="flex flex-col items-center gap-2 group transition-all">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white group-hover:border-primary shadow-sm transition-all shadow-slate-200">
            <FiNavigation className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">Direction</span>
        </button>
        
        <button className="flex flex-col items-center gap-2 group transition-all">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white group-hover:border-primary shadow-sm transition-all shadow-slate-200">
            <FiShare2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">Share</span>
        </button>
      </div>
    </div>
  );
}
