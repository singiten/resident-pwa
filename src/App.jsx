import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/guards/ProtectedRoute';
import MobileLayout from './components/layout/MobileLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import RoleRoute from './components/guards/RoleRoute';
import Residents from './pages/admin/Residents'; 
// Resident pages
import Home from './pages/home/Home';
import Announcements from './pages/announcements/Announcements';
import Reports from './pages/reports/Reports';
import EqubIddir from './pages/equb/EqubIddir';
import Profile from './pages/profile/Profile';
import LostFound from './pages/lostfound/LostFound';
import Promotions from './pages/promotions/Promotions';
import Payments from './pages/payments/Payments';

import Condos from './pages/admin/Condos';
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected resident routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MobileLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/equb" element={<EqubIddir />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/lost-found" element={<LostFound />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/payments" element={<Payments />} />
              <Route 
    path="/residents" 
    element={
      <RoleRoute allowedRoles={['condo_admin', 'super_admin']}>
        <Residents />
      </RoleRoute>
    } 
  />
  <Route 
    path="/condos" 
    element={
      <RoleRoute allowedRoles={['super_admin']}>
        <Condos />
      </RoleRoute>
    } 
  />
  
  <Route 
    path="/residents" 
    element={
      <RoleRoute allowedRoles={['condo_admin', 'super_admin']}>
        <Residents />
      </RoleRoute>
    } 
  />
</Route>


            

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
            
          </Routes>
        </BrowserRouter>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;