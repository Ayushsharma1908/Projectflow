import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { CheckSquare, Calendar, FolderKanban, Search, Loader2 } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import toast from 'react-hot-toast';

const statusColors = { todo: 'text-text-muted', 'in-progress': 'text-green', review: 'text-[#BF5AF2]', done: 'text-[#128C7E]' };
const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const priorityColors = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };

const TaskGroup = ({ title, tasks, hexColor, onStatusUpdate }) => (
  <div className="mb-7">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-[7px] h-[7px] rounded-full" style={{ background: hexColor }} />
      <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.1em]">{title}</h2>
      <span className="text-[11px] text-text-muted bg-bg-elevated px-2 py-px rounded-full">{tasks.length}</span>
    </div>
    <div className="flex flex-col gap-2">
      {tasks.map(task => <TaskRow key={task._id} task={task} onStatusUpdate={onStatusUpdate} />)}
    </div>
  </div>
);

const TaskRow = ({ task, onStatusUpdate }) => {
  const isOverdue = task.deadline && isAfter(new Date(), new Date(task.deadline)) && task.status !== 'done';
  const statusColorClass = statusColors[task.status] || 'text-green';
  const priorityColor = priorityColors[task.priority] || '#30D158';
  
  // Create a mapping to convert the text class to a border/bg representation dynamically
  // Since we know the colors, we can map them:
  const getStatusHex = (status) => {
    switch(status) {
      case 'todo': return '#71717A';
      case 'in-progress': return '#30D158';
      case 'review': return '#BF5AF2';
      case 'done': return '#128C7E';
      default: return '#30D158';
    }
  };
  const sHex = getStatusHex(task.status);

  return (
    <div className="p-4 sm:px-7 bg-bg-elevated border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-green-border hover:shadow-[0_4px_24px_rgba(37,211,102,0.06)] group">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={`w-11 h-11 rounded-xl bg-[#111113] border border-white/10 flex items-center justify-center shrink-0 ${statusColorClass} transition-colors`}>
          <CheckSquare size={20} />
        </div>
        <div className="min-w-0">
          <p className={`text-[15px] mb-1 truncate ${task.status === 'done' ? 'font-medium text-text-muted line-through' : 'font-semibold text-text-primary'}`}>
            {task.title}
          </p>
          {task.project && (
            <Link to={`/projects/${task.project._id}`} className="text-[13px] text-text-secondary hover:text-green transition-colors inline-flex items-center gap-1">
              <FolderKanban size={12} /> {task.project.name}
            </Link>
          )}
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1.5 shrink-0 ml-[60px] sm:ml-0">
        {task.deadline && (
          <div className={`inline-flex items-center px-2.5 py-1 rounded-md border ${isOverdue ? 'bg-[#FF453A]/10 border-[#FF453A]/20' : 'bg-[#111113] border-white/10'}`}>
            <p className={`text-xs ${isOverdue ? 'font-semibold text-[#FF453A]' : 'font-medium text-text-secondary'}`}>
              {isOverdue ? 'Overdue' : format(new Date(task.deadline), 'MMM d, yyyy')}
            </p>
          </div>
        )}
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
             <span className="text-[11px] text-text-muted uppercase tracking-widest hidden sm:inline-block">Priority</span>
             <div className="w-2 h-2 rounded-full" style={{ background: priorityColor, boxShadow: `0 0 8px ${priorityColor}80` }} />
           </div>
           <select 
             value={task.status} 
             onChange={e => onStatusUpdate(task._id, e.target.value)}
             style={{ color: sHex, borderColor: `${sHex}44` }}
             className="text-xs px-2 py-1 bg-transparent border rounded-md outline-none cursor-pointer hover:bg-white/5 transition-colors"
           >
             <option value="todo" className="text-text-primary bg-bg-elevated">To Do</option>
             <option value="in-progress" className="text-text-primary bg-bg-elevated">In Progress</option>
             <option value="review" className="text-text-primary bg-bg-elevated">Review</option>
             <option value="done" className="text-text-primary bg-bg-elevated">Done</option>
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

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-green" /></div>;

  return (
    <div className="relative z-10 pb-10 animate-fade-in">
      {/* Background Glow */}
      <div className="app-bg-glow top-[-100px] right-[-200px] w-[1000px] h-[1000px]" />

      {/* Header */}
      <div className="mb-10 relative z-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-dim border border-green-border text-[13px] font-medium text-green mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_10px_var(--tw-colors-green-DEFAULT)]" />
          Personal Workload
        </div>
        
        <h1 className="text-[clamp(32px,5vw,48px)] font-black tracking-tight leading-[1.1] mb-4 text-text-primary">
          My{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-text-primary to-green">
            Tasks
          </span>
        </h1>
        
        <p className="text-lg text-text-secondary max-w-[600px] leading-relaxed">
          You have {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you. Keep pushing forward and stay on top of your goals.
        </p>
      </div>

      {/* Filter bar */}
      <div className="relative z-20 mb-8 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search tasks..." 
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-bg-elevated text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/50 transition-colors" 
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-white/10 bg-bg-elevated text-sm text-text-primary px-4 outline-none focus:border-green/50 min-w-[140px] cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select 
          value={priorityFilter} 
          onChange={e => setPriorityFilter(e.target.value)}
          className="h-11 rounded-xl border border-white/10 bg-bg-elevated text-sm text-text-primary px-4 outline-none focus:border-green/50 min-w-[140px] cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="relative z-20">
        {filtered.length === 0 ? (
          <div className="bg-transparent border border-dashed border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <CheckSquare size={32} className="text-text-muted opacity-30 mb-4" />
            <p className="text-[15px] text-text-secondary font-medium">No tasks found</p>
            <p className="text-[13px] text-text-muted mt-1">{search ? 'Try adjusting your search' : 'No tasks have been assigned to you yet'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.overdue.length > 0 && <TaskGroup title="Overdue" tasks={groups.overdue} hexColor="#FF453A" onStatusUpdate={handleStatusUpdate} />}
            {groups.active.length > 0 && <TaskGroup title="Active" tasks={groups.active} hexColor="#30D158" onStatusUpdate={handleStatusUpdate} />}
            {groups.done.length > 0 && <TaskGroup title="Completed" tasks={groups.done} hexColor="#128C7E" onStatusUpdate={handleStatusUpdate} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;