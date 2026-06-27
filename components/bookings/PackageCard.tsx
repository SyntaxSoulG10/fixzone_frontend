"use client";

import Image from "next/image";
import { FiCheckCircle, FiClock } from "react-icons/fi";

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  isRecommended?: boolean;
  image: string;
}

interface PackageCardProps {
  pkg: Package;
  isSelected: boolean;
  onSelect: (pkg: Package) => void;
}

export default function PackageCard({ pkg, isSelected, onSelect }: PackageCardProps) {
  return (
    <div 
      className={`relative flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden border-2 transition-all duration-300 group cursor-pointer ${
        isSelected ? 'border-orange-500 shadow-md ring-4 ring-orange-50' : 'border-slate-100 hover:border-orange-200'
      }`}
      onClick={() => onSelect(pkg)}
    >
      {/* Selection Overlay for Mobile UI feel */}
      {isSelected && (
        <div className="absolute top-4 right-4 z-10">
          <FiCheckCircle className="w-6 h-6 text-orange-500 fill-white" />
        </div>
      )}

      {/* Package Image Source */}
      <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
        {/* Use standard img tag to support dynamic/untrusted protocols like file:// */}
        <img
          src={pkg.image.startsWith('file://') ? 'https://images.unsplash.com/photo-15057404209ce-096b99092408?auto=format&fit=crop&q=80&w=400' : pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-15057404209ce-096b99092408?auto=format&fit=crop&q=80&w=400';
          }}
        />
        {pkg.isRecommended && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
            Recommended
          </div>
        )}
      </div>

      {/* Package Details */}
      <div className="flex-1 p-6 md:p-8 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
              {pkg.name}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1">
              <FiClock className="w-3.5 h-3.5" />
              <span>Duration ~ {pkg.duration}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-orange-500 uppercase">LKR</div>
            <div className="text-2xl font-black text-slate-900 leading-none">
              {pkg.price.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Estimated</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 mt-6">
          {pkg.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-50 flex items-center justify-center">
                <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />
              </div>
              <span className="text-sm text-slate-600 font-medium">{feature}</span>
            </div>
          ))}
        </div>

        <button 
          className={`mt-8 w-full py-3.5 rounded-xl font-bold transition-all duration-300 ${
            isSelected 
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
              : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500'
          }`}
        >
          {isSelected ? 'Package Selected' : 'Select Package'}
        </button>
      </div>
    </div>
  );
}
