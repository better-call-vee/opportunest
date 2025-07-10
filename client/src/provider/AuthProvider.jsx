import React, { useEffect, useState } from 'react';
import auth from "../../firebase/firebase.init";
import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile
} from "firebase/auth";
import axios from 'axios';
import AuthContext from './AuthContext';

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Create User with Email/Password
    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // 2. Sign In with Email/Password
    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    // 3. Sign In with Google
    const googleSignIn = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    };

    // 4. Log Out
    const logOut = () => {
        setLoading(true);
        setRole(null);
        return signOut(auth);
    };

    // 5. Update User Profile
    const updateUserProfile = (name, photo) => {
        return updateProfile(auth.currentUser, {
            displayName: name,
            photoURL: photo
        });
    };

    // --- THIS IS THE NEWLY ADDED FUNCTION ---
    // 6. Get Firebase ID Token
    const getFirebaseIdToken = () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            // The 'true' forces a token refresh if needed, ensuring it's not expired.
            return currentUser.getIdToken(true);
        }
        // Return a promise that resolves to null if no user is logged in.
        return Promise.resolve(null);
    };

    // Observer to watch auth state changes and fetch role
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const idToken = await currentUser.getIdToken();
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_URL}/sync-user`,
                        {},
                        { headers: { Authorization: `Bearer ${idToken}` } }
                    );
                    setRole(response.data.user.role);
                } catch (error) {
                    console.error("Failed to fetch user role:", error);
                    setRole(null);
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const authInfo = {
        user,
        role,
        loading,
        createUser,
        signIn,
        googleSignIn,
        logOut,
        updateUserProfile,
        getFirebaseIdToken // <-- THE FIX: The function is now included here
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;