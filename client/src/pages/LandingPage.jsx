import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

/* ─── Animated Network Canvas ─── */
function NetworkCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Define nodes in a network graph layout
    const nodes = [
      { x: 0.50, y: 0.18, label: 'ProjectFlow', main: true, size: 10 },
      { x: 0.20, y: 0.35, label: 'Design', size: 7 },
      { x: 0.80, y: 0.35, label: 'Backend', size: 7 },
      { x: 0.35, y: 0.55, label: 'Sprint #4', size: 6 },
      { x: 0.65, y: 0.55, label: 'Frontend', size: 6 },
      { x: 0.12, y: 0.60, label: 'UI/UX', size: 5 },
      { x: 0.88, y: 0.60, label: 'API', size: 5 },
      { x: 0.50, y: 0.72, label: 'Deployment', size: 6 },
      { x: 0.25, y: 0.78, label: 'Testing', size: 5 },
      { x: 0.75, y: 0.78, label: 'DevOps', size: 5 },
      { x: 0.50, y: 0.92, label: 'Launch 🚀', size: 7 },
    ];

    // Edges to draw (index pairs)
    const edges = [
      [0, 1], [0, 2],
      [1, 3], [1, 5],
      [2, 4], [2, 6],
      [3, 4], [3, 7],
      [4, 7],
      [5, 8], [6, 9],
      [7, 10], [8, 10], [9, 10],
    ];

    // Each edge has an animated progress 0→1
    const edgeProgress = edges.map(() => 0);
    // Stagger start times
    const edgeDelay = edges.map((_, i) => i * 0.055);
    const edgeDuration = 0.55; // fraction of total anim (0-1 scale)

    let start = null;
    const TOTAL_DURATION = 2800; // ms

    const getPos = (node, w, h) => ({
      x: node.x * w,
      y: node.y * h,
    });

    const GREEN = '#25D366';
    const GREEN_DIM = 'rgba(37,211,102,';
    const WHITE = '#F2F2F7';

    const draw = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const globalT = Math.min(elapsed / TOTAL_DURATION, 1);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Update edge progress
      edges.forEach((_, i) => {
        const localT = (globalT - edgeDelay[i]) / edgeDuration;
        edgeProgress[i] = Math.max(0, Math.min(1, localT));
      });

      // Draw edges with animated line drawing
      edges.forEach(([a, b], i) => {
        const p = edgeProgress[i];
        if (p <= 0) return;

        const pa = getPos(nodes[a], w, h);
        const pb = getPos(nodes[b], w, h);

        // Current end point (lerp along the line)
        const cx = pa.x + (pb.x - pa.x) * p;
        const cy = pa.y + (pb.y - pa.y) * p;

        // Glowing gradient line
        const grad = ctx.createLinearGradient(pa.x, pa.y, cx, cy);
        grad.addColorStop(0,   GREEN_DIM + '0.7)');
        grad.addColorStop(0.6, GREEN_DIM + '0.4)');
        grad.addColorStop(1,   GREEN_DIM + '0.15)');

        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Traveling glow dot at the tip
        if (p < 1) {
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = GREEN;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cx, cy, 7, 0, Math.PI * 2);
          ctx.fillStyle = GREEN_DIM + '0.25)';
          ctx.fill();
        }
      });

      // Draw nodes
      nodes.forEach((node, i) => {
        // Node appears once any of its edges start drawing
        const connectedEdges = edges.map((e, ei) =>
          (e[0] === i || e[1] === i) ? edgeProgress[ei] : -1
        ).filter(p => p >= 0);
        const nodeProgress = connectedEdges.length
          ? Math.min(1, Math.max(...connectedEdges) * 2)
          : 0;

        if (nodeProgress <= 0) return;

        const pos = getPos(node, w, h);
        const size = node.size;

        // Outer glow
        const glowRadius = size * (node.main ? 4.5 : 3.5) * nodeProgress;
        const glow = ctx.createRadialGradient(
          pos.x, pos.y, 0,
          pos.x, pos.y, glowRadius
        );
        glow.addColorStop(0, GREEN_DIM + (node.main ? '0.35)' : '0.2)'));
        glow.addColorStop(1, GREEN_DIM + '0)');
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size * nodeProgress, 0, Math.PI * 2);
        if (node.main) {
          ctx.fillStyle = GREEN;
        } else {
          ctx.fillStyle = 'rgba(18,25,20,0.9)';
          ctx.strokeStyle = GREEN_DIM + '0.8)';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
        }
        if (node.main) ctx.fill();

        // Label
        if (nodeProgress > 0.7) {
          const alpha = Math.min(1, (nodeProgress - 0.7) / 0.3);
          ctx.globalAlpha = alpha;
          ctx.font = node.main
            ? `bold ${13}px 'Helvetica Neue', Helvetica, sans-serif`
            : `${11}px 'Helvetica Neue', Helvetica, sans-serif`;
          ctx.fillStyle = node.main ? GREEN : 'rgba(200,220,210,0.85)';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, pos.x, pos.y + size + 14);
          ctx.globalAlpha = 1;
        }
      });

      if (globalT < 1) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="lp-network-canvas" />;
}

