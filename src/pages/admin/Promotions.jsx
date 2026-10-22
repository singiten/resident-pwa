import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Chip, Grid, IconButton, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const Promotions = () => {
  const [loading, setLoading] = useState(true);
  const [promos, setPromos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'shop', price: '', businessName: '', contactNumber: '', expiresAt: ''
  });

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await api.promotions.getAll({ status: 'all' }); // Admin sees all
      const data = res.data.data;
      setPromos(data?.items || data || []);
    } catch (err) {
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      const form = new FormData();
      Object.keys(formData).forEach(key => form.append(key, formData[key]));
      await api.promotions.create(form);
      toast.success('Promotion created (Pending Approval)');
      setOpenModal(false);
      fetchPromos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create promotion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await api.promotions.review(id, { status });
      toast.success(`Promotion ${status}`);
      fetchPromos();
    } catch (err) {
      toast.error('Failed to review promotion');
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#D3AD32' }} /></Box>;

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e' }}>Promotions</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)} sx={{ borderRadius: '20px' }}>
          Create
        </Button>
      </Box>

      <Grid container spacing={2}>
        {promos.map(promo => (
          <Grid item xs={12} sm={6} key={promo.id} component="div">
            <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>{promo.title}</Typography>
                <Chip label={promo.status} size="small" sx={{ textTransform: 'capitalize', fontWeight: 700 }} color={promo.status === 'approved' ? 'success' : promo.status === 'pending' ? 'warning' : 'default'} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{promo.description}</Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" fontWeight={600}>{promo.businessName} • ETB {promo.price}</Typography>
                {promo.status === 'pending' && (
                  <Box>
                    <IconButton size="small" onClick={() => handleReview(promo.id, 'approved')} sx={{ color: '#22c55e' }}><CheckCircleIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleReview(promo.id, 'rejected')} sx={{ color: '#dc2626' }}><CancelIcon fontSize="small" /></IconButton>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Create Modal */}
      <Dialog open={openModal} onClose={() => !submitting && setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Promotion</DialogTitle>
        <DialogContent>
          <TextField label="Title" fullWidth value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} sx={{ mb: 2, mt: 1 }} />
          <TextField label="Description" fullWidth multiline rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}><TextField label="Business Name" fullWidth value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Contact Number" fullWidth value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Price (ETB)" type="number" fullWidth value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Expiry Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.expiresAt} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Promotions;