import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, CircularProgress, Fab, Dialog, DialogTitle,
  DialogContent, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext'; // ✅ Fixed missing import

const Reports = () => {
  const { user } = useAuth(); // ✅ Now it works
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', category: 'other', priority: 'medium', photo: null,
  });

  const isAdmin = ['condo_admin', 'super_admin'].includes(user?.role);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Send pagination to satisfy backend validation
      const res = isAdmin 
        ? await api.reports.getAdminAll({ page: 1, limit: 50 }) 
        : await api.reports.getMy({ page: 1, limit: 50 });
      
      const data = res.data.data;
      const items = data?.items || data || [];
      setReports(items);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [isAdmin]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.warning('Title and description are required');
      return;
    }
    try {
      setSubmitting(true);
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) submitData.append(key, formData[key]);
      });
      await api.reports.create(submitData);
      toast.success('Report submitted!');
      setOpenModal(false);
      setFormData({ title: '', description: '', category: 'other', priority: 'medium', photo: null });
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.reports.updateStatus(id, { status });
      toast.success(`Report marked as ${status}`);
      fetchReports();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      case 'assigned': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'in_progress': return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' };
      case 'resolved': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
      default: return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    }
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1a1a2e' }}>{isAdmin ? 'Condo Reports' : 'My Reports'}</Typography>

      {loading ? <CircularProgress sx={{ color: '#D3AD32', display: 'block', mx: 'auto', my: 4 }} /> : 
        reports.length === 0 ? (
          <EmptyState icon={AssignmentIcon} title="No Reports Yet" message="Submit a report to notify the admin." actionLabel={!isAdmin ? "Submit Report" : null} onAction={() => setOpenModal(true)} />
        ) : (
          reports.map((report) => {
            const statusTheme = getStatusColor(report.status);
            return (
              <Paper key={report.id} elevation={0} sx={{ p: 2, mb: 2, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Chip label={report.status.replace('_', ' ')} size="small" sx={{ bgcolor: statusTheme.bg, color: statusTheme.color, fontWeight: 700, textTransform: 'capitalize' }} />
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>{new Date(report.createdAt).toLocaleDateString()}</Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{report.title}</Typography>
                <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 1.5 }}>{report.description}</Typography>
                
                {isAdmin && report.status !== 'resolved' && (
                  <Button size="small" variant="outlined" startIcon={<CheckCircleIcon />} onClick={() => handleUpdateStatus(report.id, 'resolved')} sx={{ mt: 1 }}>
                    Mark Resolved
                  </Button>
                )}

                {report.responses && report.responses.length > 0 && (
                  <Box sx={{ bgcolor: '#f8f9fa', p: 1.5, borderRadius: '8px', mt: 2, borderLeft: '3px solid #D3AD32' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Admin Response:</Typography>
                    <Typography variant="caption" sx={{ color: '#6b7a8f', display: 'block' }}>"{report.responses[report.responses.length - 1].message}"</Typography>
                  </Box>
                )}
              </Paper>
            );
          })
        )}

      {!isAdmin && (
        <Fab color="primary" onClick={() => setOpenModal(true)} sx={{ position: 'fixed', bottom: 80, right: 20, bgcolor: '#D3AD32' }}>
          <AddIcon />
        </Fab>
      )}

      {/* Create Report Modal - FIXED PaperProps */}
      <Dialog open={openModal} onClose={() => !submitting && setOpenModal(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: '24px', m: 2 } } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #f1f3f5' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>New Report</Typography>
          <IconButton onClick={() => setOpenModal(false)}><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <TextField label="Title" fullWidth value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Description" fullWidth multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select value={formData.category} label="Category" onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              <MenuItem value="plumbing">Plumbing</MenuItem>
              <MenuItem value="electrical">Electrical</MenuItem>
              <MenuItem value="noise">Noise</MenuItem>
              <MenuItem value="security">Security</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <Box sx={{ p: 3, pt: 0 }}>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={submitting} sx={{ py: 1.5 }}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Reports;