/* ─── Typing Animation ─── */
function TypingText({ words }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;

    if (!deleting && charIndex < currentWord.length) {
      timeout = setTimeout(() => {
        setText(currentWord.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
      }, 80);
    } else if (!deleting && charIndex === currentWord.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setText(currentWord.slice(0, charIndex - 1));
        setCharIndex(c => c - 1);
      }, 45);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setWordIndex(i => (i + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words]);

  return (
    <span className="lp-typing-text">
      {text}
      <span className="lp-cursor">|</span>
    </span>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon, title, description, delay }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`lp-feature-card ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="lp-feature-icon">{icon}</div>
      <h3 className="lp-feature-title">{title}</h3>
      <p className="lp-feature-desc">{description}</p>
    </div>
  );
}

/* ─── Stat Counter ─── */
function StatItem({ value, label, suffix = '' }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const end = parseInt(value);
    const duration = 1800;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [visible, value]);

  return (
    <div ref={ref} className="lp-stat-item">
      <div className="lp-stat-value">{count}{suffix}</div>
      <div className="lp-stat-label">{label}</div>
    </div>
  );
}

/* ─── Testimonial ─── */
const testimonials = [
  {
    quote: "ProjectFlow completely changed how our team collaborates. Shipping speed is up 40%.",
    name: "Sarah Chen",
    role: "Engineering Lead, NovaTech",
    avatar: "SC",
  },
  {
    quote: "The kanban view and sprint tracking together finally gave us a single source of truth.",
    name: "Marcus Rivera",
    role: "CTO, Launchpad Inc.",
    avatar: "MR",
  },
  {
    quote: "Onboarding was instant. The UI is so intuitive, the team needed zero training.",
    name: "Priya Nair",
    role: "Product Manager, Zenith",
    avatar: "PN",
  },
];

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(i => (i + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lp-root">
      {/* ── Navbar ── */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" style={{ color: 'var(--lp-green)' }}><path d="M480-560h200v-80H480v80Zm0 240h200v-80H480v80Zm-63.5-223.5Q440-567 440-600t-23.5-56.5Q393-680 360-680t-56.5 23.5Q280-633 280-600t23.5 56.5Q327-520 360-520t56.5-23.5Zm0 240Q440-327 440-360t-23.5-56.5Q393-440 360-440t-56.5 23.5Q280-393 280-360t23.5 56.5Q327-280 360-280t56.5-23.5ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/> </svg>
            ProjectFlow
          </div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#testimonials">Testimonials</a>
          </div>
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn-ghost">Log in</Link>
            <Link to="/register" className="lp-btn-primary">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg-glow" />
        <div className="lp-hero-inner">
          <div className="lp-hero-content">
            <div className="lp-badge-pill">
              <span className="lp-badge-dot" />
              Now in public beta · Free forever
            </div>
            <h1 className="lp-hero-headline">
              Manage projects like a&nbsp;<br />
              <TypingText words={['pro team.', 'machine.', 'founder.', 'rocket ship.']} />
            </h1>
            <p className="lp-hero-sub">
              ProjectFlow gives your team one place to plan sprints, track tasks,
              and ship faster — with real-time collaboration built in from day one.
            </p>
            <div className="lp-hero-actions">
              <Link to="/register" className="lp-btn-primary lp-btn-large">
                Start for free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <Link to="/login" className="lp-btn-ghost lp-btn-large">
                View demo
              </Link>
            </div>
            <p className="lp-hero-note">No credit card required · Setup in 2 minutes</p>
          </div>

          {/* Network animation canvas */}
          <div className="lp-network-wrap">
            <NetworkCanvas />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="lp-stats">
        <div className="lp-stats-inner">
          <StatItem value="12000" label="Active projects" suffix="+" />
          <div className="lp-stats-divider" />
          <StatItem value="98" label="Uptime SLA" suffix="%" />
          <div className="lp-stats-divider" />
          <StatItem value="500" label="Teams worldwide" suffix="+" />
          <div className="lp-stats-divider" />
          <StatItem value="4" label="Avg. response time (ms)" suffix="ms" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-features" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-label">Features</div>
          <h2 className="lp-section-heading">
            Everything your team needs,<br />
            <span className="lp-highlight">nothing you don't.</span>
          </h2>
          <p className="lp-section-sub">
            From sprint planning to production — ProjectFlow has the tools that actually matter.
          </p>
          <div className="lp-features-grid">
            <FeatureCard
              delay={0}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              }
              title="Kanban & Sprint Boards"
              description="Visualize work in kanban columns or sprint cycles. Drag-and-drop tasks across any stage with zero friction."
            />
            <FeatureCard
              delay={80}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              }
              title="Real-time Tracking"
              description="See task updates the moment they happen. No refresh needed — your board stays in sync automatically."
            />
            <FeatureCard
              delay={160}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              }
              title="Team Collaboration"
              description="Assign tasks, mention teammates, and leave comments. Everyone stays aligned without endless meetings."
            />
            <FeatureCard
              delay={240}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              }
              title="Progress Analytics"
              description="Track velocity, burndown, and completion rates. Make data-driven decisions about your team's capacity."
            />
            <FeatureCard
              delay={320}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              }
              title="Priority & Labels"
              description="Critical, high, medium, low — tag every task so your team always knows what to tackle next."
            />
            <FeatureCard
              delay={400}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              }
              title="Comments & Activity"
              description="Full activity history on every task. See who changed what, and when — stay accountable without micromanaging."
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lp-how" id="how-it-works">
        <div className="lp-section-inner">
          <div className="lp-section-label">How it works</div>
          <h2 className="lp-section-heading">
            Up and running in <span className="lp-highlight">under 2 minutes.</span>
          </h2>
          <div className="lp-steps">
            {[
              { n: '01', title: 'Create your workspace', desc: 'Sign up free. Set up your team workspace with a name and invite your first collaborators.' },
              { n: '02', title: 'Add your projects', desc: 'Create projects, define milestones, and break them into tasks with priorities and due dates.' },
              { n: '03', title: 'Assign & track', desc: 'Assign tasks to teammates, track progress in your kanban board, and close sprints on time.' },
            ].map((step, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step-number">{step.n}</div>
                <div className="lp-step-connector" />
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="lp-testimonials" id="testimonials">
        <div className="lp-section-inner">
          <div className="lp-section-label">Testimonials</div>
          <h2 className="lp-section-heading">Loved by teams who ship.</h2>
          <div className="lp-testimonial-carousel">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`lp-testimonial-card ${i === activeTestimonial ? 'active' : ''}`}
              >
                <div className="lp-testimonial-quote">"{t.quote}"</div>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lp-testimonial-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`lp-dot ${i === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta-glow" />
        <div className="lp-section-inner lp-cta-inner">
          <h2 className="lp-cta-heading">Ready to ship faster?</h2>
          <p className="lp-cta-sub">
            Join hundreds of teams already using ProjectFlow to build great things.
          </p>
          <Link to="/register" className="lp-btn-primary lp-btn-large lp-cta-btn">
            Get started — it's free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" style={{ color: 'var(--lp-green)' }}><path d="M480-560h200v-80H480v80Zm0 240h200v-80H480v80Zm-63.5-223.5Q440-567 440-600t-23.5-56.5Q393-680 360-680t-56.5 23.5Q280-633 280-600t23.5 56.5Q327-520 360-520t56.5-23.5Zm0 240Q440-327 440-360t-23.5-56.5Q393-440 360-440t-56.5 23.5Q280-393 280-360t23.5 56.5Q327-280 360-280t56.5-23.5ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/> </svg>
              ProjectFlow
            </div>
            <p className="lp-footer-tagline">The project management tool built for teams that move fast.</p>
          </div>
          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <Link to="/register">Sign up</Link>
            </div>
            <div className="lp-footer-col">
              <h4>Company</h4>
              <a href="#testimonials">Testimonials</a>
              <Link to="/login">Log in</Link>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 ProjectFlow. Built with ♥ for makers.</span>
        </div>
      </footer>
    </div>
  );
}
