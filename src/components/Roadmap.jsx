import React from 'react';
import { motion } from 'framer-motion';
import { HiMagnifyingGlassCircle, HiDocumentText, HiPaperAirplane, HiSparkles } from 'react-icons/hi2';

// Data for our roadmap steps
const roadmapSteps = [
    {
        icon: <HiMagnifyingGlassCircle />,
        title: 'Discover',
        description: "Explore thousands of scholarships tailored to your profile. Use our smart filters to find the perfect opportunity.",
    },
    {
        icon: <HiDocumentText />,
        title: 'Prepare',
        description: "We guide you on what documents you'll need, from writing a compelling Statement of Purpose (SOP) to preparing for your IELTS exam.",
    },
    {
        icon: <HiPaperAirplane className="-rotate-45" />,
        title: 'Apply',
        description: "Submit your application with confidence through our streamlined process. We ensure you have everything you need.",
    },
    {
        icon: <HiSparkles />,
        title: 'Succeed',
        description: "Your journey to a global education begins! Accept your offer and get ready for the next chapter of your life.",
    }
];

const SectionTitle = ({ children }) => (
    <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-txt">{children}</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">Your clear path to studying abroad.</p>
        <div className="w-24 h-1 bg-prm mx-auto mt-4 rounded"></div>
    </div>
);

const Roadmap = () => {
    return (
        <section className="py-20 bg-bgc">
            <div className="w-[85%] max-w-7xl mx-auto">
                <SectionTitle>Your Scholarship Roadmap</SectionTitle>

                <div className="relative">
                    {/* The Vertical Line - a visual guide */}
                    <div className="absolute left-6 top-0 h-full w-0.5 bg-divider md:left-1/2 md:-translate-x-1/2"></div>

                    <div className="space-y-12">
                        {roadmapSteps.map((step, index) => {
                            const isEven = index % 2 === 0;
                            // Animation variants for a cleaner look
                            const cardVariants = {
                                hidden: { opacity: 0, x: isEven ? -100 : 100 },
                                visible: { opacity: 1, x: 0 }
                            };
                            const iconVariants = {
                                hidden: { scale: 0 },
                                visible: { scale: 1 }
                            };

                            return (
                                <div key={index} className="relative flex items-center md:justify-center">
                                    {/* --- THIS IS THE NEW, ROBUST LAYOUT LOGIC --- */}

                                    {/* On Desktop, this div pushes the card to the left or right */}
                                    <div className={`w-full flex ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>

                                        {/* The Card itself */}
                                        <motion.div
                                            className="w-full md:w-5/12 pl-20 md:px-6"
                                            variants={cardVariants}
                                            initial="hidden"
                                            whileInView="visible"
                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                            viewport={{ once: true, amount: 0.5 }}
                                        >
                                            <div className={`bg-bbgc p-6 rounded-2xl shadow-lg border border-divider ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                                                <h3 className="text-2xl font-bold text-prm">{step.title}</h3>
                                                <p className="mt-2 text-gray-600 dark:text-gray-400">{step.description}</p>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* The Icon in the middle */}
                                    <motion.div
                                        className="absolute left-6 top-0 md:left-1/2 -translate-x-1/2 z-10"
                                        variants={iconVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        transition={{ duration: 0.5, type: 'spring', stiffness: 200, delay: 0.2 }}
                                        viewport={{ once: true, amount: 0.5 }}
                                    >
                                        <div className="bg-prm p-4 rounded-full shadow-lg border-4 border-bgc">
                                            {React.cloneElement(step.icon, { className: "w-8 h-8 text-white" })}
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Roadmap;