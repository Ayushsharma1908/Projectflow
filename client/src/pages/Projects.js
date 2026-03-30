import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Plus, FolderKanban, Users, Calendar, Trash2, ArrowRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PROJECT_COLORS = ['#25D366','#7AAD8C','#9B8FD4','#6B9BD4','#D4936B','#D47B8F','#7BC4C4','#B8C47B'];

const statusColors = {
  planning: { bg: 'rgba(107,122,153,0.15)', text: '#6B7A99' },
  active: { bg: 'rgba(37,211,102,0.12)', text: '#25D366' },
  'on-hold': { bg: 'rgba(212,147,107,0.15)', text: '#D4936B' },
  completed: { bg: 'rgba(18,140,126,0.15)', text: '#128C7E' },
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <h2 className="modal-title">New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder="e.g. Website Redesign" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Brief project overview..." rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="design, frontend" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {PROJECT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                  style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: form.color === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none', transition: 'var(--transition)', flexShrink: 0 }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</button>
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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="loader" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} total projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." />
        </div>
        <div className="filter-tabs">
          {['all','planning','active','on-hold','completed'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className="btn btn-ghost"
              style={{ padding: '7px 13px', fontSize: 12,
                background: filter === s ? 'var(--green-dim)' : 'transparent',
                color: filter === s ? 'var(--green)' : 'var(--text-muted)',
                borderColor: filter === s ? 'var(--green-border)' : 'transparent' }}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={44} />
          <h3>No projects found</h3>
          <p>{search ? 'Try a different search term' : 'Create your first project to get started'}</p>
          {!search && <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => setShowModal(true)}><Plus size={15} /> New Project</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(project => {
            const sc = statusColors[project.status] || statusColors.planning;
            return (
              <Link key={project._id} to={`/projects/${project._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 20, cursor: 'pointer', position: 'relative' }}>
                  {/* Color top accent */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: project.color, borderRadius: '10px 10px 0 0' }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7, flexWrap: 'wrap' }}>
                        <span className="badge" style={{ background: sc.bg, color: sc.text }}>{project.status}</span>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityDot[project.priority] }} title={project.priority} />
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.name}
                      </h3>
                    </div>
                    <button className="btn btn-icon" onClick={(e) => handleDelete(project._id, e)}
                      style={{ marginLeft: 6, color: 'var(--text-dim)', flexShrink: 0, padding: 5 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {project.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                      {project.description}
                    </p>
                  )}

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{project.completedCount || 0}/{project.taskCount || 0} tasks</span>
                      <span style={{ fontSize: 11, color: 'var(--green)' }}>{project.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${project.progress || 0}%`, background: project.color }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {project.deadline && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 11 }}>
                          <Calendar size={11} /> {format(new Date(project.deadline), 'MMM d')}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 11 }}>
                        <Users size={11} /> {project.members?.length || 1}
                      </div>
                    </div>
                    <ArrowRight size={13} color="var(--text-dim)" />
                  </div>

                  {project.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
                      {project.tags.map(tag => (
                        <span key={tag} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--text-dim)' }}>
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