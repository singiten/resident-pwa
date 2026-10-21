import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Avatar, Grid, Card, CardContent,
  Button, Chip, CircularProgress,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SavingsIcon from '@mui/icons-material/Savings';
import SearchIcon from '@mui/icons-material/Search';
import PaymentsIcon from '@mui/icons-material/Payments';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PeopleIcon from '@mui/icons-material/People';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    announcements: 0, reports: 0, promotions: 0, equbs: 0,
  });
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [latestPromotion, setLatestPromotion] = useState(null);

  const role = user?.role || 'resident';
  const isAdmin = ['condo_admin', 'super_admin'].includes(role);

  const getQuickActions = () => {
    if (role === 'super_admin') return [
      { label: 'Condos', icon: <ApartmentIcon />, path: '/condos', color: '#3b82f6' },
      { label: 'Users', icon: <PeopleIcon />, path: '/residents', color: '#8b5cf6' },
      { label: 'Revenue', icon: <AccountBalanceIcon />, path: '/payments', color: '#22c55e' },
      { label: 'Promos', icon: <StorefrontIcon />, path: '/promotions', color: '#D3AD32' },
    ];
    if (role === 'condo_admin') return [
      { label: 'Residents', icon: <PeopleIcon />, path: '/residents', color: '#3b82f6' },
      { label: 'Reports', icon: <AssignmentIcon />, path: '/reports', color: '#8b5cf6' },
      { label: 'News', icon: <CampaignIcon />, path: '/announcements', color: '#D3AD32' },
      { label: 'Promos', icon: <StorefrontIcon />, path: '/promotions', color: '#22c55e' },
    ];
    if (role === 'guard') return [
      { label: 'Reports', icon: <AssignmentIcon />, path: '/reports', color: '#3b82f6' },
      { label: 'Lost/Found', icon: <SearchIcon />, path: '/lost-found', color: '#8b5cf6' },
      { label: 'News', icon: <CampaignIcon />, path: '/announcements', color: '#D3AD32' },
    ];
    return [
      { label: 'Reports', icon: <AssignmentIcon />, path: '/reports', color: '#3b82f6' },
      { label: 'Lost/Found', icon: <SearchIcon />, path: '/lost-found', color: '#8b5cf6' },
      { label: 'Pay Dues', icon: <PaymentsIcon />, path: '/payments', color: '#22c55e' },
      { label: 'Equb', icon: <SavingsIcon />, path: '/equb', color: '#D3AD32' },
    ];
  };

  const getStatLabels = () => {
    if (role === 'super_admin') return { s1: 'Announcements', s2: 'System Reports' };
    if (role === 'condo_admin') return { s1: 'Condo News', s2: 'Condo Reports' };
    return { s1: 'Announcements', s2: 'My Reports' };
  };

  const quickActions = getQuickActions();
  const labels = getStatLabels();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Announcements - try/catch isolated
        try {
          const res = await api.announcements.getAll();
          const items = res.data.data?.items || res.data.data || [];
          setStats((p) => ({ ...p, announcements: items.length }));
          if (items.length > 0) setLatestAnnouncement(items[0]);
        } catch (e) { console.warn('Announcements:', e.message); }

        // 2. Reports
        try {
          const res = isAdmin
            ? await api.reports.getAdminAll()
            : await api.reports.getMy();
          const items = res.data.data?.items || res.data.data || [];
          setStats((p) => ({ ...p, reports: items.length }));
        } catch (e) { console.warn('Reports:', e.message); }

        // 3. Promotions
        try {
          const res = await api.promotions.getAll({ status: 'active' });
          const items = res.data.data?.items || res.data.data || [];
          setStats((p) => ({ ...p, promotions: items.length }));
          if (items.length > 0) setLatestPromotion(items[0]);
        } catch (e) { console.warn('Promotions:', e.message); }

        // 4. Equbs
        try {
          const res = role === 'super_admin'
            ? await api.equbs.getAll()
            : (user?.condoId ? await api.equbs.getPublic(user.condoId) : null);
          if (res) {
            const items = res.data.data?.items || res.data.data || [];
            setStats((p) => ({ ...p, equbs: items.length }));
          }
        } catch (e) { console.warn('Equbs:', e.message); }

      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, role, isAdmin]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <CircularProgress sx={{ color: '#D3AD32' }} />
    </Box>
  );

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      {/* Greeting */}
      <Paper elevation={0} sx={{
        p: 3, mb: 3, borderRadius: '20px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <Avatar src={user?.profilePhoto || undefined}
            sx={{ width: 56, height: 56, bgcolor: '#D3AD32', fontWeight: 700, fontSize: '1.2rem' }}>
            {user?.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Welcome back,</Typography>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{user?.fullName || 'User'}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5, display: 'block' }}>
              {role === 'super_admin'
                ? '🌍 System Administrator'
                : `🏢 ${user?.condoCode || 'Condo'} • Block ${user?.block || '—'}, Room ${user?.roomNo || '—'}`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(211,173,50,0.1)' }} />
      </Paper>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a2e' }}>Quick Actions</Typography>
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {quickActions.map((action) => (
          <Grid item xs={3} key={action.label} component="div">
            <Card elevation={0} onClick={() => navigate(action.path)}
              sx={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', cursor: 'pointer', '&:active': { transform: 'scale(0.96)' } }}>
              <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, '&:last-child': { pb: 2 } }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${action.color}15`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {action.icon}
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center', color: '#1a1a2e', lineHeight: 1.2 }}>
                  {action.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stats */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid item xs={6} component="div">
          <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 1.5, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <Box sx={{ bgcolor: 'rgba(59,130,246,0.1)', p: 1, borderRadius: '10px', color: '#3b82f6' }}>
              <CampaignIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{stats.announcements}</Typography>
              <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{labels.s1}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} component="div">
          <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 1.5, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <Box sx={{ bgcolor: 'rgba(139,92,246,0.1)', p: 1, borderRadius: '10px', color: '#8b5cf6' }}>
              <AssignmentIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{stats.reports}</Typography>
              <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{labels.s2}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Latest Announcement */}
      {latestAnnouncement && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>Latest News</Typography>
            <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/announcements')}
              sx={{ color: '#D3AD32', fontWeight: 600, textTransform: 'none' }}>See All</Button>
          </Box>
          <Paper elevation={0} onClick={() => navigate('/announcements')}
            sx={{ p: 2, borderRadius: '16px', borderLeft: '4px solid #D3AD32', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {latestAnnouncement.isPinned && (
                <Chip label="Pinned" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(211,173,50,0.1)', color: '#D3AD32', fontWeight: 700 }} />
              )}
              <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                {new Date(latestAnnouncement.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#1a1a2e' }}>{latestAnnouncement.title}</Typography>
            <Typography variant="body2" sx={{ color: '#6b7a8f', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {latestAnnouncement.body}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Latest Promotion */}
      {latestPromotion && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>Local Offer</Typography>
            <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/promotions')}
              sx={{ color: '#D3AD32', fontWeight: 600, textTransform: 'none' }}>Browse</Button>
          </Box>
          <Paper elevation={0} onClick={() => navigate('/promotions')}
            sx={{ p: 2, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', gap: 2, cursor: 'pointer' }}>
            <Box sx={{ width: 60, height: 60, borderRadius: '12px', bgcolor: 'rgba(211,173,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D3AD32' }}>
              <StorefrontIcon />
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', lineHeight: 1.2, mb: 0.5 }}>
                {latestPromotion.title}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                {latestPromotion.businessName} • {latestPromotion.type}
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Home;