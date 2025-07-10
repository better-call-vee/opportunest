import React, { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../provider/AuthContext';
import {
    // Corrected Icon Names for Heroicons v2 (hi2)
    HiUserCircle,
    HiClipboardDocumentList,
    HiChatBubbleLeftEllipsis,
    HiPlusCircle,
    HiRectangleStack,
    HiEye,
    HiUsers,
    HiChartPie,
    HiHome,
    HiBars3,
    HiXMark
} from 'react-icons/hi2';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
    const { user, role } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const activeStyle = {
        backgroundColor: 'var(--color-prm)',
        color: 'white'
    };

    const commonLinkClasses = "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-hv hover:text-black";

    const userLinks = (
        <>
            <li><NavLink to="/dashboard/my-profile" className={commonLinkClasses} style={({ isActive }) => isActive ? activeStyle : undefined}><HiUserCircle size={20} /> My Profile</NavLink></li>
            <li><NavLink to="/dashboard/my-applications" className={commonLinkClasses} style={({ isActive }) => isActive ? activeStyle : undefined}><HiClipboardDocumentList size={20} /> My Applications</NavLink></li>
            <li><NavLink to="/dashboard/my-reviews" className={commonLinkClasses} style={({ isActive }) => isActive ? activeStyle : undefined}><HiChatBubbleLeftEllipsis size={20} /> My Reviews</NavLink></li>
        </>
    );

    const moderatorLinks = (
        <>
            {userLinks}
            <div className="divider my-2"></div>
            <li className="menu-title text-txt"><span>Moderator Actions</span></li>
            <li><NavLink to="/dashboard/add-scholarship" className={commonLinkClasses} style={({ isActive }) => isActive ? activeStyle : undefined}><HiPlusCircle size={20} /> Add Scholarship</NavLink></li>
            <li><NavLink to="/dashboard/manage-scholarships" className={commonLinkClasses} style={({ isActive }) => isActive ? activeStyle : undefined}><HiRectangleStack size={20} /> Manage Scholarships</NavLink></li>
            <li><NavLink to="/dashboard/all-reviews" className={commonLinkClasses} style={({ isActive }) => isActive ? activeStyle : undefined}><HiEye size={20} /> All Reviews</NavLink></li>
            <li><NavLink to="/dashboard/all-applied-scholarship" className={commonLinkClasses} style={({ isActive }) => isActive ? activeStyle : undefined}><HiClipboardDocumentList size={20} /> All Applied</NavLink></li>
        </>
    );

    const adminLinks = (
        <>
            {moderatorLinks}
            <div className="divider my-2"></div>
            <li className="menu-title text-txt"><span>Admin Actions</span></li>
            <li><NavLink to="/dashboard/manage-users" className={commonLinkClasses} style={({ isActive }) => isActive ? activeStyle : undefined}><HiUsers size={20} /> Manage Users</NavLink></li>
            <li><NavLink to="/dashboard/analytics" className={commonLinkClasses} style={({ isActive }) => isActive ? activeStyle : undefined}><HiChartPie size={20} /> Analytics</NavLink></li>
        </>
    );

    const sidebarContent = (
        // FIX: Changed background to --color-bgc for a solid look
        <div className="flex flex-col h-full p-4 bg-[--color-bgc] text-[--color-txt]">
            <div className="p-4 mb-4 text-center border-b border-[--color-divider]">
                <div className="avatar mx-auto">
                    <div className="w-24 rounded-full ring-2 ring-[--color-prm] ring-offset-base-100 ring-offset-4">
                        <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name || 'U'}`} alt="User" />
                    </div>
                </div>
                <h2 className="mt-4 text-xl font-bold">{user?.name}</h2>
                <p className="text-sm capitalize">{role}</p>
            </div>
            {/* FIX: Removed text-base-content to allow text color to be inherited */}
            <ul className="menu flex-grow">
                {role === 'admin' ? adminLinks : role === 'moderator' ? moderatorLinks : userLinks}
            </ul>
            <div className="divider my-2"></div>
            <ul className="menu">
                <li><NavLink to="/" className={commonLinkClasses}><HiHome size={20} /> Back to Home</NavLink></li>
            </ul>
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="relative min-h-screen md:flex">
                {/* Mobile Header with Hamburger Menu */}
                <div className="md:hidden flex justify-between items-center p-4 bg-[--color-bbgc] text-[--color-txt] shadow-md">
                    <h1 className="text-xl font-bold">Dashboard</h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="btn btn-square btn-ghost">
                        <HiBars3 size={28} />
                    </button>
                </div>

                {/* Mobile Sidebar with Animation */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <>
                            <motion.div
                                className="fixed inset-0 bg-bgc z-30 md:hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                            />
                            <motion.div
                                className="fixed top-0 left-0 h-full w-80 z-40"
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "tween", ease: "easeInOut" }}
                            >
                                {sidebarContent}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Desktop Sidebar */}
                <div className="hidden md:block w-80 border-r border-[--color-divider]">
                    {sidebarContent}
                </div>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-10 bg-[--color-bgc]">
                    <Outlet />
                </main>
            </div>
        </>
    );
};

export default DashboardLayout;