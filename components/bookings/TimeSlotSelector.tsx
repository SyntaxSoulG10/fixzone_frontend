"use client";

import { useMemo } from "react";
import { FiSun, FiMoon, FiCheck, FiCalendar } from "react-icons/fi";
import { format, isSameDay } from "date-fns";

export interface TimeSlot {
  time: string;
  status: "available" | "busy";
}

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  durationMins?: number;
  isLoading?: boolean;
  selectedDate?: Date | null;
}

/**
 * Parses time strings like "08:00 AM", "8:00 AM", "01:00 PM", "13:00" into 24-hour hour & minute.
 */
function parseTimeString(timeStr: string): { hour: number; minute: number } | null {
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();

  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return { hour, minute };
}

/**
 * Categorizes a time slot into Morning (before 12:00 PM) or Evening (1:00 PM onwards).
 */
function isMorningSlot(timeStr: string): boolean {
  const parsed = parseTimeString(timeStr);
  if (!parsed) {
    return timeStr.includes("AM") || timeStr.startsWith("08") || timeStr.startsWith("09") || timeStr.startsWith("10") || timeStr.startsWith("11");
  }
  return parsed.hour < 12;
}

export default function TimeSlotSelector({
  slots,
  selectedTime,
  onTimeSelect,
  durationMins = 60,
  isLoading = false,
  selectedDate,
}: TimeSlotSelectorProps) {
  const isToday = selectedDate ? isSameDay(selectedDate, new Date()) : false;
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  // If selecting today, filter out any past slots so they vanish automatically
  const activeSlots = useMemo(() => {
    if (!isToday) {
      return slots;
    }
    return slots.filter((slot) => {
      const parsed = parseTimeString(slot.time);
      if (!parsed) return true;
      const slotMins = parsed.hour * 60 + parsed.minute;
      return slotMins > currentMins;
    });
  }, [slots, isToday, currentMins]);

  const morningSlots = activeSlots.filter((s) => isMorningSlot(s.time));
  const eveningSlots = activeSlots.filter((s) => !isMorningSlot(s.time));

  // 6:00 PM (18:00) minus package duration
  const lastPossibleSlotMins = 18 * 60 - durationMins;
  const isPastTodayCutoff = isToday && currentMins >= lastPossibleSlotMins;

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-700">
            Checking live availability...
          </p>
          {selectedDate && (
            <p className="text-xs text-slate-400">
              Loading slots for {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (activeSlots.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          <FiCalendar className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800">
            {isPastTodayCutoff ? "Booking Closed for Today" : "All Slots Booked"}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {selectedDate
              ? isPastTodayCutoff
                ? "The last service booking time for today has passed. Please select a another date to book your service."
                : `All booking time slots on ${format(selectedDate, "EEE, MMM d")} are Booked. Please select another date to book your service.`
              : "Please select a date to check available slots."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Morning Session */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
            <FiSun className="w-4 h-4" />
          </div>
          <h4 className="text-base font-bold text-slate-800 tracking-tight">Morning Session</h4>
        </div>

        {morningSlots.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {morningSlots.map((slot, idx) => {
              const isSelected = selectedTime === slot.time;
              const isBusy = slot.status === "busy";

              return (
                <button
                  key={`morning-${idx}`}
                  type="button"
                  disabled={isBusy}
                  onClick={() => onTimeSelect(slot.time)}
                  className={`relative flex flex-col items-center justify-center py-4 px-3 rounded-2xl border-2 transition-all duration-200 group ${
                    isSelected
                      ? "border-orange-500 bg-white ring-4 ring-orange-100 shadow-md scale-[1.02]"
                      : isBusy
                      ? "border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-50"
                      : "border-slate-200/80 bg-white hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-sm"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                      <FiCheck className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <span
                    className={`text-base font-black tracking-tight ${
                      isSelected ? "text-orange-600" : isBusy ? "text-slate-300" : "text-slate-800"
                    }`}
                  >
                    {slot.time}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-orange-100 text-orange-700"
                        : isBusy
                        ? "bg-slate-100 text-slate-400"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {isBusy ? "Busy" : "Available"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
            {isToday && currentMins >= 12 * 60
              ? "Morning session has concluded for today."
              : "No morning slots available for this date."}
          </div>
        )}
      </div>

      {/* Evening Session */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
            <FiMoon className="w-4 h-4" />
          </div>
          <h4 className="text-base font-bold text-slate-800 tracking-tight">Evening Session</h4>
        </div>

        {eveningSlots.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {eveningSlots.map((slot, idx) => {
              const isSelected = selectedTime === slot.time;
              const isBusy = slot.status === "busy";

              return (
                <button
                  key={`evening-${idx}`}
                  type="button"
                  disabled={isBusy}
                  onClick={() => onTimeSelect(slot.time)}
                  className={`relative flex flex-col items-center justify-center py-4 px-3 rounded-2xl border-2 transition-all duration-200 group ${
                    isSelected
                      ? "border-orange-500 bg-white ring-4 ring-orange-100 shadow-md scale-[1.02]"
                      : isBusy
                      ? "border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-50"
                      : "border-slate-200/80 bg-white hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-sm"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                      <FiCheck className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <span
                    className={`text-base font-black tracking-tight ${
                      isSelected ? "text-orange-600" : isBusy ? "text-slate-300" : "text-slate-800"
                    }`}
                  >
                    {slot.time}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-orange-100 text-orange-700"
                        : isBusy
                        ? "bg-slate-100 text-slate-400"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {isBusy ? "Busy" : "Available"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
            {isPastTodayCutoff
              ? "Evening session booking has closed for today."
              : "No evening slots available for this date."}
          </div>
        )}
      </div>
    </div>
  );
}
