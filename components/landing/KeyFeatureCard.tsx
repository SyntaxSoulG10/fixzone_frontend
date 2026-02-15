import React from "react";

interface KeyFeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const KeyFeatureCard: React.FC<KeyFeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="h-full flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
            <div className="mb-6 text-white text-5xl">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-white/60 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    );
};

export default KeyFeatureCard;
