"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Package } from "@/components/bookings/PackageCard";
import { Vehicle } from "@/components/bookings/VehicleSelector";

interface BookingData {
  station: any;
  selectedPackage: Package | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedVehicle: Vehicle | null;
  specialRequest: string;
  paymentId: number | null;
}

interface BookingContextType {
  bookingData: BookingData;
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>;
  clearBookingData: () => void;
}

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

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookingData, setBookingData] = useState<BookingData>(defaultBookingData);

  const clearBookingData = () => {
    setBookingData(defaultBookingData);
  };

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData, clearBookingData }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
