// src/routes/ModeratorRoute.jsx
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../provider/AuthContext";
import Loading from "../components/Loading";

const ModeratorRoute = ({ children }) => {
    const { user, role, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <Loading />;
    }

    if (user && (role === 'moderator' || role === 'admin')) {
        return children;
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ModeratorRoute;