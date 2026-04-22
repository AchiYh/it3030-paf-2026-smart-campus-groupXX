import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/member4/Login';
import ResourceListPage from '../pages/member1/ResourceListPage';
import ResourceFormPage from '../pages/member1/ResourceFormPage';
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
import { useAuth } from '../context/AuthContext';

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'TECHNICIAN') return <TechnicianDashboard />;
  return <UserDashboard />;
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
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketBaseLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TicketOverview />} />
        <Route path="new" element={<CreateTicketPage />} />
        <Route path="list" element={<TicketListPage />} />
        <Route path="board" element={<TicketBoardPage />} />
        <Route path=":ticketId" element={<TicketDetailsPage />} />
      </Route>
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <ResourceListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources/new"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <ResourceFormPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;