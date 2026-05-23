import { Link } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { articles } from '../data/articles'
import './Home.css'

const stats = [
  { value: '60+', label: 'Articles Published' },
  { value: '25', label: 'Interactive Lessons' },
  { value: '100%', label: 'Free Forever' },
  { value: '∞', label: 'Financial Freedom' },
]

const features = [
  {
    icon: '📰',
    title: 'Financial Articles',
    desc: 'Expert-written content on budgeting, investing, credit, taxes, and more — broken down so anyone can understand it.',
    to: '/articles',
    cta: 'Browse Articles',
    color: 'green',
  },
  {
    icon: '🎓',
    title: 'How-To Lessons',
    desc: 'Step-by-step guides that walk you through real financial tasks — from opening a savings account to making your first investment.',
    to: '/lessons',
    cta: 'Start Learning',
    color: 'gold',
  },
  {
    icon: '📈',
    title: 'Trade Simulator',
    desc: 'Practice trading stocks and ask a financial chatbot questions — all in a safe, simulated environment with zero real money.',
    to: '/chatbot',
    cta: 'Open Simulator',
    color: 'green',
  },
]

export default function Home() {
  const featuredArticles = articles.slice(0, 3)
  const featuredLessons = lessons.slice(0, 3)

  return (
    <main className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">🌱 Nonprofit · Free · For Everyone</div>
          <h1 className="hero-title">
            Money shouldn't be<br />
            <span className="gradient-text">a mystery.</span>
          </h1>
          <p className="hero-subtitle">
            moneasey is a nonprofit financial literacy platform that gives you the
            knowledge, tools, and confidence to take control of your financial future —
            completely free.
          </p>
          <div className="hero-actions">
            <Link to="/lessons" className="btn-primary">Start Learning Free</Link>
            <Link to="/articles" className="btn-ghost">Read Articles →</Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="chart-mock">
            <div className="chart-header">
              <span className="chart-label">Portfolio Growth</span>
              <span className="chart-value">+24.6%</span>
            </div>
            <svg viewBox="0 0 300 120" className="chart-svg">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,90 L30,80 L60,85 L90,60 L120,65 L150,40 L180,45 L210,25 L240,30 L270,15 L300,10 L300,120 L0,120 Z"
                fill="url(#chartGrad)" />
              <path d="M0,90 L30,80 L60,85 L90,60 L120,65 L150,40 L180,45 L210,25 L240,30 L270,15 L300,10"
                fill="none" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="chart-tickers">
              {['AAPL +1.2%', 'MSFT +0.8%', 'VTI +0.4%'].map(t => (
                <span key={t} className="ticker">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section features-section">
        <div className="section-header">
          <h2>Everything you need to get financially literate</h2>
          <p>Three powerful tools, zero cost, zero fluff.</p>
        </div>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className={`feature-card feature-${f.color}`}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <Link to={f.to} className="feature-link">{f.cta} →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST ARTICLES */}
      <section className="section">
        <div className="section-header">
          <h2>Latest Articles</h2>
          <Link to="/articles" className="see-all">View all →</Link>
        </div>
        <div className="article-preview-grid">
          {featuredArticles.map(a => (
            <Link to={`/articles/${a.id}`} key={a.id} className="article-preview-card">
              <div className="article-preview-tag">{a.topic}</div>
              <h3>{a.title}</h3>
              <p>{a.excerpt}</p>
              <div className="article-preview-meta">
                <span>{a.date}</span>
                <span>{a.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LESSONS PREVIEW */}
      <section className="section">
        <div className="section-header">
          <h2>Popular Lessons</h2>
          <Link to="/lessons" className="see-all">All lessons →</Link>
        </div>
        <div className="lessons-preview-grid">
          {featuredLessons.map(l => (
            <Link to={`/lessons/${l.id}`} key={l.id} className="lesson-preview-card">
              <span className="lesson-icon">{l.icon}</span>
              <div className="lesson-preview-info">
                <div className="lesson-preview-meta">
                  <span className={`difficulty diff-${l.difficulty.toLowerCase()}`}>{l.difficulty}</span>
                  <span className="duration">{l.duration}</span>
                </div>
                <h3>{l.title}</h3>
                <p>{l.description}</p>
              </div>
              <span className="lesson-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-glow" />
        <h2>Ready to take control of your finances?</h2>
        <p>Start with a free lesson today. No account required.</p>
        <div className="cta-actions">
          <Link to="/lessons" className="btn-primary">Start a Lesson</Link>
          <Link to="/chatbot" className="btn-ghost">Try the Trade Sim</Link>
        </div>
      </section>
    </main>
  )
}
