import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Don't show immediately; wait 15s
      setTimeout(() => setShowPrompt(true), 15000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install outcome:', outcome);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => setShowPrompt(false);

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 76, sm: 24 }, mb: 2 }}
    >
      <Box
        sx={{
          bgcolor: '#1a1a2e',
          color: '#fff',
          borderRadius: '16px',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          maxWidth: 380,
        }}
      >
        <Box
          component="img"
          src="/icons/icon-96x96.png"
          alt="YeKondo"
          sx={{ width: 44, height: 44, borderRadius: '10px' }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Install YeKondominium
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Add to home screen for a native-like experience
          </Typography>
        </Box>
        <Button
          size="small"
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleInstall}
          sx={{
            bgcolor: '#D3AD32',
            color: '#fff',
            '&:hover': { bgcolor: '#c49a2b' },
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          Install
        </Button>
        <IconButton size="small" onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.6)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Snackbar>
  );
};

export default InstallPrompt;