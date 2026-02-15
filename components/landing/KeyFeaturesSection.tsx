import { FiShield, FiCalendar, FiBell, FiSmartphone, FiClock, FiBarChart2 } from "react-icons/fi";
import KeyFeatureCard from "@/components/landing/KeyFeatureCard";

export default function KeyFeaturesSection() {
    return (
        <section id="features" className="py-20 bg-[#140802] relative overflow-hidden">
            {/* Background Gradient */}
            <div
                className="absolute left-0 right-0 top-[35%] bottom-[25%] pointer-events-none"
                style={{
                    background: `linear-gradient(180deg, rgba(20, 8, 2, 0.5) 1%, rgba(238, 121, 61, 0.5) 51%, rgba(20, 8, 2, 0.5) 100%)`
                }}
            ></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <span className="text-[#FF6B00] font-bold text-lg mb-2 block">Key Features</span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <KeyFeatureCard
                        icon={<FiCalendar />}
                        title="Easy Online Booking"
                        description="Book your vehicle service in just a few clicks — no waiting in line!"
                    />
                    <KeyFeatureCard
                        icon={<FiBell />}
                        title="Real-Time Notifications"
                        description="Get instant alerts when your vehicle status changes or service is completed."
                    />
                    <KeyFeatureCard
                        icon={<FiSmartphone />}
                        title="Mobile & Web Access"
                        description="Access your account anywhere, anytime, from mobile or desktop."
                    />
                    <KeyFeatureCard
                        icon={<FiClock />}
                        title="Digital Service History"
                        description="All past services, bills, and reports stored safely for quick reference."
                    />
                    <KeyFeatureCard
                        icon={<FiShield />}
                        title="Secure Authentication"
                        description="Safe and reliable login using JWT technology."
                    />
                    <KeyFeatureCard
                        icon={<FiBarChart2 />}
                        title="Analytics Dashboard for Service Centers"
                        description="Owners can track bookings, revenue, and customer trends in real time."
                    />
                </div>
            </div>
        </section>
    );
}
