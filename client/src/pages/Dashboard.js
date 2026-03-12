import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FolderKanban, CheckSquare, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { format, isAfter, addDays } from 'date-fns';

const priorityColors = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card" style={{ padding: '18px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{sub}</p>}
      </div>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color={color} strokeWidth={1.8} />
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
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <h1 className="page-title">
          {greeting},{' '}
          <span style={{ color: 'var(--green)' }}>{user?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 5 }}>
          Here's what's happening across your projects.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-stats">
        <StatCard icon={FolderKanban} label="Active Projects" value={activeProjects} sub={`${projects.length} total`} color="var(--green)" />
        <StatCard icon={CheckSquare} label="Tasks Completed" value={completedTasks} sub={`${tasks.length} total`} color="#30D158" />
        <StatCard icon={Clock} label="Due This Week" value={upcoming.length} sub="upcoming" color="#BF5AF2" />
        <StatCard icon={AlertCircle} label="Overdue" value={overdue} sub="need attention" color="#FF453A" />
      </div>

      {/* Two column section */}
      <div className="grid-2col">
        {/* Recent Projects */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Projects</h2>
            <Link to="/projects" style={{ fontSize: 12, color: 'var(--green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {projects.slice(0, 5).map(project => (
              <Link key={project._id} to={`/projects/${project._id}`}
                style={{ display: 'block', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', textDecoration: 'none', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7, gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: project.color || 'var(--green)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{project.progress || 0}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${project.progress || 0}%` }} />
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="empty-state" style={{ padding: '28px 20px' }}>
                <FolderKanban size={28} color="var(--text-muted)" />
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>No projects yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Upcoming Deadlines</h2>
            <Link to="/my-tasks" style={{ fontSize: 12, color: 'var(--green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {tasks.filter(t => t.status !== 'done' && t.deadline).slice(0, 5).map(task => {
              const isOverdue = isAfter(new Date(), new Date(task.deadline));
              return (
                <div key={task._id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{task.project?.name}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 11, color: isOverdue ? '#FF453A' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>
                        {isOverdue ? 'Overdue' : format(new Date(task.deadline), 'MMM d')}
                      </p>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColors[task.priority] || 'var(--green)', marginTop: 4, marginLeft: 'auto' }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {tasks.filter(t => t.status !== 'done' && t.deadline).length === 0 && (
              <div className="empty-state" style={{ padding: '28px 20px' }}>
                <CheckSquare size={28} color="var(--text-muted)" />
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