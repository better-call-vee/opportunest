import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {/* The Outlet will render the specific page component */}
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;