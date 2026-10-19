import { Edit, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import FormModal from '../components/FormModal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchToolbar from '../components/SearchToolbar.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import useResourceList from '../hooks/useResourceList.js';
import api from '../services/api.js';
import { currency, date, dateInput, number } from '../utils/format.js';

const blank = {
  deliveryId: '',
  farmerNumber: '',
  cropType: 'Maize',
  weightKg: '',
  pricePerKg: '',
  deliveryDate: ''
};

export default function Deliveries() {
  const list = useResourceList('/deliveries');
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [show, setShow] = useState(false);
  const { showToast } = useToast();

  const total = useMemo(() => Number(form.weightKg || 0) * Number(form.pricePerKg || 0), [form.weightKg, form.pricePerKg]);

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setShow(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      deliveryId: row.deliveryId,
      farmerNumber: row.farmerNumber,
      cropType: row.cropType,
      weightKg: row.weightKg,
      pricePerKg: row.pricePerKg,
      deliveryDate: dateInput(row.deliveryDate)
    });
    setShow(true);
  };

  const save = async (event) => {
    event.preventDefault();
    const payload = { ...form, weightKg: Number(form.weightKg), pricePerKg: Number(form.pricePerKg) };
    try {
      if (editing) {
        await api.put(`/deliveries/${editing._id}`, payload);
        showToast('Delivery updated');
      } else {
        await api.post('/deliveries', payload);
        showToast('Delivery recorded and pending payment created');
      }
      setShow(false);
      list.fetchRows();
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save delivery', 'danger');
    }
  };

  const remove = async (row) => {
    if (!confirm(`Delete delivery ${row.deliveryId}?`)) return;
    try {
      await api.delete(`/deliveries/${row._id}`);
      showToast('Delivery deleted');
      list.fetchRows();
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const columns = [
    { key: 'deliveryId', label: 'Delivery ID' },
    { key: 'farmerNumber', label: 'Farmer No.' },
    { key: 'farmer', label: 'Farmer', render: (row) => row.farmer ? `${row.farmer.firstName} ${row.farmer.lastName}` : '-' },
    { key: 'cropType', label: 'Crop' },
    { key: 'weightKg', label: 'Weight', render: (row) => `${number(row.weightKg)} kg` },
    { key: 'pricePerKg', label: 'Price/Kg', render: (row) => currency(row.pricePerKg) },
    { key: 'totalAmount', label: 'Total', render: (row) => currency(row.totalAmount) },
    { key: 'deliveryDate', label: 'Date', render: (row) => date(row.deliveryDate) },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="table-actions">
          <button className="icon-btn" onClick={() => openEdit(row)} title="Edit delivery">
            <Edit size={16} />
          </button>
          <button className="icon-btn danger" onClick={() => remove(row)} title="Delete delivery">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader title="Crop Deliveries" subtitle="Record produce collections and automatically calculate farmer payment amounts." />
      <SearchToolbar search={list.filters.search || ''} onSearch={list.setSearch} buttonLabel="Add Delivery" onAdd={openCreate}>
        <select className="form-select compact-input" onChange={(e) => list.patchFilters({ cropType: e.target.value })}>
          <option value="">All crops</option>
          <option>Maize</option>
          <option>Beans</option>
          <option>Irish Potatoes</option>
        </select>
        <input className="form-control compact-input" type="date" onChange={(e) => list.patchFilters({ startDate: e.target.value })} />
      </SearchToolbar>
      <DataTable columns={columns} rows={list.rows} loading={list.loading} />
      <Pagination page={list.meta.page} pages={list.meta.pages} onChange={list.setPage} />

      <FormModal
        title={editing ? 'Update Delivery' : 'Record Delivery'}
        show={show}
        onClose={() => setShow(false)}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setShow(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" form="delivery-form">
              Save
            </button>
          </>
        }
      >
        <form id="delivery-form" onSubmit={save} className="form-grid two">
          <label>
            Delivery ID
            <input className="form-control" value={form.deliveryId} placeholder="Auto-generated if empty" onChange={(e) => setForm({ ...form, deliveryId: e.target.value })} />
          </label>
          <label>
            Farmer number
            <input className="form-control" value={form.farmerNumber} onChange={(e) => setForm({ ...form, farmerNumber: e.target.value })} required />
          </label>
          <label>
            Crop type
            <select className="form-select" value={form.cropType} onChange={(e) => setForm({ ...form, cropType: e.target.value })} required>
              <option>Maize</option>
              <option>Beans</option>
              <option>Irish Potatoes</option>
            </select>
          </label>
          <label>
            Weight in kilograms
            <input className="form-control" type="number" min="0.01" step="0.01" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} required />
          </label>
          <label>
            Price per kilogram
            <input className="form-control" type="number" min="0.01" step="0.01" value={form.pricePerKg} onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })} required />
          </label>
          <label>
            Delivery date
            <input className="form-control" type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} required />
          </label>
          <div className="calculation-banner">
            Total Amount = Weight × Price/Kg = <strong>{currency(total)}</strong>
          </div>
        </form>
      </FormModal>
    </>
  );
}
