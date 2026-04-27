"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/UI/PageHeader";
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

const STATIONS_MOCK = [
  { 
    id: "11111111-1111-1111-1111-111111111111", 
    name: "Janaka Motors HQ", 
    location: "24/A, Havelock Road, Colombo", 
    image: "/garages/garage01.jpg", 
    rating: 4.8, 
    reviews: 120,
    openStatus: "Open until 7:00 PM"
  },
];

export default function StationDetailPage() {
  const params = useParams() as { stationId: string };
  const router = useRouter();
  const { setBookingData } = useBooking();

  // --- Data State ---
  const [station, setStation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Selection State ---
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [specialRequest, setSpecialRequest] = useState("");
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
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
        
        // Transform backend data to match UI components
        const transformedStation = {
          id: data.centerId,
          name: data.name,
          location: data.address || "Unknown Location",
          image: "/garages/garage01.jpg",
          rating: data.rating || 4.5,
          reviews: data.customerRatings?.length || 0,
          openStatus: "Contact center for hours"
        };
        
        setStation(transformedStation);
        
        // Load real packages from backend
        if (data.servicePackages && data.servicePackages.length > 0) {
          const transformedPackages = data.servicePackages.map((pkg: any) => ({
            id: pkg.packageId,
            name: pkg.name,
            description: pkg.description,
            price: pkg.basePrice,
            duration: `${pkg.estimatedDurationMins / 60} hrs`,
            image: "/images/bookings/package-gold-car.png",
            features: pkg.type ? pkg.type.split(",") : ["Standard service features"]
          }));
          setPackages(transformedPackages);
        } else {
          setPackages(PACKAGES); // Fallback to mock if no packages in center
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
        const transformed: Vehicle[] = data.map((v: ApiVehicle) => ({
          id: v.id,
          brand: v.brand,
          model: "", // We can add this later
          licensePlate: v.plateNumber,
          image: v.imageUrl || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200"
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

  // --- Helpers ---
  const selectedVehicle = useMemo(() => {
    return userVehicles.find(v => v.id === selectedVehicleId) || null;
  }, [selectedVehicleId, userVehicles]);

  const isValid = useMemo(() => {
    return !!(selectedPackage && selectedDate && selectedTime && selectedVehicleId);
  }, [selectedPackage, selectedDate, selectedTime, selectedVehicleId]);

  // Handle proceed to checkout
  const handleProceed = async () => {
    if (isValid && selectedPackage && selectedDate && selectedTime) {
      try {
        setInitLoading(true);
        setError(null);

        // Step 1: Initialize payment on backend
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const paymentId = await initPayment(selectedPackage.id, selectedVehicleId!, formattedDate, selectedTime!, station.id, specialRequest);

        // Step 2: Save to context and navigate
        setBookingData({
          station,
          selectedPackage,
          selectedDate,
          selectedTime,
          selectedVehicle,
          specialRequest,
          paymentId,
        });

        router.push("/dashboard/customer/checkout");
      } catch (err: any) {
        console.error("Initialization error:", err);
        if (err.message === "TIME_SLOT_UNAVAILABLE") {
          setError("Sorry, this time slot was just taken. Please select another time.");
        } else {
          setError("Failed to initialize booking. Please try again.");
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
                  onSelect={setSelectedPackage}
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
                  onVehicleSelect={setSelectedVehicleId}
                />
              ) : (
                <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl text-center space-y-3">
                  <p className="text-sm font-medium text-orange-800">You don't have any vehicles yet.</p>
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
