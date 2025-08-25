import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";

import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminDashboardPage from "./pages/Dashboard/AdminDashboardPage";
import AdminProfilePage from "./pages/Dashboard/AdminProfilePage";
import AdminAddListingPage from "./pages/Dashboard/AdminAddListingPage";
import AdminAdminUsersPage from "./pages/Dashboard/AdminAdminUsersPage";
import AdminAnalyticsPage from "./pages/Dashboard/AdminAnalyticsPage";
import AdminBookingsPage from "./pages/Dashboard/AdminBookingsPage";
import AdminChargesPage from "./pages/Dashboard/AdminChargesPage";
import AdminCMSPage from "./pages/Dashboard/AdminCMSPage";
import AdminEditListingPage from "./pages/Dashboard/AdminEditListingPage";
import AdminListingsPage from "./pages/Dashboard/AdminListingsPage";
import AdminModerationPage from "./pages/Dashboard/AdminModerationPage";
import AdminRolesPage from "./pages/Dashboard/AdminRolesPage";
import AdminSettingsPage from "./pages/Dashboard/AdminSettingsPage";
import AdminSupportPage from "./pages/Dashboard/AdminSupportPage";
import AdminUsersPage from "./pages/Dashboard/AdminUsersPage";
import AdminViewListingPage from "./pages/Dashboard/AdminViewListingPage";

export default function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/listings" element={<AdminListingsPage />} />
          <Route path="/listings/add" element={<AdminAddListingPage />} />
          <Route path="/admin/listings/edit/:id" element={<AdminEditListingPage />} />
          <Route path="/admin/listings/view/:id" element={<AdminViewListingPage />} />
          <Route path="/bookings" element={<AdminBookingsPage />} />
          <Route path="/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/settings" element={<AdminSettingsPage />} />
          <Route path="/support" element={<AdminSupportPage />} />
          <Route path="/charges" element={<AdminChargesPage />} />
          <Route path="/admin/cms" element={<AdminCMSPage />} />
          <Route path="/admin/moderation" element={<AdminModerationPage />} />
          <Route path="/roles" element={<AdminRolesPage />} />
          <Route path="/admin-users" element={<AdminAdminUsersPage />} />
        </Route>

        {/* Catch-all for non-admin/public routes */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Router>
    </AdminAuthProvider>
  );
}
