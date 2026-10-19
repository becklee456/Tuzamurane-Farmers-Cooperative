import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import Cooperatives from './pages/Cooperatives.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Deliveries from './pages/Deliveries.jsx';
import Farmers from './pages/Farmers.jsx';
import Login from './pages/Login.jsx';
import Payments from './pages/Payments.jsx';
import Reports from './pages/Reports.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cooperatives" element={<Cooperatives />} />
            <Route path="/farmers" element={<Farmers />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
