import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import EmptyState from '../../components/common/EmptyState';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    photo: null,
  });

    const fetchReports = async () => {
    try {
      setLoading(true);
      // Check role
      const isAdmin = ['condo_admin', 'super_admin'].includes(user?.role);
      
      const res = isAdmin 
        ? await api.reports.getAdminAll({ limit: 50 }) // Admin fetches all
        : await api.reports.getMy({ limit: 50 }); // Resident fetches their own
        
      const data = res.data.data;
      const items = data?.items || data || [];
      setReports(items);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.warning('Title and description are required');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);
      if (formData.photo) {
        submitData.append('photo', formData.photo);
      }

      await api.reports.create(submitData);
      toast.success('Report submitted successfully!');
      setOpenModal(false);
      setFormData({ title: '', description: '', category: 'other', priority: 'medium', photo: null });
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
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
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1a1a2e' }}>
        My Reports
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#D3AD32' }} />
        </Box>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={AssignmentIcon}
          title="No Reports Yet"
          message="Submit a report to notify the admin about an issue in your condominium."
          actionLabel="Submit Report"
          onAction={() => setOpenModal(true)}
        />
      ) : (
        reports.map((report) => {
          const statusTheme = getStatusColor(report.status);
          return (
            <Paper
              key={report.id}
              elevation={0}
              sx={{ p: 2, mb: 2, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Chip
                  label={report.status.replace('_', ' ')}
                  size="small"
                  sx={{ bgcolor: statusTheme.bg, color: statusTheme.color, fontWeight: 700, textTransform: 'capitalize' }}
                />
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                {report.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {report.description}
              </Typography>
              
              {report.responses && report.responses.length > 0 && (
                <Box sx={{ bgcolor: '#f8f9fa', p: 1.5, borderRadius: '8px', borderLeft: '3px solid #D3AD32' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    Admin Response:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7a8f', display: 'block' }}>
                    "{report.responses[report.responses.length - 1].message}"
                  </Typography>
                </Box>
              )}
            </Paper>
          );
        })
      )}

      {/* FAB to create report */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setOpenModal(true)}
        sx={{ position: 'fixed', bottom: 80, right: 20, bgcolor: '#D3AD32', '&:hover': { bgcolor: '#c49a2b' } }}
      >
        <AddIcon />
      </Fab>

      {/* Create Report Modal */}
      <Dialog
        open={openModal}
        onClose={() => !submitting && setOpenModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '24px', m: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #f1f3f5' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>New Report</Typography>
          <Button onClick={() => setOpenModal(false)} sx={{ minWidth: 0, color: '#6b7a8f' }}>
            <CloseIcon />
          </Button>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            label="Title"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="e.g., Broken Elevator"
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="Describe the issue in detail..."
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <MenuItem value="plumbing">Plumbing</MenuItem>
              <MenuItem value="electrical">Electrical</MenuItem>
              <MenuItem value="noise">Noise</MenuItem>
              <MenuItem value="security">Security</MenuItem>
              <MenuItem value="structural">Structural</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              label="Priority"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
            </Select>
          </FormControl>

          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="report-photo-upload"
            type="file"
            onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
          />
          <label htmlFor="report-photo-upload">
            <Button variant="outlined" component="span" fullWidth sx={{ borderStyle: 'dashed' }}>
              {formData.photo ? formData.photo.name : '+ Attach Photo (Optional)'}
            </Button>
          </label>
        </DialogContent>
        <Box sx={{ p: 3, pt: 0 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ py: 1.5 }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Report'}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Reports;