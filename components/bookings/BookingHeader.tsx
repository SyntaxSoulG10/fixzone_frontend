"use client";

import { useState } from "react";
import { FiPhone, FiNavigation, FiShare2, FiMapPin, FiClock, FiX } from "react-icons/fi";
import { LuBadgeCheck } from "react-icons/lu";

interface BookingHeaderProps {
  station: {
    name: string;
    location: string;
    googleMapsUrl?: string | null;
    image: string;
    rating?: number;
    reviews?: number;
    openStatus: string;
    contactPhone?: string | null;
    openingHours?: string | null;
  };
}

export default function BookingHeader({ station }: BookingHeaderProps) {
  const [showPhone, setShowPhone] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  const handleCall = () => {
    if (station.contactPhone) {
      // On mobile this opens the dialler; on desktop show the number
      window.location.href = `tel:${station.contactPhone.replace(/\s/g, "")}`;
      setShowPhone(true);
    } else {
      setShowPhone(true);
    }
  };

  const handleDirection = () => {
    const mapsLink = station.googleMapsUrl || (station.location && (station.location.startsWith("http://") || station.location.startsWith("https://")) ? station.location : null);
    if (mapsLink) {
      window.open(mapsLink, "_blank");
    } else {
      const query = encodeURIComponent(station.location || station.name);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: station.name,
      text: `Check out ${station.name} at ${station.location}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareMsg("Link copied!");
        setTimeout(() => setShareMsg(""), 2500);
      } catch {}
    }
  };

  return (
    <div className="relative w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      {/* Banner / Image Area */}
      <div className="relative h-64 md:h-80 w-full">
        <img
          src={station.image.startsWith('file://') ? 'https://images.unsplash.com/photo-1486006396193-471a2a3bc68a?auto=format&fit=crop&q=80&w=800' : station.image}
          alt={station.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486006396193-471a2a3bc68a?auto=format&fit=crop&q=80&w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Overlaid Info */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Safe Center
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {station.name}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-slate-300 text-sm">
            {station.googleMapsUrl || (station.location && (station.location.startsWith("http://") || station.location.startsWith("https://"))) ? (
              <a
                href={station.googleMapsUrl || station.location}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white hover:underline transition-colors font-medium text-orange-400"
              >
                <FiMapPin className="text-orange-500 shrink-0" />
                <span>{station.location}</span>
              </a>
            ) : (
              <div className="flex items-center gap-1.5">
                <FiMapPin className="text-orange-500 shrink-0" />
                <span>{station.location}</span>
              </div>
            )}
            {station.openingHours && (
              <div className="flex items-center gap-1.5">
                <FiClock className="text-orange-400" />
                <span className="text-green-400 font-medium">{station.openingHours}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phone number popup */}
      {showPhone && (
        <div className="mx-6 mt-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Phone Number</p>
            {station.contactPhone ? (
              <a
                href={`tel:${station.contactPhone.replace(/\s/g, "")}`}
                className="text-lg font-bold text-orange-600 hover:text-orange-700"
              >
                📞 {station.contactPhone}
              </a>
            ) : (
              <p className="text-sm font-semibold text-slate-500 italic">No phone number available</p>
            )}
          </div>
          <button onClick={() => setShowPhone(false)} className="text-slate-400 hover:text-slate-600 ml-4">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Share confirmation */}
      {shareMsg && (
        <div className="mx-6 mt-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">
          ✓ {shareMsg}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-around py-6 border-t border-slate-50 bg-slate-50/30">
        <button onClick={handleCall} className="flex flex-col items-center gap-2 group transition-all">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 shadow-sm transition-all">
            <FiPhone className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">Call</span>
        </button>
        
        <button onClick={handleDirection} className="flex flex-col items-center gap-2 group transition-all">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 shadow-sm transition-all">
            <FiNavigation className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">Directions</span>
        </button>
        
        <button onClick={handleShare} className="flex flex-col items-center gap-2 group transition-all">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 shadow-sm transition-all">
            <FiShare2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">Share</span>
        </button>
      </div>
    </div>
  );
}
