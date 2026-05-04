"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Package } from "@/components/bookings/PackageCard";
import { Vehicle } from "@/components/bookings/VehicleSelector";

// Data structure for a booking session
interface BookingData {
  station: any;
  selectedPackage: Package | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedVehicle: Vehicle | null;
  specialRequest: string;
  paymentId: number | null;
}

// Context interface for booking state and methods
interface BookingContextType {
  bookingData: BookingData;
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>;
  clearBookingData: () => void;
}

// Initialize with empty booking data
const defaultBookingData: BookingData = {
  station: null,
  selectedPackage: null,
  selectedDate: null,
  selectedTime: null,
  selectedVehicle: null,
  specialRequest: "",
  paymentId: null,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider component for booking context
export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookingData, setBookingData] = useState<BookingData>(defaultBookingData);

  // Reset booking data to initial empty state
  const clearBookingData = () => {
    setBookingData(defaultBookingData);
  };

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData, clearBookingData }}>
      {children}
    </BookingContext.Provider>
  );
};

// Hook to access booking context - throws error if used outside provider
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
