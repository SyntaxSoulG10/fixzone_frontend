import React from 'react';
import Image from 'next/image';

const testimonials = [
    {
        id: 1,
        name: "Dinuka, Car Owner",
        text: "“FixZone made the whole process so simple. I booked my service in minutes and got updates instantly!”",
        image: "/testimonial_dinuka.png"
    },
    {
        id: 2,
        name: "Shanika, Scooter Owner",
        text: "“I didn’t have to call the service center again and again. The notifications were so helpful!”",
        image: "/testimonial_shanika.png"
    },
    {
        id: 3,
        name: "AutoCare Service Center",
        text: "“The dashboard and booking system improved our workflow a lot. Highly recommended!”",
        image: "/testimonial_autocare.png"
    },
    {
        id: 4,
        name: "Kasun, Car Owner",
        text: "“Everything feels smooth and fast. Best digital system I’ve used so far!”",
        image: "/testimonial_kasun.png"
    }
];

const TestimonialsSection = () => {
    return (
        <section className="bg-[#140802] py-24 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-orange-900/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <span className="text-[#EA580C] font-bold text-lg uppercase tracking-wide">Testimonials</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-100 leading-tight">
                        Where Technology <br className="hidden md:block" />
                        <span className="text-slate-100">Meets Trusted Service.</span>
                    </h2>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="group p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:bg-white/[0.07]"
                        >
                            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-orange-500/50 transition-colors">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow space-y-3">
                                    <p className="text-lg text-slate-300 italic font-light leading-relaxed">
                                        {testimonial.text}
                                    </p>
                                    <p className="text-[#EA580C] font-semibold text-sm uppercase tracking-wider">
                                        — {testimonial.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default TestimonialsSection;
