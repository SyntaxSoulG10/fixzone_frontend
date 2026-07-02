"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiTruck,
  FiHash,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import { Car } from "lucide-react";
import { getVehicles, type Vehicle } from "@/lib/customer-api";
import { getMyBookings } from "@/lib/api";
import { enrichBookingsWithCenterNames } from "@/lib/enrichBookings";
import APP_CONFIG from "@/config";

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  if (s === "COMPLETED")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
        <FiCheckCircle className="w-3 h-3" /> Completed
      </span>
    );
  if (s === "IN_PROGRESS")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
        <FiClock className="w-3 h-3" /> In Progress
      </span>
    );
  if (s === "CANCELLED")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
        <FiX className="w-3 h-3" /> Cancelled
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
      {s.replace("_", " ")}
    </span>
  );
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params?.vehicleId as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vehicleId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [vehicles, rawBookings] = await Promise.all([
          getVehicles(),
          getMyBookings(),
        ]);

        const found = vehicles.find((v) => v.id === vehicleId);
        if (!found) {
          setError("Vehicle not found.");
          setLoading(false);
          return;
        }
        setVehicle(found);

        // Filter bookings for this vehicle
        const vehicleBookings = rawBookings.filter(
          (b: any) => String(b.vehicleId) === String(vehicleId)
        );

        const enriched = await enrichBookingsWithCenterNames(vehicleBookings);
        // Sort by most recent first
        enriched.sort((a: any, b: any) => {
          const da = new Date(a.bookingDate || 0).getTime();
          const db = new Date(b.bookingDate || 0).getTime();
          return db - da;
        });
        setServiceHistory(enriched);
      } catch (err) {
        setError("Failed to load vehicle details.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [vehicleId]);

  // Compute last service info
  const completedServices = serviceHistory.filter(
    (b) => (b.status || "").toUpperCase() === "COMPLETED"
  );
  const lastService = completedServices[0] || null;
  const daysSinceLastService = lastService
    ? Math.floor(
        (Date.now() - new Date(lastService.bookingDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FiAlertCircle className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 text-lg font-medium">{error || "Vehicle not found"}</p>
        <Link
          href="/dashboard/customer/profile"
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-all"
        >
          Back to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6 animate-fade-in">
      {/* Back button */}
      <Link
        href="/dashboard/customer/profile"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      {/* ── Vehicle Hero ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        {/* blobs */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-20 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="relative px-6 py-8 md:px-10 md:py-10 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Vehicle image or icon */}
          <div className="relative shrink-0">
            {vehicle.imageUrl ? (
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.brand}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-4 border-white/20 shadow-2xl">
                <Car size={48} className="text-white" />
              </div>
            )}
            {vehicle.vehicleType && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500 text-white shadow whitespace-nowrap">
                {vehicle.vehicleType}
              </span>
            )}
          </div>

          {/* Vehicle info */}
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">
              My Vehicle
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {vehicle.brand}
              {vehicle.model && (
                <span className="text-orange-300 ml-2">{vehicle.model}</span>
              )}
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-mono">{vehicle.plateNumber}</p>
          </div>

          {/* badge */}
          <div className="sm:ml-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full border border-orange-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              {completedServices.length} service{completedServices.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Info Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: FiTag, label: "Brand", value: vehicle.brand },
          { icon: FiTruck, label: "Model", value: vehicle.model || "—" },
          { icon: FiHash, label: "Plate No.", value: vehicle.plateNumber },
          { icon: Car, label: "Type", value: vehicle.vehicleType || "—" },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2"
          >
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <Icon size={17} className="text-orange-600" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {label}
            </p>
            <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Last Service Summary ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <FiCalendar size={17} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-none">
              Last Service
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Most recent completed service
            </p>
          </div>
        </div>
        <div className="p-6">
          {lastService ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 space-y-1">
                <p className="font-bold text-slate-900 text-base">
                  {lastService.packageName || "Service"}
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <FiMapPin className="w-3 h-3" />
                  {lastService.serviceCenterName || "Service Center"}
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" />
                  {lastService.bookingDate}
                  {lastService.bookingTime && ` at ${lastService.bookingTime}`}
                </p>
              </div>
              <div className="text-center sm:text-right shrink-0">
                <div className="inline-flex flex-col items-center bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3">
                  <p className="text-3xl font-black text-orange-600">
                    {daysSinceLastService}
                  </p>
                  <p className="text-xs font-semibold text-orange-500 mt-0.5">
                    days ago
                  </p>
                </div>
                {daysSinceLastService !== null && daysSinceLastService > 180 && (
                  <p className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" />
                    Service overdue!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <FiTruck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">
                No completed services yet for this vehicle.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Service History ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <FiClock size={17} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-none">
              Service History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              All bookings for this vehicle
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {serviceHistory.length === 0 ? (
            <div className="py-12 text-center">
              <FiCalendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">
                No service history found for this vehicle.
              </p>
            </div>
          ) : (
            serviceHistory.map((booking, i) => (
              <div
                key={booking.bookingId || `b-${i}`}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <FiTruck className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {booking.packageName || "Service"}
                    </p>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <FiMapPin className="w-3 h-3 shrink-0" />
                      {booking.serviceCenterName || "Service Center"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <FiCalendar className="w-3 h-3 shrink-0" />
                      {booking.bookingDate}
                      {booking.bookingTime && ` · ${booking.bookingTime}`}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={booking.status} />
                  {booking.estimatedCost != null && (
                    <p className="text-xs text-slate-400 mt-1 font-semibold">
                      Rs.{Number(booking.estimatedCost).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
