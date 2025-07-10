import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { HiEye, HiPencil, HiTrash } from 'react-icons/hi2';

// Reusable Section Title
const SectionTitle = ({ children }) => (
    <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[--color-txt]">{children}</h1>
        <div className="w-24 h-1 bg-[--color-prm] mx-auto mt-4 rounded"></div>
    </div>
);

// Reusable Modal Component
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-bgc z-50 flex justify-center items-center p-4">
        <div className="bg-md p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-3xl relative">
            <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            {children}
        </div>
    </div>
);

const ManageScholarships = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue } = useForm();

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedScholarship, setSelectedScholarship] = useState(null);

    // Fetch all scholarships using Tanstack Query
    const { data: scholarships = [], isLoading, error } = useQuery({
        queryKey: ['scholarshipsAdmin'],
        queryFn: async () => {
            const res = await axiosSecure.get('/scholarships-admin');
            return res.data.data;
        }
    });

    // Mutation for deleting a scholarship
    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/scholarships/${id}`),
        onSuccess: () => {
            Swal.fire('Deleted!', 'The scholarship has been deleted.', 'success');
            queryClient.invalidateQueries({ queryKey: ['scholarshipsAdmin'] });
        }
    });

    // Mutation for updating a scholarship
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => axiosSecure.patch(`/scholarships/${id}`, data),
        onSuccess: () => {
            Swal.fire('Updated!', 'The scholarship has been updated.', 'success');
            queryClient.invalidateQueries({ queryKey: ['scholarshipsAdmin'] });
            setIsEditModalOpen(false);
        }
    });

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
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

    const handleEditOpen = (scholarship) => {
        setSelectedScholarship(scholarship);
        // Pre-fill the form with existing data
        Object.keys(scholarship).forEach(key => {
            if (key === 'applicationDeadline') {
                // Format date for the input field
                setValue(key, new Date(scholarship[key]).toISOString().split('T')[0]);
            } else {
                setValue(key, scholarship[key]);
            }
        });
        setIsEditModalOpen(true);
    };

    const handleDetailsOpen = (scholarship) => {
        setSelectedScholarship(scholarship);
        setIsDetailsModalOpen(true);
    };

    const onEditSubmit = (data) => {
        const { _id, ...restOfData } = data;
        const updatedData = {
            ...restOfData,
            universityWorldRank: parseInt(data.universityWorldRank, 10),
            tuitionFees: parseFloat(data.tuitionFees) || 0,
            applicationFees: parseFloat(data.applicationFees),
            serviceCharge: parseFloat(data.serviceCharge),
        };
        updateMutation.mutate({ id: selectedScholarship._id, data: updatedData });
    };

    const inputStyle = "w-full p-3 bg-transparent text-[--color-txt] rounded-lg border-2 border-[--color-divider] focus:border-[--color-prm] focus:outline-none transition-colors duration-300";
    const labelStyle = "block mb-2 font-medium text-sm text-[--color-txt]";

    if (isLoading) return <div className="text-center"><span className="loading loading-lg text-[--color-prm]"></span></div>;
    if (error) return <div className="text-center text-red-500">Error loading scholarships: {error.message}</div>;

    return (
        <div className="w-full">
            <SectionTitle>Manage All Scholarships</SectionTitle>
            <div className="overflow-x-auto bg-bbgc rounded-2xl shadow-lg p-4 border border-txt">
                <table className="table w-full">
                    <thead className="text-sm text-txt uppercase">
                        <tr>
                            <th>Scholarship & University</th>
                            <th>Subject / Degree</th>
                            <th>Fees</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scholarships.map((scholarship) => (
                            <tr key={scholarship._id} className="hover:bg-[--color-bgc]">
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <img src={scholarship.universityImage} alt={`${scholarship.universityName} logo`} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{scholarship.scholarshipName}</div>
                                            <div className="text-sm opacity-70">{scholarship.universityName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {scholarship.subjectCategory}
                                    <br />
                                    <span className="badge badge-ghost badge-sm">{scholarship.degree}</span>
                                </td>
                                <td>${scholarship.applicationFees}</td>
                                <td className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleDetailsOpen(scholarship)} className="btn btn-sm btn-circle bg-blue-500 text-white hover:bg-blue-600 border-none" aria-label="View Details"><HiEye size={16} /></button>
                                        <button onClick={() => handleEditOpen(scholarship)} className="btn btn-sm btn-circle bg-yellow-500 text-white hover:bg-yellow-600 border-none" aria-label="Edit"><HiPencil size={16} /></button>
                                        <button onClick={() => handleDelete(scholarship._id)} className="btn btn-sm btn-circle bg-red-500 text-white hover:bg-red-600 border-none" aria-label="Delete"><HiTrash size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {isDetailsModalOpen && selectedScholarship && (
                <Modal onClose={() => setIsDetailsModalOpen(false)}>
                    <h2 className="text-2xl font-bold mb-4">{selectedScholarship.scholarshipName}</h2>
                    <div className="space-y-2 text-[--color-txt]">
                        <p><strong>University:</strong> {selectedScholarship.universityName}</p>
                        <p><strong>Location:</strong> {selectedScholarship.universityCity}, {selectedScholarship.universityCountry}</p>
                        <p><strong>Subject:</strong> {selectedScholarship.subjectCategory}</p>
                        <p><strong>Degree:</strong> {selectedScholarship.degree}</p>
                        <p><strong>Application Fees:</strong> ${selectedScholarship.applicationFees}</p>
                        <p><strong>Service Charge:</strong> ${selectedScholarship.serviceCharge}</p>
                        <p><strong>Deadline:</strong> {new Date(selectedScholarship.applicationDeadline).toLocaleDateString()}</p>
                    </div>
                </Modal>
            )}

            {/* Edit Modal with Full Form */}
            {isEditModalOpen && selectedScholarship && (
                <Modal onClose={() => setIsEditModalOpen(false)}>
                    <h2 className="text-2xl font-bold mb-6">Edit Scholarship</h2>
                    <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Scholarship Name</label>
                                <input type="text" {...register("scholarshipName", { required: true })} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>University Name</label>
                                <input type="text" {...register("universityName", { required: true })} className={inputStyle} />
                            </div>
                            {/* Add all other fields here */}
                            <div>
                                <label className={labelStyle}>Application Fees ($)</label>
                                <input type="number" step="0.01" {...register("applicationFees", { required: true })} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Application Deadline</label>
                                <input type="date" {...register("applicationDeadline", { required: true })} className={inputStyle} />
                            </div>
                        </div>
                        <button type="submit" disabled={updateMutation.isPending} className="btn w-full text-white mt-4" style={{ backgroundColor: 'var(--color-prm)' }}>
                            {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default ManageScholarships;