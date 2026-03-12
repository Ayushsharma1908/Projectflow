import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FolderKanban, CheckSquare, Clock, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { format, isAfter, addDays } from 'date-fns';

const priorityColors = { low: '#7AAD8C', medium: '#C8A97E', high: '#D4936B', critical: '#E07B6A' };
const statusColors = { todo: '#6B7A99', 'in-progress': '#C8A97E', review: '#9B8FD4', done: '#7AAD8C' };
const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card" style={{ padding: '22px 24px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} strokeWidth={1.8} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/tasks/my-tasks')])
      .then(([p, t]) => { setProjects(p.data); setTasks(t.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const overdue = tasks.filter(t => t.deadline && isAfter(new Date(), new Date(t.deadline)) && t.status !== 'done').length;
  const upcoming = tasks.filter(t => t.status !== 'done' && t.deadline && !isAfter(new Date(), new Date(t.deadline)) && isAfter(addDays(new Date(), 7), new Date(t.deadline)));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div className="loader" />
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {greeting}, <span style={{ color: 'var(--gold)' }}>{user?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>Here's what's happening across your projects.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={FolderKanban} label="Active Projects" value={activeProjects} sub={`${projects.length} total`} color="var(--gold)" />
        <StatCard icon={CheckSquare} label="Tasks Completed" value={completedTasks} sub={`${tasks.length} total assigned`} color="#7AAD8C" />
        <StatCard icon={Clock} label="Due This Week" value={upcoming.length} sub="upcoming deadlines" color="#9B8FD4" />
        <StatCard icon={AlertCircle} label="Overdue" value={overdue} sub="need attention" color="#E07B6A" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Projects */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>Recent Projects</h2>
            <Link to="/projects" style={{ fontSize: 12, color: 'var(--gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div>
            {projects.slice(0, 5).map(project => (
              <Link key={project._id} to={`/projects/${project._id}`}
                style={{ display: 'block', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', textDecoration: 'none', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: project.color || 'var(--gold)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{project.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project.progress || 0}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${project.progress || 0}%` }} />
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="empty-state" style={{ padding: 32 }}>
                <FolderKanban size={32} color="var(--text-muted)" />
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>No projects yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>Upcoming Deadlines</h2>
            <Link to="/my-tasks" style={{ fontSize: 12, color: 'var(--gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div>
            {tasks.filter(t => t.status !== 'done' && t.deadline).slice(0, 5).map(task => {
              const isOverdue = isAfter(new Date(), new Date(task.deadline));
              return (
                <div key={task._id} style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                        {task.project?.name}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 11, color: isOverdue ? '#E07B6A' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>
                        {isOverdue ? 'Overdue' : format(new Date(task.deadline), 'MMM d')}
                      </p>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColors[task.priority], marginTop: 4, marginLeft: 'auto' }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {tasks.filter(t => t.status !== 'done' && t.deadline).length === 0 && (
              <div className="empty-state" style={{ padding: 32 }}>
                <CheckSquare size={32} color="var(--text-muted)" />
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>No upcoming deadlines</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
