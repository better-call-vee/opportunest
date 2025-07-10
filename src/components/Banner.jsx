import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectCoverflow } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DotGrid from './DotGrid';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

// Data for our new interactive country cards
const featuredCountries = [
    { name: 'Australia', flag: '/aus.png' }, 
    { name: 'Canada', flag: '/can.png' },    // and Canada
    { name: 'Germany', flag: '/german.png' },
    { name: 'New Zealand', flag: '/nz.png' },
    { name: 'USA', flag: '/us.png' }
];

const Banner = () => {
    return (
        <section className="w-[85%] max-w-7xl mx-auto my-12">
            <div className="relative bg-bbgc rounded-3xl shadow-2xl border border-divider overflow-hidden">

                {/* Background Dot Grid */}
                <div className="absolute inset-0 z-0">
                    <DotGrid dotSize={2} gap={25} proximity={100} shockStrength={0.2} />
                </div>

                {/* Main Content */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[60vh] p-8">

                    {/* Left Side: Image Slider */}
                    <div className="w-full h-full flex items-center justify-center">
                        <Swiper
                            modules={[Navigation, Autoplay, EffectCoverflow]}
                            effect={'coverflow'}
                            grabCursor={true}
                            centeredSlides={true}
                            slidesPerView={'auto'}
                            loop={true}
                            autoplay={{ delay: 4000, disableOnInteraction: false }}
                            coverflowEffect={{
                                rotate: 50,
                                stretch: 0,
                                depth: 100,
                                modifier: 1,
                                slideShadows: true,
                            }}
                            className="w-full py-10"
                        >
                            {['/s1.jpg', '/s2.jpg', '/s3.jpg'].map((src, index) => (
                                <SwiperSlide key={index} style={{ width: '60%', maxWidth: '400px' }}>
                                    <div className="relative group aspect-[4/3]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-prm via-accent to-sry rounded-2xl transition-all duration-500 group-hover:blur-md group-hover:scale-105"></div>
                                        <div className="relative p-1.5 h-full">
                                            <img src={src} alt={`Banner Slide ${index + 1}`} className="w-full h-full object-cover rounded-xl shadow-lg" />
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Right Side: Text Content & Interactive Cards */}
                    <div className="relative z-10 flex flex-col justify-center items-center lg:items-start text-center lg:text-left h-full">

                        <motion.h1
                            className="text-4xl lg:text-6xl font-black text-txt leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Your Gateway to <span className="text-accent">Global</span> Education.
                        </motion.h1>

                        {/* --- NEW: Featured Countries Section --- */}
                        <motion.div
                            className="mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <p className="text-lg text-sry mb-4">Start your journey in top destinations:</p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                {featuredCountries.map((country, index) => (
                                    <motion.div
                                        key={country.name}
                                        className="bg-bgc/50 dark:bg-bgc/70 p-3 rounded-lg flex items-center gap-3 shadow-md border border-divider"
                                        whileHover={{ y: -5, scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
                                    >
                                        <img src={country.flag} alt={`${country.name} flag`} className="w-8 h-8 rounded-full object-cover" />
                                        <span className="font-semibold text-txt">{country.name}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            className="mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <Link
                                to="/all-scholarships"
                                className="btn btn-lg text-white border-none transition-transform duration-300 hover:scale-105"
                                style={{ backgroundColor: 'var(--color-prm)' }}
                            >
                                Explore All Scholarships
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;