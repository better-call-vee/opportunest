import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { motion } from 'framer-motion';
import { HiUsers, HiAcademicCap, HiClipboardDocumentList } from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

// Reusable Components for a clean look
const SectionTitle = ({ children }) => (
    <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[--color-txt]">{children}</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">An overview of your platform's activity.</p>
        <div className="w-24 h-1 bg-[--color-prm] mx-auto mt-4 rounded"></div>
    </div>
);

const StatCard = ({ icon, title, value, color }) => (
    <motion.div
        className="bg-[--color-bbgc] p-6 rounded-2xl shadow-lg flex items-center gap-6 border border-[--color-divider]"
        whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
    >
        <div className={`p-4 rounded-full`} style={{ backgroundColor: color, color: 'white' }}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-3xl font-bold text-[--color-txt]">{value}</p>
        </div>
    </motion.div>
);

const ChartContainer = ({ title, children }) => (
    <div className="bg-[--color-bbgc] p-6 rounded-2xl shadow-lg border border-[--color-divider]">
        <h3 className="text-xl font-bold mb-6 text-[--color-txt]">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            {children}
        </div>
    </div>
);

// Main Analytics Component
const Analytics = () => {
    const axiosSecure = useAxiosSecure();

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin/stats');
            return res.data.data;
        }
    });

    // Colors for the Pie Chart, using your theme
    const PIE_COLORS = ['#059669', '#10b981', '#34d399']; // --color-prm, --color-accent, dark --color-prm

    if (isLoading) return <div className="text-center"><span className="loading loading-lg text-[--color-prm]"></span></div>;
    if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

    return (
        <div className="w-full">
            <SectionTitle>Platform Analytics</SectionTitle>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <StatCard icon={<HiUsers size={32} />} title="Total Users" value={stats.totalUsers} color="var(--color-info)" />
                <StatCard icon={<HiAcademicCap size={32} />} title="Total Scholarships" value={stats.totalScholarships} color="var(--color-success)" />
                <StatCard icon={<HiClipboardDocumentList size={32} />} title="Total Applications" value={stats.totalApplications} color="var(--color-warning)" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Bar Chart */}
                <div className="lg:col-span-3">
                    <ChartContainer title="Recent Applications (Last 7 Days)">
                        <ResponsiveContainer>
                            <BarChart data={stats.applicationStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                                <XAxis dataKey="date" stroke="var(--color-txt)" />
                                <YAxis stroke="var(--color-txt)" />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bgc)', border: '1px solid var(--color-divider)' }} />
                                <Legend />
                                <Bar dataKey="applications" fill="var(--color-prm)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                {/* Pie Chart */}
                <div className="lg:col-span-2">
                    <ChartContainer title="Scholarships by Category">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.categoryStats}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {stats.categoryStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bgc)', border: '1px solid var(--color-divider)' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;