import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NotificationProvider>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
