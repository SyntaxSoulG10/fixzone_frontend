import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            <Sidebar />
            <main className="md:pl-64 pt-20 transition-all duration-300 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
