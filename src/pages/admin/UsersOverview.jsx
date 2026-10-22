import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Avatar, Button, IconButton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UsersOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [condos, setCondos] = useState([]);
  const [selectedCondo, setSelectedCondo] = useState(null);
  const [condoUsers, setCondoUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const condosRes = await api.condos.getAll();
        const condosData = condosRes.data.data || [];

        // Get user counts for each condo (just total, not full objects)
        const statsPromises = condosData.map(async (condo) => {
          try {
            const usersRes = await api.users.getByCondo(condo.id);
            const users = usersRes.data.data || [];
            return {
              ...condo,
              totalUsers: users.length,
              residents: users.filter(u => u.role === 'resident').length,
              guards: users.filter(u => u.role === 'guard').length,
            };
          } catch (e) {
            return { ...condo, totalUsers: 0, residents: 0, guards: 0 };
          }
        });

        const results = await Promise.all(statsPromises);
        setCondos(results);
      } catch (err) {
        toast.error('Failed to load overview');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleViewUsers = async (condo) => {
    setSelectedCondo(condo);
    setFetchingUsers(true);
    try {
      const res = await api.users.getByCondo(condo.id);
      setCondoUsers(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load users for this condo');
    } finally {
      setFetchingUsers(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#D3AD32' }} /></Box>;

  // Detailed User View
  if (selectedCondo) {
    return (
      <Box sx={{ p: 2, pb: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconButton onClick={() => setSelectedCondo(null)}><ArrowBackIcon /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{selectedCondo.condoName} - Users</Typography>
        </Box>

        {fetchingUsers ? <CircularProgress /> : (
          <Grid container spacing={2}>
            {condoUsers.map((u) => (
              <Grid item xs={12} sm={6} key={u.id} component="div">
                <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: u.role === 'condo_admin' ? '#3b82f6' : '#D3AD32' }}>{u.fullName?.charAt(0)}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>{u.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{u.email}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ display: 'block', textTransform: 'capitalize', fontWeight: 700, color: u.role === 'condo_admin' ? '#3b82f6' : '#6b7280' }}>{u.role}</Typography>
                    <Typography variant="caption" color={u.isVerified ? 'success.main' : 'warning.main'}>{u.isVerified ? 'Verified' : 'Pending'}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  }

  // Condo List View
  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>System Users by Condo</Typography>
      {condos.map((condo) => (
        <Paper key={condo.id} elevation={0} sx={{ p: 2, mb: 2, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: '#1a1a2e' }}>{condo.condoName.charAt(0)}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>{condo.condoName}</Typography>
              <Typography variant="caption" color="text.secondary">{condo.condoCode}</Typography>
            </Box>
            <Button size="small" variant="outlined" onClick={() => handleViewUsers(condo)}>View Users</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6b7280' }}><PeopleIcon fontSize="small" /> <Typography variant="body2">{condo.totalUsers} Total</Typography></Box>
            <Typography variant="body2" sx={{ color: '#22c55e' }}>{condo.residents} Residents</Typography>
            <Typography variant="body2" sx={{ color: '#f59e0b' }}>{condo.guards} Guards</Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default UsersOverview;