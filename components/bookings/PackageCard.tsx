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
      className={`relative flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300 group cursor-pointer h-full ${
        isSelected ? 'border-orange-500 shadow-xl ring-2 ring-orange-500 ring-offset-2' : 'border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md'
      }`}
      onClick={() => onSelect(pkg)}
    >
      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-full shadow-sm p-0.5">
          <FiCheckCircle className="w-6 h-6 text-orange-500 fill-white" />
        </div>
      )}

      {/* Banner Image */}
      <div className="w-full h-44 relative overflow-hidden flex-shrink-0 bg-slate-100">
        <img
          src={pkg.image.startsWith('file://') ? 'https://images.unsplash.com/photo-15057404209ce-096b99092408?auto=format&fit=crop&q=80&w=400' : pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-15057404209ce-096b99092408?auto=format&fit=crop&q=80&w=400';
          }}
        />
        {pkg.isRecommended && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-lg">
            Recommended
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-start gap-4 mb-5">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors leading-tight">
              {pkg.name}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-2 font-medium">
              <FiClock className="w-4 h-4" />
              <span>Duration ~ {pkg.duration}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-0.5">LKR</div>
            <div className="text-2xl font-black text-slate-900 leading-none tracking-tight">
              {pkg.price.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {pkg.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <FiCheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm text-slate-600 font-medium leading-snug">{feature}</span>
            </div>
          ))}
        </div>

        <button 
          className={`mt-auto w-full py-3.5 rounded-xl font-bold text-[15px] transition-all duration-300 ${
            isSelected 
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600'
          }`}
        >
          {isSelected ? 'Package Selected' : 'Select Package'}
        </button>
      </div>
    </div>
  );
}
