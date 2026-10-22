import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Avatar, Grid, CircularProgress, Divider, Chip,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || 'resident';
  const isSuperAdmin = role === 'super_admin';
  const isCondoAdmin = role === 'condo_admin';
  const isGuard = role === 'guard';

  const [loading, setLoading] = useState(true);
  const [statBlocks, setStatBlocks] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        if (isSuperAdmin) {
          const [condosRes, paymentsRes, promotionsRes] = await Promise.allSettled([
            api.condos.getAll(),
            api.payments.getStatistics(),
            api.promotions.getAll({ status: 'approved' }),
          ]);

          const condos = condosRes.status === 'fulfilled' ? (condosRes.value.data.data || []) : [];
          const payStats = paymentsRes.status === 'fulfilled' ? (paymentsRes.value.data.data || {}) : {};
          const promos = promotionsRes.status === 'fulfilled' ? (promotionsRes.value.data.data?.items || promotionsRes.value.data.data || []) : [];

          const totalRevenue = Number(payStats.totalServiceFees || 0) + (condos.length * 500) + promos.reduce((sum, p) => sum + (p.price || 0), 0);

          setStatBlocks([
            { label: 'Condominiums', value: condos.length, icon: <ApartmentIcon />, color: '#3b82f6', path: '/condos' },
            { label: 'Total Revenue', value: `ETB ${totalRevenue.toLocaleString()}`, icon: <AccountBalanceIcon />, color: '#22c55e', path: '/revenue' },
            { label: 'Active Promos', value: promos.length, icon: <CampaignIcon />, color: '#D3AD32', path: '/promotions' },
            { label: 'Total Payments', value: payStats.totalPayments || 0, icon: <AssignmentIcon />, color: '#8b5cf6', path: '/revenue' },
          ]);

        } else if (isCondoAdmin) {
          const [usersRes, paymentsRes, reportsRes] = await Promise.allSettled([
            api.users.getByCondo(user.condoId),
            api.payments.getAll(),
            api.reports.getAdminAll({ page: 1, limit: 5 }),
          ]);

          const users = usersRes.status === 'fulfilled' ? (usersRes.value.data.data || []) : [];
          const payments = paymentsRes.status === 'fulfilled' ? (paymentsRes.value.data.data?.payments || paymentsRes.value.data.data || []) : [];
          const reports = reportsRes.status === 'fulfilled' ? (reportsRes.value.data.data?.items || reportsRes.value.data.data || []) : [];

          // 🌟 STAT BLOCKS
          setStatBlocks([
            { label: 'Residents', value: users.filter(u => u.role === 'resident').length, icon: <PeopleIcon />, color: '#3b82f6', path: '/residents' },
            { label: 'Pending Payments', value: payments.filter(p => p.status === 'pending').length, icon: <ScheduleIcon />, color: '#f59e0b', path: '/payments' },
            { label: 'Open Reports', value: reports.filter(r => r.status !== 'resolved').length, icon: <AssignmentIcon />, color: '#8b5cf6', path: '/reports' },
          ]);

          // 🌟 QUICK ACTIONS (Grid of 6 buttons for Condo Admin)
          setQuickActions([
            { label: 'Residents', icon: <PeopleIcon />, path: '/residents', color: '#3b82f6' },
            { label: 'Rooms', icon: <HomeIcon />, path: '/rooms', color: '#10b981' },
            { label: 'Equb & Iddir', icon: <AccountBalanceIcon />, path: '/equb', color: '#D3AD32' },
            { label: 'Lost & Found', icon: <SearchIcon />, path: '/lost-found', color: '#8b5cf6' },
            { label: 'Announcements', icon: <CampaignIcon />, path: '/announcements', color: '#f59e0b' },
            { label: 'Reports', icon: <AssignmentIcon />, path: '/reports', color: '#3b82f6' },
          ]);

          setActivityFeed(reports.slice(0, 5).map(r => ({
            title: `Report: ${r.title}`,
            subtitle: r.status.replace('_', ' '),
            date: r.createdAt,
          })));

        } else {
          // Guard & Resident
          const [annRes, repRes] = await Promise.allSettled([
            api.announcements.getAll({ page: 1, limit: 5 }),
            isGuard ? api.reports.getAdminAll({ page: 1, limit: 5 }) : api.reports.getMy({ page: 1, limit: 5 }),
          ]);

          const announcements = annRes.status === 'fulfilled' ? (annRes.value.data.data?.items || annRes.value.data.data || []) : [];
          const reports = repRes.status === 'fulfilled' ? (repRes.value.data.data?.items || repRes.value.data.data || []) : [];

          setStatBlocks([
            { label: 'Announcements', value: announcements.length, icon: <CampaignIcon />, color: '#D3AD32', path: '/announcements' },
            { label: isGuard ? 'Condo Reports' : 'My Reports', value: reports.length, icon: <AssignmentIcon />, color: '#8b5cf6', path: '/reports' },
          ]);

          // Resident & Guard Quick Actions
          setQuickActions([
            { label: 'Reports', icon: <AssignmentIcon />, path: '/reports', color: '#3b82f6' },
            { label: 'Lost & Found', icon: <SearchIcon />, path: '/lost-found', color: '#8b5cf6' },
            { label: 'Equb & Iddir', icon: <AccountBalanceIcon />, path: '/equb', color: '#D3AD32' },
            { label: 'Announcements', icon: <CampaignIcon />, path: '/announcements', color: '#f59e0b' },
          ]);
          
          setActivityFeed(announcements.slice(0, 5).map(a => ({
            title: a.title,
            subtitle: a.announcementType,
            date: a.createdAt,
          })));
        }
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [role, user, isSuperAdmin, isCondoAdmin, isGuard]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress sx={{ color: '#D3AD32' }} /></Box>;

  return (
    <Box sx={{ p: 2, pb: 4 }}>
      {/* ── Greeting Card ─────────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '20px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <Avatar src={user?.profilePhoto || undefined} sx={{ width: 56, height: 56, bgcolor: '#D3AD32', fontWeight: 700, fontSize: '1.2rem' }}>
            {user?.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Welcome back,</Typography>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{user?.fullName || 'User'}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5, display: 'block' }}>
              {isSuperAdmin && '🌍 System Administrator'}
              {isCondoAdmin && `🏢 ${user?.condoCode || 'Condo'} · Admin`}
              {isGuard && `🛡️ ${user?.condoCode || 'Condo'} · Guard`}
              {!isSuperAdmin && !isCondoAdmin && !isGuard && `🏢 ${user?.condoCode || 'Condo'} · Block ${user?.block || '—'}, Room ${user?.roomNo || '—'}`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(211, 173, 50, 0.1)' }} />
      </Paper>

      {/* ── Stat Blocks ───────────────────────────────────────────────── */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a2e' }}>Overview</Typography>
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {statBlocks.map((stat) => (
          <Grid item xs={6} sm={4} key={stat.label} component="div">
            <Paper elevation={0} onClick={() => stat.path && navigate(stat.path)} sx={{ p: 2, borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', cursor: stat.path ? 'pointer' : 'default', transition: 'transform 0.2s', '&:active': { transform: 'scale(0.97)' }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{stat.icon}</Box>
              <Box sx={{ minWidth: 0 }}><Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1, color: '#1a1a2e', fontSize: '1.1rem' }}>{stat.value}</Typography><Typography variant="caption" sx={{ color: '#6b7a8f', fontSize: '0.7rem' }} noWrap>{stat.label}</Typography></Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── Quick Actions Grid ────────────────────────────────────────── */}
      {quickActions.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a2e' }}>Management Actions</Typography>
          <Grid container spacing={1.5}>
            {quickActions.map((action) => (
              <Grid item xs={4} key={action.label} component="div">
                <Paper elevation={0} onClick={() => navigate(action.path)} sx={{ p: 2, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'transform 0.2s', '&:active': { transform: 'scale(0.96)' } }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${action.color}15`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{action.icon}</Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center', color: '#1a1a2e', lineHeight: 1.2 }}>{action.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ── Recent Activity Feed ──────────────────────────────────────── */}
      {activityFeed.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a2e' }}>Recent Activity</Typography>
          <Paper elevation={0} sx={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            {activityFeed.map((item, index) => (
              <Box key={index}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#D3AD32', mt: 1, flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.3 }} noWrap>{item.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.7rem' }}>{item.subtitle} • {new Date(item.date).toLocaleDateString()}</Typography>
                  </Box>
                </Box>
                {index < activityFeed.length - 1 && <Divider />}
              </Box>
            ))}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Home;