import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Avatar, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Grid } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import PaymentsIcon from '@mui/icons-material/Payments';
import SavingsIcon from '@mui/icons-material/Savings';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    fan: user?.fan || '',
    block: user?.block || '',
    roomNo: user?.roomNo || '',
  });

  const handleLogout = async () => {
    if (window.confirm('Log out?')) { await logout(); navigate('/login'); }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await api.auth.updateProfile(formData);
      // If backend returns updated user, use it. Otherwise merge.
      const updatedUser = res.data.data?.user || { ...user, ...formData };
      updateUser(updatedUser);
      toast.success('Profile updated!');
      setOpenEdit(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>My Profile</Typography>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', mb: 3 }}>
        <Avatar src={user?.profilePhoto || undefined} sx={{ width: 80, height: 80, bgcolor: '#D3AD32', fontSize: '2rem', fontWeight: 700, mx: 'auto', mb: 2, border: '4px solid #fff' }}>
          {user?.fullName?.charAt(0) || 'R'}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{user?.fullName}</Typography>
        <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 1 }}>{user?.email}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ bgcolor: '#f1f3f5', px: 1.5, py: 0.5, borderRadius: '8px', fontWeight: 600 }}>{user?.role?.replace('_', ' ').toUpperCase()}</Typography>
          <Typography variant="caption" sx={{ bgcolor: 'rgba(34,197,94,0.1)', px: 1.5, py: 0.5, borderRadius: '8px', color: '#22c55e', fontWeight: 600 }}>{user?.isVerified ? 'Verified' : 'Unverified'}</Typography>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', mb: 3 }}>
        <List disablePadding>
          <ListItem sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon><HomeIcon color="action" /></ListItemIcon>
            <ListItemText primary="Condo Info" secondary={`${user?.condoCode || 'N/A'} • Block ${user?.block || '—'}, Room ${user?.roomNo || '—'}`} />
          </ListItem>
          <Divider />
          <ListItem sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon><BadgeIcon color="action" /></ListItemIcon>
            <ListItemText primary="FAN Number" secondary={user?.fan || 'Not set'} />
          </ListItem>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/payments')} sx={{ borderRadius: '16px' }}>
              <ListItemIcon><PaymentsIcon sx={{ color: '#22c55e' }} /></ListItemIcon>
              <ListItemText primary="Payments & Dues" />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/equb')} sx={{ borderRadius: '16px' }}>
              <ListItemIcon><SavingsIcon sx={{ color: '#D3AD32' }} /></ListItemIcon>
              <ListItemText primary="Equb & Iddir" />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setOpenEdit(true)} sx={{ borderColor: '#1a1a2e', color: '#1a1a2e' }}>Edit Profile</Button>
        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>Log Out</Button>
      </Box>

      <Dialog open={openEdit} onClose={() => !saving && setOpenEdit(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '24px', m: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Profile</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField label="Full Name" fullWidth value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} sx={{ mb: 2, mt: 1 }} />
          <TextField label="Phone Number" fullWidth value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}><TextField label="Block" fullWidth value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Room" fullWidth value={formData.roomNo} onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })} /></Grid>
          </Grid>
          <TextField label="FAN Number" fullWidth value={formData.fan} onChange={(e) => setFormData({ ...formData, fan: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEdit(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;