import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.decor} />
      <div style={styles.card} className="fade-in">
        <div style={styles.logoRow}>
          <span className="logo-dot" />
          <span style={styles.logoText}>ProjectFlow</span>
        </div>
        <h1 style={styles.title}>Get started</h1>
        <p style={styles.subtitle}>Create your account to begin</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Smith" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="jane@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 6 characters" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.login}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--green)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-base)', padding: 20, position: 'relative', overflow: 'hidden'
  },
  decor: {
    position: 'absolute', left: '50%', top: '10%', transform: 'translateX(-50%)',
    width: 600, height: 300, borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(37,211,102,0.08) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  card: {
    background: 'var(--bg-elevated)', border: '1px solid var(--green-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl), 0 0 60px rgba(37,211,102,0.06)',
    padding: '40px', width: '100%', maxWidth: 420
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500,
    color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8
  },
  subtitle: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 },
  login: { fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20 }
};

export default Register;
