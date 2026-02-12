export default function StatsSection() {
    return (
        <>
            <div className="relative w-full h-auto md:h-32 bg-black z-30">
                <div className="w-full px-4 py-8 md:p-0 md:absolute md:top-full md:left-0 md:right-0 md:-translate-y-1/2">
                    <div className="max-w-6xl mx-auto bg-white rounded-[1.5rem] shadow-2xl py-8 px-6 flex flex-col md:flex-row justify-around text-center border border-slate-100">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-extrabold text-[#E65100]">1M+</h3>
                            <p className="text-slate-600 font-bold text-lg">Active Users</p>
                            <p className="text-slate-400 text-sm max-w-[180px] mx-auto leading-relaxed">Happy customers using our platform every day.</p>
                        </div>

                        <div className="hidden md:block w-px bg-slate-200"></div>

                        <div className="space-y-2">
                            <h3 className="text-3xl font-extrabold text-[#E65100]">1M+</h3>
                            <p className="text-slate-600 font-bold text-lg">Registered<br />Service Centers</p>
                            <p className="text-slate-400 text-sm max-w-[180px] mx-auto leading-relaxed">Trusted partners across the country.</p>
                        </div>

                        <div className="hidden md:block w-px bg-slate-200"></div>

                        <div className="space-y-2">
                            <h3 className="text-3xl font-extrabold text-[#E65100]">1M+</h3>
                            <p className="text-slate-600 font-bold text-lg">Services<br />Completed</p>
                            <p className="text-slate-400 text-sm max-w-[180px] mx-auto leading-relaxed">Fast, smooth, and fully digital service handling.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Buffer to push About Section down */}
            <div className="w-full h-20 bg-black"></div>
        </>
    );
}
