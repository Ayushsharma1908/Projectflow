import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-5 relative overflow-hidden text-text-primary selection:bg-green-dim selection:text-green">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-green/5 blur-[120px] pointer-events-none" />
      
      {/* Card */}
      <div className="bg-[#111113]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-10 md:p-12 w-full max-w-[440px] relative z-10 shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_40px_var(--tw-colors-green-dim)]">
        
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <span className="w-2.5 h-2.5 rounded-full bg-green shadow-[0_0_12px_var(--tw-colors-green-dim),0_0_30px_var(--tw-colors-green-dim)] animate-pulse" />
          <span className="font-extrabold text-xl tracking-tight text-white">ProjectFlow</span>
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome back</h1>
          <p className="text-[15px] text-text-secondary">Sign in to continue your work</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-widest">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" 
              required 
              autoFocus 
              className="w-full px-4 py-3.5 bg-bg-elevated border border-white/10 rounded-lg text-[15px] text-white placeholder:text-text-muted focus:outline-none focus:border-green/50 focus:ring-1 focus:ring-green/50 transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-widest">Password</label>
            <div className="relative">
              <input 
                type={showPass ? 'text' : 'password'} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                required 
                className="w-full pl-4 pr-12 py-3.5 bg-bg-elevated border border-white/10 rounded-lg text-[15px] text-white placeholder:text-text-muted focus:outline-none focus:border-green/50 focus:ring-1 focus:ring-green/50 transition-all" 
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-green hover:bg-green-dark text-[#0A1F12] font-semibold text-[15px] rounded-full transition-all shadow-[0_2px_16px_var(--tw-colors-green-border)] hover:shadow-[0_4px_28px_var(--tw-colors-green-dim)] hover:-translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center my-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <span className="relative z-10 px-3 bg-[#111113]/80 text-[13px] text-text-muted">
            New to ProjectFlow?
          </span>
        </div>
        
        <Link 
          to="/register" 
          className="w-full flex items-center justify-center py-3.5 bg-transparent border border-white/10 hover:border-green/30 hover:bg-white/5 text-text-secondary hover:text-white font-medium text-[15px] rounded-full transition-all"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default Login;
