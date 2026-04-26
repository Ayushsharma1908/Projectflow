import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FolderKanban, CheckSquare, Clock, AlertCircle, ArrowRight, TrendingUp, Loader2 } from 'lucide-react';
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
    <span className="text-green relative">
      {text}
      <span className="animate-[cursorBlink_0.75s_step-end_infinite] ml-[1px] font-extralight">|</span>
    </span>
  );
}

const StatCard = ({ icon: Icon, label, value, sub, hexColor }) => (
  <div className="bg-bg-elevated border border-white/5 rounded-2xl p-7 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: `radial-gradient(circle, ${hexColor} 0%, transparent 70%)` }} />
    <div className="w-11 h-11 rounded-xl mb-5 flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${hexColor}22`, color: hexColor }}>
      <Icon size={22} strokeWidth={2} />
    </div>
    <div className="flex-1 relative z-10">
      <p className="text-4xl font-extrabold text-text-primary tracking-tight leading-none mb-2">{value}</p>
      <p className="text-[14px] font-semibold text-text-muted">{label}</p>
      {sub && (
        <p className="text-[13px] text-text-secondary mt-3 flex items-center gap-1.5 font-medium">
          <TrendingUp size={14} style={{ color: hexColor }} /> {sub}
        </p>
      )}
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
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-green" />
    </div>
  );

  return (
    <div className="animate-fade-in relative z-10 pb-10">
      {/* Background Glow */}
      <div className="app-bg-glow top-[-100px] left-[-200px] w-[1000px] h-[1000px]" />
      
      {/* Header */}
      <div className="mb-10 relative z-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-dim border border-green-border text-[13px] font-medium text-green mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_10px_var(--tw-colors-green-DEFAULT)]" />
          {format(new Date(), 'EEEE, MMMM d')}
        </div>
        
        <h1 className="text-[clamp(32px,5vw,48px)] font-black tracking-tight leading-[1.1] mb-4 text-text-primary">
          {greeting},{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-text-primary to-green">
            {user?.name?.split(' ')[0]}
          </span>
        </h1>
        
        <p className="text-lg text-text-secondary max-w-[600px] leading-relaxed">
          ProjectFlow gives your team one place to plan sprints, track tasks, and build <TypingText words={['something great.', 'faster.', 'the future.']} />
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FolderKanban} label="Active Projects" value={activeProjects} sub={`${projects.length} total`} hexColor="#30D158" />
        <StatCard icon={CheckSquare} label="Tasks Completed" value={completedTasks} sub={`${tasks.length} total`} hexColor="#30D158" />
        <StatCard icon={Clock} label="Due This Week" value={upcoming.length} sub="upcoming" hexColor="#BF5AF2" />
        <StatCard icon={AlertCircle} label="Overdue" value={overdue} sub="need attention" hexColor="#FF453A" />
      </div>

      {/* Two column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-bg-elevated border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h2 className="text-lg font-bold text-text-primary tracking-tight">Recent Projects</h2>
            <Link to="/app/projects" className="text-[13px] font-medium text-text-secondary hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex-1">
            {projects.slice(0, 5).map(project => (
              <Link 
                key={project._id} 
                to={`/app/projects/${project._id}`}
                className="block p-5 border-b border-light-white border-opacity-[0.03] hover:bg-bg-hover transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#111113] border border-white/10 flex items-center justify-center shrink-0">
                      <FolderKanban size={20} color={project.color || '#30D158'} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-text-primary mb-1 truncate group-hover:text-green transition-colors">{project.name}</p>
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ width: `${project.progress || 0}%`, background: `linear-gradient(90deg, ${project.color || '#249C42'}, ${project.color || '#30D158'})` }} 
                          />
                        </div>
                        <span className="text-[12px] font-medium text-text-muted">{project.progress || 0}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                     <ArrowRight size={14} className="text-text-muted group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <FolderKanban size={32} className="text-text-muted opacity-30 mb-3" />
                <p className="text-[15px] text-text-secondary font-medium">No projects yet</p>
                <p className="text-[13px] text-text-muted mt-1">Create one to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-bg-elevated border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h2 className="text-lg font-bold text-text-primary tracking-tight">Upcoming Deadlines</h2>
            <Link to="/app/my-tasks" className="text-[13px] font-medium text-text-secondary hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex-1">
            {tasks.filter(t => t.status !== 'done' && t.deadline).slice(0, 5).map(task => {
              const isOverdue = isAfter(new Date(), new Date(task.deadline));
              const priorityColor = priorityColors[task.priority] || '#30D158';
              return (
                <div key={task._id} className="p-4 sm:px-6 border-b border-light-white border-opacity-[0.03] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-[#111113] border border-white/10 flex items-center justify-center shrink-0">
                      <CheckSquare size={20} color={priorityColor} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-text-primary mb-1 truncate">{task.title}</p>
                      <p className="text-[13px] font-medium text-text-secondary truncate">{task.project?.name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded border border-white/5 ${isOverdue ? 'bg-[#FF453A]/10 border-[#FF453A]/20' : 'bg-[#111113]'}`}>
                      <p className={`text-[12px] ${isOverdue ? 'text-[#FF453A] font-bold' : 'text-text-secondary font-medium'}`}>
                        {isOverdue ? 'Overdue' : format(new Date(task.deadline), 'MMM d')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.05em]">Priority</span>
                       <div className="w-2 h-2 rounded-full" style={{ background: priorityColor, boxShadow: `0 0 6px ${priorityColor}80` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {tasks.filter(t => t.status !== 'done' && t.deadline).length === 0 && (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <CheckSquare size={32} className="text-text-muted opacity-30 mb-3" />
                <p className="text-[15px] text-text-secondary font-medium">No upcoming deadlines</p>
                <p className="text-[13px] text-text-muted mt-1">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;