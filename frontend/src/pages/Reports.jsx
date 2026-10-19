import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import api from '../services/api.js';
import { exportExcel, exportPdf } from '../utils/exporters.js';
import { currency, date, number } from '../utils/format.js';

const reportOptions = {
  monthly: {
    label: 'Monthly Income Report',
    endpoint: '/reports/monthly-income',
    columns: [
      { key: 'month', label: 'Month' },
      { key: 'cropType', label: 'Crop' },
      { key: 'deliveries', label: 'Deliveries' },
      { key: 'totalWeight', label: 'Weight', render: (row) => `${number(row.totalWeight)} kg` },
      { key: 'totalIncome', label: 'Income', render: (row) => currency(row.totalIncome) }
    ]
  },
  payments: {
    label: 'Payment Report',
    endpoint: '/reports/payments',
    columns: [
      { key: 'paymentId', label: 'Payment ID' },
      { key: 'farmerNumber', label: 'Farmer No.' },
      { key: 'farmer', label: 'Farmer', render: (row) => row.farmer ? `${row.farmer.firstName} ${row.farmer.lastName}` : '-' },
      { key: 'paymentStatus', label: 'Status' },
      { key: 'totalAmountPaid', label: 'Amount', render: (row) => currency(row.totalAmountPaid) },
      { key: 'paymentDate', label: 'Date', render: (row) => date(row.paymentDate) }
    ]
  },
  deliveries: {
    label: 'Farmer Delivery Report',
    endpoint: '/reports/farmer-deliveries',
    columns: [
      { key: 'deliveryId', label: 'Delivery ID' },
      { key: 'farmerNumber', label: 'Farmer No.' },
      { key: 'farmer', label: 'Farmer', render: (row) => row.farmer ? `${row.farmer.firstName} ${row.farmer.lastName}` : '-' },
      { key: 'cropType', label: 'Crop' },
      { key: 'weightKg', label: 'Weight', render: (row) => `${number(row.weightKg)} kg` },
      { key: 'totalAmount', label: 'Total', render: (row) => currency(row.totalAmount) },
      { key: 'deliveryDate', label: 'Date', render: (row) => date(row.deliveryDate) }
    ]
  },
  crops: {
    label: 'Crop Performance Report',
    endpoint: '/reports/crop-performance',
    columns: [
      { key: 'cropType', label: 'Crop' },
      { key: 'deliveries', label: 'Deliveries' },
      { key: 'totalWeight', label: 'Weight', render: (row) => `${number(row.totalWeight)} kg` },
      { key: 'averagePrice', label: 'Average Price', render: (row) => currency(row.averagePrice) },
      { key: 'totalIncome', label: 'Income', render: (row) => currency(row.totalIncome) }
    ]
  }
};

const flatten = (rows) =>
  rows.map((row) => ({
    ...row,
    farmer: row.farmer ? `${row.farmer.firstName} ${row.farmer.lastName}` : row.farmer,
    deliveryDate: row.deliveryDate ? date(row.deliveryDate) : row.deliveryDate,
    paymentDate: row.paymentDate ? date(row.paymentDate) : row.paymentDate
  }));

export default function Reports() {
  const [type, setType] = useState('monthly');
  const [filters, setFilters] = useState({ cropType: '', farmerNumber: '', startDate: '', endDate: '', paymentStatus: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const selected = reportOptions[type];

  const runReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(selected.endpoint, { params: filters });
      setRows(data);
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not generate report', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const exportRows = (format) => {
    if (!rows.length) {
      showToast('Generate a report before exporting', 'danger');
      return;
    }
    const exportData = flatten(rows);
    const fileName = `tuzamurane-${type}-report`;
    if (format === 'excel') exportExcel(exportData, fileName);
    else exportPdf(exportData, fileName, selected.label);
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Filter and export income, payment, farmer delivery, and crop performance reports." />
      <section className="panel report-panel">
        <div className="report-filters">
          <select className="form-select" value={type} onChange={(e) => { setType(e.target.value); setRows([]); }}>
            {Object.entries(reportOptions).map(([key, option]) => (
              <option key={key} value={key}>{option.label}</option>
            ))}
          </select>
          <select className="form-select" value={filters.cropType} onChange={(e) => setFilters({ ...filters, cropType: e.target.value })}>
            <option value="">All crops</option>
            <option>Maize</option>
            <option>Beans</option>
            <option>Irish Potatoes</option>
          </select>
          <input className="form-control" placeholder="Farmer number" value={filters.farmerNumber} onChange={(e) => setFilters({ ...filters, farmerNumber: e.target.value })} />
          <input className="form-control" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          <input className="form-control" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          <select className="form-select" value={filters.paymentStatus} onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}>
            <option value="">All payments</option>
            <option>Pending</option>
            <option>Paid</option>
          </select>
          <button className="btn btn-primary" onClick={runReport}>
            <RefreshCw size={17} />
            Generate
          </button>
          <button className="btn btn-outline-secondary" onClick={() => exportRows('pdf')}>
            <Download size={17} />
            PDF
          </button>
          <button className="btn btn-outline-secondary" onClick={() => exportRows('excel')}>
            <FileSpreadsheet size={17} />
            Excel
          </button>
        </div>
      </section>
      <DataTable columns={selected.columns} rows={rows} loading={loading} emptyText="Generate a report to view results" />
    </>
  );
}
