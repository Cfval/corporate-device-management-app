import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SidebarContent } from '../components/navigation/SidebarContent';
import { Navbar } from '../components/navigation/Navbar';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminClientsPage from '../pages/admin/AdminClientsPage';
import AdminClientDetailPage from '../pages/admin/AdminClientDetailPage';
import AdminClientUsersPage from '../pages/admin/AdminClientUsersPage';
import AdminClientDevicesPage from '../pages/admin/AdminClientDevicesPage';
import AdminClientLinesPage from '../pages/admin/AdminClientLinesPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import SortingDemoPage from '../pages/admin/SortingDemoPage';
import { Box, Drawer } from '@mui/material';
import { motion } from 'framer-motion';

const drawerWidth = 240;

const AdminLayout = () => {
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
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="clients" element={<AdminClientsPage />} />
          <Route path="clients/:id" element={<AdminClientDetailPage />} />
          <Route path="clients/:id/users" element={<AdminClientUsersPage />} />
          <Route path="clients/:id/devices" element={<AdminClientDevicesPage />} />
          <Route path="clients/:id/lines" element={<AdminClientLinesPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="sorting-demo" element={<SortingDemoPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />  
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminLayout;

