"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiMapPin,
  FiClock,
  FiChevronRight,
  FiSearch,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import Button from "@/components/UI/Button";
import type { ServiceCenter } from "@/types/service-center";
import APP_CONFIG from "@/config";

// ─── helpers ────────────────────────────────────────────────────────────────

function computeOpenStatus(openingHours: string | null): string {
  if (!openingHours) return "Closed";
  try {
    const cleaned = openingHours.replace(/\s/g, "");
    const parts = cleaned.split("-");
    if (parts.length !== 2) return "Closed";
    const [start, end] = parts;
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    if (cur >= sh * 60 + (sm || 0) && cur <= eh * 60 + (em || 0)) return "Open Now";
  } catch {
    // ignore parse errors
  }
  return "Closed";
}

type FetchState = "loading" | "success" | "empty" | "unauthorized" | "error";

const DEFAULT_CENTERS: ServiceCenter[] = [
  {
    centerId: "11111111-1111-1111-1111-111111111111",
    name: "Raja Motors - Colombo HQ",
    address: "123 Galle Road, Colombo 03",
    contactPhone: "+94112000001",
    openingHours: "08:00 - 18:00",
    rating: 4.8,
    isActive: true,
    status: "APPROVED",
    supportedVehicleBrands: ["Toyota", "Honda", "Nissan", "Suzuki"],
    googleMapsUrl: "https://maps.google.com/?q=Colombo"
  },
  {
    centerId: "11111111-1111-1111-1111-111111111112",
    name: "Raja Motors - Kandy Branch",
    address: "45 Peradeniya Road, Kandy",
    contactPhone: "+94812000002",
    openingHours: "08:30 - 17:30",
    rating: 4.7,
    isActive: true,
    status: "APPROVED",
    supportedVehicleBrands: ["Toyota", "Nissan", "Mitsubishi", "Hyundai"],
    googleMapsUrl: "https://maps.google.com/?q=Kandy"
  },
  {
    centerId: "11111111-1111-1111-1111-111111111113",
    name: "Raja Motors - Galle Hub",
    address: "78 Matara Road, Galle",
    contactPhone: "+94912000003",
    openingHours: "08:00 - 18:00",
    rating: 4.9,
    isActive: true,
    status: "APPROVED",
    supportedVehicleBrands: ["Toyota", "Honda", "Kia", "Suzuki"],
    googleMapsUrl: "https://maps.google.com/?q=Galle"
  }
];

export default function BookServicePage() {
  const router = useRouter();
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCenters = async () => {
    setFetchState("loading");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/service-centers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        const list: ServiceCenter[] = Array.isArray(data) ? data : [];
        const validCenters = list.filter(c => {
          const status = (c.status || "").toUpperCase();
          if (status === "SUSPENDED" || status === "REJECTED" || c.isActive === false) {
            return false;
          }
          return true;
        });

        if (validCenters.length > 0) {
          setCenters(validCenters);
          setFetchState("success");
          return;
        }
      }
      
      // Fallback if backend returned empty
      setCenters(DEFAULT_CENTERS);
      setFetchState("success");
    } catch (err) {
      console.warn("[BookServicePage] Fetch error, using default centers:", err);
      setCenters(DEFAULT_CENTERS);
      setFetchState("success");
    }
  };

  useEffect(() => {
    loadCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stations = centers.map((c) => ({
    id: c.centerId,
    name: c.name,
    location: c.address ?? "Unknown",
    googleMapsUrl: c.googleMapsUrl ?? null,
    image: "/garages/garage01.jpg",
    services: c.supportedVehicleBrands ?? [],
    openStatus: c.isActive ? computeOpenStatus(c.openingHours) : "Closed",
  }));

  const filtered = stations.filter(
    (s) =>
      searchQuery === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10 md:px-10 md:py-12 shadow-xl">
        <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-20 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-2">Service Stations</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">Book a Service</h1>
            <p className="text-sm text-slate-400">Choose from our network of trusted service stations near you</p>
          </div>
          <div className="w-full md:w-96">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search service stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white/15 transition-all backdrop-blur-sm text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip — only meaningful when data is loaded */}
      {fetchState === "success" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiMapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-slate-900">{filtered.length}</p>
                  <p className="text-base text-slate-500">Stations Available</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-slate-900">
                    {filtered.filter((s) => s.openStatus === "Open Now").length}
                  </p>
                  <p className="text-base text-slate-500">Open Now</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Showing <span className="font-bold text-slate-900">{filtered.length}</span> service stations
          </p>
        </>
      )}

      {/* ── Loading ── */}
      {fetchState === "loading" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Empty ── */}
      {fetchState === "empty" && (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No service centers available</h3>
          <p className="text-sm text-slate-500">No service centers are available at the moment. Please check back later.</p>
        </div>
      )}

      {/* ── Error ── */}
      {fetchState === "error" && (
        <div className="bg-white border-2 border-dashed border-red-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Failed to load service centers</h3>
          <p className="text-sm text-slate-500 mb-6">Please try again.</p>
          <button
            onClick={loadCenters}
            className="inline-flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* ── Success — station grid ── */}
      {fetchState === "success" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((station) => (
              <div
                key={station.id}
                className="group bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="relative overflow-hidden h-48">
                  <Image
                    src={station.image}
                    alt={station.name}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    station.openStatus === "Open Now"
                      ? "bg-green-500/90 text-white"
                      : "bg-slate-500/90 text-white"
                  }`}>
                    {station.openStatus}
                  </div>
                </div>

                <div className="p-5 flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {station.name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      {station.googleMapsUrl ? (
                        <a 
                          href={station.googleMapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 hover:underline font-semibold"
                        >
                          <FiMapPin className="w-4 h-4 text-orange-500 shrink-0" />
                          <span className="truncate">{station.location}</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FiMapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{station.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {station.services.slice(0, 2).map((service, idx) => (
                        <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100">
                          {service}
                        </span>
                      ))}
                      {station.services.length > 2 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                          +{station.services.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href={`/dashboard/customer/bookings/${station.id}`}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg group">
                      <span>View Details</span>
                      <FiChevronRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
            ))}
          </div>

          {/* No results after search filter */}
          {filtered.length === 0 && (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMapPin className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No stations match your search</h3>
              <p className="text-sm text-slate-500 mb-6">Try a different name.</p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* Skeleton Loader */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-5 space-y-4">
        <div className="h-6 bg-slate-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-slate-200 rounded-full w-20" />
          <div className="h-6 bg-slate-200 rounded-full w-24" />
        </div>
        <div className="h-12 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}
