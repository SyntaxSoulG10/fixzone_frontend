"use client";

import { useState, useEffect } from "react";
import { 
  getPaymentDetails, 
  refundPayment, 
  reschedulePayment 
} from "@/lib/api";

// Props for payment manager component
interface PaymentManagerProps {
  bookingId: number;
}

// Manage payment status and actions (refund/reschedule)
export default function PaymentManager({ bookingId }: PaymentManagerProps) {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Fetch payment details on mount
  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // Get current payment status from API
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await getPaymentDetails(bookingId);
      if (data && data.status) {
        // Status examples: PAID, REFUNDED, PENDING
        setPaymentStatus(data.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Process 20% refund for booking cancellation
  const handleRefund = async () => {
    if (!confirm("Are you sure you want to cancel and receive a 20% refund?")) return;
    
    try {
      setActionLoading(true);
      setMessage(null);
      await refundPayment(bookingId);
      setMessage({ text: "20% refunded successfully", type: 'success' });
      // Reload payment status after refund
      await fetchStatus();
    } catch (err: any) {
      setMessage({ text: err.message || "Refund failed", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Reschedule booking with 5% additional fee
  const handleReschedule = async () => {
    try {
      setActionLoading(true);
      setMessage(null);
      const url = await reschedulePayment(bookingId);
      
      // Redirect to new Stripe checkout session
      if (url && url.startsWith("http")) {
        window.location.href = url;
      } else {
        setMessage({ text: "Failed to get redesign URL", type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Reschedule failed", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 border rounded animate-pulse bg-gray-50">Loading payment details...</div>;
  }

  // Don't show if payment not tracked
  if (!paymentStatus) {
    return null;
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment Status</h3>
        {/* Status badge with color-coded states */}
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
          paymentStatus === 'REFUNDED' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {paymentStatus}
        </span>
      </div>

      {/* Display operation result message */}
      {message && (
        <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Show action buttons only for paid bookings */}
      {paymentStatus === 'PAID' && (
        <div className="flex gap-4 pt-4 border-t">
          {/* Refund button - returns 20% of payment */}
          <button
            onClick={handleRefund}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {actionLoading ? "Processing..." : "Cancel Booking"}
          </button>
          
          {/* Reschedule button - adds 5% fee to payment */}
          <button
            onClick={handleReschedule}
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {actionLoading ? "Processing..." : "Reschedule (+5%)"}
          </button>
        </div>
      )}
    </div>
  );
}
