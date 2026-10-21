import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import PaymentsIcon from '@mui/icons-material/Payments';
import SavingsIcon from '@mui/icons-material/Savings';
import StorefrontIcon from '@mui/icons-material/Storefront';
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
  });

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      navigate('/login');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await api.auth.updateProfile(formData);
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
      setOpenEdit(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1a1a2e' }}>
        My Profile
      </Typography>

      {/* Profile Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          mb: 3,
        }}
      >
        <Avatar
          src={user?.profilePhoto || undefined}
          sx={{
            width: 80,
            height: 80,
            bgcolor: '#D3AD32',
            fontSize: '2rem',
            fontWeight: 700,
            mx: 'auto',
            mb: 2,
            border: '4px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {user?.fullName?.charAt(0) || 'R'}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {user?.fullName}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 1 }}>
          {user?.email}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ bgcolor: '#f1f3f5', px: 1.5, py: 0.5, borderRadius: '8px', color: '#6b7a8f', fontWeight: 600 }}>
            {user?.role?.replace('_', ' ').toUpperCase()}
          </Typography>
          <Typography variant="caption" sx={{ bgcolor: 'rgba(34,197,94,0.1)', px: 1.5, py: 0.5, borderRadius: '8px', color: '#22c55e', fontWeight: 600 }}>
            {user?.isVerified ? 'Verified' : 'Unverified'}
          </Typography>
        </Box>
      </Paper>

      {/* Details List */}
      <Paper elevation={0} sx={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', mb: 3 }}>
        <List disablePadding>
          <ListItem sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><HomeIcon color="action" /></ListItemIcon>
            <ListItemText primary="Condominium" secondary={`${user?.condoCode || 'N/A'} • Block ${user?.block || '—'}, Room ${user?.roomNo || '—'}`} />
          </ListItem>
          <Divider />
          <ListItem sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><BadgeIcon color="action" /></ListItemIcon>
            <ListItemText primary="FAN Number" secondary={user?.fan || 'Not set'} />
          </ListItem>
          <Divider />
          <ListItem sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><EditIcon color="action" /></ListItemIcon>
            <ListItemText primary="Phone Number" secondary={user?.phoneNumber || 'Not set'} />
          </ListItem>
        </List>
      </Paper>

      {/* Quick Links */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6b7a8f', mb: 1, ml: 1 }}>
        More Features
      </Typography>
      <Paper elevation={0} sx={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', mb: 3 }}>
        <List disablePadding>
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
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/promotions')} sx={{ borderRadius: '16px' }}>
              <ListItemIcon><StorefrontIcon sx={{ color: '#8b5cf6' }} /></ListItemIcon>
              <ListItemText primary="Business Promotions" />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>

      {/* Actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button variant="outlined" onClick={() => setOpenEdit(true)} sx={{ borderColor: '#1a1a2e', color: '#1a1a2e' }}>
          Edit Profile
        </Button>
        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
          Log Out
        </Button>
      </Box>

      {/* Edit Modal */}
      <Dialog open={openEdit} onClose={() => !saving && setOpenEdit(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px', m: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Profile</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Full Name"
            fullWidth
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Phone Number"
            fullWidth
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="FAN Number"
            fullWidth
            value={formData.fan}
            onChange={(e) => setFormData({ ...formData, fan: e.target.value })}
            helperText="16-digit FAN number"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEdit(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile} disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;