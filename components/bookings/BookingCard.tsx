"use client";

import React from "react";
import { FiMapPin, FiTruck, FiClock, FiCalendar, FiDollarSign, FiUser, FiChevronRight, FiAlertCircle, FiCheckCircle, FiEdit, FiX, FiDownload } from "react-icons/fi";

interface BookingCardProps {
  booking: any;
  compact?: boolean;
  showActions?: boolean;
  isUpcoming?: boolean;
  isTooLateToReschedule?: boolean;
  canReschedule?: boolean;
  canCancel?: boolean;
  rescheduleCount?: number;
  rescheduleFee?: number;
  totalCost?: number;
  onReschedule?: () => void;
  onCancel?: () => void;
  onDownloadInvoice?: () => void;
  actionLoading?: string | null;
  onClick?: () => void;
  formattedDateTime?: string;
}

export default function BookingCard(props: BookingCardProps) {
  const {
    booking,
    compact,
    showActions,
    isUpcoming,
    isTooLateToReschedule,
    canReschedule,
    canCancel,
    rescheduleCount,
    rescheduleFee,
    totalCost,
    onReschedule,
    onCancel,
    onDownloadInvoice,
    actionLoading,
    onClick,
    formattedDateTime,
  } = props;

  const status = (booking?.status || "").toString().toUpperCase();

  const getStatusBadge = () => {
    if (status === "IN_PROGRESS") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-orange-100 text-orange-700 border-orange-200">
          <FiClock className="w-3 h-3" /> In Progress
        </span>
      );
    }
    if (status === "CONFIRMED" || status === "PENDING_PAYMENT") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200">
          <FiCheckCircle className="w-3 h-3" /> {status === "CONFIRMED" ? "Confirmed" : "Pending Payment"}
        </span>
      );
    }
    if (status === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
          <FiCheckCircle className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (status === "CANCELLED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
          <FiAlertCircle className="w-3 h-3" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-200">{status}</span>
    );
  };

  const formatDateTime = () => {
    if (formattedDateTime) return formattedDateTime;
    try {
      const dateString = booking?.bookingTime ? `${booking.bookingDate}T${booking.bookingTime}` : booking?.bookingDate;
      const dt = new Date(dateString);
      if (isNaN(dt.getTime())) {
        if (booking?.bookingDate && booking?.bookingTime) return `${booking.bookingDate} ${booking.bookingTime}`.trim();
        if (booking?.bookingDate) return booking.bookingDate;
        if (booking?.bookingTime) return booking.bookingTime;
        return "Date/time unavailable";
      }
      return dt.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      if (booking?.bookingTime) return booking.bookingTime;
      return "Date/time unavailable";
    }
  };
  if (compact) {
    return (
      <div
        className="rounded-2xl bg-white border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all p-5 cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 bg-linear-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FiTruck className="w-7 h-7 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-base md:text-lg font-bold text-slate-900 truncate">
                {booking?.packageName || booking?.vehicleName || "Service"}
              </p>
              <p className="text-sm md:text-base text-slate-500 truncate mt-0.5">
                {booking?.serviceCenterName || ""}
              </p>
              <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-2">
                <FiClock className="w-4 h-4 shrink-0" /> {formatDateTime()}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 ml-2 shrink-0">
            {getStatusBadge()}
            <FiChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-white border-2 border-slate-200 hover:border-orange-300 transition-all shadow-sm hover:shadow-md ${compact ? 'p-4' : 'p-5'}`} onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiTruck className="w-7 h-7 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">{booking?.packageName || booking?.vehicleName || booking?.serviceCenterName || "Booking"}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <FiMapPin className="w-3 h-3" />
              {booking?.serviceCenterName || booking?.centerAddress || "Service Center"}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-xl">
        <div>
          <p className="text-xs text-slate-500 mb-1 font-medium">Service Package</p>
          <p className="text-sm font-semibold text-slate-900">{booking?.packageName || "Standard Service"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1 font-medium">Estimated Cost</p>
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
            <FiDollarSign className="w-3 h-3 text-slate-400" />
            Rs.{booking?.estimatedCost ?? 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1 font-medium">Date</p>
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
            <FiCalendar className="w-3 h-3 text-slate-400" />
            {booking?.bookingDate || formatDateTime()}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1 font-medium">Time</p>
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
            <FiClock className="w-3 h-3 text-slate-400" />
            {booking?.bookingTime || formatDateTime()}
          </p>
        </div>
      </div>

      {booking?.rescheduleCount > 0 && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4" />
          Rescheduled {booking.rescheduleCount} / 3 times.
          {booking.rescheduleFee > 0 && ` (Penalty applied: Rs.${booking.rescheduleFee})`}
        </div>
      )}

      {showActions ? (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-lg font-bold text-slate-900">
            Total: Rs.{totalCost ?? (booking?.estimatedCost + (booking?.rescheduleFee || 0))}
          </div>

          <div className="flex gap-2">
            {isUpcoming && isTooLateToReschedule && (
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md flex items-center gap-1 self-center mr-2">
                <FiAlertCircle className="w-3 h-3" /> Too late to reschedule
              </span>
            )}

            {canReschedule ? (
              <button onClick={onReschedule} className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                <FiEdit className="w-4 h-4" />
                Reschedule
              </button>
            ) : isUpcoming && !isTooLateToReschedule && (rescheduleCount || 0) >= 3 ? (
              <span className="text-[10px] font-bold text-slate-400 self-center mr-2">Max reschedules reached</span>
            ) : null}

            {canCancel && (
              <button 
                type="button"
                onClick={onCancel} 
                disabled={actionLoading?.startsWith('cancel-')} 
                className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <FiX className="w-4 h-4 text-red-600" />
                <span>{actionLoading ? 'Processing...' : 'Cancel'}</span>
              </button>
            )}

            {onDownloadInvoice && (
              <button onClick={onDownloadInvoice} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                <FiDownload className="w-4 h-4" />
                Invoice
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end mt-2">
          <FiChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      )}
    </div>
  );
}
