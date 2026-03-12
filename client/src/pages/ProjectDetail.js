import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Plus, ArrowLeft, Calendar, Users, Trash2, Edit2, MoreHorizontal, User, Flag, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isAfter } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#6B7A99' },
  { id: 'in-progress', label: 'In Progress', color: '#C8A97E' },
  { id: 'review', label: 'Review', color: '#9B8FD4' },
  { id: 'done', label: 'Done', color: '#7AAD8C' },
];
const priorityColors = { low: '#7AAD8C', medium: '#C8A97E', high: '#D4936B', critical: '#E07B6A' };

const TaskModal = ({ task, projectId, members, onClose, onSave }) => {
  const { user } = useAuth();
  const [form, setForm] = useState(task ? {
    title: task.title, description: task.description || '',
    assignee: task.assignee?._id || '', status: task.status,
    priority: task.priority, deadline: task.deadline ? task.deadline.split('T')[0] : '',
    tags: task.tags?.join(', ') || ''
  } : { title: '', description: '', assignee: '', status: 'todo', priority: 'medium', deadline: '', tags: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        project: projectId,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        assignee: form.assignee || null
      };
      let res;
      if (task) {
        res = await api.put(`/tasks/${task._id}`, payload);
        toast.success('Task updated!');
      } else {
        res = await api.post('/tasks', payload);
        toast.success('Task created!');
      }
      onSave(res.data, !!task);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
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
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOverdue = task.deadline && isAfter(new Date(), new Date(task.deadline)) && task.status !== 'done';

  return (
    <div style={styles.taskCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColors[task.priority], flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: priorityColors[task.priority], textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {task.priority}
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{task.title}</p>
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button className="btn btn-icon" onClick={() => setMenuOpen(!menuOpen)} style={{ padding: 4 }}>
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div style={styles.menu} onMouseLeave={() => setMenuOpen(false)}>
              <button style={styles.menuItem} onClick={() => { onEdit(task); setMenuOpen(false); }}>
                <Edit2 size={12} /> Edit
              </button>
              {COLUMNS.filter(c => c.id !== task.status).map(c => (
                <button key={c.id} style={styles.menuItem} onClick={() => { onStatusChange(task._id, c.id); setMenuOpen(false); }}>
                  Move to {c.label}
                </button>
              ))}
              <button style={{ ...styles.menuItem, color: '#E07B6A' }} onClick={() => { onDelete(task._id); setMenuOpen(false); }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
          {task.description}
        </p>
      )}

      {task.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
          {task.tags.map(tag => (
            <span key={tag} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(200,169,126,0.1)', color: 'var(--gold)', border: '1px solid rgba(200,169,126,0.15)' }}>{tag}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {task.assignee ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="avatar" style={{ width: 22, height: 22, fontSize: 9 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: isOverdue ? '#E07B6A' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>
            <Calendar size={11} />
            {format(new Date(task.deadline), 'MMM d')}
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');

  const fetchData = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([api.get(`/projects/${id}`), api.get(`/tasks/project/${id}`)]);
      setProject(pRes.data); setTasks(tRes.data);
    } catch (err) {
      toast.error('Failed to load project'); navigate('/projects');
    } finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddTask = (status) => { setDefaultStatus(status); setEditingTask(null); setShowTaskModal(true); };
  const handleEditTask = (task) => { setEditingTask(task); setShowTaskModal(true); };

  const handleSaveTask = (savedTask, isEdit) => {
    if (isEdit) setTasks(prev => prev.map(t => t._id === savedTask._id ? savedTask : t));
    else setTasks(prev => [...prev, savedTask]);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
    } catch { toast.error('Failed to update task'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="loader" /></div>;
  if (!project) return null;

  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const isOwner = project.owner?._id === user?._id || project.owner === user?._id;

  return (
    <div className="fade-in" style={{ minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/projects')} style={{ marginBottom: 16, padding: '6px 12px', fontSize: 13 }}>
          <ArrowLeft size={14} /> Back to Projects
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: project.color }} />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {project.name}
              </h1>
            </div>
            {project.description && <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 600 }}>{project.description}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              {project.deadline && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
                  <Calendar size={13} /> Due {format(new Date(project.deadline), 'MMM d, yyyy')}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
                <Users size={13} /> {project.members?.length || 1} member{project.members?.length !== 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 13, color: 'var(--gold)' }}>{progress}% complete</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => handleAddTask('todo')}>
            <Plus size={16} /> Add Task
          </button>
        </div>

        {/* Progress */}
        <div style={{ marginTop: 20, maxWidth: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>{done} of {total} tasks completed</span>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${progress}%`, background: project.color }} />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={styles.kanban}>
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} style={styles.column}>
              <div style={styles.columnHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 7px', borderRadius: 999 }}>{colTasks.length}</span>
                </div>
                <button className="btn btn-icon" onClick={() => handleAddTask(col.id)} style={{ padding: 4 }}>
                  <Plus size={14} />
                </button>
              </div>
              <div style={styles.taskList}>
                {colTasks.map(task => (
                  <TaskCard key={task._id} task={task} onEdit={handleEditTask}
                    onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
                ))}
                {colTasks.length === 0 && (
                  <div style={styles.emptyCol}>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          projectId={id}
          members={project.members || []}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

const styles = {
  kanban: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16, alignItems: 'start', minHeight: 400,
    overflowX: 'auto'
  },
  column: {
    background: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 'var(--radius)',
    minWidth: 240,
    boxShadow: 'var(--shadow-sm)'
  },
  columnHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)'
  },
  taskList: { padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100 },
  taskCard: {
    background: 'var(--bg-card)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 'var(--radius-sm)',
    padding: '14px',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    transition: 'var(--transition)',
  },
  emptyCol: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', borderRadius: 'var(--radius-sm)',
    border: '1px dashed var(--text-dim)'
  },
  menu: {
    position: 'absolute', right: 0, top: '100%', zIndex: 50,
    background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-lg)',
    minWidth: 160, overflow: 'hidden'
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '9px 14px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, color: 'var(--text-secondary)',
    textAlign: 'left', transition: 'var(--transition)',
    fontFamily: 'var(--font-body)'
  }
};

export default ProjectDetail;
