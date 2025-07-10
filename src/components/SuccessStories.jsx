import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCards } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';

// Manually Added Testimonials
const successStoriesData = [
    {
        id: 1,
        name: 'Sadia Islam',
        userPhoto: '/users/user1.jpg',
        university: 'University of Melbourne, Australia',
        quote: "Opportunest didn't just find me a scholarship; it paved the way for my AI research dream. The process was so clear and straightforward!",
        gif: '/c1.gif'
    },
    {
        id: 2,
        name: 'Rahim Ahmed',
        userPhoto: '/users/user2.jpg',
        university: 'University of Toronto, Canada',
        quote: "As an engineering student from Dhaka, studying in Canada felt impossible. Opportunest made it a reality. The perfect scholarship was right there.",
        gif: '/c2.gif'
    },
    {
        id: 3,
        name: 'Nimi Akter',
        userPhoto: '/users/user3.jpg',
        university: 'Technical University of Munich, Germany',
        quote: "I was worried about applying to German universities, but this platform simplified everything. I found a full-funded scholarship and my new life is amazing!",
        gif: '/c3.gif'
    }
];

// Reusable Section Title
const SectionTitle = ({ children }) => (
    <div className="text-center lg:text-left mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-txt">{children}</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">See how we've helped students like you achieve their dreams.</p>
        <div className="w-24 h-1 bg-prm mx-auto lg:mx-0 mt-4 rounded"></div>
    </div>
);

const SuccessStories = () => {
    return (
        <section className="py-20 bg-bbgc">
            {/* --- THE FIX: Added items-center to the main container --- */}
            <div className="w-[85%] max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16">

                {/* Left Side: The Text Content */}
                <div className="lg:w-1/2">
                    <SectionTitle>Success Stories</SectionTitle>
                    <p className="text-xl text-center lg:text-left text-gray-600 dark:text-gray-400 max-w-lg mx-auto lg:mx-0">
                        We're not just a platform; we're a launchpad for future leaders, researchers, and innovators. Every success story fuels our passion to connect more students with their dream education.
                    </p>
                </div>

                {/* Right Side: The Eye-Catching Carousel */}
                <div className="lg:w-1/2 w-full flex justify-center lg:justify-end">
                    <Swiper
                        effect={'cards'}
                        grabCursor={true}
                        modules={[EffectCards, Autoplay, Pagination]}
                        loop={true}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                        }}
                        pagination={{ clickable: true }}
                        // --- THE FIX: Added pb-12 for pagination space ---
                        className="w-[320px] h-[450px] pb-12"
                    >
                        {successStoriesData.map((story) => (
                            <SwiperSlide
                                key={story.id}
                                className="bg-bgc rounded-2xl shadow-xl border border-divider p-6 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-full h-40 mb-4 rounded-lg overflow-hidden border-2 border-prm">
                                    <img src={story.gif} alt="Success animation" className="w-full h-full object-cover" />
                                </div>
                                <img src={story.userPhoto} alt={story.name} className="w-20 h-20 rounded-full object-cover border-4 border-bgc -mt-14 z-10" />
                                <h3 className="text-2xl font-bold text-txt mt-2">{story.name}</h3>
                                <p className="text-md text-prm font-semibold">{story.university}</p>
                                <div className="w-10 h-0.5 bg-divider my-3"></div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">"{story.quote}"</p>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;