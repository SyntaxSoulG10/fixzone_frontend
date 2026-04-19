"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import PageHeader from "@/components/UI/PageHeader";
import BookingHeader from "@/components/bookings/BookingHeader";
import PackageCard, { Package } from "@/components/bookings/PackageCard";
import DatePicker from "@/components/bookings/DatePicker";
import TimeSlotSelector, { TimeSlot } from "@/components/bookings/TimeSlotSelector";
import VehicleSelector, { Vehicle } from "@/components/bookings/VehicleSelector";
import BookingSummary from "@/components/bookings/BookingSummary";

// --- Mock Data ---

const PACKAGES: Package[] = [
  {
    id: "pkg-gold-full",
    name: "Gold Full Service (Car)",
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
    id: "pkg-gold-bike",
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
  { time: "8:00 AM", status: "available" },
  { time: "10:00 AM", status: "busy" },
  { time: "12:00 PM", status: "available" },
  { time: "2:00 PM", status: "available" },
  { time: "4:00 PM", status: "busy" },
  { time: "6:00 PM", status: "available" },
];

const VEHICLES: Vehicle[] = [
  { id: "v1", brand: "BMW", model: "X5", licensePlate: "CBC-5335", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200" },
  { id: "v2", brand: "Range Rover", model: "Sport", licensePlate: "CBZ-5435", image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=200" },
  { id: "v3", brand: "Mercedes", model: "C-Class", licensePlate: "ABC-3669", image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=200" },
];

const STATIONS = [
  { 
    id: "abc-1", 
    name: "AutoMiraj - Colombo 07", 
    location: "24/A, Havelock Road, Colombo", 
    image: "/garages/garage01.jpg", 
    rating: 4.8, 
    reviews: 120,
    openStatus: "Open until 7:00 PM"
  },
  // ... other stations can be added here
];

import { useBooking } from "@/context/BookingContext";

export default function StationDetailPage() {
  const params = useParams() as { stationId: string };
  const station = STATIONS.find((s) => s.id === params.stationId) || STATIONS[0];
  const { setBookingData } = useBooking();

  // --- State Management ---
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [specialRequest, setSpecialRequest] = useState("");

  // --- Helpers ---
  const selectedVehicle = useMemo(() => {
    return VEHICLES.find(v => v.id === selectedVehicleId) || null;
  }, [selectedVehicleId]);

  // --- Validation ---
  const isValid = useMemo(() => {
    return !!(selectedPackage && selectedDate && selectedTime && selectedVehicleId);
  }, [selectedPackage, selectedDate, selectedTime, selectedVehicleId]);

  // Handle proceed to summary
  const handleProceed = () => {
    if (isValid) {
      setBookingData({
        station,
        selectedPackage,
        selectedDate,
        selectedTime,
        selectedVehicle,
        specialRequest,
      });
    }
  };

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
              {PACKAGES.map((pkg) => (
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
                slots={TIME_SLOTS} 
                selectedTime={selectedTime} 
                onTimeSelect={setSelectedTime} 
              />

              <VehicleSelector 
                vehicles={VEHICLES} 
                selectedVehicleId={selectedVehicleId}
                onVehicleSelect={setSelectedVehicleId}
              />
            </div>

            <BookingSummary 
              totalPrice={selectedPackage?.price || 0}
              isValid={isValid}
              specialRequest={specialRequest}
              onSpecialRequestChange={setSpecialRequest}
              onProceed={handleProceed}
            />

          </div>
        </div>

      </div>
    </div>
  );
}










