import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Plus, ArrowLeft, Calendar, Users, Trash2, Edit2, MoreHorizontal, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isAfter } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: '#636366' },
  { id: 'in-progress', label: 'In Progress', color: '#25D366' },
  { id: 'review',      label: 'Review',      color: '#BF5AF2' },
  { id: 'done',        label: 'Done',        color: '#128C7E' },
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
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-bg-elevated border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-[500px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-fade-in" style={{ animationDuration: '0.2s' }}>
        <h2 className="text-xl font-bold text-text-primary mb-6">{task ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-text-muted uppercase tracking-widest">Title *</label>
            <input 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              placeholder="Task title" 
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
              placeholder="Task details..." 
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
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
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
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-muted uppercase tracking-widest">Assignee</label>
              <select 
                value={form.assignee} 
                onChange={e => setForm({...form, assignee: e.target.value})}
                className="w-full h-10 px-3 bg-bg-base border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:border-green/50 transition-colors"
              >
                <option value="">Unassigned</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-text-muted uppercase tracking-widest">Deadline</label>
              <input 
                type="date" 
                value={form.deadline} 
                onChange={e => setForm({...form, deadline: e.target.value})} 
                className="w-full h-10 px-3 bg-bg-base border border-white/10 rounded-xl text-sm text-text-primary focus:outline-none focus:border-green/50 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-text-muted uppercase tracking-widest">Tags (comma separated)</label>
            <input 
              value={form.tags} 
              onChange={e => setForm({...form, tags: e.target.value})} 
              placeholder="bug, feature, urgent" 
              className="w-full h-10 px-3 bg-bg-base border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/50 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-medium text-text-secondary border border-white/10 hover:bg-white/5 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-green text-[#0A1F12] hover:bg-green-dark transition-colors flex items-center gap-2 shadow-[0_2px_12px_var(--tw-colors-green-border)]">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : task ? 'Update' : 'Create Task'}
            </button>
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
    <div className="bg-bg-elevated border border-white/5 p-3 rounded-xl shadow-sm hover:border-white/10 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex flex-col mb-2">
        <div className="flex items-center justify-between gap-2 w-full">
           <div className="flex items-center gap-1.5 flex-wrap">
             <div className="w-1.5 h-1.5 rounded-full" style={{ background: priorityColors[task.priority] }} />
             <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: priorityColors[task.priority] }}>
               {task.priority}
             </span>
           </div>
           
           <div className="relative z-10 shrink-0">
            <button 
              className="p-1 text-text-muted hover:text-white hover:bg-white/10 rounded-md transition-colors" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div 
                className="absolute right-0 top-full mt-1 w-36 bg-bg-elevated border border-white/10 rounded-lg shadow-xl overflow-hidden py-1" 
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button 
                  className="w-full text-left px-3 py-2 text-[13px] text-text-secondary hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2" 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(task); setMenuOpen(false); }}
                >
                  <Edit2 size={13} /> Edit
                </button>
                {COLUMNS.filter(c => c.id !== task.status).map(c => (
                  <button 
                    key={c.id} 
                    className="w-full text-left px-3 py-2 text-[13px] text-text-secondary hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2" 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStatusChange(task._id, c.id); setMenuOpen(false); }}
                  >
                    <ArrowLeft className="rotate-180" size={13} /> {c.label}
                  </button>
                ))}
                <button 
                  className="w-full text-left px-3 py-2 text-[13px] text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors flex items-center gap-2" 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(task._id); setMenuOpen(false); }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-[13px] font-semibold text-text-primary leading-snug mt-1.5">{task.title}</p>
      </div>

      {task.description && (
        <p className="text-[12px] text-text-muted leading-relaxed line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      {task.tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {task.tags.map(tag => (
            <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-dim text-green border border-green-border">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 gap-2">
        <div className="flex items-center">
          {task.assignee ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-bg-base border border-white/10 flex items-center justify-center text-[8px] font-bold text-text-primary shrink-0">
                {task.assignee.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <span className="text-[11px] font-medium text-text-muted truncate max-w-[60px]">{task.assignee.name?.split(' ')[0]}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted opacity-60">
              <User size={11} /> Unassigned
            </div>
          )}
        </div>
        {task.deadline && (
          <div className="flex items-center gap-1 shrink-0">
            <Calendar size={11} className={isOverdue ? 'text-[#FF453A]' : 'text-text-muted'} />
            <span className={`text-[11px] ${isOverdue ? 'text-[#FF453A] font-bold' : 'text-text-muted font-medium'}`}>
              {format(new Date(task.deadline), 'MMM d')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
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

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-green" /></div>;
  if (!project) return null;

  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="animate-fade-in relative z-10 w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-text-secondary bg-transparent border border-white/10 rounded-full hover:bg-white/5 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: project.color }} />
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight leading-none break-words">
                {project.name}
              </h1>
            </div>
            {project.description && (
              <p className="text-[14px] text-text-muted max-w-[600px] mb-3 leading-relaxed">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              {project.deadline && (
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-text-secondary">
                  <Calendar size={13} /> Due {format(new Date(project.deadline), 'MMM d, yyyy')}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-text-secondary">
                <Users size={13} /> {project.members?.length || 1} member{project.members?.length !== 1 ? 's' : ''}
              </div>
              <span className="text-[12px] font-bold text-green">{progress}% complete</span>
            </div>
          </div>
          <button 
            onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green hover:bg-green-dark text-[#0A1F12] font-semibold text-sm rounded-full transition-all shadow-[0_2px_16px_var(--tw-colors-green-border)] hover:-translate-y-[1px] shrink-0 w-max"
          >
            <Plus size={15} /> Add Task
          </button>
        </div>

        {/* Progress */}
        <div className="mt-5 max-w-[400px]">
          <div className="flex justify-between items-center mb-1.5 text-[12px] font-medium text-text-secondary">
            <span>{done} of {total} tasks done</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, background: project.color }} />
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x pr-4 w-full">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="bg-bg-base/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-sm min-w-[280px] w-[300px] flex-shrink-0 snap-start flex flex-col max-h-[calc(100vh-280px)]">
              {/* Column header */}
              <div className="flex items-center justify-between p-3.5 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color, boxShadow: `0 0 8px ${col.color}` }} />
                  <span className="text-[11px] font-bold text-text-primary uppercase tracking-[0.08em]">{col.label}</span>
                  <span className="text-[11px] font-medium text-text-muted bg-bg-elevated/80 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <button 
                  onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                  className="p-1 rounded-md text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              {/* Cards wrapper */}
              <div className="p-2.5 flex flex-col gap-2.5 overflow-y-auto flex-1 min-h-[100px]">
                {colTasks.map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task}
                    onEdit={t => { setEditingTask(t); setShowTaskModal(true); }}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange} 
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center py-8 rounded-xl border border-dashed border-white/5 bg-white/[0.01]">
                    <p className="text-[12px] font-medium text-text-muted">Empty list</p>
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
          onSave={handleSaveTask} 
        />
      )}
    </div>
  );
};

export default ProjectDetail;