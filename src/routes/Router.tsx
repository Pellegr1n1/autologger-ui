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
import EventsPage from "../pages/events/EventsPage";

interface RouteType {
  path: string;
  component: React.FC;
  isProtected?: boolean;
  allowedRoles?: number[];
}

const routes: RouteType[] = [
  { path: "/", component: HomePage },
  { path: "/register", component: RegisterPage, allowedRoles: [3] },
  { path: "/login", component: LoginPage },
  { path: "/profile", component: ProfilePage },
  { path: "/vehicles", component: VehiclesPage },
  { path: "/events", component: EventsPage },
  { path: "/reports", component: ReportsPage },
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