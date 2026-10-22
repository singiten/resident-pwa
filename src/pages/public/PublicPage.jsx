import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress, Chip, Button, Divider,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LoginIcon from '@mui/icons-material/Login';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axiosConfig';

const PublicPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [promos, setPromos] = useState([]);
  const [freeRooms, setFreeRooms] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Promotions (Public)
        const promoPromise = api.promotions.getAll({ status: 'approved' })
          .then(res => {
            const data = res.data.data;
            return Array.isArray(data) ? data : (data?.items || []);
          })
          .catch(() => []);

        // 2. Fetch Free Rooms (Public)
        // Note: If your backend requires auth for this, it will fail gracefully and return []
        const roomPromise = api.rooms.getPublic({ status: 'free', limit: 20 })
          .then(res => {
            const data = res.data.data;
            return Array.isArray(data) ? data : (data?.items || []);
          })
          .catch(() => []);

        const [promosData, roomsData] = await Promise.all([promoPromise, roomPromise]);

        setPromos(promosData);
        setFreeRooms(roomsData);

      } catch (err) {
        console.error('Public data fetch failed:', err);
        setError('Could not load some data right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        <CircularProgress sx={{ color: '#D3AD32' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 6 }}>
      
      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          px: 3,
          pt: 6,
          pb: 6,
          borderRadius: '0 0 32px 32px',
          textAlign: 'center',
          maxWidth: 900,
          mx: 'auto',
        }}
      >
        <Box
          component="img"
          src="/icons/icon-96x96.png"
          alt="YeKondominium"
          sx={{ width: 72, height: 72, borderRadius: '18px', mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          YeKondominium
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: 500, mx: 'auto' }}>
          Discover condominiums, find available rooms, and explore local offers.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{ bgcolor: '#D3AD32', '&:hover': { bgcolor: '#c49a2b' }, borderRadius: '20px', px: 3, py: 1.2, fontWeight: 600 }}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/register')}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', borderRadius: '20px', px: 3, py: 1.2, fontWeight: 600, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}
          >
            Register
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, mt: 4 }}>
        {error && (
          <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', bgcolor: '#fff3cd' }}>
            <Typography variant="body2" sx={{ color: '#856404' }}>{error}</Typography>
          </Paper>
        )}

        {/* ── Free Rooms Section ────────────────────────────────────────── */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a2e' }}>
          Available Rooms
        </Typography>

        {freeRooms.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', textAlign: 'center', mb: 4, bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <MeetingRoomIcon sx={{ fontSize: 40, color: '#d1d5db', mb: 1 }} />
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              No free rooms available at the moment.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {freeRooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} key={room.id} component="div">
                <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ p: 1, bgcolor: 'rgba(34,197,94,0.1)', borderRadius: '8px', color: '#22c55e' }}>
                      <MeetingRoomIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Room {room.roomNo}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {room.block?.blockNo ? `Block ${room.block.blockNo}` : 'Block N/A'} • Floor {room.floorNo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', display: 'block', mt: 1 }}>
                    {room.model?.replace('_', ' ') || 'Standard Room'}
                  </Typography>
                  <Chip label="Available" size="small" color="success" sx={{ mt: 2, fontWeight: 600 }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ── Promotions Section ────────────────────────────────────────── */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a2e' }}>
          Local Business Offers
        </Typography>

        {promos.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, borderRadius: '16px', textAlign: 'center', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <StorefrontIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
            <Typography variant="h6" sx={{ color: '#6b7a8f', fontWeight: 600 }}>
              No active promotions yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Check back soon for offers from local businesses.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {promos.map((promo) => (
              <Grid item xs={12} sm={6} md={4} key={promo.id} component="div">
                <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {promo.imageUrl ? (
                    <Box component="img" src={promo.imageUrl} alt={promo.title} sx={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ height: 140, bgcolor: 'rgba(211,173,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D3AD32' }}>
                      <StorefrontIcon sx={{ fontSize: 48 }} />
                    </Box>
                  )}
                  <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Chip label={promo.type} size="small" sx={{ alignSelf: 'flex-start', mb: 1, bgcolor: 'rgba(211,173,50,0.1)', color: '#D3AD32', fontWeight: 700, textTransform: 'capitalize' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                      {promo.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {promo.description}
                    </Typography>

                    <Box sx={{ mt: 'auto' }}>
                      <Divider sx={{ mb: 1.5 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <StorefrontIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                        <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{promo.businessName}</Typography>
                      </Box>
                      {promo.condo && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                          <Typography variant="caption" sx={{ color: '#9ca3af' }}>{promo.condo.condoName}</Typography>
                        </Box>
                      )}
                      {promo.contactNumber && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                          <Typography variant="caption" sx={{ color: '#9ca3af' }}>{promo.contactNumber}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <Box sx={{ textAlign: 'center', mt: 6, px: 2 }}>
        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
          © {new Date().getFullYear()} YeKondominium — Condominium Management System
        </Typography>
      </Box>
    </Box>
  );
};

export default PublicPage;