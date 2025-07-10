import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const AddReviewModal = ({ scholarshipInfo, onClose }) => {
    const { register, handleSubmit, reset } = useForm();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const addReviewMutation = useMutation({
        mutationFn: (reviewData) => axiosSecure.post('/reviews', reviewData),
        onSuccess: () => {
            Swal.fire('Thank You!', 'Your review has been submitted.', 'success');
            queryClient.invalidateQueries({ queryKey: ['scholarshipReviews', scholarshipInfo.scholarshipId] });
            onClose();
        },
        onError: (error) => {
            Swal.fire('Error', error.response?.data?.message || 'Failed to submit review.', 'error');
        }
    });

    const onSubmit = (data) => {
        const reviewData = {
            ratingPoint: parseInt(data.ratingPoint, 10),
            reviewerComments: data.reviewerComments,
            scholarshipName: scholarshipInfo.scholarshipName,
            scholarship_id: scholarshipInfo.scholarshipId,
            universityName: scholarshipInfo.universityName,
        };
        addReviewMutation.mutate(reviewData);
    };

    return (
        <div className="fixed inset-0 bg-bgc z-50 flex justify-center items-center p-4">
            <div className="bg-[--color-bgc] p-8 rounded-2xl shadow-xl w-full max-w-lg relative">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <h2 className="text-2xl font-bold mb-4 text-center">Add a Review for {scholarshipInfo.universityName}</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block mb-2 font-medium">Rating (out of 5)</label>
                        <select {...register("ratingPoint", { required: true })} className="select select-bordered w-full bg-transparent border-[--color-divider]">
                            <option value="5">5 Stars (Excellent)</option>
                            <option value="4">4 Stars (Good)</option>
                            <option value="3">3 Stars (Average)</option>
                            <option value="2">2 Stars (Poor)</option>
                            <option value="1">1 Star (Very Poor)</option>
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
                    <button type="submit" disabled={addReviewMutation.isPending} className="btn w-full text-white" style={{ backgroundColor: 'var(--color-prm)' }}>
                        {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddReviewModal;