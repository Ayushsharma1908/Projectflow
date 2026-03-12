import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { CheckSquare, Calendar, Flag, FolderKanban, Search, Filter } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import toast from 'react-hot-toast';

const statusColors = { todo: '#6B7A99', 'in-progress': '#C8A97E', review: '#9B8FD4', done: '#7AAD8C' };
const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const priorityColors = { low: '#7AAD8C', medium: '#C8A97E', high: '#D4936B', critical: '#E07B6A' };

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    api.get('/tasks/my-tasks')
      .then(res => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
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
    active: filtered.filter(t => t.status !== 'done' && !(t.deadline && isAfter(new Date(), new Date(t.deadline)))),
    done: filtered.filter(t => t.status === 'done')
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="loader" /></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>My Tasks</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{tasks.length} tasks assigned to you</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={{ paddingLeft: 36 }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: '0 1 160px' }}>
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ flex: '0 1 160px' }}>
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={48} />
          <h3>No tasks found</h3>
          <p>{search ? 'Try adjusting your search' : 'No tasks have been assigned to you yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Overdue */}
          {groups.overdue.length > 0 && (
            <TaskGroup title="Overdue" tasks={groups.overdue} color="#E07B6A" onStatusUpdate={handleStatusUpdate} />
          )}
          {/* Active */}
          {groups.active.length > 0 && (
            <TaskGroup title="Active" tasks={groups.active} color="var(--gold)" onStatusUpdate={handleStatusUpdate} />
          )}
          {/* Done */}
          {groups.done.length > 0 && (
            <TaskGroup title="Completed" tasks={groups.done} color="#7AAD8C" onStatusUpdate={handleStatusUpdate} />
          )}
        </div>
      )}
    </div>
  );
};

const TaskGroup = ({ title, tasks, color, onStatusUpdate }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</h2>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 8px', borderRadius: 999 }}>{tasks.length}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tasks.map(task => <TaskRow key={task._id} task={task} onStatusUpdate={onStatusUpdate} />)}
    </div>
  </div>
);

const TaskRow = ({ task, onStatusUpdate }) => {
  const isOverdue = task.deadline && isAfter(new Date(), new Date(task.deadline)) && task.status !== 'done';
  const statusColor = statusColors[task.status];
  const priorityColor = priorityColors[task.priority];

  return (
    <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      {/* Status indicator */}
      <div style={{ width: 3, height: 36, borderRadius: 2, background: statusColor, flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
          {task.title}
        </p>
        {task.project && (
          <Link to={`/projects/${task.project._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', marginTop: 3 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <FolderKanban size={11} />
            {task.project.name}
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, flexWrap: 'wrap' }}>
        {/* Priority */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColor }} />
          <span style={{ fontSize: 12, color: priorityColor, textTransform: 'capitalize' }}>{task.priority}</span>
        </div>

        {/* Deadline */}
        {task.deadline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: isOverdue ? '#E07B6A' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>
            <Calendar size={12} />
            {format(new Date(task.deadline), 'MMM d, yyyy')}
          </div>
        )}

        {/* Status selector */}
        <select
          value={task.status}
          onChange={e => onStatusUpdate(task._id, e.target.value)}
          style={{ fontSize: 12, padding: '4px 10px', color: statusColor, background: 'var(--bg-elevated)', border: `1px solid ${statusColor}33`, borderRadius: 'var(--radius-sm)', width: 'auto' }}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
};

export default MyTasks;
