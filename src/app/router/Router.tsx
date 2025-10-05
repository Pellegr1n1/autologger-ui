import React from "react";
import { Route, Routes } from "react-router-dom";
import { LoginPage, RegisterPage } from "../../pages/Auth";
import CallbackPage from "../../pages/Auth/CallbackPage";
import { HomePage } from "../../pages/Home";
import { NotFoundPage } from "../../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import ReportsPage from "../../pages/Reports";
import { VehiclesPage } from "../../pages/Vehicles";
import { ProfilePage } from "../../pages/Profile";
import { MaintenancePage } from "../../pages/Maintenance";
import { BlockchainPage } from "../../pages/Blockchain";
import TermsPage from "../../pages/Terms/TermsPage";
import PrivacyPage from "../../pages/Privacy/PrivacyPage";

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
  { path: "/auth/callback", component: CallbackPage },
  { path: "/terms", component: TermsPage },
  { path: "/privacy", component: PrivacyPage },
  { path: "/profile", component: ProfilePage, isProtected: true },
  { path: "/vehicles", component: VehiclesPage, isProtected: true },
  { path: "/maintenance", component: MaintenancePage, isProtected: true },
  { path: "/reports", component: ReportsPage, isProtected: true },
  { path: "/blockchain", component: BlockchainPage, isProtected: true },
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