// src/pages/Dashboard/ManageUsers.jsx
import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import AuthContext from '../../provider/AuthContext';
import { HiTrash, HiUsers } from 'react-icons/hi2';

const SectionTitle = ({ children }) => (
    <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[--color-txt]">{children}</h1>
        <div className="w-24 h-1 bg-[--color-prm] mx-auto mt-4 rounded"></div>
    </div>
);

const ManageUsers = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { user: adminUser } = useContext(AuthContext); // The logged-in admin
    const [roleFilter, setRoleFilter] = useState(''); // State for the filter dropdown

    // Fetch users with filtering, controlled by Tanstack Query
    const { data: users = [], isLoading, error } = useQuery({
        queryKey: ['users', roleFilter], // The query will re-run when roleFilter changes
        queryFn: async () => {
            const res = await axiosSecure.get(`/admin/users?role=${roleFilter}`);
            return res.data.data;
        }
    });

    // Mutation for updating a user's role
    const updateRoleMutation = useMutation({
        mutationFn: ({ id, newRole }) => axiosSecure.patch(`/admin/users/${id}/role`, { newRole }),
        onSuccess: () => {
            Swal.fire({
                title: 'Role Updated!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    // Mutation for deleting a user
    const deleteUserMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/admin/users/${id}`),
        onSuccess: () => {
            Swal.fire('Deleted!', 'The user has been removed.', 'success');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    const handleRoleChange = (userId, newRole) => {
        updateRoleMutation.mutate({ id: userId, newRole });
    };

    const handleDeleteUser = (userToDelete) => {
        if (adminUser.email === userToDelete.email) {
            Swal.fire("Action Forbidden", "You cannot delete your own account.", "error");
            return;
        }
        Swal.fire({
            title: `Delete ${userToDelete.name}?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: 'var(--color-prm)',
            confirmButtonText: 'Yes, delete user!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteUserMutation.mutate(userToDelete._id);
            }
        });
    };

    if (isLoading) return <div className="text-center"><span className="loading loading-lg text-[--color-prm]"></span></div>;
    if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

    return (
        <div className="w-full">
            <SectionTitle>Manage All Users</SectionTitle>

            {/* Filter Dropdown */}
            <div className="flex justify-end mb-4">
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="select select-bordered bg-transparent border-[--color-divider]"
                >
                    <option className='text-bgc' value="">Filter by All Roles</option>
                    <option className='bg-bgc text-txt' value="user">User</option>
                    <option className='bg-bgc text-txt' value="moderator">Moderator</option>
                    <option className='bg-bgc text-txt' value="admin">Admin</option>
                </select>
            </div>

            <div className="overflow-x-auto bg-[--color-bbgc] rounded-2xl shadow-lg p-4 border border-[--color-divider]">
                <table className="table w-full">
                    <thead className="text-sm text-txt uppercase">
                        <tr>
                            <th>User Info</th>
                            <th>Role</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-[--color-bgc]">
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name}`} alt="Avatar" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{user.name}</div>
                                            <div className="text-sm opacity-70">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <select
                                        className="select select-ghost select-sm"
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        disabled={adminUser.email === user.email} // Disable changing own role
                                    >
                                        <option value="user">User</option>
                                        <option value="moderator">Moderator</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="text-center">
                                    <button
                                        onClick={() => handleDeleteUser(user)}
                                        className="btn btn-sm btn-circle bg-red-500 text-white hover:bg-red-600 border-none"
                                        aria-label="Delete User"
                                        disabled={adminUser.email === user.email} // Disable deleting own account
                                    >
                                        <HiTrash size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;