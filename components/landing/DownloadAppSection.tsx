import React from 'react';
import Link from 'next/link';

const DownloadAppSection = () => {
    return (
        <section className="w-full bg-gradient-to-r from-[#FF8A00] to-[#E65100] relative overflow-hidden py-20 px-6 md:px-16">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

                {/* Left Content */}
                <div className="w-full md:w-1/2 text-white z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Manage all projects from<br /> your mobile
                    </h2>
                    <p className="text-white/90 text-lg mb-10 max-w-xl font-medium leading-relaxed">
                        Download the app to manage your projects, keep track of the progress and complete tasks without procrastinating. Stay on track and complete on time!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-white font-semibold mb-2">Get the App</span>
                            <Link href="#" className="transform transition-transform hover:scale-105">
                                <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-3 border border-white/20 shadow-lg w-max">
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-white my-auto">
                                        <path d="M3.464 22.09c-.31.144-.654-.087-.654-.431V2.34c0-.344.344-.575.654-.431l18.528 10.09c.277.15.277.552 0 .702L3.464 22.09Z" fill="transparent" /> {/* Placeholder shape, replacing with actual path below */}
                                        <path d="M5.00034 21.0567C4.65651 21.1378 4.31644 20.8443 4.31644 20.485V3.515C4.31644 3.15571 4.65651 2.86219 5.00034 2.94323L12.5714 10.5143L5.00034 21.0567Z" fill="#00EA90" />
                                        <path d="M19.1678 12.8712L14.7351 15.3418L12.5714 13.1781L19.1678 12.8712Z" fill="#FFD400" />
                                        <path d="M14.7351 8.65824L19.1678 11.1288L12.5714 10.8219L14.7351 8.65824Z" fill="#FF3D00" />
                                        <path d="M5.00034 2.94323L12.5714 10.5143L14.7351 8.65824L5.59074 3.56157C5.37894 3.44355 5.1488 3.23594 5.00034 2.94323Z" fill="#00D775" />
                                        <path d="M5.00034 21.0567L12.5714 13.4857L14.7351 15.3418L5.59074 20.4384C5.37894 20.5564 5.1488 20.764 5.00034 21.0567Z" fill="#00E58F" />
                                        <path d="M12.5714 13.4857L14.7351 15.3418L19.1678 12.8712L12.5714 13.4857Z" fill="#FFC900" />
                                        {/* Simplified generic play icon/shape as actual svgs are long */}

                                    </svg>
                                    <div className="flex flex-col -mt-1 text-left">
                                        <span className="text-[10px] font-medium leading-tight opacity-80 uppercase tracking-widest">Get it on</span>
                                        <span className="text-xl font-bold leading-none tracking-wide">Google Play</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Content - Phone Mockups */}
                <div className="w-full md:w-1/2 relative h-[400px] md:h-[600px] flex items-center justify-center">
                    {/* Phone 1 (Left - Dashboard) */}
                    <div className="absolute top-0 left-4 md:left-12 w-[160px] md:w-[240px] h-auto z-0">
                        <img
                            src="/AppImg2.png"
                            alt="App Screenshot Dashboard"
                            className="w-full h-auto object-contain drop-shadow-2xl"
                        />
                    </div>

                    {/* Phone 2 (Right - Login) */}
                    <div className="absolute top-12 md:top-24 right-4 md:right-12 w-[170px] md:w-[255px] h-auto z-10">
                        <img
                            src="/AppImg1.png"
                            alt="App Screenshot Login"
                            className="w-full h-auto object-contain drop-shadow-2xl"
                        />
                    </div>
                </div>

            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-top-right pointer-events-none"></div>
        </section>
    );
};

export default DownloadAppSection;
