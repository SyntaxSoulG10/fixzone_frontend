"use client";

import { FiArrowRight, FiInfo } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface BookingSummaryProps {
  totalPrice: number;
  isValid: boolean;
  onSpecialRequestChange: (text: string) => void;
  specialRequest: string;
}

export default function BookingSummary({ totalPrice, isValid, onSpecialRequestChange, specialRequest }: BookingSummaryProps) {
  const router = useRouter();

  const handleProceed = () => {
    if (isValid) {
      router.push("/dashboard/customer/checkout");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-8 sticky top-6">
      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          Special Request <span className="text-[10px] font-medium text-slate-300 tracking-normal">(Optional)</span>
        </label>
        <textarea
          placeholder="Describe any specific issues (e.g. 'Strange noise from rear left tire')..."
          value={specialRequest}
          onChange={(e) => onSpecialRequestChange(e.target.value)}
          className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-50 focus:border-orange-500 transition-all resize-none"
        />
      </div>

      <div className="pt-6 border-t border-slate-50">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Estimate</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-400">LKR</span>
              <span className="text-4xl font-black text-slate-900 leading-none">
                {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter self-end">
            <FiInfo className="w-3.5 h-3.5" />
            Prices May Vary
          </div>
        </div>

        <button
          onClick={handleProceed}
          disabled={!isValid}
          className={`group flex items-center justify-between w-full p-6 h-16 rounded-2xl font-bold transition-all duration-500 ${
            isValid 
              ? 'bg-orange-500 text-white shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-95' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed grayscale'
          }`}
        >
          <span className="text-lg">Proceed to Payment</span>
          <FiArrowRight className={`w-6 h-6 transition-transform duration-500 ${isValid ? 'group-hover:translate-x-2' : ''}`} />
        </button>

        <p className="mt-4 text-[10px] text-center text-slate-400 leading-relaxed max-w-[80%] mx-auto">
          By proceeding, you agree to our <span className="font-bold border-b border-slate-200 text-slate-500">Terms of Service</span>
        </p>
      </div>
    </div>
  );
}
