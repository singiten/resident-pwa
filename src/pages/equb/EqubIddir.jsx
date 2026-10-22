import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EmptyState from '../../components/common/EmptyState';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const EqubIddir = () => {
  const { user } = useAuth();
  const isAdmin = ['super_admin', 'condo_admin'].includes(user?.role);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('equb');
  const [equbs, setEqubs] = useState([]);
  const [iddirs, setIddirs] = useState([]);
  
  // Create Modal State
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', contributionAmount: '', startDate: '', dueDate: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'equb') {
        const res = isAdmin 
          ? await api.equbs.getByCondo(user.condoId, { page: 1, limit: 20 })
          : await api.equbs.getPublic(user.condoId, { page: 1, limit: 20 });
        const data = res.data.data;
        setEqubs(Array.isArray(data) ? data : (data?.items || []));
      } else {
        const res = isAdmin 
          ? await api.iddirs.getByCondo(user.condoId, { page: 1, limit: 20 })
          : await api.iddirs.getByCondo(user.condoId, { page: 1, limit: 20 }); // Assuming no public route for iddirs yet
        const data = res.data.data;
        setIddirs(Array.isArray(data) ? data : (data?.items || []));
      }
    } catch (err) {
      toast.error(`Failed to load ${activeTab}s`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab, isAdmin, user]);

  const handleCreate = async () => {
    try {
      if (activeTab === 'equb') {
        await api.equbs.create(user.condoId, formData);
      } else {
        await api.iddirs.create(user.condoId, formData);
      }
      toast.success(`${activeTab} created!`);
      setOpenModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const currentList = activeTab === 'equb' ? equbs : iddirs;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f8f9fa' }}>
      <Box sx={{ p: 2, pb: 0, bgcolor: '#fff', borderBottom: '1px solid #eef0f3' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Community Groups</Typography>
          {isAdmin && <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)} sx={{ borderRadius: '20px' }}>Create</Button>}
        </Box>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth" sx={{ '& .MuiTabs-indicator': { backgroundColor: '#D3AD32', height: 3 } }}>
          <Tab label="Equbs" value="equb" sx={{ fontWeight: 600 }} />
          <Tab label="Iddirs" value="iddir" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loading ? <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} /> : 
          currentList.length === 0 ? <EmptyState icon={activeTab === 'equb' ? SavingsIcon : PeopleIcon} title={`No ${activeTab}s`} message="No groups found." /> : 
          currentList.map(group => (
            <Paper key={group.id} elevation={0} sx={{ p: 2, mb: 2, borderRadius: '16px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>{group.name}</Typography>
                <Chip label={group.status} size="small" color={group.status === 'active' ? 'success' : 'default'} sx={{ textTransform: 'capitalize' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Contribution: <strong>ETB {group.contributionAmount}</strong></Typography>
              <Typography variant="caption" color="text.secondary">Members: {group.noMembers || 0}</Typography>
            </Paper>
          ))
        }
      </Box>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '24px', m: 2 } } }}>
        <DialogTitle>Create {activeTab === 'equb' ? 'Equb' : 'Iddir'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField label="Name" fullWidth value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} sx={{ mb: 2, mt: 1 }} />
          <TextField label="Contribution Amount (ETB)" type="number" fullWidth value={formData.contributionAmount} onChange={e => setFormData({ ...formData, contributionAmount: e.target.value })} sx={{ mb: 2 }} />
          {activeTab === 'equb' && (
            <>
              <TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} sx={{ mb: 2 }} />
              <TextField label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} sx={{ mb: 2 }} />
            </>
          )}
          {activeTab === 'iddir' && (
            <TextField label="Started Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} sx={{ mb: 2 }} />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EqubIddir;