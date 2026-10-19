import { Banknote, HandCoins, PackageCheck, Truck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import api from '../services/api.js';
import { currency, date, number } from '../utils/format.js';

const cropColors = ['#2f7d32', '#e0a21b', '#1976a3'];

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setDashboard(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="loading-panel">Loading dashboard...</div>;
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Operational analytics for collections, farmer payments, and cooperative performance." />

      <div className="stat-grid">
        <StatCard label="Total Farmers" value={number(dashboard.totalFarmers)} icon={Users} tone="green" />
        <StatCard label="Total Deliveries" value={number(dashboard.totalDeliveries)} icon={Truck} tone="blue" />
        <StatCard label="Cooperative Income" value={currency(dashboard.totalCooperativeIncome)} icon={PackageCheck} tone="amber" />
        <StatCard label="Payments Made" value={currency(dashboard.totalPaymentsMade)} icon={HandCoins} tone="teal" />
        <StatCard label="Pending Payments" value={currency(dashboard.totalPendingPayments)} icon={Banknote} tone="red" />
      </div>

      <div className="chart-grid">
        <section className="panel span-2">
          <h2>Monthly Income</h2>
          <ResponsiveContainer width="100%" height={310}>
            <LineChart data={dashboard.monthlyIncome}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => currency(value)} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#2f7d32" strokeWidth={3} />
              <Line type="monotone" dataKey="deliveries" stroke="#1976a3" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section className="panel">
          <h2>Crop Delivery Trend</h2>
          <ResponsiveContainer width="100%" height={310}>
            <PieChart>
              <Pie data={dashboard.cropTrend} dataKey="weight" nameKey="cropType" outerRadius={110} label>
                {dashboard.cropTrend.map((entry, index) => (
                  <Cell key={entry.cropType} fill={cropColors[index % cropColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${number(value)} kg`} />
            </PieChart>
          </ResponsiveContainer>
        </section>
        <section className="panel span-2">
          <h2>Crop Income Performance</h2>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={dashboard.cropTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cropType" />
              <YAxis />
              <Tooltip formatter={(value) => currency(value)} />
              <Bar dataKey="income" fill="#e0a21b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="panel">
          <h2>Recent Activities</h2>
          <div className="activity-list">
            {dashboard.recentActivities.map((item) => (
              <div className="activity-item" key={item._id}>
                <strong>{item.action}</strong>
                <span>{item.entity} by {item.user?.name || 'System'}</span>
                <small>{date(item.createdAt)}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
