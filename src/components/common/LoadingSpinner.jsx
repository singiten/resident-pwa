import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        minHeight: fullScreen ? '100vh' : 300,
        width: '100%',
      }}
    >
      <CircularProgress sx={{ color: '#D3AD32' }} size={48} />
      {message && (
        <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;