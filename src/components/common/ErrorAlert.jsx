import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  const message =
    typeof error === 'string'
      ? error
      : error?.response?.data?.message ||
        error?.message ||
        'Something went wrong';

  return (
    <Alert severity="error" onClose={onClose} sx={{ mb: 2, borderRadius: '12px' }}>
      <AlertTitle>Error</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorAlert;