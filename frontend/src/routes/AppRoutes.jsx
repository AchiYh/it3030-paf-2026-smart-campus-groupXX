import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/member4/Login';
import BookingDashboard from '../pages/member2/BookingDashboard';
import FindResources from '../pages/member2/FindResources';
import MyBookings from '../pages/member2/MyBookings';
// Import your admin booking pages (directly from member2 folder)
import AdminBookingDashboard from '../pages/member2/AdminDashboard';
import ManageBookings from '../pages/member2/ManageBookings';
import TicketBaseLayout from '../layouts/member3/TicketBaseLayout';
import TicketOverview from '../pages/member3/ticketing/TicketOverview';
import TicketListPage from '../pages/member3/ticketing/TicketListPage';
import TicketBoardPage from '../pages/member3/ticketing/TicketBoardPage';
import TicketDetailsPage from '../pages/member3/ticketing/TicketDetailsPage';
import CreateTicketPage from '../pages/member3/ticketing/CreateTicketPage';
import OAuth2RedirectHandler from '../pages/member4/OAuth2RedirectHandler';
import AdminDashboard from '../pages/member4/AdminDashboard';
import UserDashboard from '../pages/member4/UserDashboard';
import TechnicianDashboard from '../pages/member4/TechnicianDashboard';
import UserManagement from '../pages/member4/UserManagement';
import AddTechnicianPage from '../pages/member4/AddTechnicianPage';
import { useAuth } from '../context/AuthContext';

// Role-based redirect component
function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'TECHNICIAN') return <Navigate to="/tickets" replace />;
  return <Navigate to="/bookings" replace />;
}

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

function TicketBoardRoute() {
  const { user } = useAuth();
  if (user?.role === 'USER') {
    return <Navigate to="/tickets/list" replace />;
  }
  return <TicketBoardPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes – no layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

      {/* Root route with role-based redirect */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RootRedirect />
          </ProtectedRoute>
        }
      />

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
        path="/admin/dashboard"
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
        <Route path="new" element={<CreateTicketPage />} />
        <Route path="list" element={<TicketListPage />} />
        <Route path="board" element={<TicketBoardRoute />} />
        <Route path=":ticketId" element={<TicketDetailsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;