import { ReactNode } from "react";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    desc: string;
}

export default function FeatureCard({ icon, title, desc }: FeatureCardProps) {
    return (
        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-100 hover:shadow-xl hover:shadow-orange-100 transition-all duration-300 group">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl text-slate-600 mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">
                {desc}
            </p>
        </div>
    );
}
