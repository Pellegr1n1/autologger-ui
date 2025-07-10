import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    component: React.FC;
    allowedRoles: number[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const userRole = Number(localStorage.getItem("role_id"));

    if (!token || !allowedRoles.includes(userRole)) {
        return <Navigate to="/login" />;
    }

    return <Component />;
};

export default ProtectedRoute;