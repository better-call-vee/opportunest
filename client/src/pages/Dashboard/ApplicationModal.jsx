import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import AuthContext from '../../provider/AuthContext';

const ApplicationModal = ({ scholarship, onClose }) => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            // --- STEP 1: UPLOAD PHOTO TO YOUR OWN BACKEND ---
            const imageFile = data.applicantPhoto[0];
            const formData = new FormData();
            formData.append('image', imageFile);

            const imageUploadRes = await axiosSecure.post('/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (!imageUploadRes.data.success) {
                throw new Error('Photo upload failed. Please try a different image.');
            }
            const applicantPhotoUrl = imageUploadRes.data.data.display_url;

            // --- STEP 2: CREATE THE APPLICATION OBJECT ---
            const applicationDetails = {
                applicantPhone: data.applicantPhone,
                applicantAddress: data.applicantAddress,
                applicantGender: data.applicantGender,
                applyingDegree: data.applyingDegree,
                sscResult: data.sscResult,
                hscResult: data.hscResult,
                studyGap: data.studyGap,
                applicantPhoto: applicantPhotoUrl, // Use the secure URL from your backend
                applicantName: user.name,
                applicantId: user._id,
                scholarshipId: scholarship._id,
            };

            // --- STEP 3: SUBMIT THE FINAL APPLICATION ---
            const postRes = await axiosSecure.post('/applications', applicationDetails);

            if (postRes.data.success) {
                onClose();
                Swal.fire({
                    title: "Application Submitted!",
                    text: "Your application has been received successfully.",
                    icon: "success",
                    confirmButtonColor: 'var(--color-prm)'
                });
            } else {
                throw new Error(postRes.data.message || 'Failed to submit application');
            }
        } catch (error) {
            console.error("Application Submission Error:", error);
            Swal.fire("Submission Failed", error.message || "Something went wrong. Please try again.", "error");
        }
    };

    const inputStyle = "w-full p-3 bg-transparent text-[--color-txt] rounded-lg border-2 border-[--color-divider] focus:border-[--color-prm] focus:outline-none";
    const labelStyle = "block mb-2 font-medium text-sm text-[--color-txt]";

    return (
        <div className="fixed inset-0 bg-bgc z-50 flex justify-center items-center p-4">
            <div className="bg-[--color-bgc] p-8 rounded-2xl shadow-xl w-full max-w-3xl relative">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <h2 className="text-3xl font-bold mb-6 text-center">Apply for {scholarship.scholarshipName}</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-[--color-bbgc] rounded-lg">
                        <div><label className="font-bold">University:</label> <p>{scholarship.universityName}</p></div>
                        <div><label className="font-bold">Scholarship:</label> <p>{scholarship.scholarshipCategory}</p></div>
                        <div><label className="font-bold">Subject:</label> <p>{scholarship.subjectCategory}</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Phone Number</label>
                            <input type="tel" {...register("applicantPhone", { required: true })} className={inputStyle} />
                        </div>
                        <div>
                            <label className={labelStyle}>Gender</label>
                            <select {...register("applicantGender", { required: true })} className={`select ${inputStyle}`} defaultValue="">
                                <option value="" disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelStyle}>Address (Village, District, Country)</label>
                            <input type="text" {...register("applicantAddress", { required: true })} className={inputStyle} />
                        </div>
                        <div>
                            <label className={labelStyle}>Applying Degree</label>
                            <select {...register("applyingDegree", { required: true })} className={`select ${inputStyle}`} defaultValue={scholarship.degree}>
                                <option value="Diploma">Diploma</option>
                                <option value="Bachelor">Bachelor</option>
                                <option value="Masters">Masters</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}>Study Gap (Optional)</label>
                            <select {...register("studyGap")} className={`select ${inputStyle}`} defaultValue="">
                                <option value="">No Gap</option>
                                <option value="1 Year">1 Year</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3+ Years">3+ Years</option>
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
                            <label className={labelStyle}>Your Photo</label>
                            <input type="file" {...register("applicantPhoto", { required: true })} className="file-input file-input-bordered w-full bg-transparent border-2 border-[--color-divider]" />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={isSubmitting} className="btn w-full text-lg text-white" style={{ backgroundColor: 'var(--color-prm)' }}>
                            {isSubmitting ? 'Submitting...' : 'Proceed to Payment & Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationModal;