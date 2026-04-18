import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FolderKanban, CheckSquare, Clock, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { format, isAfter, addDays } from 'date-fns';

const priorityColors = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };

function TypingText({ words }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;
    if (!deleting && charIndex < currentWord.length) {
      timeout = setTimeout(() => { setText(currentWord.slice(0, charIndex + 1)); setCharIndex(c => c + 1); }, 80);
    } else if (!deleting && charIndex === currentWord.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => { setText(currentWord.slice(0, charIndex - 1)); setCharIndex(c => c - 1); }, 45);
    } else if (deleting && charIndex === 0) {
      setDeleting(false); setWordIndex(i => (i + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words]);

  return (
    <span style={{ color: 'var(--green)', position: 'relative' }}>
      {text}
      <span style={{ animation: 'cursorBlink 0.75s step-end infinite', marginLeft: 1, fontWeight: 200 }}>|</span>
    </span>
  );
}

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, transition: 'var(--transition)' }}>
      <Icon size={22} strokeWidth={1.8} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 8 }}>{value}</p>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
      {sub && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <TrendingUp size={14} color={color} /> {sub}
      </p>}
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="loader" />
    </div>
  );

  return (
    <div className="fade-in" style={{ position: 'relative', zIndex: 1, paddingBottom: 40 }}>
      {/* Background Glow similar to Landing Page */}
      <div className="app-bg-glow" style={{ top: -100, left: -200, width: 1000, height: 1000 }} />
      
      {/* Header aligned with Landing Page Hero */}
      <div style={{ marginBottom: 40, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 999, background: 'var(--green-dim)', border: '1px solid var(--green-border)', fontSize: 13, fontWeight: 500, color: 'var(--green)', marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }} />
          {format(new Date(), 'EEEE, MMMM d')}
        </div>
        
        <h1 className="page-title" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
          {greeting},{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--text-primary), var(--green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {user?.name?.split(' ')[0]}
          </span>
        </h1>
        
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          ProjectFlow gives your team one place to plan sprints, track tasks, and build <TypingText words={['something great.', 'faster.', 'the future.']} />
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid-stats" style={{ marginBottom: 32 }}>
        <StatCard icon={FolderKanban} label="Active Projects" value={activeProjects} sub={`${projects.length} total`} color="var(--green)" />
        <StatCard icon={CheckSquare} label="Tasks Completed" value={completedTasks} sub={`${tasks.length} total`} color="#30D158" />
        <StatCard icon={Clock} label="Due This Week" value={upcoming.length} sub="upcoming" color="#BF5AF2" />
        <StatCard icon={AlertCircle} label="Overdue" value={overdue} sub="need attention" color="#FF453A" />
      </div>

      {/* Two column section with Enhanced Lists */}
      <div className="grid-2col">
        {/* Recent Projects */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Recent Projects</h2>
            <Link to="/projects" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ flex: 1 }}>
            {projects.slice(0, 5).map(project => (
              <Link key={project._id} to={`/projects/${project._id}`}
                style={{ display: 'block', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.03)', textDecoration: 'none', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FolderKanban size={20} color={project.color || 'var(--green)'} />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="progress-bar" style={{ width: 100, height: 4 }}>
                          <div className="progress-fill" style={{ width: `${project.progress || 0}%`, background: `linear-gradient(90deg, ${project.color || 'var(--green-dark)'}, ${project.color || 'var(--green)'})`, boxShadow: `0 0 8px ${project.color || 'var(--green-dark)'}80` }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project.progress || 0}%</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="empty-state" style={{ padding: '60px 20px' }}>
                <FolderKanban size={32} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: 16 }} />
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500 }}>No projects yet</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Create one to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Upcoming Deadlines</h2>
            <Link to="/my-tasks" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ flex: 1 }}>
            {tasks.filter(t => t.status !== 'done' && t.deadline).slice(0, 5).map(task => {
              const isOverdue = isAfter(new Date(), new Date(task.deadline));
              const priorityColor = priorityColors[task.priority] || 'var(--green)';
              return (
                <div key={task._id} style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: 1 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckSquare size={20} color={priorityColor} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{task.project?.name}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 6, background: isOverdue ? 'rgba(255, 69, 58, 0.1)' : 'var(--bg-elevated)', border: `1px solid ${isOverdue ? 'rgba(255, 69, 58, 0.2)' : 'var(--text-dim)'}` }}>
                      <p style={{ fontSize: 12, color: isOverdue ? '#FF453A' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 500 }}>
                        {isOverdue ? 'Overdue' : format(new Date(task.deadline), 'MMM d')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                       <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</span>
                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor, boxShadow: `0 0 8px ${priorityColor}80` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {tasks.filter(t => t.status !== 'done' && t.deadline).length === 0 && (
              <div className="empty-state" style={{ padding: '60px 20px' }}>
                <CheckSquare size={32} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: 16 }} />
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500 }}>No upcoming deadlines</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;