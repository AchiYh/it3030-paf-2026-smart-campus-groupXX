import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/member4/Login';
import BookingDashboard from '../pages/member2/BookingDashboard';
import FindResources from '../pages/member2/FindResources';
import MyBookings from '../pages/member2/MyBookings';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div style={{ padding: '2rem', fontSize: '1rem' }}>
              Welcome to the Smart Campus portal. Use the menu to manage your bookings and notifications.
            </div>
          </ProtectedRoute>
        }
      />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;