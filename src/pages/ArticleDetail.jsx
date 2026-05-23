import { useParams, Link, useNavigate } from 'react-router-dom'
import { articles } from '../data/articles'
import './ArticleDetail.css'

function parseContent(text) {
  return text.trim().split('\n\n').map((block, i) => {
    if (block.startsWith('**') && block.endsWith('**') && block.indexOf('\n') === -1) {
      return <h3 key={i} className="article-h3">{block.replace(/\*\*/g, '')}</h3>
    }
    if (block.startsWith('• ') || block.includes('\n• ')) {
      const items = block.split('\n').filter(l => l.trim())
      return (
        <ul key={i} className="article-list">
          {items.map((item, j) => (
            <li key={j}>{item.replace(/^[•\-]\s*/, '').split(/(\*\*[^*]+\*\*)/).map((p, k) =>
              p.startsWith('**') ? <strong key={k}>{p.slice(2, -2)}</strong> : p
            )}</li>
          ))}
        </ul>
      )
    }
    if (/^\d+\.\s/.test(block)) {
      const items = block.split('\n').filter(l => l.trim())
      return (
        <ol key={i} className="article-list article-list-ol">
          {items.map((item, j) => (
            <li key={j}>{item.replace(/^\d+\.\s*/, '').split(/(\*\*[^*]+\*\*)/).map((p, k) =>
              p.startsWith('**') ? <strong key={k}>{p.slice(2, -2)}</strong> : p
            )}</li>
          ))}
        </ol>
      )
    }
    const parts = block.split(/(\*\*[^*]+\*\*)/).map((p, j) =>
      p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p
    )
    return <p key={i} className="article-para">{parts}</p>
  })
}

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const article = articles.find(a => a.id === Number(id))

  if (!article) {
    return (
      <main className="detail-page">
        <div className="not-found">
          <h2>Article not found</h2>
          <Link to="/articles" className="back-link">← Back to Articles</Link>
        </div>
      </main>
    )
  }

  const others = articles.filter(a => a.id !== article.id && a.topic === article.topic).slice(0, 3)
  const fallback = articles.filter(a => a.id !== article.id).slice(0, 3)
  const related = others.length > 0 ? others : fallback

  return (
    <main className="detail-page">
      <div className="detail-header">
        <div className="detail-header-inner">
          <button onClick={() => navigate(-1)} className="back-link">← Back</button>
          <div className="detail-tag">{article.topic}</div>
          <h1>{article.title}</h1>
          <div className="detail-meta">
            {article.author && (
              <>
                <span className="meta-author">By {article.author}</span>
                <span className="meta-dot">·</span>
              </>
            )}
            <span>{article.date}</span>
            <span className="meta-dot">·</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>

      <div className="detail-body">
        <article className="article-content">
          <p className="article-lead">{article.excerpt}</p>
          {parseContent(article.content)}

          {article.citations && article.citations.length > 0 && (
            <div className="article-citations">
              <h4 className="citations-heading">Sources</h4>
              <ol className="citations-list">
                {article.citations.map((cite, i) => (
                  <li key={i} className="citation-item">
                    {cite.url ? (
                      <>
                        <span className="cite-authors">{cite.authors}. </span>
                        <span className="cite-title">"{cite.title}." </span>
                        <span className="cite-source">{cite.source}</span>
                        {cite.date && <span className="cite-date">, {cite.date}</span>}
                        <span>. </span>
                        <a href={cite.url} target="_blank" rel="noreferrer" className="cite-link">
                          {cite.url.length > 60 ? cite.url.slice(0, 60) + '…' : cite.url}
                        </a>
                      </>
                    ) : (
                      <>
                        <span className="cite-authors">{cite.authors}. </span>
                        <span className="cite-title">"{cite.title}." </span>
                        <span className="cite-source">{cite.source}</span>
                        {cite.date && <span className="cite-date">, {cite.date}</span>}
                        <span>.</span>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </article>

        <aside className="related-section">
          {related.length > 0 && (
            <>
              <h3>Related Articles</h3>
              <div className="related-list">
                {related.map(r => (
                  <Link key={r.id} to={`/articles/${r.id}`} className="related-card">
                    <span className="related-tag">{r.topic}</span>
                    <span className="related-title">{r.title}</span>
                    <span className="related-read">{r.readTime}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
          <Link to="/articles" className="all-articles-link">Browse all articles →</Link>
        </aside>
      </div>
    </main>
  )
}
