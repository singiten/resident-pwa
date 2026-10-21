import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Chip, Avatar, IconButton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import EmptyState from '../../components/common/EmptyState';

const Residents = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      let allUsers = [];

      if (user.role === 'super_admin') {
        // 1. Fetch all condos first
        const condosRes = await api.condos.getAll();
        const condos = condosRes.data.data || [];

        // 2. Fetch users for each condo
        const userPromises = condos.map(condo => 
          api.users.getByCondo(condo.id)
            .then(res => res.data.data || [])
            .catch(() => []) // Ignore errors on empty condos
        );

        const usersByCondo = await Promise.all(userPromises);
        
        // 3. Flatten the array of arrays into a single array
        allUsers = usersByCondo.flat();
      } else {
        // Condo Admin - only fetch their condo
        const res = await api.users.getByCondo(user.condoId);
        const data = res.data.data;
        allUsers = Array.isArray(data) ? data : (data?.users || data?.items || []);
      }

      setUsers(allUsers);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleVerify = async (condoId, userId) => {
    try {
      await api.users.verify(condoId, userId);
      toast.success('User verified');
      fetchUsers();
    } catch (err) {
      toast.error('Verify failed');
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#D3AD32' }} /></Box>;

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1a1a2e' }}>
        {user.role === 'super_admin' ? 'All System Users' : 'Condo Residents'}
      </Typography>

      {users.length === 0 ? (
        <EmptyState icon={PeopleIcon} title="No Users" message="No users found." />
      ) : (
        users.map((u) => (
          <Paper key={u.id} elevation={0}
            sx={{ p: 2, mb: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <Avatar sx={{ bgcolor: u.role === 'super_admin' ? '#dc2626' : u.role === 'condo_admin' ? '#3b82f6' : '#D3AD32' }}>
              {u.fullName?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{u.fullName}</Typography>
              <Typography variant="caption" sx={{ color: '#6b7a8f' }} noWrap>{u.email}</Typography>
              {user.role === 'super_admin' && (
                <Typography variant="caption" sx={{ display: 'block', color: '#9ca3af', mt: 0.3 }}>
                  {u.condoCode || 'No Condo'} • {u.role}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Chip label={u.role} size="small" sx={{ textTransform: 'capitalize', fontWeight: 700 }} />
              <Chip
                label={u.isVerified ? 'Verified' : 'Pending'}
                size="small"
                color={u.isVerified ? 'success' : 'warning'}
                variant="outlined"
              />
            </Box>
            {!u.isVerified && ['condo_admin', 'super_admin'].includes(user.role) && u.condoId && (
              <IconButton size="small" onClick={() => handleVerify(u.condoId, u.id)} sx={{ color: '#22c55e' }}>
                <VerifiedIcon fontSize="small" />
              </IconButton>
            )}
          </Paper>
        ))
      )}
    </Box>
  );
};

export default Residents;