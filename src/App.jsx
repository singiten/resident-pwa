
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleRoute from './components/guards/RoleRoute';
import MobileLayout from './components/layout/MobileLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PublicPage from './pages/public/PublicPage';

import Home from './pages/home/Home';
import Announcements from './pages/announcements/Announcements';
import Reports from './pages/reports/Reports';
import EqubIddir from './pages/equb/EqubIddir';
import Profile from './pages/profile/Profile';
import LostFound from './pages/lostfound/LostFound';
import Payments from './pages/payments/Payments';
import Rooms from './pages/admin/Rooms';
import Condos from './pages/admin/Condos';
import Residents from './pages/admin/Residents';
import Revenue from './pages/admin/Revenue';
import Promotions from './pages/admin/Promotions';
import UsersOverview from './pages/admin/UsersOverview';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/public" element={<PublicPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/lost-found" element={<LostFound />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/equb" element={<EqubIddir />} />
              
              {/* Super Admin Routes */}
              <Route path="/condos" element={<RoleRoute allowedRoles={['super_admin']}><Condos /></RoleRoute>} />
              <Route path="/revenue" element={<RoleRoute allowedRoles={['super_admin']}><Revenue /></RoleRoute>} />
              <Route path="/users-overview" element={<RoleRoute allowedRoles={['super_admin']}><UsersOverview /></RoleRoute>} />
              <Route path="/admin-promotions" element={<RoleRoute allowedRoles={['super_admin', 'condo_admin']}><Promotions /></RoleRoute>} />
              
              {/* Condo Admin Shared Routes */}
              <Route path="/residents" element={<RoleRoute allowedRoles={['super_admin', 'condo_admin']}><Residents /></RoleRoute>} />
            </Route>
<Route 
  path="/rooms" 
  element={
    <RoleRoute allowedRoles={['condo_admin']}>
      <Rooms />
    </RoleRoute>
  } 
/>
            <Route path="/" element={<Navigate to="/public" replace />} />
            <Route path="*" element={<Navigate to="/public" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-center" autoClose={3000} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;