import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import EmptyState from '../../components/common/EmptyState';

const Residents = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Modals
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    fullName: '', phoneNumber: '', block: '', roomNo: '', isVerified: false
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let allUsers = [];

      if (isSuperAdmin) {
        // Super Admin fetches users per condo (as fixed previously)
        const condosRes = await api.condos.getAll();
        const condos = condosRes.data.data || [];
        const userPromises = condos.map(c => api.users.getByCondo(c.id).then(r => r.data.data || []).catch(() => []));
        const results = await Promise.all(userPromises);
        allUsers = results.flat();
      } else {
        // Condo Admin fetches only their condo
        const res = await api.users.getByCondo(user.condoId);
        const data = res.data.data;
        allUsers = Array.isArray(data) ? data : (data?.users || data?.items || []);
      }
      setUsers(allUsers);
    } catch (err) {
      toast.error('Failed to load residents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [user]);

  // ── CRUD ACTIONS ──────────────────────────────────────────────────

  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setFormData({
      fullName: u.fullName || '',
      phoneNumber: u.phoneNumber || '',
      block: u.block || '',
      roomNo: u.roomNo || '',
      isVerified: u.isVerified || false,
    });
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      await api.users.update(selectedUser.condoId, selectedUser.id, formData);
      toast.success('User updated successfully');
      setOpenEdit(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyToggle = async (u) => {
    try {
      // Backend expects { isVerified: true/false }
      await api.users.verify(u.condoId, u.id, { isVerified: !u.isVerified });
      toast.success(`User marked as ${!u.isVerified ? 'Verified' : 'Pending'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleOpenDelete = (u) => {
    setSelectedUser(u);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await api.users.delete(selectedUser.condoId, selectedUser.id);
      toast.success('User deleted successfully');
      setOpenDelete(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#D3AD32' }} /></Box>;

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1a1a2e' }}>
        {isSuperAdmin ? 'All Users' : 'Condo Residents'}
      </Typography>

      {users.length === 0 ? (
        <EmptyState icon={PeopleIcon} title="No Users" message="No users found." />
      ) : (
        users.map((u) => (
          <Paper key={u.id} elevation={0} sx={{ p: 2, mb: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <Avatar sx={{ bgcolor: u.role === 'super_admin' ? '#dc2626' : u.role === 'condo_admin' ? '#3b82f6' : '#D3AD32' }}>
              {u.fullName?.charAt(0)}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{u.fullName}</Typography>
              <Typography variant="caption" sx={{ color: '#6b7a8f' }} noWrap>{u.email}</Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#9ca3af', mt: 0.3 }}>
                Block {u.block || '—'}, Room {u.roomNo || '—'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Chip label={u.role} size="small" sx={{ textTransform: 'capitalize', fontWeight: 700 }} />
              <Chip
                label={u.isVerified ? 'Verified' : 'Pending'}
                size="small"
                color={u.isVerified ? 'success' : 'warning'}
                variant="outlined"
                onClick={() => !isSuperAdmin && handleVerifyToggle(u)}
                sx={{ cursor: !isSuperAdmin ? 'pointer' : 'default' }}
              />
            </Box>

            {/* Actions - Only show for Admins */}
            {!isSuperAdmin && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                <IconButton size="small" onClick={() => handleOpenEdit(u)} sx={{ color: '#3b82f6' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleOpenDelete(u)} sx={{ color: '#dc2626' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Paper>
        ))
      )}

      {/* ── EDIT MODAL ────────────────────────────────────────────────── */}
      <Dialog open={openEdit} onClose={() => !submitting && setOpenEdit(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '24px', m: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Resident</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField label="Full Name" fullWidth value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} sx={{ mb: 2, mt: 1 }} />
          <TextField label="Phone Number" fullWidth value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}><TextField label="Block" fullWidth value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Room" fullWidth value={formData.roomNo} onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })} /></Grid>
          </Grid>
          <FormControl fullWidth>
            <InputLabel>Verification Status</InputLabel>
            <Select value={formData.isVerified} label="Verification Status" onChange={(e) => setFormData({ ...formData, isVerified: e.target.value })}>
              <MenuItem value={true}>Verified</MenuItem>
              <MenuItem value={false}>Pending</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEdit(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
        </DialogActions>
      </Dialog>

      {/* ── DELETE MODAL ──────────────────────────────────────────────── */}
      <Dialog open={openDelete} onClose={() => !submitting && setOpenDelete(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '24px', m: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#dc2626' }}>Delete Resident</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to delete <strong>{selectedUser?.fullName}</strong>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={submitting}>{submitting ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Residents;