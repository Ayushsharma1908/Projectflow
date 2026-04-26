import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
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
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-5 relative overflow-hidden text-text-primary selection:bg-green-dim selection:text-green">
      {/* Background glow */}
      <div className="absolute left-1/2 top-[10%] -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-green/[0.08] blur-[100px] pointer-events-none" />
      
      {/* Card */}
      <div className="bg-[#111113]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-10 md:p-12 w-full max-w-[440px] relative z-10 shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_40px_var(--tw-colors-green-dim)]">
        
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor" className="text-green"><path d="M480-560h200v-80H480v80Zm0 240h200v-80H480v80Zm-63.5-223.5Q440-567 440-600t-23.5-56.5Q393-680 360-680t-56.5 23.5Q280-633 280-600t23.5 56.5Q327-520 360-520t56.5-23.5Zm0 240Q440-327 440-360t-23.5-56.5Q393-440 360-440t-56.5 23.5Q280-393 280-360t23.5 56.5Q327-280 360-280t56.5-23.5ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/> </svg>
          <span className="font-extrabold text-xl tracking-tight text-white">ProjectFlow</span>
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Get started</h1>
          <p className="text-[15px] text-text-secondary">Create your account to begin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-widest">Full Name</label>
            <input 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ayush" 
              required 
              autoFocus 
              className="w-full px-4 py-3 bg-bg-elevated border border-white/10 rounded-lg text-[15px] text-white placeholder:text-text-muted focus:outline-none focus:border-green/50 focus:ring-1 focus:ring-green/50 transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-widest">Email</label>
            <input 
              type="email" 
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" 
              required 
              className="w-full px-4 py-3 bg-bg-elevated border border-white/10 rounded-lg text-[15px] text-white placeholder:text-text-muted focus:outline-none focus:border-green/50 focus:ring-1 focus:ring-green/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-widest">Password</label>
            <div className="relative">
              <input 
                type={showPass ? 'text' : 'password'} 
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 6 characters" 
                required 
                className="w-full pl-4 pr-12 py-3 bg-bg-elevated border border-white/10 rounded-lg text-[15px] text-white placeholder:text-text-muted focus:outline-none focus:border-green/50 focus:ring-1 focus:ring-green/50 transition-all" 
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
            className="w-full flex items-center justify-center py-3.5 mt-6 bg-green hover:bg-green-dark text-[#0A1F12] font-semibold text-[15px] rounded-full transition-all shadow-[0_2px_16px_var(--tw-colors-green-border)] hover:shadow-[0_4px_28px_var(--tw-colors-green-dim)] hover:-translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
               <div className="flex items-center justify-center gap-2">
                 <Loader2 className="w-5 h-5 animate-spin" />
                 <span>Creating account...</span>
               </div>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-[13px] text-text-muted text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
