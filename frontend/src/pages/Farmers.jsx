import { Edit, History, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import FormModal from '../components/FormModal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchToolbar from '../components/SearchToolbar.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import useResourceList from '../hooks/useResourceList.js';
import api from '../services/api.js';
import { currency, date, dateInput } from '../utils/format.js';

const blank = {
  farmerNumber: '',
  firstName: '',
  lastName: '',
  telephoneNumber: '',
  village: '',
  membershipDate: '',
  cooperativeCode: 'TZM-001'
};

export default function Farmers() {
  const list = useResourceList('/farmers');
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [history, setHistory] = useState(null);
  const [show, setShow] = useState(false);
  const { showToast } = useToast();

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setShow(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      farmerNumber: row.farmerNumber,
      firstName: row.firstName,
      lastName: row.lastName,
      telephoneNumber: row.telephoneNumber,
      village: row.village,
      membershipDate: dateInput(row.membershipDate),
      cooperativeCode: row.cooperativeCode
    });
    setShow(true);
  };

  const openHistory = async (row) => {
    const { data } = await api.get(`/farmers/history/${row.farmerNumber}`);
    setHistory(data);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/farmers/${editing._id}`, form);
        showToast('Farmer updated');
      } else {
        await api.post('/farmers', form);
        showToast('Farmer registered');
      }
      setShow(false);
      list.fetchRows();
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save farmer', 'danger');
    }
  };

  const remove = async (row) => {
    if (!confirm(`Delete ${row.firstName} ${row.lastName}?`)) return;
    try {
      await api.delete(`/farmers/${row._id}`);
      showToast('Farmer deleted');
      list.fetchRows();
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const columns = [
    { key: 'farmerNumber', label: 'Farmer No.' },
    { key: 'name', label: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { key: 'telephoneNumber', label: 'Telephone' },
    { key: 'village', label: 'Village' },
    { key: 'membershipDate', label: 'Joined', render: (row) => date(row.membershipDate) },
    { key: 'cooperativeCode', label: 'Coop Code' },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="table-actions">
          <button className="icon-btn" onClick={() => openHistory(row)} title="View farmer history">
            <History size={16} />
          </button>
          <button className="icon-btn" onClick={() => openEdit(row)} title="Edit farmer">
            <Edit size={16} />
          </button>
          <button className="icon-btn danger" onClick={() => remove(row)} title="Delete farmer">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader title="Farmer Management" subtitle="Digital farmer registration with validation, search, filters, and history tracking." />
      <SearchToolbar search={list.filters.search || ''} onSearch={list.setSearch} buttonLabel="Add Farmer" onAdd={openCreate}>
        <input className="form-control compact-input" placeholder="Village filter" onChange={(e) => list.patchFilters({ village: e.target.value })} />
      </SearchToolbar>
      <DataTable columns={columns} rows={list.rows} loading={list.loading} />
      <Pagination page={list.meta.page} pages={list.meta.pages} onChange={list.setPage} />

      <FormModal
        title={editing ? 'Update Farmer' : 'Register Farmer'}
        show={show}
        onClose={() => setShow(false)}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setShow(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" form="farmer-form">
              Save
            </button>
          </>
        }
      >
        <form id="farmer-form" onSubmit={save} className="form-grid two">
          {[
            ['farmerNumber', 'Farmer number'],
            ['firstName', 'First name'],
            ['lastName', 'Last name'],
            ['telephoneNumber', 'Telephone number'],
            ['village', 'Village'],
            ['cooperativeCode', 'Cooperative code']
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input className="form-control" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required />
            </label>
          ))}
          <label>
            Membership date
            <input className="form-control" type="date" value={form.membershipDate} onChange={(e) => setForm({ ...form, membershipDate: e.target.value })} required />
          </label>
        </form>
      </FormModal>

      <FormModal title="Farmer Delivery History" show={Boolean(history)} onClose={() => setHistory(null)}>
        {history && (
          <div className="history-view">
            <h3>{history.farmer.firstName} {history.farmer.lastName}</h3>
            <p>{history.farmer.farmerNumber} · {history.farmer.telephoneNumber} · {history.farmer.village}</p>
            <h4>Deliveries</h4>
            {history.deliveries.map((item) => (
              <div className="mini-row" key={item._id}>
                <span>{item.cropType} · {date(item.deliveryDate)}</span>
                <strong>{currency(item.totalAmount)}</strong>
              </div>
            ))}
            <h4>Payments</h4>
            {history.payments.map((item) => (
              <div className="mini-row" key={item._id}>
                <span>{item.paymentStatus} · {date(item.paymentDate || item.createdAt)}</span>
                <strong>{currency(item.totalAmountPaid)}</strong>
              </div>
            ))}
          </div>
        )}
      </FormModal>
    </>
  );
}
