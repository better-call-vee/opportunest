import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { HiPencil, HiTrash } from 'react-icons/hi2';

// Reusable Components
const SectionTitle = ({ children }) => (
    <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[--color-txt]">{children}</h1>
        <div className="w-24 h-1 bg-[--color-prm] mx-auto mt-4 rounded"></div>
    </div>
);

const EditReviewModal = ({ review, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm({
        defaultValues: {
            ratingPoint: review.ratingPoint,
            reviewerComments: review.reviewerComments,
        }
    });

    const onEditSubmit = (data) => {
        onSuccess(data); // Call the mutation function from the parent
    };

    return (
        <div className="fixed inset-0 bg-bgc z-50 flex justify-center items-center p-4">
            <div className="bg-[--color-bgc] p-8 rounded-2xl shadow-xl w-full max-w-lg relative">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <h2 className="text-2xl font-bold mb-4 text-center">Edit Your Review</h2>
                <p className="text-center text-gray-500 mb-6">for {review.universityName}</p>
                
                <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
                    <div>
                        <label className="block mb-2 font-medium">Rating (out of 5)</label>
                        <select {...register("ratingPoint", { required: true })} className="select select-bordered w-full bg-transparent border-[--color-divider]">
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Your Comments</label>
                        <textarea
                            {...register("reviewerComments", { required: true })}
                            className="textarea textarea-bordered w-full h-32 bg-transparent border-[--color-divider]"
                            placeholder="Share your experience..."
                        ></textarea>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="btn w-full text-white" style={{ backgroundColor: 'var(--color-prm)' }}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Main Component
const MyReviews = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    // Fetch user's reviews
    const { data: reviews = [], isLoading, error } = useQuery({
        queryKey: ['myReviews'],
        queryFn: async () => {
            const res = await axiosSecure.get('/my-reviews');
            return res.data.data;
        }
    });

    // Mutation for deleting a review
    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/reviews/${id}`),
        onSuccess: () => {
            Swal.fire('Deleted!', 'Your review has been deleted.', 'success');
            queryClient.invalidateQueries({ queryKey: ['myReviews'] });
        }
    });

    // Mutation for updating a review
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => axiosSecure.patch(`/reviews/${id}`, data),
        onSuccess: () => {
            setIsEditModalOpen(false);
            Swal.fire('Updated!', 'Your review has been updated.', 'success');
            queryClient.invalidateQueries({ queryKey: ['myReviews'] });
        }
    });

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone.",
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

    const handleEditOpen = (review) => {
        setSelectedReview(review);
        setIsEditModalOpen(true);
    };

    if (isLoading) return <div className="text-center"><span className="loading loading-lg text-[--color-prm]"></span></div>;
    if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

    return (
        <div className="w-full">
            <SectionTitle>My Reviews</SectionTitle>
            <div className="overflow-x-auto bg-[--color-bbgc] rounded-2xl shadow-lg p-4 border border-[--color-divider]">
                <table className="table w-full">
                    <thead className="text-sm text-[--color-txt] uppercase">
                        <tr>
                            <th>Scholarship & University</th>
                            <th>Review Date</th>
                            <th>Review Comment</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.length > 0 ? reviews.map((review) => (
                            <tr key={review._id} className="hover:bg-[--color-bgc]">
                                <td>
                                    <div className="font-bold">{review.scholarshipName || 'N/A'}</div>
                                    <div className="text-sm opacity-70">{review.universityName}</div>
                                </td>
                                <td>{new Date(review.reviewDate).toLocaleDateString()}</td>
                                <td className="max-w-sm whitespace-pre-wrap">{review.reviewerComments}</td>
                                <td className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEditOpen(review)} className="btn btn-sm btn-circle bg-yellow-500 text-white hover:bg-yellow-600 border-none" aria-label="Edit"><HiPencil size={16} /></button>
                                        <button onClick={() => handleDelete(review._id)} className="btn btn-sm btn-circle bg-red-500 text-white hover:bg-red-600 border-none" aria-label="Delete"><HiTrash size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-500">You have not written any reviews yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isEditModalOpen && (
                <EditReviewModal
                    review={selectedReview}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={(data) => {
                        updateMutation.mutate({ id: selectedReview._id, data });
                    }}
                />
            )}
        </div>
    );
};

export default MyReviews;