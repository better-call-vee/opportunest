import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AllScholarships from "../pages/AllScholarships";
import ScholarshipDetails from "../pages/ScholarshipDetails";
import ErrorPage from "../components/ErrorPage";

import PrivateRoute from "../provider/PrivateRoute";
import AdminRoute from "../provider/AdminRoute";
import ModeratorRoute from "../provider/ModeratorRoute";

import MyProfile from "../pages/Dashboard/MyProfile";
import MyApplications from "../pages/Dashboard/MyApplications";
import MyReviews from "../pages/Dashboard/MyReviews";
import AddScholarship from "../pages/Dashboard/AddScholarship";
import ManageScholarships from "../pages/Dashboard/ManageScholarships";
import AllReviews from "../pages/Dashboard/AllReviews";
import AllAppliedScholarships from "../pages/Dashboard/AllAppliedScholarships";
import ManageUsers from "../pages/Dashboard/ManageUsers";
import Analytics from "../pages/Dashboard/Analytics";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Register /> },
            { path: "/all-scholarships", element: <AllScholarships /> },
            {
                path: "/scholarship/:id",
                element: <PrivateRoute><ScholarshipDetails /></PrivateRoute>,
            },
        ]
    },
    // --- DASHBOARD ROUTES ---
    {
        path: "dashboard",
        element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
        errorElement: <ErrorPage />,
        children: [
            // User Routes
            { path: "my-profile", element: <MyProfile /> },
            { path: "my-applications", element: <MyApplications /> },
            { path: "my-reviews", element: <MyReviews /> },

            // Moderator Routes (also accessible by Admin)
            { path: "add-scholarship", element: <ModeratorRoute><AddScholarship /></ModeratorRoute> },
            { path: "manage-scholarships", element: <ModeratorRoute><ManageScholarships /></ModeratorRoute> },
            { path: "all-reviews", element: <ModeratorRoute><AllReviews /></ModeratorRoute> },
            { path: "all-applied-scholarship", element: <ModeratorRoute><AllAppliedScholarships /></ModeratorRoute> },

            // Admin Only Routes
            { path: "manage-users", element: <AdminRoute><ManageUsers /></AdminRoute> },
            { path: "analytics", element: <AdminRoute><Analytics /></AdminRoute> },
        ]
    }
]);