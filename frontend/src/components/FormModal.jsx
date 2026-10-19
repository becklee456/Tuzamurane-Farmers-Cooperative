import { X } from 'lucide-react';

export default function FormModal({ title, show, onClose, children, footer }) {
  if (!show) return null;

  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
