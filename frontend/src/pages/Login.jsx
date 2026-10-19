import { LockKeyhole, Sprout } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      showToast('Welcome back to Tuzamurane CMS');
      navigate('/dashboard');
    } catch (error) {
      showToast(error.response?.data?.message || 'Login failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-visual">
        <div className="brand-block login-brand">
          <div className="brand-mark">
            <Sprout size={28} />
          </div>
          <div>
            <strong>Tuzamurane Farmers Cooperative</strong>
            <span>Nyamagabe District produce operations</span>
          </div>
        </div>
        <div className="login-copy">
          <h1>Cooperative Management System</h1>
          <p>Digital farmer records, crop deliveries, payments, receipts, and reports for transparent bulk sales operations.</p>
        </div>
      </section>
      <section className="login-card">
        <div className="login-card-head">
          <LockKeyhole size={24} />
          <h2>Administrator Login</h2>
        </div>
        <form onSubmit={submit} className="form-grid">
          <label>
            Email or username
            <input
              className="form-control"
              value={form.identifier}
              onChange={(event) => setForm({ ...form, identifier: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              className="form-control"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <small>Seed account: admin@tuzamurane.rw / Admin123!</small>
        </form>
      </section>
    </main>
  );
}
