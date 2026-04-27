"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCalendar, FiClock, FiInfo, FiChevronRight, FiPackage, FiTruck } from "react-icons/fi";
import Image from "next/image";
import { useState } from "react";
import { useBooking } from "@/context/BookingContext";
import { format } from "date-fns";
import Button from "@/components/UI/Button";
import { executeStripePayment } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { bookingData } = useBooking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pkg = bookingData.selectedPackage;
  const vehicle = bookingData.selectedVehicle;
  const date = bookingData.selectedDate;
  const time = bookingData.selectedTime;
  const paymentId = bookingData.paymentId;

  if (!pkg || !vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">No Booking Data Found</h1>
        <Button onClick={() => router.push("/dashboard/customer/bookings")}>
          Go Back to Bookings
        </Button>
      </div>
    );
  }

  const bookingCharge = pkg.price * 0.4;

  const handlePay = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!paymentId) {
        throw new Error("Booking session expired. Please go back and try again.");
      }

      const stripeUrl = await executeStripePayment(paymentId);

      if (stripeUrl && stripeUrl.startsWith("http")) {
        window.location.href = stripeUrl;
      } else {
        throw new Error("Invalid payment URL received from server.");
      }
    } catch (err: any) {
      console.error("Stripe payment error:", err);
      setError(err.message || "Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <FiArrowLeft className="w-6 h-6 text-slate-800" />
        </button>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Confirm & Pay</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Summary Details */}
        <div className="flex-1 space-y-6">

          {/* Vehicle Banner */}
          <div className="relative rounded-3xl overflow-hidden shadow-sm h-64 md:h-80 group">
            <Image
              src={vehicle.image}
              alt={vehicle.brand}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h2 className="text-3xl font-black mb-1">{vehicle.brand} {vehicle.model}</h2>
              <p className="text-slate-400 font-bold tracking-widest text-sm uppercase">
                {vehicle.licensePlate}
              </p>
            </div>
          </div>

          {/* Booking Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-5 shadow-sm">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FiCalendar className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Schedule Date</p>
                <p className="font-bold text-slate-900">{date ? format(date, "MMM dd, yyyy") : "Not selected"}</p>
              </div>
            </div>

            {/* Time */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-5 shadow-sm">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FiClock className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Arrival Time</p>
                <p className="font-bold text-slate-900">{time || "Not selected"}</p>
              </div>
            </div>

            {/* Package */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-5 shadow-sm">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FiPackage className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Package</p>
                <p className="font-bold text-slate-900">{pkg.name}</p>
              </div>
            </div>

            {/* Vehicle */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-5 shadow-sm">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FiTruck className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle</p>
                <p className="font-bold text-slate-900">{vehicle.brand} {vehicle.model}</p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex gap-4">
            <FiInfo className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-red-600 leading-relaxed">
              Note: Remaining balance will be collected at the Service Center after service completion.
            </p>
          </div>
        </div>

        {/* Right Side: Price & Pay */}
        <div className="w-full lg:w-[380px]">
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col gap-8 sticky top-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Order Summary</h3>

            {/* Price Breakdown */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Service Price</span>
                <span className="font-bold text-slate-900 font-mono">
                  Rs {pkg.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Discount</span>
                <span className="font-bold text-green-500 font-mono">Rs 0.00</span>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="bg-orange-50/80 rounded-3xl p-5 border border-orange-100 flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 font-black text-sm">Booking Charge (40%)</p>
                    <p className="text-[10px] text-orange-400 font-bold">Pay now to confirm slot</p>
                  </div>
                  <span className="text-2xl font-black text-orange-600 font-mono tracking-tight">
                    Rs {bookingCharge.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <div>
              <Button
                onClick={handlePay}
                disabled={loading}
                className={`w-full h-16 rounded-2xl text-lg font-black transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 shadow-xl
                  ${loading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-orange-500 hover:bg-orange-600 shadow-orange-200 text-white"
                  }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Pay Booking Charge
                    <FiChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4">
                  <p className="text-xs text-center text-red-600 font-bold leading-relaxed">{error}</p>
                </div>
              )}

              <p className="mt-4 text-[10px] text-center text-slate-400 px-6 leading-relaxed font-medium">
                By clicking pay, you agree to our{" "}
                <span className="text-slate-600 font-bold border-b border-slate-200">terms and conditions</span>{" "}
                for online bookings. You will be redirected to Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
