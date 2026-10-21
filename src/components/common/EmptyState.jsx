import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyState = ({
  icon: Icon = InboxIcon,
  title = 'Nothing here yet',
  message = '',
  actionLabel = null,
  onAction = null,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 3,
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'rgba(211,173,50,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: 40, color: '#D3AD32' }} />
      </Box>
      <Typography variant="h6" sx={{ color: '#1a1a2e', fontWeight: 600 }}>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" sx={{ color: '#6b7a8f', maxWidth: 300 }}>
          {message}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;