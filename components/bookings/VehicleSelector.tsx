"use client";

import Image from "next/image";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select Vehicle</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {vehicles.map((v) => {
          const isSelected = selectedVehicleId === v.id;
          
          return (
            <div 
              key={v.id}
              onClick={() => onVehicleSelect(v.id)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                isSelected 
                  ? 'border-orange-500 ring-4 ring-orange-50 scale-105' 
                  : 'border-slate-100 hover:border-orange-200'
              }`}>
                <Image
                  src={v.image}
                  alt={v.brand}
                  fill
                  className="object-cover"
                />
              </div>
              <span className={`text-[10px] font-black tracking-tight uppercase transition-colors ${
                isSelected ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                {v.licensePlate}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
