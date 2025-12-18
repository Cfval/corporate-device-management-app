import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import { motion } from "framer-motion";

import { SidebarContent } from "../components/navigation/SidebarContent";
import { Navbar } from "../components/navigation/Navbar";

import ClientDashboard from "../pages/client/ClientDashboard";
import ClientUsersPage from "../pages/client/ClientUsersPage";
import ClientDevicesPage from "../pages/client/ClientDevicesPage";
import ClientLinesPage from "../pages/client/ClientLinesPage";
import ClientReportsPage from "../pages/client/ClientReportsPage";
import ClientProfilePage from "../pages/client/ClientProfilePage";
import ClientEditPage from "../pages/client/ClientEditPage";

const drawerWidth = 240;

const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">

      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:block" style={{ width: drawerWidth }}>
        <Drawer
          variant="permanent"
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: "transparent",
              borderRight: "none",
              boxShadow: "none",
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      </div>

      {/* SIDEBAR MOBILE */}
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
            backgroundColor: "transparent",
            borderRight: "none",
            boxShadow: "none",
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

      {/* MAIN CONTENT */}
      <div
        className="flex-1 w-full"
        style={{ width: `calc(100% - ${drawerWidth}px)` }}
      >
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-6 py-6 max-w-screen-xl mx-auto">
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
        </div>
      </div>
    </div>
  );
};

export default ClientLayout;
























































































