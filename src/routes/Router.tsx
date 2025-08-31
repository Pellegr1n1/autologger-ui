import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/home/HomePage";
import NotFoundPage from "../pages/notFound/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";
import ReportsPage from "../pages/reports/ReportsPage";
import VehiclesPage from "../pages/vehicles/VehiclesPage";
import ProfilePage from "../pages/profile/ProfilePage";
import VehicleDetailsPage from "../pages/vehicles/VehicleDetailsPage";
import MaintenancePage from "../pages/maintenance/MaintenancePage";

interface RouteType {
  path: string;
  component: React.FC;
  isProtected?: boolean;
  allowedRoles?: number[];
}

const routes: RouteType[] = [
  { path: "/", component: HomePage },
  { path: "/register", component: RegisterPage },
  { path: "/login", component: LoginPage },
  { path: "/profile", component: ProfilePage, isProtected: true },
  { path: "/vehicles", component: VehiclesPage, isProtected: true },
  { path: "/vehicles/:vehicleId", component: VehicleDetailsPage, isProtected: true },
  { path: "/maintenance", component: MaintenancePage, isProtected: true },
  { path: "/events", component: VehicleDetailsPage, isProtected: true },
  { path: "/reports", component: ReportsPage, isProtected: true },
];

const Router: React.FC = () => {
  return (
    <Routes>
      {routes.map((route, key) => (
        <Route
          key={key}
          path={route.path}
          element={
            route.isProtected ? (
              <ProtectedRoute
                component={route.component}
                allowedRoles={route.allowedRoles || []}
              />
            ) : (
              <route.component />
            )
          }
        />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Router;