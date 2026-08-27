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
import { 
  Snackbar, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  IconButton, 
  Box 
} from "@mui/material";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
import ConfirmDialog from "@/components/UI/ConfirmDialog";
import APP_CONFIG from "@/config";
import { getMyBookings, rescheduleBookingAPI, cancelBookingAPI, getAvailableSlotsAPI, getPaymentIdByBooking, executeStripePayment } from "@/lib/api";
import { enrichBookingsWithCenterNames } from "@/lib/enrichBookings";
import InvoiceModal from "@/components/invoices/InvoiceModal";
import { InvoiceDocumentProps } from "@/components/invoices/InvoiceDocument";


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
  const [invoiceModalData, setInvoiceModalData] = useState<InvoiceDocumentProps | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; bookingId: string }>({ isOpen: false, bookingId: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

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

  const fetchBookings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRescheduleSubmit = async () => {
    if (!reschedulingBooking || !newDate || !newTime) return;
    
    try {
      setActionLoading(`reschedule-${reschedulingBooking.bookingId}`);
      
      const response = await rescheduleBookingAPI(reschedulingBooking.bookingId, newDate, newTime);
      
      if (response && response.error) {
        setRescheduleError(response.message);
        return;
      }

      showSnackbar("Booking rescheduled successfully!", "success");
      
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
    try {
      setActionLoading(`cancel-${bookingId}`);
      await cancelBookingAPI(bookingId);
      showSnackbar("Booking cancelled successfully.", "info");
      fetchBookings();
      setCancelModal({ isOpen: false, bookingId: '' });
    } catch (error: any) {
      console.error("Cancel Error:", error);
      showSnackbar(error.message || "Failed to cancel booking", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleProceedToPayment = async (bookingId: string) => {
    try {
      setPaymentLoading(bookingId);
      const paymentId = await getPaymentIdByBooking(bookingId);
      if (!paymentId) {
        showSnackbar("Payment session not found. The slot may have expired. Please book again.", "warning");
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
      showSnackbar(err.message || "Failed to start payment. Please try again.", "error");
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleDownloadInvoice = async (bookingId: string) => {
    setInvoiceLoading(bookingId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // 1. Locate booking details in current state
      let booking = [...(bookings.past || []), ...(bookings.current || []), ...(bookings.upcoming || [])].find(
        (b: any) => (b.bookingId || b.id) === bookingId
      );

      // 2. If needed, fetch full booking details from backend
      if (!booking || !booking.packageName) {
        try {
          const bookingRes = await fetch(`${APP_CONFIG.API_BASE_URL}/api/bookings/${bookingId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          if (bookingRes.ok) {
            const fetchedBooking = await bookingRes.json();
            booking = { ...booking, ...fetchedBooking };
          }
        } catch (e) {
          console.warn("Could not fetch detailed booking record", e);
        }
      }

      // 3. Fetch invoice record from backend
      let invoice: any = null;
      try {
        const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/invoices/booking/${bookingId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          invoice = await res.json();
        }
      } catch (e) {
        console.warn("Could not fetch invoice endpoint", e);
      }

      // 4. Extract customer, vehicle, center details
      let customerName = booking?.customerName || (typeof window !== 'undefined' ? localStorage.getItem('userName') : null);
      if (!customerName || customerName.trim() === '') {
        customerName = "Valued Customer";
      }

      let vehicleStr = booking?.vehicleName || "";
      if (!vehicleStr && booking?.vehicleBrand) {
        vehicleStr = `${booking.vehicleBrand} ${booking.vehicleModel || ''}`.trim();
      }
      if (!vehicleStr) {
        vehicleStr = "Standard Vehicle";
      }

      const vehicleNumberStr = booking?.plateNumber || booking?.vehicleRegNumber || "";

      const subtotalVal = Number(invoice?.subtotal || booking?.estimatedCost || 0);
      const discountVal = Number(invoice?.discount || 0);
      const taxVal = Number(invoice?.tax || 0);
      const advancePaidVal = Number(booking?.bookingFeePaid ? (booking?.bookingFee || 0) : 0);
      const totalVal = Number(
        invoice?.total !== undefined && invoice?.total !== null
          ? invoice.total
          : (subtotalVal + taxVal - discountVal - advancePaidVal)
      );

      const invProps: InvoiceDocumentProps = {
        invoiceNumber: invoice?.invoiceId 
          ? `INV-${String(invoice.invoiceId).substring(0, 8).toUpperCase()}` 
          : `INV-${bookingId.substring(0, 8).toUpperCase()}`,
        issuedDate: invoice?.issuedAt || booking?.bookingDate || new Date(),
        status: invoice?.status || (booking?.status === 'COMPLETED' ? 'PAID' : (booking?.status || 'ISSUED')),
        serviceCenter: {
          name: booking?.serviceCenterName || "FIXZONE AUTO",
          address: booking?.centerAddress || "123 Service Road, Auto City",
          email: "contact@fixzone.lk",
          phone: booking?.contactPhone || "+94 (11) 234-5678",
        },
        billTo: {
          customerName: customerName,
          vehicle: vehicleStr,
          vehicleNumber: vehicleNumberStr,
          customerId: booking?.customerId || invoice?.issuedToCustomerId || "N/A",
        },
        serviceDetails: {
          centerName: booking?.serviceCenterName || "FixZone Auto Center",
          bookingRef: bookingId,
        },
        lineItems: [
          {
            name: booking?.packageName || "Full Service Package",
            description: booking?.packageDescription || "Base maintenance and labor cost",
            price: subtotalVal,
          },
        ],
        subtotal: subtotalVal,
        discount: discountVal,
        tax: taxVal,
        advancePaid: advancePaidVal,
        total: totalVal > 0 ? totalVal : subtotalVal,
      };

      setInvoiceModalData(invProps);
      setIsInvoiceModalOpen(true);
    } catch (err) {
      showSnackbar("Invoice not available yet. Please try again later.", "info");
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
    const canCancel = isUpcoming && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && booking.status !== 'IN_PROGRESS';

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
              <button 
                type="button"
                onClick={() => setReschedulingBooking(booking)}
                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-sm"
              >
                <FiEdit className="w-4 h-4 text-white" />
                Reschedule
              </button>
            ) : isUpcoming && !isTooLateToReschedule && (booking.rescheduleCount || 0) >= 3 ? (
              <span className="text-[10px] font-bold text-slate-400 self-center mr-2">Max reschedules reached</span>
            ) : null}
            
            {canCancel && (
              <button 
                type="button"
                onClick={() => setCancelModal({ isOpen: true, bookingId })}
                disabled={actionLoading === `cancel-${bookingId}`}
                className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <FiX className="w-4 h-4 text-red-600" />
                <span>{actionLoading === `cancel-${bookingId}` ? 'Cancelling...' : 'Cancel'}</span>
              </button>
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

      {/* Unified Professional Invoice Modal */}
      <InvoiceModal
        open={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setInvoiceModalData(null);
        }}
        invoiceData={invoiceModalData}
        isLoading={Boolean(invoiceLoading)}
      />

      {/* Reschedule MUI Dialog */}
      <Dialog
        open={Boolean(reschedulingBooking)}
        onClose={() => { setReschedulingBooking(null); setRescheduleError(null); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '1.5rem', p: 1 } }}
      >
        {reschedulingBooking && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
              Reschedule Booking
              <IconButton onClick={() => { setReschedulingBooking(null); setRescheduleError(null); }} size="small">
                <FiX />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 2 }}>
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
                    <div className="space-y-6 my-2">
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
                  <div className="space-y-4 my-2">
                    {rescheduleError && (
                      <Alert severity="error" sx={{ borderRadius: '0.75rem', mb: 2 }}>
                        {rescheduleError}
                      </Alert>
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
                  </div>
                );
              })()}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
              <Button 
                onClick={() => { setReschedulingBooking(null); setRescheduleError(null); }}
                variant="secondary"
                className="flex-1 py-3"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRescheduleSubmit}
                disabled={!newDate || !newTime || actionLoading !== null}
                variant="primary"
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700"
              >
                {actionLoading ? 'Updating...' : 'Confirm'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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

      {/* Cancel Booking Confirmation MUI Dialog */}
      <ConfirmDialog
        open={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, bookingId: '' })}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        variant="danger"
        isLoading={actionLoading !== null}
        onConfirm={() => handleCancel(cancelModal.bookingId)}
      />

      <FeedbackSnackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
      />
    </div>
  );
}

