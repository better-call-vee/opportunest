import React, { useState, useContext, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../provider/AuthContext';
import Swal from 'sweetalert2';
import {
    HiBars3,
    HiXMark,
    HiHome,
    HiAcademicCap,
    HiUser,
    HiShieldCheck,
    HiSun,
    HiMoon
} from "react-icons/hi2";
import { motion, AnimatePresence } from 'framer-motion';

// Custom hook to manage the theme logic
const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);



    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    return [theme, toggleTheme];
};

const Navbar = () => {
    const { user, role, loading, logOut } = useContext(AuthContext);
    // console.log("Navbar received user:", user);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [theme, toggleTheme] = useTheme();

    const closeAllMenus = () => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
    };

    const handleLogOut = () => {
        closeAllMenus(); // Close the menu immediately when the button is clicked

        Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-prm)',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, log me out!'
        }).then((result) => {
            if (result.isConfirmed) {
                logOut()
                    .then(() => {
                        // This alert shows after the logout is successful
                        Swal.fire({
                            title: 'Logged Out!',
                            text: 'You have been successfully logged out.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    })
                    .catch(error => {
                        console.error("Logout Error:", error);
                        Swal.fire(
                            'Logout Failed',
                            'An error occurred while logging out.',
                            'error'
                        );
                    });
            }
        });
    };

    const activeLinkStyle = { color: 'var(--color-prm)', fontWeight: '600' };

    const navLinks = (
        <>
            <li><NavLink to="/" onClick={closeAllMenus} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center gap-2 hover:text-[--color-prm] transition-colors duration-300"><HiHome /> Home</NavLink></li>
            <li><NavLink to="/all-scholarships" onClick={closeAllMenus} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center gap-2 hover:text-[--color-prm] transition-colors duration-300"><HiAcademicCap /> All Scholarship</NavLink></li>
            {user && (
                <li><NavLink to="/dashboard/my-profile" onClick={closeAllMenus} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center gap-2 hover:text-[--color-prm] transition-colors duration-300">
                    {role === 'admin' ? <HiShieldCheck /> : <HiUser />} Dashboard
                </NavLink></li>
            )}
        </>
    );

    return (
        <>
            {/* SHARED OVERLAY for both mobile menu and profile dropdown */}
            <AnimatePresence>
                {(isMobileMenuOpen || isDropdownOpen) && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeAllMenus}
                    />
                )}
            </AnimatePresence>

            <header className="bg-[--color-bbgc]/80 dark:bg-[--color-bgc]/80 backdrop-blur-lg shadow-md sticky top-0 z-50">
                <nav className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" onClick={closeAllMenus}>
                            <img src="/logo-light.png" alt="Opportunest Logo" className="h-50 block dark:hidden" />
                            <img src="/logo-dark.png" alt="Opportunest Logo" className="h-50 hidden dark:block" />
                        </Link>

                        <ul className="hidden md:flex items-center space-x-6 font-medium">{navLinks}</ul>

                        <div className="flex items-center gap-2">
                            <button onClick={toggleTheme} className="btn btn-ghost btn-circle" aria-label="Toggle theme">
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div key={theme} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        {theme === 'light' ? <HiSun size={24} /> : <HiMoon size={24} />}
                                    </motion.div>
                                </AnimatePresence>
                            </button>

                            {user ? (
                                <div className="relative">
                                    <button onClick={() => setIsDropdownOpen(p => !p)} className="btn btn-ghost btn-circle avatar">
                                        <div className="w-10 rounded-full ring ring-[--color-prm] ring-offset-base-100 ring-offset-2">
                                            <img alt="User Profile" src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=random`} />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.ul
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full right-0 mt-3 p-2 shadow menu menu-sm bg-[--color-bbgc] rounded-box w-52 border border-[--color-divider]"
                                            >
                                                <li className="p-2 font-semibold">Hello, {user.displayName}</li>
                                                <li className="p-2 capitalize">Role: <span className="badge border-none text-white" style={{ backgroundColor: 'var(--color-prm)' }}>{role}</span></li>
                                                <div className="divider my-0"></div>
                                                <li><button onClick={handleLogOut} className="btn btn-ghost w-full justify-start text-txt hover:bg-red-500 hover:text-white">Logout</button></li>
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                !loading && <Link to="/login" className="hidden md:inline-block text-white font-semibold px-5 py-2.5 rounded-lg transition-transform duration-300 hover:scale-105" style={{ backgroundColor: 'var(--color-prm)' }}>Login</Link>
                            )}

                            <button className="md:hidden btn btn-ghost btn-circle" onClick={() => setIsMobileMenuOpen(p => !p)} aria-label="Open menu">
                                {isMobileMenuOpen ? <HiXMark size={28} /> : <HiBars3 size={28} />}
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[--color-bgc] shadow-xl z-50"
                    >
                        <ul className="flex flex-col space-y-6 p-8 pt-24 text-lg font-medium">
                            {navLinks}
                            {!user && !loading && (<li className="w-full pt-4"><Link to="/login" className="btn w-full text-white" style={{ backgroundColor: 'var(--color-prm)' }} onClick={closeAllMenus}>Login</Link></li>)}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
