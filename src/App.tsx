import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Equipment from './pages/Equipment';
import Maintenance from './pages/Maintenance';
import Stock from './pages/Stock';
import Regions from './pages/Regions';
import Clients from './pages/clients/Clients';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Layout from './components/common/Layout';
import NotFound from './pages/NotFound';
import ClientDashboard from './pages/clients/ClientDashboard';
import ClientEquipment from './pages/clients/ClientEquipment';
import ClientLayout from './pages/clients/ClientLayout';
import ClientMaintenance from './pages/clients/ClientMaintenance';
import ClientProfile from './pages/clients/ClientProfile';
import ClientCompanyProfile from './pages/clients/ClientCompanyProfile';
import './App.css';
import ClientSettings from './pages/clients/ClientSettings';
import ClientSales from './pages/clients/ClientSales';

function App() {
  const location = useLocation();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            borderRadius: '12px',
            padding: '16px',
          },
          success: { iconTheme: { primary: '#28A745', secondary: '#FFFFFF' } },
          error: { iconTheme: { primary: '#DC3545', secondary: '#FFFFFF' } },
        }}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/list" element={<Products />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/sales/list" element={<Sales />} />
              <Route path="/sales/analytics" element={<Sales />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/regions" element={<Regions />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route element={<PrivateRoute />}>
            <Route element={<ClientLayout />}>
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/profile" element={<ClientProfile />} />
              <Route path="/client/company" element={<ClientCompanyProfile />} />
              <Route path="/client/equipment" element={<ClientEquipment />} />
              <Route path="/client/settings" element={<ClientSettings />} />
              <Route path="/client/sales" element={<ClientSales />} />
              <Route path="/client/maintenance" element={<ClientMaintenance />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;