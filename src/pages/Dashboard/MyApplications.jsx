import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { HiPencil, HiTrash, HiChatBubbleLeftEllipsis } from 'react-icons/hi2';
import AddReviewModal from './AddReviewModal';
import AuthContext from '../../provider/AuthContext';
import axios from 'axios';

// Reusable Section Title
const SectionTitle = ({ children }) => (
    <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[--color-txt]">{children}</h1>
        <div className="w-24 h-1 bg-[--color-prm] mx-auto mt-4 rounded"></div>
    </div>
);

// --- NEW: Edit Application Modal Component ---
const EditApplicationModal = ({ application, onClose, onSuccess }) => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { 
            applicantPhone: application.applicantPhone,
            applicantAddress: application.applicantAddress,
            applicantGender: application.applicantGender,
            applyingDegree: application.applyingDegree,
            sscResult: application.sscResult,
            hscResult: application.hscResult,
            studyGap: application.studyGap,
        }
    });

    const image_hosting_key = import.meta.env.VITE_IMGBB_API_KEY;
    const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

    const onEditSubmit = async (data) => {
        try {
            let applicantPhotoUrl = application.applicantPhoto; // Keep old photo by default

            // If a new photo is uploaded, upload it to ImgBB
            if (data.applicantPhoto && data.applicantPhoto.length > 0) {
                const imageFile = { image: data.applicantPhoto[0] };
                const res = await axios.post(image_hosting_api, imageFile, {
                    headers: { 'content-type': 'multipart/form-data' }
                });
                if (res.data.success) {
                    applicantPhotoUrl = res.data.data.display_url;
                } else {
                    throw new Error('New photo upload failed.');
                }
            }

            const updatedApplicationData = {
                ...data, // Contains all form fields
                applicantPhoto: applicantPhotoUrl,
            };

            await onSuccess(updatedApplicationData); // Call the mutation function from the parent
            onClose();

        } catch (error) {
            Swal.fire("Update Failed", error.message || "Something went wrong.", "error");
        }
    };

    const inputStyle = "w-full p-3 bg-transparent text-[--color-txt] rounded-lg border-2 border-[--color-divider] focus:border-[--color-prm] focus:outline-none";
    const labelStyle = "block mb-2 font-medium text-sm text-[--color-txt]";

    return (
        <div className="fixed inset-0 bg-bgc z-50 flex justify-center items-center p-4">
            <div className="bg-[--color-bgc] p-8 rounded-2xl shadow-xl w-full max-w-3xl relative">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <h2 className="text-3xl font-bold mb-6 text-center">Edit Application</h2>
                <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
                    {/* All form fields from ApplicationModal are here, pre-filled */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Phone Number</label>
                            <input type="tel" {...register("applicantPhone", { required: true })} className={inputStyle} />
                        </div>
                        <div>
                            <label className={labelStyle}>Gender</label>
                            <select {...register("applicantGender", { required: true })} className={`select ${inputStyle}`}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelStyle}>Address</label>
                            <input type="text" {...register("applicantAddress", { required: true })} className={inputStyle} />
                        </div>
                        <div>
                            <label className={labelStyle}>Applying Degree</label>
                            <select {...register("applyingDegree", { required: true })} className={`select ${inputStyle}`}>
                                <option value="Diploma">Diploma</option>
                                <option value="Bachelor">Bachelor</option>
                                <option value="Masters">Masters</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}>SSC Result (GPA)</label>
                            <input type="number" step="0.01" {...register("sscResult", { required: true })} className={inputStyle} />
                        </div>
                        <div>
                            <label className={labelStyle}>HSC Result (GPA)</label>
                            <input type="number" step="0.01" {...register("hscResult", { required: true })} className={inputStyle} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelStyle}>Change Photo (Optional)</label>
                            <input type="file" {...register("applicantPhoto")} className="file-input file-input-bordered w-full bg-transparent border-2 border-[--color-divider]" />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={isSubmitting} className="btn w-full text-lg text-white" style={{ backgroundColor: 'var(--color-prm)' }}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main MyApplications Component ---
const MyApplications = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // New state for edit modal
    const [selectedApplication, setSelectedApplication] = useState(null);

    const { data: applications = [], isLoading, error } = useQuery({
        queryKey: ['myApplications'],
        queryFn: async () => {
            const res = await axiosSecure.get('/my-applications');
            return res.data.data;
        }
    });

    const cancelMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/applications/${id}`),
        onSuccess: () => {
            Swal.fire('Cancelled!', 'Your application has been cancelled.', 'success');
            queryClient.invalidateQueries({ queryKey: ['myApplications'] });
        }
    });

    // --- NEW: Mutation for updating an application ---
    const updateApplicationMutation = useMutation({
        mutationFn: ({ id, data }) => axiosSecure.patch(`/applications/${id}`, data),
        onSuccess: () => {
            Swal.fire('Updated!', 'Your application has been updated.', 'success');
            queryClient.invalidateQueries({ queryKey: ['myApplications'] });
        }
    });

    const handleCancel = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-prm)',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                cancelMutation.mutate(id);
            }
        });
    };

    // --- UPDATED: handleEdit now opens the modal ---
    const handleEdit = (application) => {
        if (application.applicationStatus !== 'pending') {
            Swal.fire('Cannot Edit', `This application is currently ${application.applicationStatus}.`, 'info');
        } else {
            setSelectedApplication(application);
            setIsEditModalOpen(true);
        }
    };

    const handleAddReview = (application) => {
        setSelectedApplication(application);
        setIsReviewModalOpen(true);
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
            <SectionTitle>My Scholarship Applications</SectionTitle>
            <div className="overflow-x-auto bg-[--color-bbgc] rounded-2xl shadow-lg p-4 border border-[--color-divider]">
                <table className="table w-full">
                    <thead className="text-sm text-[--color-txt] uppercase">
                        <tr>
                            <th>University</th>
                            <th>Address</th>
                            <th>Feedback</th>
                            <th>Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length > 0 ? applications.map((app) => (
                            <tr key={app._id} className="hover:bg-[--color-bgc]">
                                <td>{app.universityName}</td>
                                <td>{app.universityAddress}</td>
                                <td>{app.feedback || 'N/A'}</td>
                                <td>{getStatusBadge(app.applicationStatus)}</td>
                                <td className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEdit(app)} className="btn btn-sm btn-circle bg-yellow-500 text-white hover:bg-yellow-600 border-none" aria-label="Edit"><HiPencil size={16} /></button>
                                        <button onClick={() => handleCancel(app._id)} className="btn btn-sm btn-circle bg-red-500 text-white hover:bg-red-600 border-none" aria-label="Cancel"><HiTrash size={16} /></button>
                                        <button onClick={() => handleAddReview(app)} className="btn btn-sm btn-circle bg-sky-500 text-white hover:bg-sky-600 border-none" aria-label="Add Review"><HiChatBubbleLeftEllipsis size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center py-8">You have not applied to any scholarships yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isReviewModalOpen && (
                <AddReviewModal
                    scholarshipInfo={selectedApplication}
                    onClose={() => setIsReviewModalOpen(false)}
                />
            )}

            {/* --- NEW: Render the Edit Modal --- */}
            {isEditModalOpen && (
                <EditApplicationModal
                    application={selectedApplication}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={(data) => {
                        updateApplicationMutation.mutate({ id: selectedApplication._id, data });
                    }}
                />
            )}
        </div>
    );
};

export default MyApplications;