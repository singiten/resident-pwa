import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CampaignIcon from '@mui/icons-material/Campaign';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';
import CelebrationIcon from '@mui/icons-material/Celebration';
import PeopleIcon from '@mui/icons-material/People';
import PushPinIcon from '@mui/icons-material/PushPin';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import EmptyState from '../../components/common/EmptyState';

// Filter configuration
const FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'General', value: 'general' },
  { label: 'Emergency', value: 'emergency' },
  { label: 'Event', value: 'event' },
  { label: 'Celebration', value: 'celebration' },
  { label: 'Mourning', value: 'mourning' },
];

const Announcements = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Fetch announcements
    const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (filter !== 'ALL') params.announcementType = filter;
      
      const res = await api.announcements.getAll(params);
      const data = res.data.data;
      const items = data?.items || data || [];
      setAnnouncements(items);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [filter]);

  // Client-side search filtering
  const filteredAnnouncements = announcements.filter((ann) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      ann.title.toLowerCase().includes(term) ||
      ann.body.toLowerCase().includes(term)
    );
  });

  // Helper: Get Icon based on type
  const getTypeConfig = (type) => {
    switch (type) {
      case 'emergency':
        return { icon: <WarningIcon fontSize="small" />, color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' };
      case 'event':
        return { icon: <EventIcon fontSize="small" />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
      case 'celebration':
        return { icon: <CelebrationIcon fontSize="small" />, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
      case 'mourning':
        return { icon: <PeopleIcon fontSize="small" />, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
      default:
        return { icon: <CampaignIcon fontSize="small" />, color: '#D3AD32', bg: 'rgba(211, 173, 50, 0.1)' };
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f8f9fa' }}>
      
      {/* Header & Search */}
      <Box sx={{ p: 2, pb: 1, bgcolor: '#fff', borderBottom: '1px solid #eef0f3' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1a1a2e' }}>
          Announcements
        </Typography>
        
        <TextField
          placeholder="Search announcements..."
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7a8f', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Horizontal Scrollable Tabs */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
          {FILTERS.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              onClick={() => setFilter(f.value)}
              sx={{
                bgcolor: filter === f.value ? '#1a1a2e' : '#f1f3f5',
                color: filter === f.value ? '#fff' : '#6b7a8f',
                fontWeight: 600,
                '&:hover': { bgcolor: filter === f.value ? '#1a1a2e' : '#e9ecef' },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#D3AD32' }} />
          </Box>
        ) : filteredAnnouncements.length === 0 ? (
          <EmptyState
            icon={CampaignIcon}
            title="No Announcements"
            message={searchTerm ? "No announcements match your search." : "There are no announcements for this filter."}
          />
        ) : (
          filteredAnnouncements.map((ann) => {
            const config = getTypeConfig(ann.announcementType);
            return (
              <Paper
                key={ann.id}
                elevation={0}
                onClick={() => setSelectedAnnouncement(ann)}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: '16px',
                  borderLeft: `4px solid ${config.color}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  '&:active': { transform: 'scale(0.98)' },
                  transition: 'transform 0.1s',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Chip
                    icon={config.icon}
                    label={ann.announcementType}
                    size="small"
                    sx={{
                      bgcolor: config.bg,
                      color: config.color,
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      height: 24,
                    }}
                  />
                  {ann.isPinned && (
                    <PushPinIcon sx={{ fontSize: 18, color: '#D3AD32', transform: 'rotate(45deg)' }} />
                  )}
                </Box>
                
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                  {ann.title}
                </Typography>
                
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b7a8f',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 1.5,
                  }}
                >
                  {ann.body}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    {new Date(ann.createdAt).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#D3AD32', fontWeight: 600 }}>
                    Read More
                  </Typography>
                </Box>
              </Paper>
            );
          })
        )}
      </Box>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: '24px 24px 0 0', sm: '24px' },
            position: { xs: 'absolute', sm: 'relative' },
            bottom: { xs: 0, sm: 'auto' },
            m: { xs: 0, sm: 2 },
          },
        }}
      >
        {selectedAnnouncement && (
          <>
            <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  icon={getTypeConfig(selectedAnnouncement.announcementType).icon}
                  label={selectedAnnouncement.announcementType}
                  size="small"
                  sx={{
                    bgcolor: getTypeConfig(selectedAnnouncement.announcementType).bg,
                    color: getTypeConfig(selectedAnnouncement.announcementType).color,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                  }}
                />
                {selectedAnnouncement.isPinned && (
                  <Typography variant="caption" sx={{ color: '#D3AD32', fontWeight: 600 }}>
                    • Pinned
                  </Typography>
                )}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3 }}>
                {selectedAnnouncement.title}
              </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ px: 3, pb: 3 }}>
              <Typography variant="body1" sx={{ color: '#4b5563', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedAnnouncement.body}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#f1f3f5', color: '#6b7a8f' }}>
                  {selectedAnnouncement.createdBy?.fullName?.charAt(0) || 'A'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {selectedAnnouncement.createdBy?.fullName || 'Condo Admin'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7a8f' }}>
                    {new Date(selectedAnnouncement.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
              <Button
                onClick={() => setSelectedAnnouncement(null)}
                variant="contained"
                fullWidth
                sx={{ py: 1.5 }}
              >
                Done Reading
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Announcements;