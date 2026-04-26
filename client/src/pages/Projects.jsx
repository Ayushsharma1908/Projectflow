import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, FolderKanban, Users, Calendar, Trash2, ArrowRight, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PROJECT_COLORS = ['#25D366','#7AAD8C','#9B8FD4','#6B9BD4','#D4936B','#D47B8F','#7BC4C4','#B8C47B'];

const statusStyles = {
  planning: { bg: 'bg-[#6B7A99]/15', text: 'text-[#6B7A99]' },
  active: { bg: 'bg-green-dim', text: 'text-green' },
  'on-hold': { bg: 'bg-[#D4936B]/15', text: 'text-[#D4936B]' },
  completed: { bg: 'bg-[#128C7E]/15', text: 'text-[#128C7E]' },
};
const priorityDot = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };

const ProjectModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0], status: 'planning', priority: 'medium', deadline: '', tags: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      const res = await api.post('/projects', payload);
      toast.success('Project created!');
      onSave(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-bg-elevated border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-[500px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-fade-in" style={{ animationDuration: '0.2s' }}>
        <h2 className="text-xl font-bold text-text-primary mb-6">New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-text-muted uppercase tracking-widest">Project Name *</label>
            <input 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="e.g. Website Redesign" 
              required 
              autoFocus 
              className="w-full px-4 py-2.5 bg-bg-base border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-text-muted uppercase tracking-widest">Description</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Brief project overview..." 
              rows={3} 
              className="w-full px-4 py-2.5 bg-bg-base border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/50 transition-colors resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-muted uppercase tracking-widest">Status</label>
              <select 
                value={form.status} 
                onChange={e => setForm({...form, status: e.target.value})}
                className="w-full h-10 px-3 bg-bg-base border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:border-green/50 transition-colors"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-muted uppercase tracking-widest">Priority</label>
              <select 
                value={form.priority} 
                onChange={e => setForm({...form, priority: e.target.value})}
                className="w-full h-10 px-3 bg-bg-base border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:border-green/50 transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-muted uppercase tracking-widest">Deadline</label>
              <input 
                type="date" 
                value={form.deadline} 
                onChange={e => setForm({...form, deadline: e.target.value})} 
                className="w-full h-10 px-3 bg-bg-base border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:border-green/50 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-muted uppercase tracking-widest">Tags</label>
              <input 
                value={form.tags} 
                onChange={e => setForm({...form, tags: e.target.value})} 
                placeholder="design, frontend" 
                className="w-full h-10 px-3 bg-bg-base border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/50 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1.5 pt-2">
            <label className="text-[13px] font-semibold text-text-muted uppercase tracking-widest">Color</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {PROJECT_COLORS.map(c => (
                <button 
                  key={c} 
                  type="button" 
                  onClick={() => setForm({...form, color: c})}
                  className="w-[26px] h-[26px] rounded-full flex-shrink-0 transition-transform hover:scale-110"
                  style={{ background: c, border: form.color === c ? '2px solid white' : '2px solid transparent', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none' }} 
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-medium text-text-secondary border border-white/10 hover:bg-white/5 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-green text-[#0A1F12] hover:bg-green-dark transition-colors flex items-center gap-2 shadow-[0_2px_12px_var(--tw-colors-green-border)]">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-green" /></div>;

  return (
    <div className="animate-fade-in pb-10 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-1">Projects</h1>
          <p className="text-[15px] text-text-secondary">{projects.length} total projects</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green hover:bg-green-dark text-[#0A1F12] font-semibold text-sm rounded-full transition-all shadow-[0_2px_16px_var(--tw-colors-green-border)] hover:-translate-y-[1px]"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search projects..." 
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-bg-elevated text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/50 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all','planning','active','on-hold','completed'].map(s => (
            <button 
              key={s} 
              onClick={() => setFilter(s)} 
              className={`px-4 h-11 text-[13px] font-medium rounded-xl border transition-colors ${filter === s ? 'bg-green-dim text-green border-green-border' : 'bg-transparent text-text-muted border-transparent hover:bg-bg-elevated hover:text-text-primary'}`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <FolderKanban size={44} className="text-text-muted opacity-30 mb-4" />
          <h3 className="text-lg font-bold text-text-primary mb-1">No projects found</h3>
          <p className="text-[14px] text-text-secondary mb-5">{search ? 'Try a different search term' : 'Create your first project to get started'}</p>
          {!search && (
            <button 
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green text-[#0A1F12] font-semibold text-sm rounded-full"
            >
              <Plus size={14} /> New Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(project => {
            const sc = statusStyles[project.status] || statusStyles.planning;
            return (
              <Link key={project._id} to={`/projects/${project._id}`} className="block relative group rounded-2xl transition-all">
                <div className="absolute inset-0 bg-bg-elevated border border-white/10 rounded-2xl transition-all group-hover:border-white/20 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] group-hover:-translate-y-1" />
                <div className="relative p-6 flex flex-col h-full z-10 group-hover:-translate-y-1 transition-transform">
                  {/* Color top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-80" style={{ background: project.color }} />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                          {project.status.replace('-', ' ')}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: priorityDot[project.priority] }} title={project.priority} />
                      </div>
                      <h3 className="text-[16px] font-bold text-text-primary truncate">
                        {project.name}
                      </h3>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(project._id, e)}
                      className="p-1.5 text-text-muted hover:text-[#FF453A] hover:bg-[#FF453A]/10 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {project.description && (
                    <p className="text-[13px] text-text-secondary leading-relaxed mb-5 line-clamp-2 flex-1">
                      {project.description}
                    </p>
                  )}
                  {!project.description && <div className="flex-1" />}

                  <div className="mb-5 mt-auto">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-medium text-text-muted">{project.completedCount || 0}/{project.taskCount || 0} tasks</span>
                      <span className="text-[11px] font-bold" style={{ color: project.color }}>{project.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${project.progress || 0}%`, background: project.color }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {project.deadline && (
                        <div className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted">
                          <Calendar size={13} /> {format(new Date(project.deadline), 'MMM d')}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted">
                        <Users size={13} /> {project.members?.length || 1}
                      </div>
                    </div>
                    <ArrowRight size={15} className="text-text-muted group-hover:text-green group-hover:translate-x-1 transition-all" />
                  </div>

                  {project.tags?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-4 pt-4 border-t border-white/5">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-text-muted border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showModal && <ProjectModal onClose={() => setShowModal(false)} onSave={p => setProjects(prev => [p, ...prev])} />}
    </div>
  );
};

export default Projects;