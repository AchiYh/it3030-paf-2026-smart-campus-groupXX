import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/member4/Login';
import TicketBaseLayout from '../layouts/member3/TicketBaseLayout';
import TicketOverview from '../pages/member3/ticketing/TicketOverview';
import TicketListPage from '../pages/member3/ticketing/TicketListPage';
import TicketBoardPage from '../pages/member3/ticketing/TicketBoardPage';
import TicketDetailsPage from '../pages/member3/ticketing/TicketDetailsPage';
import CreateTicketPage from '../pages/member3/ticketing/CreateTicketPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div style={{ padding: '2rem', fontSize: '1rem' }}>
              Welcome to the Smart Campus portal. Use the notification bell to view alerts.
            </div>
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
