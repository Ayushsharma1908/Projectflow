import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { CheckSquare, Calendar, FolderKanban, Search } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import toast from 'react-hot-toast';

const statusColors = { todo: '#636366', 'in-progress': '#25D366', review: '#BF5AF2', done: '#128C7E' };
const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const priorityColors = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };

const TaskGroup = ({ title, tasks, color, onStatusUpdate }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
      <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</h2>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 7px', borderRadius: 999 }}>{tasks.length}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {tasks.map(task => <TaskRow key={task._id} task={task} onStatusUpdate={onStatusUpdate} />)}
    </div>
  </div>
);

const TaskRow = ({ task, onStatusUpdate }) => {
  const isOverdue = task.deadline && isAfter(new Date(), new Date(task.deadline)) && task.status !== 'done';
  const statusColor = statusColors[task.status] || 'var(--green)';
  const priorityColor = priorityColors[task.priority] || 'var(--green)';

  return (
    <div className="card" style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: 1 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CheckSquare size={20} color={statusColor} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: task.status === 'done' ? 500 : 600, color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.title}
          </p>
          {task.project && (
            <Link to={`/projects/${task.project._id}`}
              style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <FolderKanban size={12} /> {task.project.name}
            </Link>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        {task.deadline && (
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 6, background: isOverdue ? 'rgba(255, 69, 58, 0.1)' : 'var(--bg-elevated)', border: `1px solid ${isOverdue ? 'rgba(255, 69, 58, 0.2)' : 'var(--text-dim)'}` }}>
            <p style={{ fontSize: 12, color: isOverdue ? '#FF453A' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 500 }}>
              {isOverdue ? 'Overdue' : format(new Date(task.deadline), 'MMM d, yyyy')}
            </p>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
             <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</span>
             <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor, boxShadow: `0 0 8px ${priorityColor}80` }} />
           </div>
           <select value={task.status} onChange={e => onStatusUpdate(task._id, e.target.value)}
             style={{ fontSize: 12, padding: '4px 8px', color: statusColor,
               background: 'transparent', border: `1px solid ${statusColor}44`,
               borderRadius: 'var(--radius-sm)', width: 'auto', outline: 'none', cursor: 'pointer' }}>
             <option value="todo">To Do</option>
             <option value="in-progress">In Progress</option>
             <option value="review">Review</option>
             <option value="done">Done</option>
           </select>
        </div>
      </div>
    </div>
  );
};

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    api.get('/tasks/my-tasks').then(res => setTasks(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (taskId, status) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
      toast.success(`Moved to ${statusLabels[status]}`);
    } catch { toast.error('Update failed'); }
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.project?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const groups = {
    overdue: filtered.filter(t => t.deadline && isAfter(new Date(), new Date(t.deadline)) && t.status !== 'done'),
    active:  filtered.filter(t => t.status !== 'done' && !(t.deadline && isAfter(new Date(), new Date(t.deadline)))),
    done:    filtered.filter(t => t.status === 'done'),
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="loader" /></div>;

  return (
    <div className="fade-in" style={{ position: 'relative', zIndex: 1, paddingBottom: 40 }}>
      {/* Background Glow */}
      <div className="app-bg-glow" style={{ top: -100, right: -200, width: 1000, height: 1000 }} />

      {/* Header aligned with Landing Page Hero */}
      <div style={{ marginBottom: 40, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 999, background: 'var(--green-dim)', border: '1px solid var(--green-border)', fontSize: 13, fontWeight: 500, color: 'var(--green)', marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }} />
          Personal Workload
        </div>
        
        <h1 className="page-title" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
          My{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--text-primary), var(--green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tasks
          </span>
        </h1>
        
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          You have {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you. Keep pushing forward and stay on top of your goals.
        </p>
      </div>

      {/* Filter bar */}
      <div className="filter-bar" style={{ position: 'relative', zIndex: 2, marginBottom: 32 }}>
        <div className="search-wrap" style={{ flex: '1 1 300px', maxWidth: '100%' }}>
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={{ paddingLeft: 40, height: 44, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-elevated)', fontSize: 14 }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ height: 44, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-elevated)', fontSize: 14, color: 'var(--text-primary)', padding: '0 16px', minWidth: 140 }}>
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          style={{ height: 44, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-elevated)', fontSize: 14, color: 'var(--text-primary)', padding: '0 16px', minWidth: 140 }}>
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {filtered.length === 0 ? (
          <div className="empty-state card" style={{ padding: '60px 20px', background: 'transparent' }}>
            <CheckSquare size={32} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: 16 }} />
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500 }}>No tasks found</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{search ? 'Try adjusting your search' : 'No tasks have been assigned to you yet'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {groups.overdue.length > 0 && <TaskGroup title="Overdue" tasks={groups.overdue} color="#FF453A" onStatusUpdate={handleStatusUpdate} />}
            {groups.active.length > 0 && <TaskGroup title="Active" tasks={groups.active} color="var(--green)" onStatusUpdate={handleStatusUpdate} />}
            {groups.done.length > 0 && <TaskGroup title="Completed" tasks={groups.done} color="#128C7E" onStatusUpdate={handleStatusUpdate} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;