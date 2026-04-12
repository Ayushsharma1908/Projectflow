import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Plus, ArrowLeft, Calendar, Users, Trash2, Edit2, MoreHorizontal, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isAfter } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: '#636366' },
  { id: 'in-progress', label: 'In Progress',  color: '#25D366' },
  { id: 'review',      label: 'Review',       color: '#BF5AF2' },
  { id: 'done',        label: 'Done',         color: '#128C7E' },
];
const priorityColors = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };

/* ── Task Modal ── */
const TaskModal = ({ task, projectId, members, onClose, onSave }) => {
  const [form, setForm] = useState(task ? {
    title: task.title, description: task.description || '',
    assignee: task.assignee?._id || '', status: task.status,
    priority: task.priority, deadline: task.deadline ? task.deadline.split('T')[0] : '',
    tags: task.tags?.join(', ') || '',
  } : { title: '', description: '', assignee: '', status: 'todo', priority: 'medium', deadline: '', tags: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, project: projectId,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        assignee: form.assignee || null };
      const res = task ? await api.put(`/tasks/${task._id}`, payload) : await api.post('/tasks', payload);
      toast.success(task ? 'Task updated!' : 'Task created!');
      onSave(res.data, !!task);
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save task'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Task details..." rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tags</label>
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="bug, feature, urgent" />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : task ? 'Update' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Task Card ── */
const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOverdue = task.deadline && isAfter(new Date(), new Date(task.deadline)) && task.status !== 'done';

  return (
    <div className="card" style={{ padding: '13px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 9 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColors[task.priority], flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: priorityColors[task.priority], textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              {task.priority}
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{task.title}</p>
        </div>
        <div style={{ position: 'relative', flexShrink: 0, marginLeft: 4 }}>
          <button className="btn btn-icon" onClick={() => setMenuOpen(!menuOpen)} style={{ padding: 4 }}>
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div style={cardS.menu} onMouseLeave={() => setMenuOpen(false)}>
              <button style={cardS.menuItem} onClick={() => { onEdit(task); setMenuOpen(false); }}>
                <Edit2 size={11} /> Edit
              </button>
              {COLUMNS.filter(c => c.id !== task.status).map(c => (
                <button key={c.id} style={cardS.menuItem} onClick={() => { onStatusChange(task._id, c.id); setMenuOpen(false); }}>
                  → {c.label}
                </button>
              ))}
              <button style={{ ...cardS.menuItem, color: '#FF453A' }} onClick={() => { onDelete(task._id); setMenuOpen(false); }}>
                <Trash2 size={11} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 9, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
          {task.description}
        </p>
      )}

      {task.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 9 }}>
          {task.tags.map(tag => (
            <span key={tag} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-border)' }}>{tag}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {task.assignee ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="avatar" style={{ width: 20, height: 20, fontSize: 8 }}>
                {task.assignee.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.assignee.name?.split(' ')[0]}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', fontSize: 11 }}>
              <User size={11} /> Unassigned
            </div>
          )}
        </div>
        {task.deadline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: isOverdue ? '#FF453A' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>
            <Calendar size={11} />
            {format(new Date(task.deadline), 'MMM d')}
          </div>
        )}
      </div>
    </div>
  );
};

const cardS = {
  menu: {
    position: 'absolute', right: 0, top: '100%', zIndex: 50,
    background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-lg)',
    minWidth: 150, overflow: 'hidden',
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: 7,
    width: '100%', padding: '8px 14px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, color: 'var(--text-secondary)',
    textAlign: 'left', transition: 'var(--transition)',
    fontFamily: 'var(--font-body)',
  },
};

/* ── Main Page ── */
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([api.get(`/projects/${id}`), api.get(`/tasks/project/${id}`)]);
      setProject(pRes.data); setTasks(tRes.data);
    } catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveTask = (saved, isEdit) => {
    if (isEdit) setTasks(prev => prev.map(t => t._id === saved._id ? saved : t));
    else setTasks(prev => [...prev, saved]);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${taskId}`); setTasks(prev => prev.filter(t => t._id !== taskId)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try { const res = await api.put(`/tasks/${taskId}`, { status }); setTasks(prev => prev.map(t => t._id === taskId ? res.data : t)); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="loader" /></div>;
  if (!project) return null;

  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/projects')}
          style={{ marginBottom: 14, padding: '6px 12px', fontSize: 13 }}>
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
              <h1 className="page-title" style={{ fontSize: 'clamp(20px, 4vw, 30px)' }}>{project.name}</h1>
            </div>
            {project.description && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 560, marginBottom: 10 }}>{project.description}</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              {project.deadline && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                  <Calendar size={12} /> Due {format(new Date(project.deadline), 'MMM d, yyyy')}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                <Users size={12} /> {project.members?.length || 1} member{project.members?.length !== 1 ? 's' : ''}
              </div>
              <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>{progress}% complete</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowTaskModal(true); }} style={{ flexShrink: 0 }}>
            <Plus size={15} /> Add Task
          </button>
        </div>

        {/* Progress */}
        <div style={{ marginTop: 16, maxWidth: 380 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>{done} of {total} tasks done</span>
          </div>
          <div className="progress-bar" style={{ height: 5 }}>
            <div className="progress-fill" style={{ width: `${progress}%`, background: project.color }} />
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', minWidth: 0 }}>
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{col.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 999 }}>{colTasks.length}</span>
                </div>
                <button className="btn btn-icon" onClick={() => { setEditingTask(null); setShowTaskModal(true); }} style={{ padding: 3 }}>
                  <Plus size={13} />
                </button>
              </div>
              {/* Cards */}
              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 7, minHeight: 80 }}>
                {colTasks.map(task => (
                  <TaskCard key={task._id} task={task}
                    onEdit={t => { setEditingTask(t); setShowTaskModal(true); }}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange} />
                ))}
                {colTasks.length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 10px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--text-dim)' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask} projectId={id} members={project.members || []}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSave={handleSaveTask} />
      )}
    </div>
  );
};

export default ProjectDetail;