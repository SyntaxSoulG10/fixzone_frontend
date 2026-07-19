"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";
import { 
  FiCheckCircle, 
  FiClock, 
  FiCalendar, 
  FiMapPin, 
  FiTruck,
  FiX,
  FiEdit,
  FiDownload,
  FiAlertCircle,
  FiDollarSign,
  FiPrinter
} from "react-icons/fi";
import APP_CONFIG from "@/config";
import { getMyBookings, rescheduleBookingAPI, cancelBookingAPI, getAvailableSlotsAPI, getPaymentIdByBooking, executeStripePayment } from "@/lib/api";
import { enrichBookingsWithCenterNames } from "@/lib/enrichBookings";


// Keep dummy bookings as fallback for UI demonstration if no data
const DUMMY_BOOKINGS = {
  current: [],
  upcoming: [],
  past: []
};

export default function MyBookingsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'current' | 'upcoming' | 'past') || 'upcoming';
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>(initialTab);
  const [bookings, setBookings] = useState<any>({ current: [], upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [invoiceModal, setInvoiceModal] = useState<any>(null);
  const [invoiceLoading, setInvoiceLoading] = useState<string | null>(null);

  // Reschedule Form State
  const [reschedulingBooking, setReschedulingBooking] = useState<any>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);


  useEffect(() => {
    if (reschedulingBooking && newDate) {
      const loadSlots = async () => {
        setLoadingSlots(true);
        try {
          const slots = await getAvailableSlotsAPI(reschedulingBooking.centerId, newDate);
          setAvailableSlots(slots);
        } catch (error) {
          console.error("Failed to fetch slots:", error);
          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      loadSlots();
    }
  }, [reschedulingBooking, newDate]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const raw = await getMyBookings();
      const data = await enrichBookingsWithCenterNames(raw);

      const categorized = {
        current:  data.filter((b: any) => b.status === "IN_PROGRESS"),
        upcoming: data.filter((b: any) => b.status === "CONFIRMED" || b.status === "PENDING_PAYMENT"),
        past:     data.filter((b: any) => b.status === "COMPLETED" || b.status === "CANCELLED" || b.status === "EXPIRED"),
      };
      setBookings(categorized);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingBooking || !newDate || !newTime) return;
    
    try {
      setActionLoading(`reschedule-${reschedulingBooking.bookingId}`);
      
      console.log("🎯 TASK 3 & 6: RESCHEDULE DEBUG");
      console.log("URL:", `${APP_CONFIG.API_BASE_URL}/api/bookings/${reschedulingBooking.bookingId}/reschedule`);
      console.log("Payload:", { newDate, newTime });

      const response = await rescheduleBookingAPI(reschedulingBooking.bookingId, newDate, newTime);
      
      if (response && response.error) {
        setRescheduleError(response.message);
        return;
      }

      console.log("Full API Response:", response);
      alert("Booking rescheduled successfully!");
      
      setReschedulingBooking(null);
      setNewDate("");
      setNewTime("");
      fetchBookings();
    } catch (error: any) {
      console.error("Reschedule Error:", error);
      setRescheduleError(error.message || "Failed to reschedule booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setActionLoading(`cancel-${bookingId}`);
      console.log("🎯 TASK 2: CANCEL DEBUG");
      console.log("URL:", `${APP_CONFIG.API_BASE_URL}/api/bookings/${bookingId}/cancel`);

      await cancelBookingAPI(bookingId);
      alert("Booking cancelled successfully.");
      fetchBookings();
    } catch (error: any) {
      console.error("Cancel Error:", error);
      alert(error.message || "Failed to cancel booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleProceedToPayment = async (bookingId: string) => {
    try {
      setPaymentLoading(bookingId);
      const paymentId = await getPaymentIdByBooking(bookingId);
      if (!paymentId) {
        alert("Payment session not found. The slot may have expired. Please book again.");
        return;
      }
      const stripeUrl = await executeStripePayment(paymentId);
      if (stripeUrl && /^https?:\/\//i.test(stripeUrl)) {
        window.location.href = stripeUrl;
      } else {
        throw new Error("Could not get Stripe checkout URL.");
      }
    } catch (err: any) {
      console.error("Proceed to payment error:", err);
      alert(err.message || "Failed to start payment. Please try again.");
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleDownloadInvoice = async (bookingId: string) => {

    setInvoiceLoading(bookingId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/invoices/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Invoice not found');
      const invoice = await res.json();
      setInvoiceModal(invoice);
    } catch (err) {
      alert('Invoice not available yet. Please try again later.');
    } finally {
      setInvoiceLoading(null);
    }
  };

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', count: bookings.upcoming.length },
    { key: 'current', label: 'Current', count: bookings.current.length },
    { key: 'past', label: 'Past', count: bookings.past.length }
  ];

  const getStatusBadge = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-orange-100 text-orange-700 border-orange-200">
          <FiClock className="w-3 h-3" /> In Progress
        </span>
      );
    }
    if (s === 'CONFIRMED' || s === 'PENDING_PAYMENT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200">
          <FiCheckCircle className="w-3 h-3" /> {s === 'CONFIRMED' ? 'Confirmed' : 'Pending Payment'}
        </span>
      );
    }
    if (s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
          <FiCheckCircle className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
          <FiX className="w-3 h-3" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-200">
        {s}
      </span>
    );
  };

  const renderBookingCard = (booking: any, type: string) => {
    const bookingId = booking.bookingId || booking.id;
    const isUpcoming = type === 'upcoming';
    
    // Calculate days until booking
    const bDate = new Date(booking.bookingDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = bDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isTooLateToReschedule = diffDays < 3;
    const canReschedule = isUpcoming && (booking.rescheduleCount || 0) < 3 && !isTooLateToReschedule;
    const canCancel = isUpcoming;

    return (
      <div key={bookingId} className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-red-300 hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiTruck className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl mb-1">{booking.serviceCenterName || "Service Center"}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <FiMapPin className="w-3 h-3" />
                {booking.centerAddress || "Station Address"}
              </p>
            </div>
          </div>
          {getStatusBadge(booking.status)}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Service Package</p>
            <p className="text-sm font-semibold text-slate-900">{booking.packageName || "Standard Service"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Estimated Cost</p>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
              <FiDollarSign className="w-3 h-3 text-slate-400" />
              Rs.{booking.estimatedCost || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Date</p>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
              <FiCalendar className="w-3 h-3 text-slate-400" />
              {booking.bookingDate}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Time</p>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
              <FiClock className="w-3 h-3 text-slate-400" />
              {booking.bookingTime}
            </p>
          </div>
        </div>

        {booking.rescheduleCount > 0 && (
          <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4" />
            Rescheduled {booking.rescheduleCount} / 3 times.
            {booking.rescheduleFee > 0 && ` (Penalty applied: Rs.${booking.rescheduleFee})`}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-xl font-bold text-slate-900">
            Total: Rs.{booking.estimatedCost + (booking.rescheduleFee || 0)}
          </div>
          
          <div className="flex gap-2">
            {isUpcoming && isTooLateToReschedule && (
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md flex items-center gap-1 self-center mr-2">
                <FiAlertCircle className="w-3 h-3" /> Too late to reschedule
              </span>
            )}

            {canReschedule ? (
              <Button 
                onClick={() => setReschedulingBooking(booking)}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <FiEdit className="w-4 h-4" />
                Reschedule
              </Button>
            ) : isUpcoming && !isTooLateToReschedule && (booking.rescheduleCount || 0) >= 3 ? (
              <span className="text-[10px] font-bold text-slate-400 self-center mr-2">Max reschedules reached</span>
            ) : null}
            
            {canCancel && (
              <Button 
                onClick={() => handleCancel(bookingId)}
                disabled={actionLoading === `cancel-${bookingId}`}
                className="px-4 py-2 text-sm border-2 border-red-300 hover:border-red-400 text-red-600 hover:bg-orange-50 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <FiX className="w-4 h-4" />
                {actionLoading === `cancel-${bookingId}` ? 'Cancelling...' : 'Cancel'}
              </Button>
            )}
            
            {type === 'past' && booking.status === 'COMPLETED' && (
              <Button 
                onClick={() => handleDownloadInvoice(bookingId)}
                disabled={invoiceLoading === bookingId}
                className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {invoiceLoading === bookingId ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Loading...</>
                ) : (
                  <><FiDownload className="w-4 h-4" /> Download Invoice</>
                )}
              </Button>
            )}

            {booking.status === 'PENDING_PAYMENT' && (
              <Button 
                onClick={() => handleProceedToPayment(bookingId)}
                disabled={paymentLoading === bookingId}
                className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {paymentLoading === bookingId ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <>Complete Booking</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const currentBookings = bookings[activeTab] || [];

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="My Bookings"
        description="View and manage all your service appointments"
      />

      {/* Invoice Preview Modal */}
      {invoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-6 flex items-start justify-between">
              <div>
                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1">FixZone</p>
                <h3 className="text-2xl font-bold text-white">Invoice</h3>
                <p className="text-slate-400 text-sm mt-1">#{invoiceModal.invoiceId?.slice(0, 8)?.toUpperCase() || 'N/A'}</p>
              </div>
              <button onClick={() => setInvoiceModal(null)} className="text-slate-400 hover:text-white transition-colors mt-1">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    invoiceModal.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>{invoiceModal.status || 'PENDING'}</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Issued</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {invoiceModal.issuedAt ? new Date(invoiceModal.issuedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Amount Breakdown</p>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-slate-600">Subtotal</span>
                    <span className="text-sm font-semibold text-slate-800">Rs. {Number(invoiceModal.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-slate-600">Tax (8%)</span>
                    <span className="text-sm font-semibold text-slate-800">Rs. {Number(invoiceModal.tax || 0).toLocaleString()}</span>
                  </div>
                  {Number(invoiceModal.discount || 0) > 0 && (
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-sm text-emerald-600">Discount</span>
                      <span className="text-sm font-semibold text-emerald-600">- Rs. {Number(invoiceModal.discount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-4 py-3 bg-orange-50">
                    <span className="text-base font-bold text-slate-900">Total</span>
                    <span className="text-base font-bold text-orange-600">Rs. {Number(invoiceModal.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex gap-3">
              <button
                onClick={() => setInvoiceModal(null)}
                className="flex-1 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <FiPrinter className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Reschedule Booking</h3>
              <button onClick={() => { setReschedulingBooking(null); setRescheduleError(null); }} className="text-slate-400 hover:text-slate-600">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {(() => {
              // Ensure we parse the date string (e.g. "2026-04-26") as local time
              const [year, month, day] = reschedulingBooking.bookingDate.split('-').map(Number);
              const bookingDate = new Date(year, month - 1, day);
              
              const today = new Date();
              today.setHours(0,0,0,0);
              
              const diffTime = bookingDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const tooLate = diffDays < 3;

              if (tooLate) {
                return (
                  <div className="space-y-6">
                    <div className="p-6 bg-red-50 border-2 border-red-100 text-red-700 rounded-2xl text-center">
                      <FiAlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                      <h4 className="font-bold text-xl mb-2">Rescheduling Unavailable</h4>
                      <p className="text-sm leading-relaxed">
                        Sorry, you can only reschedule appointments that are at least 3 days away. 
                        Your current booking is on <strong>{reschedulingBooking.bookingDate}</strong>.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setReschedulingBooking(null)}
                      className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold"
                    >
                      Close
                    </Button>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {rescheduleError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3 animate-shake">
                      <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>{rescheduleError}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">New Date</label>
                    <input 
                      type="date" 
                      value={newDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Available Time Slots</label>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setNewTime(slot)}
                            className={`
                              py-2 text-sm font-semibold rounded-xl border-2 transition-all
                              ${newTime === slot 
                                ? 'bg-orange-500 border-orange-500 text-white shadow-md' 
                                : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-orange-200'}
                            `}
                          >
                            {slot.substring(0, 5)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-sm text-slate-400">
                          {newDate ? "No slots available for this date" : "Select a date to see slots"}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-800 leading-relaxed text-center font-bold">
                      <FiAlertCircle className="inline mr-1" />
                      Maximum 3 reschedules allowed per booking.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={() => { setReschedulingBooking(null); setRescheduleError(null); }}
                      className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleRescheduleSubmit}
                      disabled={!newDate || !newTime || actionLoading !== null}
                      className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:bg-slate-300"
                    >
                      {actionLoading ? 'Updating...' : 'Confirm'}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`
                flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all
                ${activeTab === tab.key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key 
                  ? 'bg-white/20' 
                  : 'bg-slate-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-8 text-slate-500">Loading your bookings...</div>
        ) : currentBookings.length > 0 ? (
          currentBookings.map((booking: any, index: number) => {
            const safeKey = booking.bookingId || booking.id || `booking-${index}`;
            return (
              <div key={safeKey}>
                {renderBookingCard(booking, activeTab)}
              </div>
            );
          })
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No {activeTab} bookings</h3>
            <p className="text-sm text-slate-500 mb-6">
              {activeTab === 'current' && "You don't have any active service appointments."}
              {activeTab === 'upcoming' && "You don't have any upcoming appointments scheduled."}
              {activeTab === 'past' && "You don't have any service history yet."}
            </p>
            <Link href="/dashboard/customer/bookings">
              <Button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold">
                Book a Service
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

