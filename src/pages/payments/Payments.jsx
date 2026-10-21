import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, Grid } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import EmptyState from '../../components/common/EmptyState';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Payments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Super Admin fetches ALL payments, Resident fetches their own
        const res = user.role === 'super_admin' 
          ? await api.payments.getAll({ limit: 50 })
          : await api.payments.getMy({ limit: 50 });
          
        const data = res.data.data;
        let items = [];
        if (data) {
          if (Array.isArray(data)) items = data;
          else if (Array.isArray(data.items)) items = data.items;
          else if (Array.isArray(data.payments)) items = data.payments;
        }
        
        setPayments(items);
        const revenue = items.reduce((sum, p) => sum + (p.amount || 0), 0);
        setTotalRevenue(revenue);
      } catch (err) {
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#D3AD32' }} /></Box>;

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1a1a2e' }}>
        {user.role === 'super_admin' ? 'System Revenue' : 'My Payments'}
      </Typography>

      {user.role === 'super_admin' && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Total Revenue Generated</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#D3AD32' }}>ETB {totalRevenue.toLocaleString()}</Typography>
        </Paper>
      )}

      {payments.length === 0 ? (
        <EmptyState icon={PaymentsIcon} title="No Payments" message="No payment records found." />
      ) : (
        payments.map((payment) => (
          <Paper key={payment.id} elevation={0} sx={{ p: 2, mb: 2, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                {(payment.type || 'Payment').replace('_', ' ')}
              </Typography>
              <Chip label={payment.status} size="small" sx={{ fontWeight: 700 }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>ETB {payment.amount?.toLocaleString()}</Typography>
                <Typography variant="caption" sx={{ color: '#6b7a8f' }}>{new Date(payment.createdAt).toLocaleDateString()}</Typography>
              </Box>
              {user.role === 'super_admin' && (
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>User: {payment.userId?.slice(0, 6)}...</Typography>
              )}
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default Payments;