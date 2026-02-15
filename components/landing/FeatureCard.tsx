import { ReactNode } from "react";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    desc: string;
}

export default function FeatureCard({ icon, title, desc }: FeatureCardProps) {
    return (
        <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-300 group hover:-translate-y-1 cursor-default">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-slate-500 leading-relaxed">
                {desc}
            </p>
        </div>
    );
}
