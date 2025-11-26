import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import SimCardIcon from '@mui/icons-material/SimCard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const adminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Clients', icon: <BusinessIcon />, path: '/admin/clients' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
  ];

  const clientMenuItems = [
    { text: 'Panel Principal', icon: <DashboardIcon />, path: '/client/dashboard' },
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/client/users' },
    { text: 'Dispositivos', icon: <PhoneAndroidIcon />, path: '/client/devices' },
    { text: 'Lineas', icon: <SimCardIcon />, path: '/client/lines' },
    { text: 'Reportes', icon: <AssessmentIcon />, path: '/client/reports' },
    { text: 'Mi Perfil', icon: <PersonIcon />, path: '/client/profile' },
  ];

  const menuItems = user.role === 'ADMIN' ? adminMenuItems : clientMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" className="font-bold text-gray-800">
          {user.role === 'ADMIN' ? 'Admin Panel' : 'Client Panel'}
        </Typography>
        {user.clientId && (
          <Typography variant="caption" className="text-gray-500">
            Client ID: {user.clientId}
          </Typography>
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              className={location.pathname === item.path ? 'bg-blue-100' : ''}
            >
              <ListItemIcon className={location.pathname === item.path ? 'text-blue-600' : ''}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

