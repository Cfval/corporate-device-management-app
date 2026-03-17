import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import type { UserRole } from '../../types';

const LoginPage = () => {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [clientId, setClientId] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login(role, clientId || undefined);
    navigate(role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard');
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center px-4 overflow-hidden">
      {/* Background blobs — matching landing page */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute -top-40 -left-10 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute top-20 -right-16 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      {/* Back to home */}
      <button
        onClick={() => navigate('/landing')}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to home
      </button>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-slate-700/70 bg-slate-900/80 px-8 py-10 shadow-2xl shadow-sky-900/30 backdrop-blur">
        <h1 className="mb-8 text-center text-2xl font-semibold text-slate-50">
          Sign in
        </h1>

        <Box component="form" className="space-y-4">
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: '#94a3b8', '&.Mui-focused': { color: '#38bdf8' } }}>
              Role
            </InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value as UserRole)}
              sx={{
                color: '#f1f5f9',
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
                '.MuiSvgIcon-root': { color: '#94a3b8' },
              }}
              MenuProps={{
                PaperProps: {
                  sx: { bgcolor: '#1e293b', color: '#f1f5f9' },
                },
              }}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="CLIENT">Client</MenuItem>
            </Select>
          </FormControl>

          {role === 'CLIENT' && (
            <TextField
              fullWidth
              size="small"
              label="Client ID (Test Client ID: 1 to 15)"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              variant="outlined"
              InputLabelProps={{ sx: { color: '#94a3b8', '&.Mui-focused': { color: '#38bdf8' } } }}
              InputProps={{ sx: { color: '#f1f5f9' } }}
              sx={{
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
                '.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
              }}
            />
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            size="large"
            sx={{
              mt: 1,
              borderRadius: '9999px',
              backgroundColor: '#0ea5e9',
              '&:hover': { backgroundColor: '#38bdf8' },
              color: '#0f172a',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.875rem',
            }}
          >
            Sign in
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default LoginPage;
