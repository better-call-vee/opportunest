import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub } from 'react-icons/fa';
import { HiOutlineArrowRight } from 'react-icons/hi2';

const Footer = () => {
    return (
        <footer className="bg-bbgc border-t border-divider text-txt">
            <div className="w-[85%] max-w-7xl mx-auto px-4">

                {/* Main Footer Content */}
                <div className="py-16 flex flex-col lg:flex-row justify-between gap-12">

                    {/* Left Side: Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/">
                            {/* KEPT YOUR h-50 REQUIREMENT */}
                            <img src="/logo-light.png" alt="Opportunest Logo" className="h-50 block dark:hidden" />
                            <img src="/logo-dark.png" alt="Opportunest Logo" className="h-50 hidden dark:block" />
                        </Link>
                    </div>

                    {/* Right Side: All Link Columns */}
                    <div className="w-full lg:w-auto grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-bold text-lg text-txt mb-4">Quick Links</h3>
                            <ul className="space-y-3">
                                <li><Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-prm transition-colors duration-300">Home</Link></li>
                                <li><Link to="/all-scholarships" className="text-gray-500 dark:text-gray-400 hover:text-prm transition-colors duration-300">All Scholarships</Link></li>
                                <li><Link to="/dashboard/my-profile" className="text-gray-500 dark:text-gray-400 hover:text-prm transition-colors duration-300">My Dashboard</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-txt mb-4">Legal</h3>
                            <ul className="space-y-3">
                                <li><Link to="/about" className="text-gray-500 dark:text-gray-400 hover:text-prm transition-colors duration-300">About Us</Link></li>
                                <li><Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-prm transition-colors duration-300">Contact</Link></li>
                                <li><Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-prm transition-colors duration-300">Privacy Policy</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-txt mb-4">Stay Updated</h3>
                            <form className="flex">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full p-3 bg-bgc rounded-l-lg border-2 border-r-0 border-divider focus:border-prm focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="p-3 text-white rounded-r-lg transition-transform duration-300 hover:scale-105"
                                    style={{ backgroundColor: 'var(--color-prm)' }}
                                    aria-label="Subscribe to newsletter"
                                >
                                    <HiOutlineArrowRight size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-8 border-t border-divider flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                        &copy; {new Date().getFullYear()} Opportunest. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-5">
                        <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-prm transition-transform duration-300 hover:scale-125" aria-label="Facebook"><FaFacebookF size={20} /></a>
                        <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-prm transition-transform duration-300 hover:scale-125" aria-label="Twitter"><FaTwitter size={20} /></a>
                        <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-prm transition-transform duration-300 hover:scale-125" aria-label="LinkedIn"><FaLinkedinIn size={20} /></a>
                        <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-prm transition-transform duration-300 hover:scale-125" aria-label="Github"><FaGithub size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;