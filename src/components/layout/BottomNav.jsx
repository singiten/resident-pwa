import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAuth } from '../../context/AuthContext';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const role = user?.role || 'resident';

  const getTabs = () => {
    if (role === 'guard') {
      return [
        { key: '/home', label: 'Home', icon: HomeIcon },
        { key: '/reports', label: 'Reports', icon: AssignmentIcon },
        { key: '/lost-found', label: 'Lost/Found', icon: SearchIcon },
        { key: '/announcements', label: 'News', icon: CampaignIcon },
        { key: '/profile', label: 'Profile', icon: PersonIcon },
      ];
    }
    
    if (role === 'super_admin') {
      return [
        { key: '/home', label: 'Overview', icon: HomeIcon },
        { key: '/condos', label: 'Condos', icon: ApartmentIcon },
        { key: '/revenue', label: 'Revenue', icon: AccountBalanceWalletIcon },
        { key: '/users-overview', label: 'Users', icon: PeopleIcon },
        { key: '/profile', label: 'Profile', icon: PersonIcon },
      ];
    }

    if (role === 'condo_admin') {
      return [
        { key: '/home', label: 'Dashboard', icon: HomeIcon },
        { key: '/residents', label: 'Residents', icon: PeopleIcon },
        { key: '/announcements', label: 'News', icon: CampaignIcon },
          { key: '/rooms', label: 'Rooms', icon: MeetingRoomIcon },
        { key: '/reports', label: 'Reports', icon: AssignmentIcon },
        { key: '/profile', label: 'Profile', icon: PersonIcon },
      ];
    }

    // Resident
    return [
      { key: '/home', label: 'Home', icon: HomeIcon },
      { key: '/announcements', label: 'News', icon: CampaignIcon },
      { key: '/reports', label: 'Reports', icon: AssignmentIcon },
      { key: '/lost-found', label: 'Lost/Found', icon: SearchIcon },
      { key: '/profile', label: 'Profile', icon: PersonIcon },
    ];
  };

  const tabs = getTabs();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200, bgcolor: '#ffffff', borderTop: '1px solid #eef0f3', boxShadow: '0 -2px 16px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 64, paddingBottom: 'env(safe-area-inset-bottom)', maxWidth: 480, mx: 'auto' }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.key);
        return (
          <Box key={tab.key} onClick={() => navigate(tab.key)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.3, flex: 1, cursor: 'pointer', py: 1, color: active ? '#D3AD32' : '#6b7a8f', '&:active': { transform: 'scale(0.94)' } }}>
            <Icon sx={{ fontSize: active ? 26 : 24 }} />
            <Box sx={{ fontSize: '0.65rem', fontWeight: active ? 700 : 500 }}>{tab.label}</Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default BottomNav;