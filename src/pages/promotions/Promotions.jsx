import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EmptyState from '../../components/common/EmptyState';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const Promotions = () => {
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await api.promotions.getAll({ limit: 50, status: 'active' });
        const data = res.data.data;
        setPromotions(data?.items || data || []);
      } catch (err) {
        toast.error('Failed to load promotions');
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1a1a2e' }}>
        Local Offers
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#D3AD32' }} />
        </Box>
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={StorefrontIcon}
          title="No Active Promotions"
          message="Check back later for special offers from local businesses."
        />
      ) : (
        promotions.map((promo) => (
          <Paper
            key={promo.id}
            elevation={0}
            sx={{ p: 0, mb: 2, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}
          >
            {promo.imageUrl && (
              <Box component="img" src={promo.imageUrl} sx={{ width: '100%', height: 160, objectFit: 'cover' }} />
            )}
            
            <Box sx={{ p: 2 }}>
              <Chip label={promo.type} size="small" sx={{ bgcolor: 'rgba(211,173,50,0.1)', color: '#D3AD32', fontWeight: 700, textTransform: 'capitalize', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                {promo.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 2 }}>
                {promo.description}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>Offered by</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>{promo.businessName}</Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  href={promo.websiteUrl || `tel:${promo.contactNumber}`}
                  target="_blank"
                  onClick={() => api.promotions.trackClick(promo.id).catch(() => {})}
                  sx={{ borderRadius: '20px' }}
                >
                  Contact
                </Button>
              </Box>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default Promotions;