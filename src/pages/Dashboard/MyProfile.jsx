import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import Lottie from "lottie-react";
import AuthContext from '../../provider/AuthContext';
import dashboardAnimation from '../../../public/dashboard-lt.json'; // Make sure this path is correct

const MyProfile = () => {
    const { user, role } = useContext(AuthContext);

    // A simple loading state in case user data isn't ready yet
    if (!user) {
        return <div className="text-center">Loading Profile...</div>;
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full max-w-5xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Lottie Animation Column */}
                <div className="lg:col-span-2 flex items-center justify-center p-4">
                    <Lottie animationData={dashboardAnimation} loop={true} style={{ maxWidth: '300px' }} />
                </div>

                {/* Profile Card Column */}
                <div className="lg:col-span-3 flex items-center">
                    <div className="w-full p-8 bg-[--color-bbgc] rounded-2xl shadow-lg border border-[--color-divider] text-center">

                        <div className="relative inline-block mb-6">
                            <img
                                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name || 'U'}&size=128`}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover mx-auto"
                            />
                            {/* Animated Border */}
                            <div className="absolute inset-0 rounded-full border-4 border-[--color-prm] animate-pulse"></div>
                        </div>

                        <h1 className="text-3xl font-bold text-[--color-txt]">{user.name}</h1>
                        <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>

                        {/* Role Badge - only shown for admin or moderator */}
                        {(role === 'admin' || role === 'moderator') && (
                            <div className="mt-4">
                                <span
                                    className="px-4 py-1 text-sm font-semibold text-white rounded-full capitalize"
                                    style={{ backgroundColor: 'var(--color-prm)' }}
                                >
                                    {role}
                                </span>
                            </div>
                        )}

                        <div className="mt-8 border-t border-[--color-divider] pt-6">
                            <p className="text-gray-600 dark:text-gray-300">
                                Welcome to your dashboard! From here, you can manage your applications, reviews, and profile settings.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MyProfile;