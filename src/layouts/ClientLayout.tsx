import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SidebarContent } from '../components/navigation/SidebarContent';
import { Navbar } from '../components/navigation/Navbar';
import ClientDashboard from '../pages/client/ClientDashboard';
import ClientUsersPage from '../pages/client/ClientUsersPage';
import ClientDevicesPage from '../pages/client/ClientDevicesPage';
import ClientLinesPage from '../pages/client/ClientLinesPage';
import ClientReportsPage from '../pages/client/ClientReportsPage';
import ClientProfilePage from '../pages/client/ClientProfilePage';
import ClientEditPage from "../pages/client/ClientEditPage";
import { Box, Drawer } from '@mui/material';
import { motion } from 'framer-motion';

const drawerWidth = 240;

const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar - Fixed */}
      <Box
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      </Box>

      {/* Mobile Drawer - Temporary */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </motion.div>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <Routes>
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="users" element={<ClientUsersPage />} />
          <Route path="devices" element={<ClientDevicesPage />} />
          <Route path="lines" element={<ClientLinesPage />} />
          <Route path="reports" element={<ClientReportsPage />} />
          <Route path="profile" element={<ClientProfilePage />} />
          <Route path="profile/edit" element={<ClientEditPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default ClientLayout;

