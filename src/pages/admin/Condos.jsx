import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Grid, Chip, IconButton, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const Condos = () => {
  const [loading, setLoading] = useState(true);
  const [condos, setCondos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ condoName: '', address: '', city: '', maxAdmins: 1 });
  
  // Detail Modal State
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState(null);

  const fetchCondos = async () => {
    try {
      setLoading(true);
      const res = await api.condos.getAll();
      setCondos(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load condos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCondos(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData({ condoName: '', address: '', city: '', maxAdmins: 1 });
    setOpenModal(true);
  };

  const openEdit = (condo) => {
    setEditing(condo);
    setFormData({
      condoName: condo.condoName,
      address: condo.address,
      city: condo.city,
      maxAdmins: condo.maxAdmins || 1,
    });
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.condoName || !formData.address || !formData.city) {
      toast.warning('All fields required');
      return;
    }
    try {
      setSubmitting(true);
      if (editing) {
        await api.condos.update(editing.id, formData);
        toast.success('Condo updated!');
      } else {
        await api.condos.create(formData);
        toast.success('Condo created!');
      }
      setOpenModal(false);
      fetchCondos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this condo?')) return;
    try {
      await api.condos.delete(id);
      toast.success('Deleted');
      fetchCondos();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.condos.toggleStatus(id);
      toast.success('Status toggled');
      fetchCondos();
    } catch (err) {
      toast.error('Toggle failed');
    }
  };

  // Grouping Logic
  const groupedCondos = condos.reduce((acc, condo) => {
    const city = condo.city || 'Unknown Location';
    if (!acc[city]) acc[city] = [];
    acc[city].push(condo);
    return acc;
  }, {});

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#D3AD32' }} /></Box>;

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e' }}>Condominiums</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: '20px' }}>
          Add Condo
        </Button>
      </Box>

      {Object.keys(groupedCondos).sort().map((city) => (
        <Box key={city} sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#6b7a8f', mb: 1.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
            📍 {city}
          </Typography>
          
          <Grid container spacing={2}>
            {groupedCondos[city].map((condo) => (
              <Grid item xs={12} sm={6} key={condo.id} component="div">
                <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ p: 1, bgcolor: 'rgba(211,173,50,0.1)', borderRadius: '8px', color: '#D3AD32' }}>
                      <ApartmentIcon />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{condo.condoName}</Typography>
                      <Typography variant="caption" sx={{ color: '#6b7a8f' }}>Code: {condo.condoCode}</Typography>
                    </Box>
                    <Chip label={condo.activeStatus ? 'Active' : 'Inactive'} size="small" color={condo.activeStatus ? 'success' : 'error'} />
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 1 }}>{condo.address}</Typography>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <Chip icon={<PeopleIcon />} label={`${condo._count?.users || 0} Users`} size="small" />
                    <Chip icon={<ViewModuleIcon />} label={`${condo._count?.blocks || 0} Blocks`} size="small" />
                    <Chip icon={<MeetingRoomIcon />} label={`${condo._count?.rooms || 0} Rooms`} size="small" />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button size="small" onClick={() => { setSelectedCondo(condo); setOpenDetail(true); }}>View Details</Button>
                    <Box>
                      <IconButton size="small" onClick={() => handleToggle(condo.id)} sx={{ color: '#f59e0b' }}><PowerSettingsNewIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => openEdit(condo)} sx={{ color: '#3b82f6' }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(condo.id)} sx={{ color: '#dc2626' }}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Create/Edit Modal */}
      <Dialog open={openModal} onClose={() => !submitting && setOpenModal(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Edit Condo' : 'Add Condo'}</DialogTitle>
        <DialogContent>
          <TextField label="Condo Name" fullWidth value={formData.condoName} onChange={(e) => setFormData({ ...formData, condoName: e.target.value })} sx={{ mb: 2, mt: 1 }} />
          <TextField label="City" fullWidth value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Address" fullWidth value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Max Admins" type="number" fullWidth value={formData.maxAdmins} onChange={(e) => setFormData({ ...formData, maxAdmins: parseInt(e.target.value) || 1 })} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>{selectedCondo?.condoName}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={6}><Typography variant="caption" color="text.secondary">Condo Code</Typography><Typography variant="body1" fontWeight={600}>{selectedCondo?.condoCode}</Typography></Grid>
            <Grid item xs={6}><Typography variant="caption" color="text.secondary">Location</Typography><Typography variant="body1">{selectedCondo?.city}, {selectedCondo?.address}</Typography></Grid>
            <Grid item xs={6}><Typography variant="caption" color="text.secondary">Total Residents</Typography><Typography variant="body1" fontWeight={600}>{selectedCondo?._count?.users || 0}</Typography></Grid>
            <Grid item xs={6}><Typography variant="caption" color="text.secondary">Total Blocks</Typography><Typography variant="body1" fontWeight={600}>{selectedCondo?._count?.blocks || 0}</Typography></Grid>
            <Grid item xs={6}><Typography variant="caption" color="text.secondary">Total Rooms</Typography><Typography variant="body1" fontWeight={600}>{selectedCondo?._count?.rooms || 0}</Typography></Grid>
            <Grid item xs={6}><Typography variant="caption" color="text.secondary">Max Admins</Typography><Typography variant="body1" fontWeight={600}>{selectedCondo?.maxAdmins}</Typography></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenDetail(false)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default Condos;