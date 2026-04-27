"use client";

import { useState } from "react";
import { createPaymentSession } from "@/lib/api";

interface PaymentButtonProps {
  bookingId?: number;
  amount: number;
}

export default function PaymentButton({ bookingId = 101, amount }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the backend API to create a Stripe payment session
      const paymentUrl = await createPaymentSession(bookingId, amount);

      // Redirect the user to the returned Stripe Checkout URL
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setError("Received an invalid response from the server.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="px-6 py-2.5 bg-[#635BFF] text-white rounded-lg font-medium shadow-sm hover:bg-[#4B45FF] hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg 
              className="animate-spin h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Book & Pay"
        )}
      </button>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-md border border-red-100">
          {error}
        </p>
      )}
    </div>
  );
}
