"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import Button from "@/components/UI/Button";

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8">
          <FiCheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Checkout Page</h1>
        <p className="text-slate-500 mb-12 text-lg max-w-md">
          This is a placeholder for the payment gateway integration. Booking details would be processed here.
        </p>

        <div className="flex gap-4">
          <Button 
            variant="secondary" 
            onClick={() => router.back()}
            className="h-14 px-8 rounded-2xl"
          >
            <FiArrowLeft className="mr-2" /> Back to Booking
          </Button>
          <Button 
            onClick={() => router.push("/dashboard/customer/history")}
            className="h-14 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 border-none shadow-orange-200"
          >
            Go to My Bookings
          </Button>
        </div>
      </div>
    </div>
  );
}
