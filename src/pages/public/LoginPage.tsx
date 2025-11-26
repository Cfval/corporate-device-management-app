import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
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
    <Container maxWidth="sm" className="flex items-center justify-center min-h-screen">
      <Paper elevation={3} className="p-8 w-full">
        <Typography variant="h4" component="h1" className="mb-6 text-center font-bold text-gray-800">
          Login
        </Typography>
        
        <Box component="form" className="space-y-4">
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="CLIENT">Client</MenuItem>
            </Select>
          </FormControl>

          {role === 'CLIENT' && (
            <TextField
              fullWidth
              label="Client ID (Optional)"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              variant="outlined"
            />
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
            size="large"
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;

