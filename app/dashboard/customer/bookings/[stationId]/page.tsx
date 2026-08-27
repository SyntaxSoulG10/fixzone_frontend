"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import BookingHeader from "@/components/bookings/BookingHeader";
import PackageCard, { Package } from "@/components/bookings/PackageCard";
import DatePicker from "@/components/bookings/DatePicker";
import TimeSlotSelector, { TimeSlot } from "@/components/bookings/TimeSlotSelector";
import VehicleSelector, { Vehicle } from "@/components/bookings/VehicleSelector";
import BookingSummary from "@/components/bookings/BookingSummary";
import { useBooking } from "@/context/BookingContext";
import { getServiceCenterDetails, getServicePackagesByCenter, initPayment, getAvailableSlotsAPI } from "@/lib/api";
import { getVehicles, type Vehicle as ApiVehicle } from "@/lib/customer-api";
import { format } from "date-fns";
// import toast from "react-hot-toast";

// --- Mock Data (Fallback) ---

const PACKAGES: Package[] = [
  {
    id: "22222222-2222-2222-2222-222222222221",
    name: "Full Service",
    description: "Premium comprehensive car care package",
    price: 15000,
    duration: "2.5 hrs",
    estimatedDurationMins: 150,
    image: "/images/bookings/package-gold-car.png",
    isRecommended: true,
    features: [
      "Comprehensive diagnostics",
      "Premium interior detail",
      "Engine bay cleaning",
      "Waxing & polishing",
      "Oil & Filter replacement",
      "Brake inspection"
    ]
  },
  {
    id: "4aba5910-a686-49db-9dde-915c8b7f538c",
    name: "Gold Package (Bike)",
    description: "Essential care for your motorcycle",
    price: 8000,
    duration: "1.5 hrs",
    estimatedDurationMins: 90,
    image: "/images/bookings/package-gold-bike.png",
    features: [
      "Engine Oil & Filter Change",
      "Brake Inspection",
      "Chain Lubrication",
      "General Safety Check"
    ]
  }
];

const TIME_SLOTS: TimeSlot[] = [
  { time: "08:00 AM", status: "available" },
  { time: "09:30 AM", status: "available" },
  { time: "10:30 AM", status: "busy" },
  { time: "01:00 PM", status: "available" },
  { time: "02:45 PM", status: "available" },
  { time: "04:30 PM", status: "available" },
];

// Vehicles will be fetched from API

const STATIONS_MOCK: StationDetail[] = [
  { 
    id: "11111111-1111-1111-1111-111111111111", 
    name: "Janaka Motors HQ", 
    location: "24/A, Havelock Road, Colombo", 
    image: "/garages/garage01.jpg", 
    rating: 4.8, 
    reviews: 120,
    openStatus: "Open until 7:00 PM",
    contactPhone: null,
    openingHours: null,
    paymentReady: true,
    paymentStatusMessage: "Online payment is enabled for this branch."
  },
];

type StationDetail = {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  openStatus: string;
  contactPhone: string | null;
  openingHours: string | null;
  paymentReady: boolean;
  paymentStatusMessage: string;
};

type BackendPackage = {
  packageId?: string;
  name?: string;
  description?: string;
  basePrice?: number;
  estimatedDurationMins?: number;
  type?: string | null;
  vehicleBrand?: string | null;
};

type BackendVehicle = {
  id?: string;
  vehicleType?: string | null;
};

