import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import axios from 'axios';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { HiPlusCircle } from 'react-icons/hi2';

// A reusable component for a clean section header
const SectionTitle = ({ children }) => (
    <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[--color-txt]">{children}</h1>
        <div className="w-24 h-1 bg-[--color-prm] mx-auto mt-4 rounded"></div>
    </div>
);

const AddScholarship = () => {
    const axiosSecure = useAxiosSecure();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const image_hosting_key = import.meta.env.VITE_IMGBB_API_KEY;
    const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

    const onSubmit = async (data) => {
        try {
            // 1. Upload image to ImgBB
            const imageFile = { image: data.universityImage[0] };
            const res = await axios.post(image_hosting_api, imageFile, {
                headers: { 'content-type': 'multipart/form-data' }
            });

            if (!res.data.success) {
                throw new Error('Image upload failed');
            }

            // 2. Create the scholarship object with correct data types
            const scholarshipItem = {
                scholarshipName: data.scholarshipName,
                universityName: data.universityName,
                universityImage: res.data.data.display_url,
                universityCountry: data.universityCountry,
                universityCity: data.universityCity,
                universityWorldRank: parseInt(data.universityWorldRank, 10),
                subjectCategory: data.subjectCategory,
                scholarshipCategory: data.scholarshipCategory,
                degree: data.degree,
                tuitionFees: parseFloat(data.tuitionFees) || 0,
                applicationFees: parseFloat(data.applicationFees),
                serviceCharge: parseFloat(data.serviceCharge),
                applicationDeadline: data.applicationDeadline,
            };

            // 3. Send the scholarship data to your backend
            const postRes = await axiosSecure.post('/scholarships', scholarshipItem);
            
            if (postRes.data.success) {
                reset();
                Swal.fire({
                    title: "Success!",
                    text: "Scholarship has been added.",
                    icon: "success",
                    confirmButtonColor: 'var(--color-prm)'
                });
            } else {
                throw new Error(postRes.data.message || 'Failed to add scholarship');
            }

        } catch (error) {
            console.error("Submission Error:", error);
            Swal.fire({
                title: "Submission Failed",
                text: error.message || "Something went wrong. Please try again.",
                icon: "error"
            });
        }
    };

    // --- STYLING CONSTANTS ---
    const labelStyle = "block mb-2 font-medium text-sm text-[--color-txt]";
    const errorStyle = "text-red-500 text-xs mt-1";
    
    // Style for regular text/number inputs
    const inputStyle = "w-full p-3 bg-transparent text-[--color-txt] rounded-lg border-2 border-[--color-divider] focus:border-[--color-prm] focus:outline-none transition-colors duration-300";
    
    // FIX: Specific style for dropdowns (removes p-3 to prevent text cutoff)
    const selectStyle = "w-full bg-transparent text-[--color-txt] rounded-lg border-2 border-[--color-divider] focus:border-[--color-prm] focus:outline-none transition-colors duration-300";


    return (
        <div className="w-full max-w-5xl mx-auto p-6 md:p-10 bg-[--color-bbgc] rounded-2xl shadow-xl border border-[--color-divider]">
            <SectionTitle>Add a New Scholarship</SectionTitle>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    
                    {/* Scholarship Name */}
                    <div>
                        <label className={labelStyle}>Scholarship Name</label>
                        <input type="text" {...register("scholarshipName", { required: "Scholarship name is required." })} className={inputStyle} />
                        {errors.scholarshipName && <span className={errorStyle}>{errors.scholarshipName.message}</span>}
                    </div>

                    {/* University Name */}
                    <div>
                        <label className={labelStyle}>University Name</label>
                        <input type="text" {...register("universityName", { required: "University name is required." })} className={inputStyle} />
                        {errors.universityName && <span className={errorStyle}>{errors.universityName.message}</span>}
                    </div>

                    {/* University Country */}
                    <div>
                        <label className={labelStyle}>University Country</label>
                        <input type="text" {...register("universityCountry", { required: "Country is required." })} className={inputStyle} />
                        {errors.universityCountry && <span className={errorStyle}>{errors.universityCountry.message}</span>}
                    </div>

                    {/* University City */}
                    <div>
                        <label className={labelStyle}>University City</label>
                        <input type="text" {...register("universityCity", { required: "City is required." })} className={inputStyle} />
                        {errors.universityCity && <span className={errorStyle}>{errors.universityCity.message}</span>}
                    </div>

                    {/* University World Rank */}
                    <div>
                        <label className={labelStyle}>University World Rank</label>
                        <input type="number" {...register("universityWorldRank", { required: "Rank is required.", valueAsNumber: true })} className={inputStyle} />
                        {errors.universityWorldRank && <span className={errorStyle}>{errors.universityWorldRank.message}</span>}
                    </div>

                     {/* Application Deadline */}
                     <div>
                        <label className={labelStyle}>Application Deadline</label>
                        <input type="date" {...register("applicationDeadline", { required: "Deadline is required." })} className={inputStyle} />
                        {errors.applicationDeadline && <span className={errorStyle}>{errors.applicationDeadline.message}</span>}
                    </div>

                    {/* Subject Category */}
                    <div>
                        <label className={labelStyle}>Subject Category</label>
                        <select {...register("subjectCategory", { required: "Subject is required." })} defaultValue="" className={`select ${selectStyle}`}>
                            <option value="" disabled>Select Subject</option>
                            <option className='text-txt bg-bgc' value="Agriculture">Agriculture</option>
                            <option className='text-txt bg-bgc' value="Engineering">Engineering</option>
                            <option className='text-txt bg-bgc' value="Doctor">Doctor</option>
                        </select>
                         {errors.subjectCategory && <span className={errorStyle}>{errors.subjectCategory.message}</span>}
                    </div>

                    {/* Scholarship Category */}
                    <div>
                        <label className={labelStyle}>Scholarship Category</label>
                        <select {...register("scholarshipCategory", { required: "Category is required." })} defaultValue="" className={`select ${selectStyle}`}>
                            <option value="" disabled>Select Category</option>
                            <option className='text-txt bg-bgc' value="Full fund">Full Fund</option>
                            <option className='text-txt bg-bgc' value="Partial">Partial</option>
                            <option className='text-txt bg-bgc' value="Self-fund">Self-fund</option>
                        </select>
                        {errors.scholarshipCategory && <span className={errorStyle}>{errors.scholarshipCategory.message}</span>}
                    </div>

                    {/* Degree */}
                    <div>
                        <label className={labelStyle}>Degree</label>
                        <select {...register("degree", { required: "Degree is required." })} defaultValue="" className={`select ${selectStyle}`}>
                            <option value="" disabled>Select Degree</option>
                            <option className='text-txt bg-bgc' value="Diploma">Diploma</option>
                            <option className='text-txt bg-bgc' value="Bachelor">Bachelor</option>
                            <option className='text-txt bg-bgc' value="Masters">Masters</option>
                        </select>
                        {errors.degree && <span className={errorStyle}>{errors.degree.message}</span>}
                    </div>

                    {/* Application Fees */}
                    <div>
                        <label className={labelStyle}>Application Fees ($)</label>
                        <input type="number" step="0.01" {...register("applicationFees", { required: "Fee is required.", valueAsNumber: true })} className={inputStyle} />
                        {errors.applicationFees && <span className={errorStyle}>{errors.applicationFees.message}</span>}
                    </div>

                    {/* Service Charge */}
                    <div>
                        <label className={labelStyle}>Service Charge ($)</label>
                        <input type="number" step="0.01" {...register("serviceCharge", { required: "Charge is required.", valueAsNumber: true })} className={inputStyle} />
                        {errors.serviceCharge && <span className={errorStyle}>{errors.serviceCharge.message}</span>}
                    </div>
                    
                    {/* Tuition Fees (Optional) */}
                    <div>
                        <label className={labelStyle}>Tuition Fees ($) (Optional)</label>
                        <input type="number" step="0.01" {...register("tuitionFees", { valueAsNumber: true })} className={inputStyle} />
                    </div>

                     {/* University Image */}
                     <div className="md:col-span-2">
                        <label className={labelStyle}>University Image/Logo</label>
                        {/* FIX: Specific style for the file input */}
                        <input type="file" {...register("universityImage", { required: "Image is required." })} className="file-input file-input-bordered w-full bg-transparent border-2 border-[--color-divider] focus:border-[--color-prm] focus:outline-none" />
                        {errors.universityImage && <span className={errorStyle}>{errors.universityImage.message}</span>}
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn w-full text-lg text-white mt-8 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--color-prm)' }}>
                    {isSubmitting ? (
                        <span className="loading loading-spinner"></span>
                    ) : (
                        <HiPlusCircle size={24} />
                    )}
                    {isSubmitting ? 'Adding Scholarship...' : 'Add Scholarship'}
                </button>
            </form>
        </div>
    );
};

export default AddScholarship;