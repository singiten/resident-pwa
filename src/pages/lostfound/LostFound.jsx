import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Fab,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import EmptyState from '../../components/common/EmptyState';

const LostFound = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'found'
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    type: 'lost',
    itemName: '',
    description: '',
    category: 'other',
    location: '',
    dateLostFound: new Date().toISOString().split('T')[0],
    photo: null,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.lostFound.getAll({ limit: 50, type: activeTab });
      const data = res.data.data;
      const fetchedItems = data?.items || data || [];
      setItems(fetchedItems);
    } catch (err) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleSubmit = async () => {
    if (!formData.itemName || !formData.description) {
      toast.warning('Item name and description are required');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('type', formData.type);
      submitData.append('itemName', formData.itemName);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      if (formData.location) submitData.append('location', formData.location);
      submitData.append('dateLostFound', formData.dateLostFound);
      if (formData.photo) submitData.append('photo', formData.photo);

      await api.lostFound.create(submitData);
      toast.success('Item posted successfully!');
      setOpenModal(false);
      setFormData({
        type: activeTab,
        itemName: '',
        description: '',
        category: 'other',
        location: '',
        dateLostFound: new Date().toISOString().split('T')[0],
        photo: null,
      });
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async (id) => {
    if (!window.confirm('Are you sure this item belongs to you? The admin will verify this claim.')) return;
    try {
      await api.lostFound.claim(id, {});
      toast.success('Claim submitted! The admin will contact you.');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Header */}
      <Box sx={{ p: 2, pb: 0, bgcolor: '#fff', borderBottom: '1px solid #eef0f3' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1a1a2e' }}>
          Lost & Found
        </Typography>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#D3AD32', height: 3, borderRadius: '3px 3px 0 0' },
            '& .Mui-selected': { color: '#1a1a2e !important', fontWeight: 700 },
          }}
        >
          <Tab label="Lost Items" value="lost" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Found Items" value="found" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#D3AD32' }} />
          </Box>
        ) : items.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title={`No ${activeTab === 'lost' ? 'Lost' : 'Found'} Items`}
            message={`Nothing has been reported ${activeTab} yet.`}
            actionLabel={`Post ${activeTab === 'lost' ? 'Lost' : 'Found'} Item`}
            onAction={() => {
              setFormData({ ...formData, type: activeTab });
              setOpenModal(true);
            }}
          />
        ) : (
          items.map((item) => (
            <Paper
              key={item.id}
              elevation={0}
              sx={{ p: 2, mb: 2, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <Box sx={{ display: 'flex', gap: 2 }}>
                {item.photoUrl ? (
                  <Box component="img" src={item.photoUrl} sx={{ width: 80, height: 80, borderRadius: '12px', objectFit: 'cover' }} />
                ) : (
                  <Box sx={{ width: 80, height: 80, borderRadius: '12px', bgcolor: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SearchIcon sx={{ color: '#9ca3af' }} />
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2 }}>
                      {item.itemName}
                    </Typography>
                    <Chip label={item.category} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(211,173,50,0.1)', color: '#D3AD32' }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#6b7a8f', fontSize: '0.8rem', mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </Typography>
                  
                  {item.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>{item.location}</Typography>
                    </Box>
                  )}

                  {/* Claim Button - only show for found items that are open */}
                  {item.type === 'found' && item.status === 'open' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleClaim(item.id)}
                      sx={{ mt: 1, borderColor: '#D3AD32', color: '#D3AD32', '&:hover': { bgcolor: 'rgba(211,173,50,0.05)' } }}
                    >
                      This is mine (Claim)
                    </Button>
                  )}
                  {item.status !== 'open' && (
                    <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 600, display: 'block', mt: 1 }}>
                      {item.status === 'claimed' ? '✓ Claimed' : 'Matched'}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Box>

      {/* FAB */}
      <Fab
        color="primary"
        onClick={() => {
          setFormData({ ...formData, type: activeTab });
          setOpenModal(true);
        }}
        sx={{ position: 'fixed', bottom: 80, right: 20, bgcolor: '#D3AD32', '&:hover': { bgcolor: '#c49a2b' } }}
      >
        <AddIcon />
      </Fab>

      {/* Post Item Modal */}
      <Dialog
        open={openModal}
        onClose={() => !submitting && setOpenModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '24px', m: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #f1f3f5' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Post Item</Typography>
          <Button onClick={() => setOpenModal(false)} sx={{ minWidth: 0, color: '#6b7a8f' }}>
            <CloseIcon />
          </Button>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              label="Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="lost">I lost this item</MenuItem>
              <MenuItem value="found">I found this item</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Item Name"
            fullWidth
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="e.g., Black Leather Wallet"
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <MenuItem value="electronics">Electronics</MenuItem>
              <MenuItem value="documents">Documents</MenuItem>
              <MenuItem value="keys">Keys</MenuItem>
              <MenuItem value="clothing">Clothing</MenuItem>
              <MenuItem value="jewelry">Jewelry</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Location (Optional)"
            fullWidth
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="e.g., Near the main gate"
          />

          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="lf-photo-upload"
            type="file"
            onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
          />
          <label htmlFor="lf-photo-upload">
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
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Post Item'}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default LostFound;