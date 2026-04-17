import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './LandingPage.css';

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
    <div className="lp-root" style={styles.page}>
      <div className="lp-hero-bg-glow" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.6 }} />
      
      <div style={styles.card} className="fade-in">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="lp-logo" style={{ justifyContent: 'center', marginBottom: '32px' }}>
            <span className="lp-logo-dot" />
            ProjectFlow
          </div>
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to continue your work</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" 
              required 
              autoFocus 
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPass ? 'text' : 'password'} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                required 
                style={{ ...styles.input, paddingRight: 44 }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="lp-btn-primary lp-btn-large" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>New to ProjectFlow?</span>
        </div>
        
        <Link 
          to="/register" 
          className="lp-btn-ghost" 
          style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}
        >
          Create an account
        </Link>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative'
  },
  card: {
    background: 'var(--lp-surface)',
    border: '1px solid var(--lp-border)',
    borderRadius: 'var(--lp-radius)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
    position: 'relative',
    zIndex: 10,
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(37, 211, 102, 0.04)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--lp-text)',
    letterSpacing: '-0.03em',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--lp-text-secondary)'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--lp-text-secondary)',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    background: 'var(--lp-elevated)',
    border: '1px solid var(--lp-border)',
    borderRadius: 'var(--lp-radius-sm)',
    color: 'var(--lp-text)',
    fontSize: '15px',
    outline: 'none',
    transition: 'var(--lp-transition)',
    boxSizing: 'border-box'
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--lp-text-muted)',
    display: 'flex',
    alignItems: 'center',
    padding: 0
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '32px 0 24px 0',
    position: 'relative'
  },
  dividerText: {
    fontSize: '13px',
    color: 'var(--lp-text-muted)',
    background: 'var(--lp-surface)',
    padding: '0 12px',
    position: 'relative',
    zIndex: 1
  }
};

export default Login;
