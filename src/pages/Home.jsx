import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { lessons } from '../data/lessons'
import { articles } from '../data/articles'
import './Home.css'

const faqs = [
  {
    q: "How do I start investing with little money?",
    a: "Start with as little as $1 using fractional shares on platforms like Fidelity or Schwab. Open a Roth IRA if you have earned income — you can contribute up to $7,000/year in 2026 and all growth is completely tax-free. Begin with low-cost index funds like VTI or SPY rather than individual stocks. Even $25/month at a 7% average return grows to over $30,000 in 30 years thanks to compound interest.",
  },
  {
    q: "What is a Roth IRA and should I open one?",
    a: "A Roth IRA is a retirement account where you contribute after-tax money, but all future growth and withdrawals are 100% tax-free. For young people in lower tax brackets, it's one of the best financial tools available. A 22-year-old who contributes $7,000/year until 65 at 7% return accumulates over $1.8 million — all tax-free.",
  },
  {
    q: "How do I create a budget that actually works?",
    a: "Use the 50/30/20 rule: 50% of after-tax income to needs (rent, food, utilities), 30% to wants (dining, entertainment), 20% to savings and debt repayment. Track every expense for one month first — most people underestimate spending by 20–30%. Free tools like Mint or a simple spreadsheet work great.",
  },
  {
    q: "How do I improve my credit score?",
    a: "Your FICO score is determined by: payment history (35%), amounts owed (30%), length of history (15%), credit mix (10%), new credit (10%). Fastest wins: set autopay so you never miss a payment, keep credit card balances below 30% of your limit, and don't close old cards. A secured card is the best starting point with no credit history.",
  },
  {
    q: "What should I do with my first paycheck?",
    a: "Follow this order: (1) Build a $1,000 starter emergency fund. (2) Contribute enough to your 401k to get the full employer match — that's free money you can't leave on the table. (3) Pay off high-interest debt. (4) Grow emergency fund to 3–6 months of expenses. (5) Max your Roth IRA. (6) Invest extra in a brokerage account.",
  },
  {
    q: "Is moneasey free to use?",
    a: "Yes — 100% free, forever. moneasey is a nonprofit. We don't sell financial products, charge subscription fees, or earn referral commissions. All 60+ articles, 25 interactive lessons, and the AI trade simulator are completely free with no sign-up required.",
  },
]

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
    <>
    <Helmet>
      <title>moneasey — Free Financial Literacy for Everyone</title>
      <meta name="description" content="Free nonprofit financial education. 60+ articles on budgeting, investing, credit & taxes. 25 interactive how-to lessons. AI trade simulator. No sign-up required." />
      <link rel="canonical" href="https://moneasey.org/" />
    </Helmet>
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

      {/* FAQ */}
      <section className="section faq-section">
        <div className="section-header">
          <h2>Common questions, answered</h2>
          <p>Straight answers — no jargon, no referral links.</p>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <details key={i} className="faq-item">
              <summary className="faq-q">{f.q}</summary>
              <p className="faq-a">{f.a}</p>
            </details>
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
    </>
  )
}
