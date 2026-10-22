import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Divider } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const Revenue = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ fees: 0, promos: 0, condos: 0, total: 0 });

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const [payRes, promoRes, condoRes] = await Promise.all([
          api.payments.getStatistics().catch(() => ({ data: { data: {} } })),
          api.promotions.getAll({ status: 'approved' }).catch(() => ({ data: { data: [] } })),
          api.condos.getAll().catch(() => ({ data: { data: [] } })),
        ]);

        const fees = Number(payRes.data?.data?.totalServiceFees || 0);
        const promosList = promoRes.data?.data?.items || promoRes.data?.data || [];
        const promosTotal = promosList.reduce((sum, p) => sum + (p.price || 0), 0);
        const condoCount = (condoRes.data?.data || []).length;
        const condoFee = 500; // Configurable
        const condosTotal = condoCount * condoFee;

        setData({
          fees,
          promos: promosTotal,
          condos: condosTotal,
          total: fees + promosTotal + condosTotal,
          promosCount: promosList.length,
          condoCount,
        });
      } catch (err) {
        toast.error('Failed to calculate revenue');
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#D3AD32' }} /></Box>;

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1a1a2e' }}>System Revenue</Typography>

      {/* Grand Total */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '20px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff' }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Total Revenue Generated</Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#D3AD32', mt: 1 }}>
          ETB {data.total.toLocaleString()}
        </Typography>
      </Paper>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Revenue Breakdown</Typography>

      <Grid container spacing={2}>
        {/* Transaction Fees */}
        <Grid item xs={12} sm={4} component="div">
          <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#3b82f6' }}>
              <ReceiptIcon /> <Typography variant="subtitle2" fontWeight={700}>Transaction Fees</Typography>
            </Box>
            <Typography variant="h6" fontWeight={700}>ETB {data.fees.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">0.34% service charge on all payments</Typography>
          </Paper>
        </Grid>

        {/* Promotions */}
        <Grid item xs={12} sm={4} component="div">
          <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#D3AD32' }}>
              <StorefrontIcon /> <Typography variant="subtitle2" fontWeight={700}>Promotions</Typography>
            </Box>
            <Typography variant="h6" fontWeight={700}>ETB {data.promos.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">{data.promosCount} approved promotions</Typography>
          </Paper>
        </Grid>

        {/* Condo Registration */}
        <Grid item xs={12} sm={4} component="div">
          <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#22c55e' }}>
              <ApartmentIcon /> <Typography variant="subtitle2" fontWeight={700}>Condo Commissions</Typography>
            </Box>
            <Typography variant="h6" fontWeight={700}>ETB {data.condos.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">{data.condoCount} condos × ETB 500</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Revenue;