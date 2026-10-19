import { Plus, Search } from 'lucide-react';

export default function SearchToolbar({ search, onSearch, buttonLabel, onAdd, children }) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <Search size={17} />
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search records" />
      </div>
      {children}
      {onAdd && (
        <button className="btn btn-primary" onClick={onAdd}>
          <Plus size={17} />
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
