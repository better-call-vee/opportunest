import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../provider/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaLink } from "react-icons/fa"; // Added more icons
import Swal from "sweetalert2";
import Loading from "../components/Loading";

export default function Register() {
    const [name, setName] = useState("");
    const [photoURL, setPhotoURL] = useState(""); // State for the photo URL
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { createUser, googleSignIn, updateUserProfile, loading: authIsLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            Swal.fire({ icon: 'error', title: 'Weak Password', text: 'Password must be at least 6 characters long.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createUser(email, password);
            // After creating user, update profile with name AND photoURL
            // Assuming updateUserProfile can handle an object with displayName and photoURL
            await updateUserProfile(name, photoURL);

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Account created successfully!",
                showConfirmButton: false,
                timer: 1500,
            });
            navigate("/");
        } catch (err) {
            let friendlyMessage = "Registration failed. Please try again.";
            if (err.code === 'auth/email-already-in-use') {
                friendlyMessage = "This email is already registered. Please try logging in.";
            }
            Swal.fire({ icon: 'error', title: 'Registration Error', text: friendlyMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        try {
            await googleSignIn();
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Signed up with Google!",
                showConfirmButton: false,
                timer: 1500,
            });
            navigate("/");
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Google Sign-Up Error', text: 'Could not complete sign-up with Google. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authIsLoading || isSubmitting) {
        return <Loading />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-[--color-bbgc]">
            <div className="w-full max-w-md p-8 space-y-6 bg-[--color-bgc] border border-[--color-divider] shadow-2xl rounded-2xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[--color-txt]">Create Your Account</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Join Opportunest today.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Full Name Input */}
                    <div className="relative">
                        <FaUser className="absolute w-4 h-4 text-gray-400 top-1/2 left-4 transform -translate-y-1/2" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full py-3 pl-10 pr-4 text-[--color-txt] bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-prm]"
                            required
                        />
                    </div>
                    {/* Photo URL Input */}
                    <div className="relative">
                        <FaLink className="absolute w-4 h-4 text-gray-400 top-1/2 left-4 transform -translate-y-1/2" />
                        <input
                            type="url"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            placeholder="Photo URL"
                            className="w-full py-3 pl-10 pr-4 text-[--color-txt] bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-prm]"
                            required
                        />
                    </div>
                    {/* Email Input */}
                    <div className="relative">
                        <FaEnvelope className="absolute w-4 h-4 text-gray-400 top-1/2 left-4 transform -translate-y-1/2" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className="w-full py-3 pl-10 pr-4 text-[--color-txt] bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-prm]"
                            required
                        />
                    </div>
                    {/* Password Input */}
                    <div className="relative">
                        <FaLock className="absolute w-4 h-4 text-gray-400 top-1/2 left-4 transform -translate-y-1/2" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password (min. 6 characters)"
                            className="w-full py-3 pl-10 pr-12 text-[--color-txt] bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-prm]"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-[--color-prm] focus:outline-none"
                        >
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-3 font-semibold cursor-pointer text-white bg-prm rounded-lg hover:bg-[--color-sry] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-prm] disabled:opacity-60">
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="relative flex items-center my-6">
                    <div className="flex-grow border-t border-[--color-divider]"></div>
                    <span className="px-4 text-sm text-gray-500 bg-[--color-bgc]">OR</span>
                    <div className="flex-grow border-t border-[--color-divider]"></div>
                </div>

                <button onClick={handleGoogleSignIn} disabled={isSubmitting} className="flex items-center justify-center w-full gap-3 py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-60">
                    <FcGoogle size={24} />
                    Continue with Google
                </button>

                <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-[--color-prm] hover:text-[--color-accent]">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}