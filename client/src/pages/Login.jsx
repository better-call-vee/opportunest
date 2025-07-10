import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../provider/AuthContext"; // Ensure path is correct
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import Loading from "../components/Loading";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // This local loading state is for actions initiated within this component
    const [isSubmitting, setIsSubmitting] = useState(false);

    // `loading` from context is for the initial auth state check
    const { signIn, googleSignIn, loading: authIsLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter both email and password!',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await signIn(email, password);
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Logged in successfully!",
                showConfirmButton: false,
                timer: 1500,
            });
            navigate(from, { replace: true });
        } catch (err) {
            let friendlyMessage = "Login failed. Please check your credentials.";
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                friendlyMessage = "Invalid email or password.";
            } else if (err.code === 'auth/too-many-requests') {
                friendlyMessage = "Access temporarily disabled due to too many failed login attempts. Please try again later.";
            }
            Swal.fire({
                icon: 'error',
                title: 'Login Error',
                text: friendlyMessage,
            });
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
                title: "Logged in with Google!",
                showConfirmButton: false,
                timer: 1500,
            });
            navigate(from, { replace: true });
        } catch (err) {
            let friendlyMessage = "Google Sign-In failed. Please try again.";
            if (err.code === 'auth/popup-closed-by-user') {
                friendlyMessage = "The sign-in process was cancelled.";
            }
            Swal.fire({
                icon: 'error',
                title: 'Google Sign-In Error',
                text: friendlyMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading spinner if initial auth state is loading or a submission is in progress
    if (authIsLoading || isSubmitting) {
        return <Loading />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-[--color-bbgc]">
            <div className="w-full max-w-md p-8 space-y-6 bg-[--color-bgc] border border-[--color-divider] shadow-2xl rounded-2xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[--color-txt]">Login to Your Account</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Welcome back to Opportunest.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className="w-full py-3 pl-4 pr-4 text-[--color-txt] bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-prm]"
                            required
                        />
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full py-3 pl-4 pr-12 text-[--color-txt] bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-prm]"
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
                    <div className="text-right">
                        <Link to="/forgot-password" className="text-sm font-medium text-[--color-prm] hover:text-[--color-accent]">
                            Forgot Password?
                        </Link>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-3 font-semibold text-white bg-prm rounded-lg hover:bg-[--color-sry] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-prm] disabled:opacity-60">
                        {isSubmitting ? 'Logging In...' : 'Login'}
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
                    Don’t have an account?{" "}
                    <Link to="/register" className="font-medium text-[--color-prm] hover:text-[--color-accent]">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}