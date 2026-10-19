import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import useResourceList from '../hooks/useResourceList.js';
import { date } from '../utils/format.js';

export default function AuditLogs() {
  const list = useResourceList('/audit-logs');
  const columns = [
    { key: 'createdAt', label: 'Date', render: (row) => date(row.createdAt) },
    { key: 'user', label: 'User', render: (row) => row.user?.name || 'System' },
    { key: 'role', label: 'Role', render: (row) => row.user?.role || '-' },
    { key: 'action', label: 'Action' },
    { key: 'entity', label: 'Entity' },
    { key: 'method', label: 'Method' },
    { key: 'path', label: 'Path' }
  ];

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Review important changes made by authenticated users." />
      <DataTable columns={columns} rows={list.rows} loading={list.loading} />
      <Pagination page={list.meta.page} pages={list.meta.pages} onChange={list.setPage} />
    </>
  );
}
