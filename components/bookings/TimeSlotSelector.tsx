"use client";

import { FiClock } from "react-icons/fi";

export interface TimeSlot {
  time: string;
  status: "available" | "busy";
}

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

export default function TimeSlotSelector({ slots, selectedTime, onTimeSelect }: TimeSlotSelectorProps) {
  const availableCount = slots.filter(s => s.status === "available").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select Time</h3>
        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-orange-100">
          {availableCount} Slots Open
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {slots.map((slot, idx) => {
          const isSelected = selectedTime === slot.time;
          const isBusy = slot.status === "busy";

          return (
            <button
              key={idx}
              disabled={isBusy}
              onClick={() => onTimeSelect(slot.time)}
              className={`relative flex flex-col items-center justify-center py-5 rounded-2xl border-2 transition-all duration-300 ${
                isSelected 
                  ? 'border-orange-500 bg-white ring-4 ring-orange-100 shadow-md' 
                  : isBusy 
                    ? 'border-slate-50 bg-slate-50/50 cursor-not-allowed opacity-60' 
                    : 'border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/30'
              }`}
            >
              <span className={`text-lg font-black tracking-tight ${
                isSelected ? 'text-slate-900' : isBusy ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {slot.time}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${
                isSelected ? 'text-orange-500' : isBusy ? 'text-slate-300' : 'text-green-500'
              }`}>
                {isBusy ? 'Busy' : 'Available'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
