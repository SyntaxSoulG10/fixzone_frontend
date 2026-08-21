"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
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
    duration: "4.5 hrs",
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
    duration: "4 hrs",
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
  { time: "08:00-09:00", status: "available" },
  { time: "10:00-11:00", status: "available" },
  { time: "12:00-13:00", status: "available" },
  { time: "14:00-15:00", status: "available" },
  { time: "16:00-17:00", status: "busy" },
  { time: "18:00-19:00", status: "available" },
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

  // --- Load Slots ---
  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedDate && station?.id) {
        try {
          const formattedDate = format(selectedDate, "yyyy-MM-dd");
          const slots = await getAvailableSlotsAPI(station.id, formattedDate);
          setAvailableSlots(slots.map(s => ({ time: s, status: "available" })));
        } catch (err) {
          console.error("Failed to load slots:", err);
          setAvailableSlots(TIME_SLOTS); // Fallback
        }
      }
    };
    fetchSlots();
  }, [selectedDate, station?.id]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Details & Selections */}
        <div className="flex-1 space-y-12">
          
          {/* Header */}
          <BookingHeader station={station} />

          {/* Package Selection */}
          {!station?.paymentReady && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
              {station?.paymentStatusMessage || "This branch is not accepting online payments yet."}
            </div>
          )}

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">Available Packages</h2>
              <span className="text-sm font-bold text-slate-400">({PACKAGES.length} Packages)</span>
            </div>
            <div className="space-y-6">
              {packages.map((pkg) => (
                <PackageCard 
                  key={pkg.id} 
                  pkg={pkg} 
                  isSelected={selectedPackage?.id === pkg.id}
                  onSelect={station?.paymentReady ? setSelectedPackage : () => undefined}
                />
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Booking Form Container */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="space-y-10">
            
            <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-10">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Book Your Service</h2>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}
              
              <DatePicker 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate} 
              />

              <TimeSlotSelector 
                slots={availableSlots.length > 0 ? availableSlots : TIME_SLOTS} 
                selectedTime={selectedTime} 
                onTimeSelect={setSelectedTime} 
              />

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
            </div>

            <BookingSummary 
              totalPrice={selectedPackage?.price || 0}
              isValid={isValid}
              specialRequest={specialRequest}
              onSpecialRequestChange={setSpecialRequest}
              onProceed={handleProceed}
              isLoading={initLoading}
            />

          </div>
        </div>

      </div>
    </div>
  );
}
