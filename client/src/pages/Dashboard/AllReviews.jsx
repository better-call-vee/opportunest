// src/pages/Dashboard/AllReviews.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { HiTrash, HiStar } from 'react-icons/hi2';

// Reusable Section Title
const SectionTitle = ({ children }) => (
    <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[--color-txt]">{children}</h1>
        <div className="w-24 h-1 bg-[--color-prm] mx-auto mt-4 rounded"></div>
    </div>
);

// Reusable Review Card
const ReviewCard = ({ review, onDelete }) => (
    <div className="bg-[--color-bbgc] rounded-2xl shadow-lg p-6 flex flex-col border border-[--color-divider]">
        <div className="flex-grow">
            <div className="flex items-center mb-4">
                <img src={review.reviewerImage || `https://ui-avatars.com/api/?name=${review.reviewerName || 'U'}`} alt={review.reviewerName} className="w-12 h-12 rounded-full mr-4" />
                <div>
                    <h4 className="font-bold text-lg">{review.reviewerName}</h4>
                    <p className="text-xs text-gray-500">{new Date(review.reviewDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="flex items-center mb-3">
                {[...Array(review.ratingPoint)].map((_, i) => <HiStar key={i} className="text-yellow-400" size={20} />)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm italic">"{review.reviewerComments}"</p>
        </div>
        <div className="border-t border-[--color-divider] mt-4 pt-4">
            <p className="font-semibold text-sm">Reviewed: <span className="font-normal">{review.universityName}</span></p>
            <p className="font-semibold text-sm">Subject: <span className="font-normal">{review.subjectCategory}</span></p>
            <button
                onClick={() => onDelete(review._id)}
                className="btn btn-sm btn-error btn-outline w-full mt-4"
            >
                <HiTrash /> Delete Review
            </button>
        </div>
    </div>
);

// Main Component
const AllReviews = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    // Fetch all reviews
    const { data: reviews = [], isLoading, error } = useQuery({
        queryKey: ['allReviews'],
        queryFn: async () => {
            const res = await axiosSecure.get('/reviews'); // Uses the new admin/moderator route
            return res.data.data;
        }
    });

    // Mutation for deleting a review
    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/admin/reviews/${id}`), // Uses the new admin delete route
        onSuccess: () => {
            Swal.fire('Deleted!', 'The review has been successfully deleted.', 'success');
            queryClient.invalidateQueries({ queryKey: ['allReviews'] });
        },
        onError: (err) => {
            Swal.fire('Error!', err.response?.data?.message || 'Could not delete the review.', 'error');
        }
    });

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently delete the review.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-prm)',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            }
        });
    };

    if (isLoading) return <div className="text-center"><span className="loading loading-lg text-[--color-prm]"></span></div>;
    if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

    return (
        <div className="w-full">
            <SectionTitle>Manage All User Reviews</SectionTitle>

            {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reviews.map((review) => (
                        <ReviewCard key={review._id} review={review} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <p>No user reviews have been submitted yet.</p>
                </div>
            )}
        </div>
    );
};

export default AllReviews;