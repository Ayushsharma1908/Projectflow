import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.decorLeft} />
      <div style={styles.decorRight} />
      <div style={styles.card} className="fade-in">
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}><Zap size={18} strokeWidth={2.5} /></div>
          <span style={styles.logoText}>ProjectFlow</span>
        </div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to continue your work</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>New to ProjectFlow?</span>
        </div>
        <Link to="/register" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
          Create Account
        </Link>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-base)', padding: 20, position: 'relative', overflow: 'hidden'
  },
  decorLeft: {
    position: 'absolute', left: '-10%', top: '20%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,211,102,0.08) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  decorRight: {
    position: 'absolute', right: '-10%', bottom: '20%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,211,102,0.05) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  card: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--green-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl), 0 0 60px rgba(37,211,102,0.06)',
    padding: '40px', width: '100%', maxWidth: 420, position: 'relative'
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: {
    width: 34, height: 34,
    background: 'linear-gradient(135deg, #25D366, #128C7E)',
    borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#0D1F16', boxShadow: '0 2px 14px rgba(37,211,102,0.35)'
  },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500,
    color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8
  },
  subtitle: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 },
  form: { marginBottom: 20 },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
  },
  divider: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '20px 0'
  },
  dividerText: { fontSize: 13, color: 'var(--text-muted)' }
};

export default Login;
