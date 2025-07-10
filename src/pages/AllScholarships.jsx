import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../hooks/useAxiosSecure'; // You can use this or a public axios instance
import { HiOutlineSearch, HiOutlineClock, HiOutlineLocationMarker, HiOutlineCash, HiOutlineStar } from 'react-icons/hi';
import Lottie from "lottie-react";
import noResultsAnimation from '../../public/no-results.json'; // Download a "no results" Lottie JSON and place it here

// --- Reusable Components for a Cleaner Main Component ---

// A beautiful, modern scholarship card
const ScholarshipCard = ({ scholarship }) => (
    <div className="bg-[--color-bbgc] rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-[--color-divider]">
        <img src={scholarship.universityImage} alt={`${scholarship.universityName} logo`} className="w-full h-48 object-cover" />
        <div className="p-6">
            <h3 className="text-xl font-bold text-[--color-prm] mb-2">{scholarship.scholarshipName}</h3>
            <p className="font-semibold text-[--color-txt] mb-4">{scholarship.universityName}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1"><HiOutlineLocationMarker /> {scholarship.universityCity}, {scholarship.universityCountry}</span>
                <span className="flex items-center gap-1"><HiOutlineClock /> {new Date(scholarship.applicationDeadline).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-between items-center border-t border-[--color-divider] pt-4">
                <div className="flex flex-col">
                    <span className="font-bold text-lg text-[--color-txt]">${scholarship.applicationFees}</span>
                    <span className="text-xs text-gray-500">Application Fee</span>
                </div>
                <Link to={`/scholarship/${scholarship._id}`} className="btn btn-sm text-white" style={{ backgroundColor: 'var(--color-prm)' }}>
                    View Details
                </Link>
            </div>
        </div>
    </div>
);

// A skeleton loader for a better loading experience
const CardSkeleton = () => (
    <div className="bg-[--color-bbgc] rounded-2xl shadow-lg overflow-hidden border border-[--color-divider]">
        <div className="bg-gray-300 dark:bg-gray-700 h-48 w-full animate-pulse"></div>
        <div className="p-6">
            <div className="bg-gray-300 dark:bg-gray-700 h-6 w-3/4 mb-4 rounded animate-pulse"></div>
            <div className="bg-gray-300 dark:bg-gray-700 h-4 w-1/2 mb-4 rounded animate-pulse"></div>
            <div className="bg-gray-300 dark:bg-gray-700 h-4 w-full mb-4 rounded animate-pulse"></div>
            <div className="flex justify-between items-center border-t border-[--color-divider] pt-4">
                <div className="bg-gray-300 dark:bg-gray-700 h-8 w-1/4 rounded animate-pulse"></div>
                <div className="bg-gray-300 dark:bg-gray-700 h-8 w-1/3 rounded animate-pulse"></div>
            </div>
        </div>
    </div>
);

// --- Main Component ---
const AllScholarships = () => {
    const axios = useAxiosSecure(); // Using secure for consistency, can be a public instance
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['allScholarships', currentPage, search],
        queryFn: async () => {
            const res = await axios.get(`/scholarships?page=${currentPage}&limit=${itemsPerPage}&search=${search}`);
            return res.data;
        }
    });

    const totalPages = data?.total ? Math.ceil(data.total / itemsPerPage) : 0;

    const handleSearch = (e) => {
        e.preventDefault();
        const searchText = e.target.search.value;
        setSearch(searchText);
        setCurrentPage(1); // Reset to first page on new search
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-[--color-txt]">Find Your Opportunity</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
                    Explore thousands of scholarships from top universities around the world. Your future starts here.
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
                <div className="relative">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search by scholarship, university, or degree..."
                        className="w-full p-4 pr-16 rounded-full bg-[--color-bbgc] border-2 border-[--color-divider] focus:border-[--color-prm] focus:outline-none"
                    />
                    <button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2 btn btn-circle text-white" style={{ backgroundColor: 'var(--color-prm)' }}>
                        <HiOutlineSearch size={24} />
                    </button>
                </div>
            </form>

            {/* Content Display */}
            <div>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: itemsPerPage }).map((_, index) => <CardSkeleton key={index} />)}
                    </div>
                ) : isError ? (
                    <div className="text-center text-red-500">Error: {error.message}</div>
                ) : data?.data?.length === 0 ? (
                    <div className="text-center py-16">
                        <Lottie animationData={noResultsAnimation} loop={true} style={{ maxWidth: '300px', margin: 'auto' }} />
                        <h2 className="text-2xl font-bold text-[--color-txt] mt-8">No Scholarships Found</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search terms to find what you're looking for.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.data.map(scholarship => <ScholarshipCard key={scholarship._id} scholarship={scholarship} />)}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                    <div className="join">
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="join-item btn">«</button>
                        {[...Array(totalPages).keys()].map(number => (
                            <button
                                key={number + 1}
                                onClick={() => setCurrentPage(number + 1)}
                                className={`join-item btn ${currentPage === number + 1 ? 'btn-active bg-prm text-white' : ''}`}
                            >
                                {number + 1}
                            </button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="join-item btn">»</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllScholarships;