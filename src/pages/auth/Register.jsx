import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Paper,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import ApartmentIcon from '@mui/icons-material/Apartment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const STEPS = ['Personal Info', 'Account Security'];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    fan: '',
    condoCode: '',
    password: '',
    confirmPassword: '',
  });

  const update = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      setError('Full name must be at least 3 characters');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!/^(09|07)\d{8}$|^\+251[79]\d{8}$/.test(formData.phoneNumber.trim())) {
      setError('Phone must be 09XXXXXXXX, 07XXXXXXXX, or +251XXXXXXXXX');
      return false;
    }
    if (!/^\d{16}$/.test(formData.fan.trim())) {
      setError('FAN must be exactly 16 digits');
      return false;
    }
    if (!formData.condoCode.trim()) {
      setError('Condo code is required (ask your condo admin)');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep1()) return;
    setActiveStep(1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setError(null);

    try {
      const user = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        fan: formData.fan.trim(),
        condoCode: formData.condoCode.trim(),
        password: formData.password,
      });

      toast.success(`Welcome, ${user.fullName?.split(' ')[0] || 'Resident'}!`);
      navigate('/home', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8f9fa',
        maxWidth: 480,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          pt: 3,
          pb: 5,
          px: 2,
          borderRadius: '0 0 32px 32px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton
            onClick={() => navigate('/login')}
            sx={{ color: '#fff', mr: 1 }}
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Back to Login
          </Typography>
        </Box>

        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
          Create Account
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Join your condominium community
        </Typography>
      </Box>

      <Box sx={{ mx: 3, mt: -3, mb: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '16px',
            bgcolor: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': { fontSize: '0.75rem', fontWeight: 600 },
                    '& .MuiStepLabel-label.Mui-active': { color: '#D3AD32' },
                    '& .MuiStepLabel-label.Mui-completed': { color: '#22c55e' },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Box>

      <Paper
        elevation={0}
        sx={{
          mx: 3,
          mb: 3,
          p: 3,
          borderRadius: '20px',
          bgcolor: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {activeStep === 0 && (
            <>
              <TextField
                label="Full Name"
                value={formData.fullName}
                onChange={update('fullName')}
                placeholder="e.g., Abebe Kebede"
                autoComplete="name"
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#6b7a8f' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={update('email')}
                placeholder="you@example.com"
                autoComplete="email"
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#6b7a8f' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={update('phoneNumber')}
                placeholder="09XXXXXXXX or +251XXXXXXXXX"
                autoComplete="tel"
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#6b7a8f' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField
                label="FAN Number"
                value={formData.fan}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                  setFormData((prev) => ({ ...prev, fan: digits }));
                  setError(null);
                }}
                placeholder="16-digit FAN number"
                sx={{ mb: 2 }}
                helperText={`${formData.fan.length}/16 digits`}
                slotProps={{
                  htmlInput: { maxLength: 16, inputMode: 'numeric' },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: '#6b7a8f' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField
                label="Condo Code"
                value={formData.condoCode}
                onChange={update('condoCode')}
                placeholder="e.g., HX-2737"
                sx={{ mb: 1 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <ApartmentIcon sx={{ color: '#6b7a8f' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: '#6b7a8f', display: 'block', mb: 2 }}
              >
                Ask your condominium admin for this code
              </Typography>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleNext}
                sx={{ py: 1.5, fontSize: '1rem' }}
              >
                Continue
              </Button>
            </>
          )}

          {activeStep === 1 && (
            <>
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={update('password')}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#6b7a8f' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={update('confirmPassword')}
                placeholder="Re-enter password"
                autoComplete="new-password"
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#6b7a8f' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end">
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  size="large"
                  sx={{ flex: 1, py: 1.5 }}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ flex: 2, py: 1.5, fontSize: '1rem' }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Box>
            </>
          )}
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#6b7a8f' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#D3AD32', fontWeight: 600, textDecoration: 'none' }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;