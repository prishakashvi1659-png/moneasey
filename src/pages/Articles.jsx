import { useState } from 'react'
import { Link } from 'react-router-dom'
import { articles, topics } from '../data/articles'
import './Articles.css'

export default function Articles() {
  const [active, setActive] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = articles.filter(a => {
    const matchTopic = active === 'All' || a.topic === active
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchTopic && matchSearch
  })

  return (
    <main className="articles-page">
      <div className="articles-hero">
        <div className="articles-hero-inner">
          <span className="page-badge">📰 Knowledge Hub</span>
          <h1>Financial Articles</h1>
          <p>
            Clear, no-jargon articles on the money topics that matter most.
            Written for real people, not Wall Street.
          </p>

          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="articles-content">
        {/* Topic filters */}
        <div className="topic-filters">
          {topics.map(t => (
            <button
              key={t}
              className={`topic-btn ${active === t ? 'active' : ''}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="results-info">
          <span>{filtered.length} article{filtered.length !== 1 ? 's' : ''}</span>
          {active !== 'All' && (
            <span className="filter-active">in {active}</span>
          )}
        </div>

        {/* Articles grid */}
        {filtered.length > 0 ? (
          <div className="articles-grid">
            {filtered.map(a => (
              <Link to={`/articles/${a.id}`} key={a.id} className="article-card">
                <div className="article-card-tag">{a.topic}</div>
                <h2>{a.title}</h2>
                <p>{a.excerpt}</p>
                <div className="article-card-footer">
                  <span className="article-date">{a.date}</span>
                  <span className="article-read">{a.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No articles found</h3>
            <p>Try a different search term or topic filter.</p>
            <button onClick={() => { setActive('All'); setSearch('') }} className="reset-btn">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
