
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const ForgotPassword = () => (
  <Box sx={{ p: 4, textAlign: 'center', maxWidth: 480, mx: 'auto' }}>
    <Typography variant="h4" sx={{ mb: 2 }}>Forgot Password</Typography>
    <Link to="/login" style={{ color: '#D3AD32', fontWeight: 600 }}>
      Back to Login
    </Link>
  </Box>
);

export default ForgotPassword;