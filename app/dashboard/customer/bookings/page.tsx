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
  FiFilter,
  FiX
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

export default function BookServicePage() {
  const router = useRouter();
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeDistance, setActiveDistance] = useState<string | null>(null);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [activeAvailability, setActiveAvailability] = useState<string | null>(null);

  type PaymentReadyCenter = Partial<ServiceCenter> & {
    paymentEnabled?: boolean | null;
    stripeConnected?: boolean | null;
    stripeConnectEnabled?: boolean | null;
    canAcceptPayments?: boolean | null;
  };

  const isPaymentReady = (center: PaymentReadyCenter) => {
    const flags = [
      center.paymentEnabled,
      center.stripeConnected,
      center.stripeConnectEnabled,
      center.canAcceptPayments,
    ] as Array<boolean | string | null | undefined>;

    const hasPositiveFlag = flags.some((flag) => {
      const normalized = String(flag).toLowerCase();
      return flag === true || normalized === "true";
    });

    const hasOnlyNegativeFlags =
      flags.length > 0 &&
      flags.every((flag) => {
        const normalized = String(flag).toLowerCase();
        return flag === false || normalized === "false" || flag == null || normalized === "null" || normalized === "undefined";
      });

    if (hasPositiveFlag) return true;
    if (hasOnlyNegativeFlags) return false;
    return true;
  };

  const loadCenters = async (lat?: number, lng?: number, radius?: number) => {
    setFetchState("loading");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      let url = `${APP_CONFIG.API_BASE_URL}/api/service-centers`;
      if (lat !== undefined && lng !== undefined && radius !== undefined) {
        url = `${APP_CONFIG.API_BASE_URL}/api/service-centers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
      }

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401) {
        console.warn("[BookServicePage] 401 Unauthorized — redirecting to login");
        router.push("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const actualData = data.content || data;
        const list: ServiceCenter[] = Array.isArray(actualData) ? actualData : [];
        const validCenters = list.filter((c) => {
          const status = (c.status || "").toUpperCase();
          if (status === "SUSPENDED" || status === "REJECTED" || c.isActive === false) {
            return false;
          }
          return isPaymentReady(c);
        });

        if (validCenters.length > 0) {
          setCenters(validCenters);
          setFetchState("success");
        } else {
          setCenters([]);
          setFetchState("empty");
        }
      } else {
        setCenters([]);
        setFetchState("error");
      }
    } catch (err) {
      console.error("[BookServicePage] Fetch error:", err);
      setCenters([]);
      setFetchState("error");
    }
  };

  useEffect(() => {
    loadCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
      if (activeDistance) {
        let radius = 50;
        if (activeDistance === "2km") radius = 2;
        else if (activeDistance === "5km") radius = 5;
        else if (activeDistance === "10km") radius = 10;

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            loadCenters(position.coords.latitude, position.coords.longitude, radius);
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert("Location access denied. Falling back to default list.");
            setActiveDistance(null);
            loadCenters();
          }
        );
      } else {
        alert("Geolocation not supported.");
        setActiveDistance(null);
        loadCenters();
      }
    } else {
      // If no distance filter, just reload normal centers
      loadCenters();
    }
  };

  const handleClearAll = () => {
    setActiveDistance(null);
    setSelectedVehicles([]);
    setSelectedServices([]);
    setActiveAvailability(null);
  };

  // Derive filter options dynamically with fallbacks for casing and alternate fields
  let availableVehicles = Array.from(new Set(
    centers.flatMap(c => {
      const pkgVehicles = c.servicePackages?.flatMap(p => {
        const raw = p as Partial<{ vehicleType?: unknown; vehicletype?: unknown; VehicleType?: unknown; specification?: unknown; specifications?: unknown; vehicleCategory?: unknown; vehicle?: unknown; name?: string; type?: string; title?: string; }>;
        const v = raw.vehicleType ?? raw.vehicletype ?? raw.VehicleType ?? raw.specification ?? raw.specifications ?? raw.vehicleCategory ?? raw.vehicle;
        if (Array.isArray(v)) return v.filter((item): item is string => typeof item === 'string');
        if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
        if (v && typeof v === 'object') {
          const named = v as Record<string, unknown>;
          const label = typeof named.name === 'string' ? named.name : typeof named.type === 'string' ? named.type : typeof named.title === 'string' ? named.title : '';
          return label ? [label] : [];
        }
        return [];
      }) || [];
      const centerBrands = c.supportedVehicleBrands || [];
      return [...pkgVehicles, ...centerBrands];
    }).filter(Boolean)
  )) as string[];

  if (availableVehicles.length === 0) {
    // Fallback if backend data is empty or missing vehicle properties
    availableVehicles = ["CAR", "BIKE", "VAN", "TRUCK"];
  }

  const availableServices = Array.from(new Set(centers.flatMap(c => c.servicePackages?.map(p => p.type) || []).filter(Boolean))) as string[];

  const distanceOptions = ["Nearby", "2km", "5km", "10km"];
  const availabilityOptions = ["Open Now", "24/7", "Available Today"];

  const stations = centers.map((c) => ({
    id: c.centerId,
    name: c.name,
    location: c.address ?? "Unknown",
    googleMapsUrl: c.googleMapsUrl ?? null,
    image: "/garages/garage01.jpg",
    services: c.supportedVehicleBrands ?? [],
    openStatus: c.isActive !== false ? computeOpenStatus(c.openingHours) : "Closed",
  }));

  const isAvailable = (s: typeof stations[0], c: ServiceCenter) => {
    if (!activeAvailability) return true;
    if (activeAvailability === "Open Now") return s.openStatus === "Open Now";
    if (activeAvailability === "24/7") {
      const oh = c.openingHours?.replace(/\s/g, "") || "";
      return oh === "00:00-24:00" || oh === "00:00-23:59" || oh === "0:00-24:00";
    }
    if (activeAvailability === "Available Today") {
      if (!c.openingHours) return false;
      try {
        const parts = c.openingHours.replace(/\s/g, "").split("-");
        if (parts.length !== 2) return false;
        const end = parts[1];
        const [eh, em] = end.split(":").map(Number);
        const now = new Date();
        const cur = now.getHours() * 60 + now.getMinutes();
        return cur < eh * 60 + (em || 0);
      } catch { return false; }
    }
    return true;
  };

  const filtered = stations.filter((s) => {
    const center = centers.find(c => c.centerId === s.id);
    if (!center) return false;

    // search query
    if (searchQuery !== "" && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // availability
    if (!isAvailable(s, center)) return false;

    // vehicle & service types: a station matches if at least ONE package matches both active filters
    const hasVehicleFilter = selectedVehicles.length > 0;
    const hasServiceFilter = selectedServices.length > 0;

    if (hasVehicleFilter || hasServiceFilter) {
      const matchesPackage = center.servicePackages?.some(p => {
        const raw = p as Partial<{ vehicleType?: unknown; vehicletype?: unknown; VehicleType?: unknown; specification?: unknown; specifications?: unknown; vehicleCategory?: unknown; vehicle?: unknown; name?: string; type?: string; title?: string; }>;
        const vRaw = raw.vehicleType ?? raw.vehicletype ?? raw.VehicleType ?? raw.specification ?? raw.specifications ?? raw.vehicleCategory ?? raw.vehicle;
        let pVehicles: string[] = [];
        if (Array.isArray(vRaw)) pVehicles = vRaw.filter((value): value is string => typeof value === 'string');
        else if (typeof vRaw === 'string') pVehicles = vRaw.split(',').map(str => str.trim()).filter(Boolean);
        else if (vRaw && typeof vRaw === 'object') {
          const named = vRaw as Record<string, unknown>;
          const label = typeof named.name === 'string' ? named.name : typeof named.type === 'string' ? named.type : typeof named.title === 'string' ? named.title : '';
          if (label) pVehicles = [label];
        }

        if (pVehicles.length === 0) pVehicles = center.supportedVehicleBrands || [];

        const packageMatchesVehicle = !hasVehicleFilter || pVehicles.some(v =>
          selectedVehicles.some(sv => v.toLowerCase() === sv.toLowerCase() || v.toLowerCase().includes(sv.toLowerCase()) || sv.toLowerCase().includes(v.toLowerCase()))
        );
        const packageMatchesService = !hasServiceFilter || (!!p.type && selectedServices.includes(p.type));

        return packageMatchesVehicle && packageMatchesService;
      });

      if (!matchesPackage) return false;
    }

    return true;
  });

  const activeFiltersCount = (activeDistance ? 1 : 0) + (activeAvailability ? 1 : 0) + selectedVehicles.length + selectedServices.length;

  const removeFilter = (type: string, val?: string) => {
    if (type === "distance") {
      setActiveDistance(null);
      setTimeout(() => loadCenters(), 0);
    }
    if (type === "availability") setActiveAvailability(null);
    if (type === "vehicle" && val) setSelectedVehicles(prev => prev.filter(v => v !== val));
    if (type === "service" && val) setSelectedServices(prev => prev.filter(s => s !== val));
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10 md:px-10 md:py-12 shadow-xl">
        <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-20 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-2">Service Stations</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">Book a Service</h1>
            <p className="text-sm text-slate-400">Choose from our network of trusted service stations near you</p>
          </div>
          <div className="w-full md:w-96 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search service stations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white/15 transition-all backdrop-blur-sm text-sm"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="relative flex items-center justify-center bg-white/10 border border-white/10 text-white px-4 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <FiFilter className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeDistance && (
                  <div className="flex items-center gap-1 bg-orange-500/20 text-orange-300 px-2 py-1 rounded-md text-xs font-medium border border-orange-500/30">
                    Dist: {activeDistance}
                    <button onClick={() => removeFilter("distance")}><FiX className="w-3 h-3 hover:text-white" /></button>
                  </div>
                )}
                {activeAvailability && (
                  <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs font-medium border border-blue-500/30">
                    {activeAvailability}
                    <button onClick={() => removeFilter("availability")}><FiX className="w-3 h-3 hover:text-white" /></button>
                  </div>
                )}
                {selectedVehicles.map(v => (
                  <div key={v} className="flex items-center gap-1 bg-white/10 text-slate-300 px-2 py-1 rounded-md text-xs font-medium border border-white/20">
                    {v}
                    <button onClick={() => removeFilter("vehicle", v)}><FiX className="w-3 h-3 hover:text-white" /></button>
                  </div>
                ))}
                {selectedServices.map(s => (
                  <div key={s} className="flex items-center gap-1 bg-white/10 text-slate-300 px-2 py-1 rounded-md text-xs font-medium border border-white/20">
                    {s}
                    <button onClick={() => removeFilter("service", s)}><FiX className="w-3 h-3 hover:text-white" /></button>
                  </div>
                ))}
              </div>
            )}
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
            onClick={() => loadCenters()}
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
              <p className="text-sm text-slate-500 mb-6">Try adjusting your filters or search.</p>
              <button
                onClick={handleClearAll}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}

      {/* Filter Bottom Sheet Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Filter</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Distance */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Distance</h3>
                <div className="flex flex-wrap gap-2">
                  {distanceOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setActiveDistance(prev => prev === opt ? null : opt)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeDistance === opt ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Availability</h3>
                <div className="flex flex-wrap gap-2">
                  {availabilityOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setActiveAvailability(prev => prev === opt ? null : opt)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeAvailability === opt ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Types */}
              {availableVehicles.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Vehicle Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableVehicles.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVehicles(prev => prev.includes(opt) ? prev.filter(v => v !== opt) : [...prev, opt])}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedVehicles.includes(opt) ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Types */}
              {availableServices.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Service Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableServices.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSelectedServices(prev => prev.includes(opt) ? prev.filter(v => v !== opt) : [...prev, opt])}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedServices.includes(opt) ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button onClick={handleClearAll} className="text-sm font-medium text-slate-500 hover:text-slate-700 underline">
                Clear All
              </button>
              <button onClick={handleApplyFilters} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
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
