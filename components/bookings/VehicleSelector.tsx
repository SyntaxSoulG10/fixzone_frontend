"use client";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  image: string;
}

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onVehicleSelect: (id: string) => void;
}

export default function VehicleSelector({ vehicles, selectedVehicleId, onVehicleSelect }: VehicleSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select Vehicle</h3>

      <div className="flex flex-col gap-2">
        {vehicles.map((v) => {
          const isSelected = selectedVehicleId === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onVehicleSelect(v.id)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-orange-500 bg-orange-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50"
              }`}
            >
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${isSelected ? "text-orange-700" : "text-slate-800"}`}>
                  {v.brand}{v.model ? ` ${v.model}` : ""}
                </p>
                <p className={`text-xs truncate mt-0.5 ${isSelected ? "text-orange-500" : "text-slate-400"}`}>
                  {v.licensePlate}
                </p>
              </div>
              {isSelected && (
                <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
