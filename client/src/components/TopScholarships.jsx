import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { HiClock, HiMapPin } from 'react-icons/hi2';

// Reusable Section Title (no changes here, but kept for context)
const SectionTitle = ({ children }) => (
    <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-txt">{children}</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">Handpicked opportunities just for you.</p>
        <div className="w-24 h-1 bg-prm mx-auto mt-4 rounded"></div>
    </div>
);

// --- IMPROVED, MORE PROFESSIONAL SCHOLARSHIP CARD ---
const ScholarshipCard = ({ scholarship, index }) => (
    <motion.div
        className="group relative bg-bbgc rounded-2xl shadow-lg overflow-hidden border border-divider transition-all duration-300"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
    >
        {/* Glowing border effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-prm rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>

        <div className="relative bg-bbgc rounded-2xl h-full flex flex-col">
            <div className="relative">
                <img src={scholarship.universityImage} alt={`${scholarship.universityName} campus`} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 bg-prm text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {scholarship.scholarshipCategory}
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-prm mb-2 truncate">{scholarship.scholarshipName}</h3>
                <p className="font-semibold text-txt mb-4 flex-grow">{scholarship.universityName}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><HiMapPin /> {scholarship.universityCity}, {scholarship.universityCountry}</span>
                    <span className="flex items-center gap-1"><HiClock /> {new Date(scholarship.applicationDeadline).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between items-center border-t border-divider pt-4 mt-auto">
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-txt">${scholarship.applicationFees}</span>
                        <span className="text-xs text-gray-500">Application Fee</span>
                    </div>
                    <Link to={`/scholarship/${scholarship._id}`} className="btn btn-sm text-white" style={{ backgroundColor: 'var(--color-prm)' }}>
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    </motion.div>
);

// Main Component
const TopScholarships = () => {
    const { data: topScholarships = [], isLoading, error } = useQuery({
        queryKey: ['topScholarships'],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/scholarships-top`);
            return res.data.data;
        }
    });

    if (error) return <div className="text-center text-red-500">Failed to load top scholarships.</div>;

    return (
        // --- FIX: Added consistent alignment and max-width ---
        <section className="py-20 bg-bgc w-[85%] max-w-7xl mx-auto">
            <SectionTitle>Top Scholarships</SectionTitle>

            {isLoading ? (
                <div className="text-center"><span className="loading loading-lg text-prm"></span></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {topScholarships.map((scholarship, index) => (
                        <ScholarshipCard key={scholarship._id} scholarship={scholarship} index={index} />
                    ))}
                </div>
            )}

            {/* --- NEW: Professional Call-to-Action Section --- */}
            <div className="mt-20 text-center bg-bbgc border border-divider rounded-2xl p-10 flex flex-col lg:flex-row items-center justify-center gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <img src="/ts.gif" alt="Apply Now" className="w-64 rounded-lg border-4 border-prm shadow-2xl" />
                </motion.div>
                <div className="lg:text-left">
                    <h3 className="text-3xl font-bold text-txt">Ready to Find More?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Explore our full catalog of scholarships and find the perfect one for you.</p>
                    <Link to="/all-scholarships" className="btn btn-lg text-white border-none transition-transform duration-300 hover:scale-105 mt-6" style={{ backgroundColor: 'var(--color-prm)' }}>
                        View All Scholarships
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TopScholarships;