import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import InstallPrompt from '../common/InstallPrompt';

const MobileLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        pb: '80px', // space for bottom nav
        maxWidth: 480,
        mx: 'auto',
        position: 'relative',
      }}
    >
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </Box>
      <BottomNav />
      <InstallPrompt />
    </Box>
  );
};

export default MobileLayout;