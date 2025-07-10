// src/pages/ScholarshipDetails.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { HiOutlineCalendar, HiOutlineCash, HiOutlineLocationMarker, HiOutlineBookOpen, HiOutlineAcademicCap, HiStar } from 'react-icons/hi';
import ApplicationModal from './Dashboard/ApplicationModal'; // We will create this next

// A simple loading skeleton for a better UX
const DetailsSkeleton = () => (
    <div className="animate-pulse container mx-auto px-4 py-12">
        <div className="bg-[--color-bbgc] h-64 w-full rounded-2xl mb-8"></div>
        <div className="bg-[--color-bbgc] h-8 w-3/4 rounded-lg mb-4"></div>
        <div className="bg-[--color-bbgc] h-6 w-1/2 rounded-lg"></div>
    </div>
);

const ScholarshipDetails = () => {
    const { id } = useParams();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch scholarship details
    const { data: scholarship, isLoading: isLoadingDetails, isError: isErrorDetails } = useQuery({
        queryKey: ['scholarshipDetails', id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/scholarships/${id}`);
            return res.data.data;
        }
    });

    // Fetch reviews for this scholarship
    const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
        queryKey: ['scholarshipReviews', id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/reviews/${id}`);
            return res.data.data;
        },
        enabled: !!scholarship, // Only run this query after scholarship details are fetched
    });

    if (isLoadingDetails) return <DetailsSkeleton />;
    if (isErrorDetails) return <div className="text-center text-red-500 py-20">Error loading scholarship details.</div>;

    return (
        <div className="bg-[--color-bgc] text-[--color-txt] min-h-screen">
            <div className="container mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="relative rounded-2xl overflow-hidden mb-8">
                    <img src={scholarship.universityImage} alt={scholarship.universityName} className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8">
                        <h1 className="text-4xl font-bold text-white">{scholarship.scholarshipName}</h1>
                        <h2 className="text-2xl text-white/90">{scholarship.universityName}</h2>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[--color-bbgc] p-6 rounded-2xl shadow-md border border-[--color-divider]">
                            <h3 className="text-2xl font-bold mb-4">Scholarship Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                                <p className="flex items-center gap-2"><HiOutlineAcademicCap className="text-[--color-prm]" /> <strong>Degree:</strong> {scholarship.degree}</p>
                                <p className="flex items-center gap-2"><HiOutlineBookOpen className="text-[--color-prm]" /> <strong>Subject:</strong> {scholarship.subjectCategory}</p>
                                <p className="flex items-center gap-2"><HiOutlineLocationMarker className="text-[--color-prm]" /> <strong>Location:</strong> {scholarship.universityCity}, {scholarship.universityCountry}</p>
                                <p className="flex items-center gap-2"><HiOutlineCalendar className="text-[--color-prm]" /> <strong>Deadline:</strong> {new Date(scholarship.applicationDeadline).toLocaleDateString()}</p>
                                <p className="flex items-center gap-2"><HiOutlineCash className="text-[--color-prm]" /> <strong>Application Fee:</strong> ${scholarship.applicationFees}</p>
                                <p className="flex items-center gap-2"><HiOutlineCash className="text-[--color-prm]" /> <strong>Service Charge:</strong> ${scholarship.serviceCharge}</p>
                            </div>
                            <div className="divider"></div>
                            <p className="text-gray-600 dark:text-gray-400">{scholarship.scholarshipDescription || "No detailed description provided."}</p>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-[--color-bbgc] p-6 rounded-2xl shadow-md border border-[--color-divider]">
                            <h3 className="text-2xl font-bold mb-4">User Reviews</h3>
                            {isLoadingReviews ? <p>Loading reviews...</p> : reviews.length > 0 ? (
                                <Swiper
                                    modules={[Navigation, Pagination, Autoplay]}
                                    spaceBetween={30}
                                    slidesPerView={1}
                                    navigation
                                    pagination={{ clickable: true }}
                                    autoplay={{ delay: 5000 }}
                                >
                                    {reviews.map(review => (
                                        <SwiperSlide key={review._id} className="p-8">
                                            <div className="text-center">
                                                <div className="flex justify-center mb-2">
                                                    {[...Array(review.ratingPoint)].map((_, i) => <HiStar key={i} className="text-yellow-400" size={24} />)}
                                                </div>
                                                <p className="italic">"{review.reviewerComments}"</p>
                                                <div className="mt-4">
                                                    <img src={review.reviewerImage} alt={review.reviewerName} className="w-12 h-12 rounded-full mx-auto mb-2" />
                                                    <p className="font-semibold">{review.reviewerName}</p>
                                                    <p className="text-sm text-gray-500">{new Date(review.reviewDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            ) : <p>No reviews yet for this scholarship.</p>}
                        </div>
                    </div>

                    {/* Right Column - Apply Button */}
                    <div className="lg:col-span-1">
                        <div className="bg-[--color-bbgc] p-6 rounded-2xl shadow-md border border-[--color-divider] sticky top-24">
                            <h3 className="text-xl font-bold mb-4">Ready to Apply?</h3>
                            <p className="mb-4 text-gray-600 dark:text-gray-400">Take the next step towards your future in {scholarship.universityCountry}.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="btn w-full text-lg text-white" style={{ backgroundColor: 'var(--color-prm)' }}>
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Modal */}
            {isModalOpen && (
                <ApplicationModal
                    scholarship={scholarship}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ScholarshipDetails;