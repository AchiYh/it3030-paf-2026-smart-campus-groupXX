import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/member4/Login';
import Signup from '../pages/member4/Signup';
import VerifyOtp from '../pages/member4/VerifyOtp';
import ForgotPassword from '../pages/member4/ForgotPassword';
import Profile from '../pages/member4/Profile';
import Settings from '../pages/member4/Settings';
import BookingDashboard from '../pages/member2/BookingDashboard';
import FindResources from '../pages/member2/FindResources';
import MyBookings from '../pages/member2/MyBookings';
import AdminBookingDashboard from '../pages/member2/AdminDashboard';
import ManageBookings from '../pages/member2/ManageBookings';
import TicketBaseLayout from '../layouts/member3/TicketBaseLayout';
import TicketOverview from '../pages/member3/ticketing/TicketOverview';
import TicketListPage from '../pages/member3/ticketing/TicketListPage';
import TicketDetailsPage from '../pages/member3/ticketing/TicketDetailsPage';
import CreateTicketPage from '../pages/member3/ticketing/CreateTicketPage';
import OAuth2RedirectHandler from '../pages/member4/OAuth2RedirectHandler';
import AdminDashboard from '../pages/member4/AdminDashboard';
import UserDashboard from '../pages/member4/UserDashboard';
import TechnicianDashboard from '../pages/member4/TechnicianDashboard';
import UserManagement from '../pages/member4/UserManagement';
import AddTechnicianPage from '../pages/member4/AddTechnicianPage';
import InfrastructurePage from '../pages/member1/InfrastructurePage';
import { useAuth } from '../context/AuthContext';

// DashboardRouter - Shows role-specific dashboard
function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'TECHNICIAN') return <TechnicianDashboard />;
  return <UserDashboard />;
}

function TicketOverviewRoute() {
  const { user } = useAuth();
  if (user?.role === 'USER') {
    return <Navigate to="/tickets/list" replace />;
  }
  return <TicketOverview />;
}

function TicketCreateRoute() {
  const { user } = useAuth();
  if (user?.role === 'TECHNICIAN') {
    return <Navigate to="/tickets/list" replace />;
  }
  return <CreateTicketPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

      {/* Root route - Shows role-specific dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      {/* Member 4 User Pages */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Member 1 Infrastructure Pages */}
      <Route path="/infrastructure" element={<ProtectedRoute><InfrastructurePage /></ProtectedRoute>} />

      {/* User Booking Routes */}
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <BookingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/find"
        element={
          <ProtectedRoute>
            <FindResources />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/my"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      {/* Admin Booking Routes */}
      <Route
        path="/admin/bookings-dashboard"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminBookingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <ManageBookings />
          </ProtectedRoute>
        }
      />

      {/* User Management Routes (Admin only) */}
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/technicians/new"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AddTechnicianPage />
          </ProtectedRoute>
        }
      />

      {/* Tickets Routes */}
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketBaseLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TicketOverviewRoute />} />
        <Route path="new" element={<TicketCreateRoute />} />
        <Route path="list" element={<TicketListPage />} />
        <Route path=":ticketId" element={<TicketDetailsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;