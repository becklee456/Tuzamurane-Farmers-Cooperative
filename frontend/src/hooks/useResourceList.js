import { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';

export default function useResourceList(endpoint, initialFilters = {}) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ page: 1, limit: 10, ...initialFilters });
  const [loading, setLoading] = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint, { params: filters });
      setRows(data.items || data);
      setMeta({ page: data.page || 1, pages: data.pages || 1, total: data.total || data.length || 0 });
    } finally {
      setLoading(false);
    }
  }, [endpoint, filters]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const setPage = (page) => setFilters((current) => ({ ...current, page }));
  const setSearch = (search) => setFilters((current) => ({ ...current, search, page: 1 }));
  const patchFilters = (next) => setFilters((current) => ({ ...current, ...next, page: 1 }));

  return { rows, meta, filters, loading, fetchRows, setPage, setSearch, patchFilters };
}
