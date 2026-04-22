import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/member4/Login';
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
import { useAuth } from '../context/AuthContext';

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
  if (user?.role === 'USER' || user?.role === 'TECHNICIAN') {
    return <Navigate to="/tickets/list" replace />;
  }
  return <CreateTicketPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
