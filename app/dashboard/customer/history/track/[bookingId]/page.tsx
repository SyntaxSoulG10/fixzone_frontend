"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/UI/PageHeader";
import Button from "@/components/UI/Button";
import { FiCheckCircle, FiCircle, FiArrowLeft } from "react-icons/fi";

const STATUS_STEPS = [
  { label: "Booking confirmed", key: "confirmed" },
  { label: "Vehicle received", key: "vehicle-in" },
  { label: "Service in progress", key: "in-progress" },
  { label: "Quality check", key: "quality-check" },
  { label: "Ready for pickup", key: "ready" },
];

const BOOKING_TRACK: Record<string, { currentStepIndex: number; service: string; vehicle: string }> = {
  "1": { currentStepIndex: 2, service: "ABC Service Station", vehicle: "Honda Civic 2020" },
};

export default function TrackStatusPage() {
  const params = useParams();
  const bookingId = String(params?.bookingId ?? "");
  const data = BOOKING_TRACK[bookingId] ?? {
    currentStepIndex: 0,
    service: "Service Center",
    vehicle: "Your vehicle",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Track Status"
        description={`See where your booking is in the process`}
      />

      <Link href="/dashboard/customer/history">
        <Button className="mb-4 px-4 py-2 text-sm border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
          <FiArrowLeft className="w-4 h-4" />
          Back to My Bookings
        </Button>
      </Link>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="font-bold text-slate-900 text-lg">{data.service}</h2>
          <p className="text-sm text-slate-500">{data.vehicle}</p>
        </div>

        <div className="relative">
          {STATUS_STEPS.map((step, index) => {
            const isDone = index < data.currentStepIndex;
            const isCurrent = index === data.currentStepIndex;
            return (
              <div key={step.key} className="flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                      isDone
                        ? "bg-green-500 border-green-500 text-white"
                        : isCurrent
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-white border-slate-200 text-slate-400"
                    }`}
                  >
                    {isDone ? (
                      <FiCheckCircle className="w-5 h-5" />
                    ) : (
                      <FiCircle className={`w-5 h-5 ${isCurrent ? "fill-orange-500" : ""}`} />
                    )}
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 min-h-[24px] ${
                        isDone ? "bg-green-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
                <div className="pt-1.5">
                  <p
                    className={`font-semibold ${
                      isCurrent ? "text-orange-600" : isDone ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                    {isCurrent && (
                      <span className="ml-2 text-xs font-normal text-orange-600">(Current)</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
