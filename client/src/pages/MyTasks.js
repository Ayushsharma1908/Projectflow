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
  const statusColor = statusColors[task.status];
  const priorityColor = priorityColors[task.priority];

  return (
    <div className="card" style={{ padding: '13px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        {/* Status bar */}
        <div style={{ width: 3, height: 36, borderRadius: 2, background: statusColor, flexShrink: 0, alignSelf: 'center' }} />

        {/* Title + project */}
        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.title}
          </p>
          {task.project && (
            <Link to={`/projects/${task.project._id}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', marginTop: 2 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <FolderKanban size={10} /> {task.project.name}
            </Link>
          )}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Priority */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColor }} />
            <span style={{ fontSize: 11, color: priorityColor, textTransform: 'capitalize' }}>{task.priority}</span>
          </div>

          {/* Deadline */}
          {task.deadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: isOverdue ? '#FF453A' : 'var(--text-muted)', fontWeight: isOverdue ? 700 : 400 }}>
              <Calendar size={11} />
              {format(new Date(task.deadline), 'MMM d, yyyy')}
            </div>
          )}

          {/* Status selector */}
          <select value={task.status} onChange={e => onStatusUpdate(task._id, e.target.value)}
            style={{ fontSize: 11, padding: '4px 8px', color: statusColor,
              background: 'var(--bg-elevated)', border: `1px solid ${statusColor}44`,
              borderRadius: 'var(--radius-sm)', width: 'auto', minWidth: 100, cursor: 'pointer' }}>
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
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{tasks.length} tasks assigned to you</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ flex: '0 1 150px', minWidth: 120 }}>
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          style={{ flex: '0 1 150px', minWidth: 120 }}>
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={44} />
          <h3>No tasks found</h3>
          <p>{search ? 'Try adjusting your search' : 'No tasks have been assigned to you yet'}</p>
        </div>
      ) : (
        <div>
          {groups.overdue.length > 0 && <TaskGroup title="Overdue" tasks={groups.overdue} color="#FF453A" onStatusUpdate={handleStatusUpdate} />}
          {groups.active.length > 0  && <TaskGroup title="Active"  tasks={groups.active}  color="var(--green)" onStatusUpdate={handleStatusUpdate} />}
          {groups.done.length > 0    && <TaskGroup title="Completed" tasks={groups.done}  color="#128C7E" onStatusUpdate={handleStatusUpdate} />}
        </div>
      )}
    </div>
  );
};

export default MyTasks;