import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { HiChatBubbleLeftEllipsis, HiXCircle, HiInformationCircle } from 'react-icons/hi2';

// Reusable Components
const SectionTitle = ({ children }) => (
    <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[--color-txt]">{children}</h1>
        <div className="w-24 h-1 bg-[--color-prm] mx-auto mt-4 rounded"></div>
    </div>
);

const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-bgc z-50 flex justify-center items-center p-4">
        <div className="bg-[--color-bgc] p-8 rounded-2xl shadow-xl w-full max-w-lg relative">
            <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            {children}
        </div>
    </div>
);

// Main Component
const AllAppliedScholarships = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm();

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [sortOption, setSortOption] = useState('applied_desc'); // State for the filter

    // --- Tanstack Query to fetch data with sorting ---
    const { data: applications = [], isLoading, error } = useQuery({
        queryKey: ['allApplications', sortOption],
        queryFn: async () => {
            const res = await axiosSecure.get(`/admin/applications?sort=${sortOption}`);
            return res.data.data;
        }
    });

    // --- Fully Implemented Mutations ---
    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => axiosSecure.patch(`/admin/applications/${id}/status`, { status }),
        onSuccess: () => {
            Swal.fire('Updated!', 'The application status has been changed.', 'success');
            queryClient.invalidateQueries({ queryKey: ['allApplications'] });
        },
        onError: (err) => {
            Swal.fire('Error', err.response?.data?.message || 'Could not update status.', 'error');
        }
    });

    const feedbackMutation = useMutation({
        mutationFn: ({ id, feedback }) => axiosSecure.patch(`/admin/applications/${id}/feedback`, { feedback }),
        onSuccess: () => {
            Swal.fire('Submitted!', 'Your feedback has been saved.', 'success');
            queryClient.invalidateQueries({ queryKey: ['allApplications'] });
            setIsFeedbackModalOpen(false);
        },
        onError: (err) => {
            Swal.fire('Error', err.response?.data?.message || 'Could not submit feedback.', 'error');
        }
    });

    // --- Fully Implemented Event Handlers ---
    const handleCancel = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will mark the application as 'Rejected'.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: 'var(--color-prm)',
            confirmButtonText: 'Yes, reject it!'
        }).then((result) => {
            if (result.isConfirmed) {
                statusMutation.mutate({ id, status: 'Rejected' });
            }
        });
    };

    const handleFeedbackOpen = (application) => {
        setSelectedApplication(application);
        reset({ feedback: application.feedback || '' });
        setIsFeedbackModalOpen(true);
    };

    const handleDetailsOpen = (application) => {
        setSelectedApplication(application);
        setIsDetailsModalOpen(true);
    };

    const onFeedbackSubmit = (data) => {
        feedbackMutation.mutate({ id: selectedApplication._id, feedback: data.feedback });
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-400/20 text-yellow-600',
            processing: 'bg-blue-400/20 text-blue-600',
            completed: 'bg-green-400/20 text-green-600',
            Rejected: 'bg-red-400/20 text-red-600',
        };
        return <span className={`badge capitalize ${styles[status] || 'badge-ghost'}`}>{status}</span>;
    };

    if (isLoading) return <div className="text-center"><span className="loading loading-lg text-[--color-prm]"></span></div>;
    if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

    return (
        <div className="w-full">
            <SectionTitle>Manage All Applications</SectionTitle>

            <div className="flex justify-center mb-6">
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="select select-bordered bg-transparent border-[--color-divider] w-full max-w-xs"
                >
                    <option className='bg-bgc text-txt' value="applied_desc">Sort by Newest Applied</option>
                    <option className='bg-bgc text-txt' value="applied_asc">Sort by Oldest Applied</option>
                    <option className='bg-bgc text-txt' value="deadline_asc">Sort by Deadline (Asc)</option>
                    <option className='bg-bgc text-txt' value="deadline_desc">Sort by Deadline (Desc)</option>
                </select>
            </div>

            <div className="overflow-x-auto bg-[--color-bbgc] rounded-2xl shadow-lg p-4 border border-[--color-divider]">
                <table className="table w-full">
                    <thead className="text-sm text-txt uppercase">
                        <tr>
                            <th>Applicant & University</th>
                            <th>Applied Date</th>
                            <th>Scholarship Deadline</th>
                            <th>Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app) => (
                            <tr key={app._id} className="hover:bg-[--color-bgc]">
                                <td>
                                    <div className="font-bold">{app.applicantName}</div>
                                    <div className="text-sm opacity-70">{app.universityName}</div>
                                </td>
                                <td>{new Date(app.applicationDate).toLocaleDateString()}</td>
                                <td>{new Date(app.applicationDeadline).toLocaleDateString()}</td>
                                <td>{getStatusBadge(app.status)}</td>
                                <td className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleDetailsOpen(app)} className="btn btn-sm btn-circle bg-blue-500 text-white" aria-label="Details"><HiInformationCircle size={16} /></button>
                                        <button onClick={() => handleFeedbackOpen(app)} className="btn btn-sm btn-circle bg-green-500 text-white" aria-label="Feedback"><HiChatBubbleLeftEllipsis size={16} /></button>
                                        <button onClick={() => handleCancel(app._id)} className="btn btn-sm btn-circle bg-red-500 text-white" aria-label="Cancel"><HiXCircle size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {isDetailsModalOpen && (
                <Modal onClose={() => setIsDetailsModalOpen(false)}>
                    <h2 className="text-2xl font-bold mb-4">Application Details</h2>
                    <div className="space-y-2">
                        <p><strong>Applicant:</strong> {selectedApplication.applicantName}</p>
                        <p><strong>University:</strong> {selectedApplication.universityName}</p>
                        <p><strong>Scholarship:</strong> {selectedApplication.scholarshipName}</p>
                        <p><strong>Degree:</strong> {selectedApplication.applyingDegree}</p>
                        <p><strong>Status:</strong> {getStatusBadge(selectedApplication.status)}</p>
                    </div>
                </Modal>
            )}

            {/* Feedback Modal */}
            {isFeedbackModalOpen && (
                <Modal onClose={() => setIsFeedbackModalOpen(false)}>
                    <h2 className="text-2xl font-bold mb-4">Provide Feedback</h2>
                    <form onSubmit={handleSubmit(onFeedbackSubmit)} className="space-y-4">
                        <div>
                            <label className="block mb-2 font-medium">Feedback for {selectedApplication.applicantName}</label>
                            <textarea
                                {...register("feedback", { required: true })}
                                className="textarea textarea-bordered w-full h-32 bg-transparent border-[--color-divider]"
                                placeholder="e.g., 'Please upload a clearer copy of your transcript.'"
                            ></textarea>
                        </div>
                        <button type="submit" disabled={feedbackMutation.isPending} className="btn w-full text-white" style={{ backgroundColor: 'var(--color-prm)' }}>
                            {feedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default AllAppliedScholarships;