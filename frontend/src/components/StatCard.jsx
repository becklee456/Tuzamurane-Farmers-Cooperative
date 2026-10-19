import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, tone = 'green' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{Icon && <Icon size={22} />}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <ArrowUpRight className="stat-corner" size={18} />
    </div>
  );
}
