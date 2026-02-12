export default function AboutSection() {
    return (
        <section id="about" className="w-full flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 h-[300px] md:h-[500px] relative">
                <img
                    src="/AboutUs_Pic.jpeg"
                    alt="Mechanic working on car"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="w-full md:w-1/2 bg-[#FFF9F4] flex flex-col justify-center px-8 md:px-16 pt-24 pb-16">
                <span className="text-[#FF6B00] font-bold text-base mb-3">About Us</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 leading-tight">
                    Where Technology Meets Trusted Service.
                </h2>
                <p className="text-slate-500 leading-relaxed text-base md:text-lg mb-6">
                    FixZone is built to make vehicle servicing easier, faster, and more transparent for everyone.
                </p>
                <p className="text-slate-500 leading-relaxed text-base md:text-lg">
                    We understand that managing vehicle service records, tracking repairs, and waiting for updates can be stressful — so we created a smart solution to fix that.
                </p>
            </div>
        </section>
    );
}
