import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import { motion } from "framer-motion";

import { SidebarContent } from "../components/navigation/SidebarContent";
import { Navbar } from "../components/navigation/Navbar";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminClientsPage from "../pages/admin/AdminClientsPage";
import AdminClientDetailPage from "../pages/admin/AdminClientDetailPage";
import AdminClientUsersPage from "../pages/admin/AdminClientUsersPage";
import AdminClientDevicesPage from "../pages/admin/AdminClientDevicesPage";
import AdminClientLinesPage from "../pages/admin/AdminClientLinesPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import SortingDemoPage from "../pages/admin/SortingDemoPage";

const drawerWidth = 240;

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">

      {/* ------------------------------ */}
      {/* DESKTOP SIDEBAR */}
      {/* ------------------------------ */}
      <div className="hidden md:block" style={{ width: drawerWidth }}>
        <Drawer
          variant="permanent"
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      </div>

      {/* ------------------------------ */}
      {/* MOBILE SIDEBAR */}
      {/* ------------------------------ */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </motion.div>
      </Drawer>

      {/* ------------------------------ */}
      {/* MAIN CONTENT */}
      {/* ------------------------------ */}
      <div
        className="flex-1 w-full"
        style={{ width: `calc(100% - ${drawerWidth}px)` }}
      >
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-6 py-6 max-w-screen-xl mx-auto">
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
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

