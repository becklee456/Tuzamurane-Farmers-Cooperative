import { Check, Printer, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import FormModal from '../components/FormModal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchToolbar from '../components/SearchToolbar.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import useResourceList from '../hooks/useResourceList.js';
import api from '../services/api.js';
import { currency, date } from '../utils/format.js';

export default function Payments() {
  const list = useResourceList('/payments');
  const [receipt, setReceipt] = useState(null);
  const { showToast } = useToast();

  const markPaid = async (row) => {
    try {
      await api.patch(`/payments/${row._id}/pay`, { paymentDate: new Date() });
      showToast('Payment marked as paid');
      list.fetchRows();
    } catch (error) {
      showToast(error.response?.data?.message || 'Payment update failed', 'danger');
    }
  };

  const openReceipt = async (row) => {
    const { data } = await api.get(`/payments/${row._id}/receipt`);
    setReceipt(data);
  };

  const printReceipt = () => {
    window.print();
  };

  const columns = [
    { key: 'paymentId', label: 'Payment ID' },
    { key: 'farmerNumber', label: 'Farmer No.' },
    { key: 'farmer', label: 'Farmer', render: (row) => row.farmer ? `${row.farmer.firstName} ${row.farmer.lastName}` : '-' },
    { key: 'delivery', label: 'Delivery', render: (row) => row.delivery?.deliveryId || '-' },
    { key: 'amount', label: 'Amount', render: (row) => currency(row.totalAmountPaid) },
    { key: 'paymentStatus', label: 'Status', render: (row) => <span className={`status ${row.paymentStatus.toLowerCase()}`}>{row.paymentStatus}</span> },
    { key: 'paymentDate', label: 'Payment Date', render: (row) => date(row.paymentDate) },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="table-actions">
          {row.paymentStatus === 'Pending' && (
            <button className="icon-btn success" onClick={() => markPaid(row)} title="Mark as paid">
              <Check size={16} />
            </button>
          )}
          <button className="icon-btn" onClick={() => openReceipt(row)} title="View receipt">
            <ReceiptText size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader title="Payment Management" subtitle="Track pending payments, mark farmer payments as paid, and print receipts." />
      <SearchToolbar search={list.filters.search || ''} onSearch={list.setSearch}>
        <select className="form-select compact-input" onChange={(e) => list.patchFilters({ paymentStatus: e.target.value })}>
          <option value="">All statuses</option>
          <option>Pending</option>
          <option>Paid</option>
        </select>
      </SearchToolbar>
      <DataTable columns={columns} rows={list.rows} loading={list.loading} />
      <Pagination page={list.meta.page} pages={list.meta.pages} onChange={list.setPage} />

      <FormModal
        title="Payment Receipt"
        show={Boolean(receipt)}
        onClose={() => setReceipt(null)}
        footer={
          <button className="btn btn-primary" onClick={printReceipt}>
            <Printer size={17} />
            Print
          </button>
        }
      >
        {receipt && (
          <div className="receipt-print">
            <div className="receipt-head">
              <h3>{receipt.cooperative}</h3>
              <p>{receipt.location}</p>
              <strong>Receipt: {receipt.receiptNumber}</strong>
            </div>
            <div className="receipt-grid">
              <span>Farmer</span><strong>{receipt.farmer.firstName} {receipt.farmer.lastName}</strong>
              <span>Farmer Number</span><strong>{receipt.farmer.farmerNumber}</strong>
              <span>Crop</span><strong>{receipt.delivery?.cropType || '-'}</strong>
              <span>Delivery ID</span><strong>{receipt.delivery?.deliveryId || '-'}</strong>
              <span>Payment Status</span><strong>{receipt.status}</strong>
              <span>Amount Paid</span><strong>{currency(receipt.amount)}</strong>
              <span>Payment Date</span><strong>{date(receipt.paymentDate)}</strong>
            </div>
          </div>
        )}
      </FormModal>
    </>
  );
}
