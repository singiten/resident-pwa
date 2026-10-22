import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import EmptyState from '../../components/common/EmptyState';

const Rooms = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Modal State
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({ status: 'free', occupiedById: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch rooms and users in parallel
      const [roomsRes, usersRes] = await Promise.all([
        api.rooms.getAll({ condoId: user.condoId }),
        api.users.getByCondo(user.condoId)
      ]);

      const roomData = roomsRes.data.data || [];
      const userData = usersRes.data.data || [];

      setRooms(roomData);
      // Only show residents as options to assign to a room
      setUsers(userData.filter(u => u.role === 'resident'));
    } catch (err) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleOpenEdit = (room) => {
    setSelectedRoom(room);
    setFormData({
      status: room.status,
      occupiedById: room.occupiedById || '',
    });
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      const payload = {
        status: formData.status,
        // If status is free, remove the user. If occupied/reserved, attach the user.
        occupiedById: formData.status === 'free' ? null : formData.occupiedById
      };
      
      if (formData.status !== 'free' && !formData.occupiedById) {
        toast.warning('Please select a resident to assign to this room.');
        return;
      }

      await api.rooms.updateStatus(user.condoId, selectedRoom.id, payload);
      toast.success('Room status updated!');
      setOpenEdit(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (status) => {
    const colors = {
      free: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
      occupied: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626' },
      reserved: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    };
    const c = colors[status] || colors.free;
    return <Chip label={status} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, textTransform: 'capitalize' }} />;
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#D3AD32' }} /></Box>;

  // Group rooms by Block for cleaner display
  const groupedRooms = rooms.reduce((acc, room) => {
    const blockName = room.block?.blockNo ? `Block ${room.block.blockNo}` : 'Unassigned Block';
    if (!acc[blockName]) acc[blockName] = [];
    acc[blockName].push(room);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1a1a2e' }}>Room Management</Typography>

      {rooms.length === 0 ? (
        <EmptyState icon={MeetingRoomIcon} title="No Rooms" message="No rooms have been configured for this condominium yet." />
      ) : (
        Object.keys(groupedRooms).sort().map((blockName) => (
          <Box key={blockName} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#6b7a8f', mb: 1.5, textTransform: 'uppercase' }}>
              {blockName}
            </Typography>
            <Grid container spacing={2}>
              {groupedRooms[blockName].map(room => (
                <Grid item xs={12} sm={6} key={room.id} component="div">
                  <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Room {room.roomNo} <Typography component="span" variant="caption" color="text.secondary">(Floor {room.floorNo})</Typography>
                      </Typography>
                      {getStatusChip(room.status)}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {room.model?.replace('_', ' ').toUpperCase() || 'Standard'} • {room.price ? `ETB ${room.price}` : 'No price set'}
                    </Typography>

                    {room.occupiedBy && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, bgcolor: '#f8f9fa', p: 1, borderRadius: '8px' }}>
                        <PersonIcon fontSize="small" sx={{ color: '#6b7a8f' }} />
                        <Typography variant="caption" fontWeight={600}>{room.occupiedBy.fullName}</Typography>
                      </Box>
                    )}

                    <Button size="small" variant="outlined" fullWidth onClick={() => handleOpenEdit(room)}>
                      Update Status
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      {/* Edit Modal */}
      <Dialog open={openEdit} onClose={() => !submitting && setOpenEdit(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '24px', m: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Room {selectedRoom?.roomNo}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <MenuItem value="free">Free (Available)</MenuItem>
              <MenuItem value="reserved">Reserved</MenuItem>
              <MenuItem value="occupied">Occupied</MenuItem>
            </Select>
          </FormControl>

          {formData.status !== 'free' && (
            <FormControl fullWidth>
              <InputLabel>Assign Resident</InputLabel>
              <Select value={formData.occupiedById} label="Assign Resident" onChange={(e) => setFormData({ ...formData, occupiedById: e.target.value })}>
                <MenuItem value=""><em>Select a resident</em></MenuItem>
                {users.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.fullName} (Block {u.block || '—'} / {u.roomNo || '—'})</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEdit(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rooms;