export default function StationDetailPage() {
  const params = useParams() as { stationId: string };
  const router = useRouter();
  const { setBookingData } = useBooking();

  // --- Data State ---
  const [station, setStation] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Selection State ---
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);
  const [specialRequest, setSpecialRequest] = useState("");
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [rawApiVehicles, setRawApiVehicles] = useState<BackendVehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dateRef = useRef<HTMLElement>(null);
  const timeRef = useRef<HTMLElement>(null);
  const vehicleRef = useRef<HTMLElement>(null);

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setTimeout(() => {
      dateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setTimeout(() => {
      timeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setTimeout(() => {
      vehicleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => 
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [packages, searchQuery]);

  // --- Auth Check ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // toast.error("Please login to book a service");
      router.push("/login");
    }
  }, [router]);

  // --- Load Data ---
  useEffect(() => {
    const fetchStationDetails = async () => {
      try {
        setLoading(true);
        const data = await getServiceCenterDetails(params.stationId);
        
        // Transform backend data to match UI components.
        // Some service centers may report mixed legacy flags, so a center should remain
        // payment-ready when any positive readiness signal is true and only be blocked
        // when all known payment flags are explicitly false.
        const paymentFlags = [
          data.paymentEnabled,
          data.stripeConnected,
          data.stripeConnectEnabled,
          data.canAcceptPayments,
        ] as Array<boolean | string | null | undefined>;
        const hasPositiveFlag = paymentFlags.some((flag) => {
          const normalized = String(flag).toLowerCase();
          return flag === true || normalized === "true";
        });
        const hasOnlyNegativeFlags =
          paymentFlags.length > 0 &&
          paymentFlags.every((flag) => {
            const normalized = String(flag).toLowerCase();
            return flag === false || normalized === "false" || flag == null || normalized === "null" || normalized === "undefined";
          });
        const paymentReady = hasPositiveFlag ? true : !hasOnlyNegativeFlags;

        const transformedStation = {
          id: data.centerId,
          name: data.name,
          location: data.address || "Unknown Location",
          googleMapsUrl: data.googleMapsUrl || null,
          image: data.imageUrl || "/garages/garage01.jpg",
          rating: data.rating || 4.5,
          reviews: data.customerRatings?.length || 0,
          openStatus: "Contact center for hours",
          contactPhone: data.contactPhone || null,
          openingHours: data.openingHours || null,
          paymentReady,
          paymentStatusMessage: paymentReady
            ? "Online payment is enabled for this branch."
            : "This branch is active but is not yet accepting online payments. Please contact the service center or choose another branch.",
        };
        
        setStation(transformedStation);
        
        // Load real packages from backend separately
        try {
          const pkgData = await getServicePackagesByCenter(params.stationId, selectedVehicleType ?? undefined);
          if (pkgData && pkgData.length > 0) {
            const transformedPackages = pkgData.map((pkg: BackendPackage) => ({
              id: pkg.packageId ?? "",
              name: pkg.name ?? "Service Package",
              description: pkg.description ?? "Standard service package",
              price: pkg.basePrice ?? 0,
              duration: pkg.estimatedDurationMins ? `${pkg.estimatedDurationMins / 60} hrs` : "Varies",
              estimatedDurationMins: pkg.estimatedDurationMins || 60,
              image: "/images/bookings/package-gold-car.png",
              features: pkg.type ? pkg.type.split(",").map((t: string) => t.trim()) : ["Standard service features"],
            }));
            setPackages(transformedPackages);
          } else {
            setPackages(PACKAGES);
          }
        } catch {
          setPackages(PACKAGES);
        }
      } catch (err) {
        console.warn("Backend fail, fallback to mock:", err);
        const mock = STATIONS_MOCK.find(s => s.id === params.stationId) || STATIONS_MOCK[0];
        setStation(mock);
        setPackages(PACKAGES);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        setVehiclesLoading(true);
        const data = await getVehicles();
        setRawApiVehicles(data);
        const transformed: Vehicle[] = data.map((v: ApiVehicle) => ({
          id: v.id,
          brand: v.brand,
          model: "",
          licensePlate: v.plateNumber,
          image: v.imageUrl || "/images/vehicle-placeholder.svg",
          ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}),
        }));
        setUserVehicles(transformed);
      } catch (err) {
        console.error("Failed to load user vehicles:", err);
      } finally {
        setVehiclesLoading(false);
      }
    };

    if (params.stationId) fetchStationDetails();
    fetchUserData();
  }, [params.stationId]);

  // --- Load Slots dynamically for selected date and package ---
  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedDate && station?.id) {
        try {
          setSlotsLoading(true);
          setSelectedTime(null); // Reset previously picked time slot on date change
          const formattedDate = format(selectedDate, "yyyy-MM-dd");
          const slots = await getAvailableSlotsAPI(station.id, formattedDate, selectedPackage?.id);
          setAvailableSlots(slots.map(s => ({ time: s, status: "available" })));
        } catch (err) {
          console.error("Failed to load slots for date:", err);
          setAvailableSlots([]);
        } finally {
          setSlotsLoading(false);
        }
      } else {
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [selectedDate, station?.id, selectedPackage?.id]);

  // --- Re-fetch packages when vehicle type changes ---
  useEffect(() => {
    if (!params.stationId) return;
    const fetchPackages = async () => {
      try {
        const pkgData = await getServicePackagesByCenter(params.stationId, selectedVehicleType ?? undefined);
        if (pkgData && pkgData.length > 0) {
          const transformedPackages = pkgData.map((pkg: BackendPackage) => ({
            id: pkg.packageId ?? "",
            name: pkg.name ?? "Service Package",
            description: pkg.description ?? "Standard service package",
            price: pkg.basePrice ?? 0,
            duration: pkg.estimatedDurationMins ? `${pkg.estimatedDurationMins / 60} hrs` : "Varies",
            estimatedDurationMins: pkg.estimatedDurationMins || 60,
            image: "/images/bookings/package-gold-car.png",
            features: pkg.type ? pkg.type.split(",").map((t: string) => t.trim()) : ["Standard service features"],
          }));
          setPackages(transformedPackages);
        } else {
          setPackages(PACKAGES);
        }
      } catch {
        setPackages(PACKAGES);
      }
    };
    fetchPackages();
  }, [params.stationId, selectedVehicleType]);

  // --- Helpers ---
  const selectedVehicle = useMemo(() => {
    return userVehicles.find(v => v.id === selectedVehicleId) || null;
  }, [selectedVehicleId, userVehicles]);

  const handleVehicleSelect = (id: string) => {
    setSelectedVehicleId(id);
    const rawVehicle = rawApiVehicles.find((rv: BackendVehicle) => rv.id === id);
    setSelectedVehicleType(rawVehicle?.vehicleType ?? null);
  };

  const isValid = useMemo(() => {
    return !!(selectedPackage && selectedDate && selectedTime && selectedVehicleId);
  }, [selectedPackage, selectedDate, selectedTime, selectedVehicleId]);

  // Handle proceed to checkout
  const handleProceed = async () => {
    if (!station?.paymentReady) {
      setError("This branch is active but is not accepting online payments yet. Please choose a different service center.");
      return;
    }

    if (isValid && selectedPackage && selectedDate && selectedTime) {
      try {
        setInitLoading(true);
        setError(null);

        // Step 1: Initialize payment on backend
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const initResult = await initPayment(selectedPackage.id, selectedVehicleId!, formattedDate, selectedTime!, station.id, specialRequest);

        if (!initResult.paymentId) {
          throw new Error(initResult.message || "Booking could not be prepared.");
        }

        if (!initResult.stripeConnected) {
          setError(initResult.message || "This branch is not ready for online payments yet. Please complete Stripe Connect onboarding first.");
          return;
        }

        // Step 2: Save to context and navigate
        setBookingData({
          station,
          selectedPackage,
          selectedDate,
          selectedTime,
          selectedVehicle,
          specialRequest,
          paymentId: initResult.paymentId,
        });

        router.push("/dashboard/customer/checkout");
      } catch (err: unknown) {
        console.error("Initialization error:", err);
        const message = err instanceof Error ? err.message : "Failed to initialize booking. Please try again.";
        if (message === "TIME_SLOT_UNAVAILABLE") {
          setError("Sorry, this time slot was just taken. Please select another time.");
        } else {
          setError(message);
        }
      } finally {
        setInitLoading(false);
      }
    }
  };

  if (loading) {
    return <div className="p-10 text-center animate-pulse">Loading service center...</div>;
  }

  if (!station) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Station Not Found</h2>
        <button onClick={() => router.push("/dashboard/customer/bookings")} className="text-orange-500 font-bold hover:underline">
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Top: Header */}
      <div className="space-y-6">
        <BookingHeader station={station} />
        {!station?.paymentReady && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
            {station?.paymentStatusMessage || "This branch is not accepting online payments yet."}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Step 1: Packages */}
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">1. Select Package</h2>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {filteredPackages.length} Packages
            </span>
          </div>
          <div className="relative w-full md:w-[450px]">
            <input 
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 pl-12 rounded-2xl border-2 border-slate-100 bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-50 focus:border-orange-500 shadow-sm text-sm font-medium transition-all text-slate-700 placeholder:text-slate-400"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        {/* Changed back to 3 columns per row as requested */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <PackageCard 
                key={pkg.id} 
                pkg={pkg} 
                isSelected={selectedPackage?.id === pkg.id}
                onSelect={station?.paymentReady ? handlePackageSelect : () => undefined}
              />
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
              No packages match your search.
            </div>
          )}
        </div>
      </section>

      {/* Step 2: Date */}
      {selectedPackage && (
        <section ref={dateRef} className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm h-fit animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8">2. Select Date</h2>
          <DatePicker 
            selectedDate={selectedDate} 
            onDateSelect={handleDateSelect} 
          />
        </section>
      )}

      {/* Step 3: Time Slot */}
      {selectedPackage && selectedDate && (
        <section ref={timeRef} className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">3. Select Time Slot</h2>
          <TimeSlotSelector 
            slots={availableSlots} 
            selectedTime={selectedTime} 
            onTimeSelect={handleTimeSelect} 
            durationMins={selectedPackage?.estimatedDurationMins || 60}
            isLoading={slotsLoading}
            selectedDate={selectedDate}
          />
        </section>
      )}

      {/* Step 4 & 5: Vehicle & Summary */}
      {selectedPackage && selectedDate && selectedTime && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section ref={vehicleRef} className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">4. Select Vehicle</h2>
            {vehiclesLoading ? (
              <div className="py-4 text-center text-slate-400 italic">Loading your vehicles...</div>
            ) : userVehicles.length > 0 ? (
              <VehicleSelector 
                vehicles={userVehicles} 
                selectedVehicleId={selectedVehicleId}
                onVehicleSelect={handleVehicleSelect}
              />
            ) : (
              <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl text-center space-y-3">
                <p className="text-sm font-medium text-orange-800">You don&apos;t have any vehicles yet.</p>
                <Link href="/dashboard/customer/profile">
                  <button className="text-xs font-bold text-orange-600 hover:underline">
                    + Add a vehicle to your profile
                  </button>
                </Link>
              </div>
            )}
          </section>

          <section className="w-full">
            <BookingSummary 
              totalPrice={selectedPackage.price}
              isValid={isValid}
              specialRequest={specialRequest}
              onSpecialRequestChange={setSpecialRequest}
              onProceed={handleProceed}
              isLoading={initLoading}
            />
          </section>
        </div>
      )}
    </div>
  );
}
