"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCalendar, FiClock, FiCreditCard, FiInfo, FiChevronRight } from "react-icons/fi";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import Image from "next/image";
import { useState } from "react";
import { useBooking } from "@/context/BookingContext";
import { format } from "date-fns";
import Button from "@/components/UI/Button";

export default function CheckoutPage() {
  const router = useRouter();
  const { bookingData } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr">("card");
  const [isBooked, setIsBooked] = useState(false);

  // Fallback data if context is empty (for dev/direct access)
  const pkg = bookingData.selectedPackage;
  const vehicle = bookingData.selectedVehicle;
  const date = bookingData.selectedDate;
  const time = bookingData.selectedTime;

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

  const bookingPrice = pkg.price;
  const discount = 0;
  const bookingCharge = bookingPrice * 0.1;

  const handlePay = () => {
    alert("Booked!");
    setIsBooked(true);
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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Initial Payment</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Summary Cards */}
        <div className="flex-1 space-y-6">
          
          {/* Vehicle Banner */}
          <div className="relative rounded-3xl overflow-hidden shadow-sm h-64 md:h-80 group">
            <Image 
              src={vehicle.image} 
              alt={vehicle.brand} 
              fill 
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

          {/* Date & Time Chips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-6 shadow-sm">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Schedule Date</p>
                <p className="font-bold text-slate-900">{date ? format(date, "MMM dd, yyyy") : "Not selected"}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-6 shadow-sm">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                <FiClock className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Arrival Time</p>
                <p className="font-bold text-slate-900">{time || "Not selected"}</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-6 h-6 flex items-center justify-center">
                <FiInfo className="text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-800">Price Breakdown</h3>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Booking Price</span>
                <span className="font-bold text-slate-900 font-mono">Rs {bookingPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Discount</span>
                <span className="font-bold text-green-500 font-mono">Rs {discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 flex items-center justify-between">
              <div>
                <p className="text-orange-600 font-black text-sm">Booking Charge (10%)</p>
                <p className="text-[10px] text-orange-400 font-bold">Pay now to confirm slot</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-orange-600 font-mono tracking-tight">
                  Rs {bookingCharge.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex gap-4">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <FiInfo className="text-red-500" />
            </div>
            <p className="text-xs font-bold text-red-600 leading-relaxed">
              Note: Remaining balance will be collected at Service Center after service completion.
            </p>
          </div>
        </div>

        {/* Right Side: Payment Methods */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Payment Method</h3>
              
              <div className="space-y-4 mb-12">
                <div 
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                    paymentMethod === "card" ? "border-orange-500 bg-white" : "border-slate-50 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      paymentMethod === "card" ? "bg-orange-100" : "bg-white border border-slate-100 shadow-sm"
                    }`}>
                      <FiCreditCard className={`w-6 h-6 ${paymentMethod === "card" ? "text-orange-600" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Credit / Debit Card</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">VISA, MASTER, AMEX</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "card" ? "border-orange-500 shadow-lg shadow-orange-100" : "border-slate-200"
                  }`}>
                    {paymentMethod === "card" && <div className="w-3 h-3 bg-orange-500 rounded-full" />}
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod("qr")}
                  className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                    paymentMethod === "qr" ? "border-orange-500 bg-white" : "border-slate-50 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      paymentMethod === "qr" ? "bg-orange-100" : "bg-white border border-slate-100 shadow-sm"
                    }`}>
                      <MdOutlineQrCodeScanner className={`w-6 h-6 ${paymentMethod === "qr" ? "text-orange-600" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Lanka QR Pay</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Pay using any local bank app</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "qr" ? "border-orange-500 shadow-lg shadow-orange-100" : "border-slate-200"
                  }`}>
                    {paymentMethod === "qr" && <div className="w-3 h-3 bg-orange-500 rounded-full" />}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Button 
                onClick={handlePay}
                disabled={isBooked}
                className={`w-full h-16 rounded-2xl text-lg font-black transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 shadow-xl ${
                  isBooked 
                  ? "bg-green-500 hover:bg-green-600 shadow-green-200 text-white" 
                  : "bg-orange-500 hover:bg-orange-600 shadow-orange-200 text-white"
                }`}
              >
                {isBooked ? "Booked Successfully" : "Pay Booking Charge"}
                {!isBooked && <FiChevronRight className="w-5 h-5" />}
              </Button>
              <p className="mt-4 text-[10px] text-center text-slate-400 px-8 leading-relaxed font-medium">
                By clicking pay, you agree to our <span className="text-slate-600 font-bold border-b border-slate-200">terms and conditions</span> for online bookings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
