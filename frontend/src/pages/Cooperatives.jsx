import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import FormModal from '../components/FormModal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchToolbar from '../components/SearchToolbar.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import useResourceList from '../hooks/useResourceList.js';
import api from '../services/api.js';

const blank = {
  cooperativeCode: '',
  cooperativeName: '',
  district: 'Nyamagabe',
  chairpersonName: ''
};

export default function Cooperatives() {
  const list = useResourceList('/cooperatives');
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
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
      cooperativeCode: row.cooperativeCode,
      cooperativeName: row.cooperativeName,
      district: row.district,
      chairpersonName: row.chairpersonName
    });
    setShow(true);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/cooperatives/${editing._id}`, form);
        showToast('Cooperative updated');
      } else {
        await api.post('/cooperatives', form);
        showToast('Cooperative created');
      }
      setShow(false);
      list.fetchRows();
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save cooperative', 'danger');
    }
  };

  const remove = async (row) => {
    if (!confirm(`Delete ${row.cooperativeName}?`)) return;
    try {
      await api.delete(`/cooperatives/${row._id}`);
      showToast('Cooperative deleted');
      list.fetchRows();
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const columns = [
    { key: 'cooperativeCode', label: 'Code' },
    { key: 'cooperativeName', label: 'Name' },
    { key: 'district', label: 'District' },
    { key: 'chairpersonName', label: 'Chairperson' },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="table-actions">
          <button className="icon-btn" onClick={() => openEdit(row)} title="Edit cooperative">
            <Edit size={16} />
          </button>
          <button className="icon-btn danger" onClick={() => remove(row)} title="Delete cooperative">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader title="Cooperative Management" subtitle="Create, update, search, and manage cooperative registration details." />
      <SearchToolbar search={list.filters.search || ''} onSearch={list.setSearch} buttonLabel="Add Cooperative" onAdd={openCreate} />
      <DataTable columns={columns} rows={list.rows} loading={list.loading} />
      <Pagination page={list.meta.page} pages={list.meta.pages} onChange={list.setPage} />

      <FormModal
        title={editing ? 'Update Cooperative' : 'New Cooperative'}
        show={show}
        onClose={() => setShow(false)}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setShow(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" form="cooperative-form">
              Save
            </button>
          </>
        }
      >
        <form id="cooperative-form" onSubmit={save} className="form-grid two">
          <label>
            Cooperative code
            <input className="form-control" value={form.cooperativeCode} onChange={(e) => setForm({ ...form, cooperativeCode: e.target.value })} required />
          </label>
          <label>
            Cooperative name
            <input className="form-control" value={form.cooperativeName} onChange={(e) => setForm({ ...form, cooperativeName: e.target.value })} required />
          </label>
          <label>
            District
            <input className="form-control" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
          </label>
          <label>
            Chairperson
            <input className="form-control" value={form.chairpersonName} onChange={(e) => setForm({ ...form, chairpersonName: e.target.value })} required />
          </label>
        </form>
      </FormModal>
    </>
  );
}
