import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { lessons } from '../data/lessons'
import './LessonDetail.css'

export default function LessonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const lesson = lessons.find(l => l.id === Number(id))
  const [activeStep, setActiveStep] = useState(0)
  const [completed, setCompleted] = useState([])

  if (!lesson) {
    return (
      <main className="lesson-detail-page">
        <div className="not-found">
          <h2>Lesson not found</h2>
          <Link to="/lessons">← Back to Lessons</Link>
        </div>
      </main>
    )
  }

  const step = lesson.steps[activeStep]
  const isCompleted = completed.includes(activeStep)
  const allDone = completed.length === lesson.steps.length

  const toggleComplete = () => {
    if (isCompleted) {
      setCompleted(c => c.filter(i => i !== activeStep))
    } else {
      setCompleted(c => [...c, activeStep])
    }
  }

  const goNext = () => {
    if (!isCompleted) setCompleted(c => [...c, activeStep])
    if (activeStep < lesson.steps.length - 1) setActiveStep(activeStep + 1)
  }

  const goPrev = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1)
  }

  function renderContent(text) {
    return text.trim().split('\n\n').map((block, i) => {
      const inline = block.split(/(\*\*[^*]+\*\*)/).map((p, j) =>
        p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p
      )
      if (block.startsWith('• ') || block.includes('\n• ')) {
        const items = block.split('\n').filter(l => l.trim())
        return (
          <ul key={i} className="step-list">
            {items.map((item, j) => (
              <li key={j}>{item.replace(/^•\s*/, '').split(/(\*\*[^*]+\*\*)/).map((p, k) =>
                p.startsWith('**') ? <strong key={k}>{p.slice(2, -2)}</strong> : p
              )}</li>
            ))}
          </ul>
        )
      }
      return <p key={i} className="step-para">{inline}</p>
    })
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `https://moneasey.org/lessons/${lesson.id}`,
    "name": lesson.title,
    "description": lesson.description,
    "totalTime": lesson.duration,
    "educationalLevel": lesson.difficulty,
    "provider": {
      "@type": "Organization",
      "@id": "https://moneasey.org/#organization",
      "name": "moneasey"
    },
    "step": lesson.steps.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.title,
      "text": s.content ? s.content.replace(/\*\*/g, '').trim().slice(0, 300) : s.title,
      "url": `https://moneasey.org/lessons/${lesson.id}#step-${i + 1}`
    })),
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://moneasey.org/" },
        { "@type": "ListItem", "position": 2, "name": "Lessons", "item": "https://moneasey.org/lessons" },
        { "@type": "ListItem", "position": 3, "name": lesson.title, "item": `https://moneasey.org/lessons/${lesson.id}` }
      ]
    }
  }

  return (
    <>
    <Helmet>
      <title>{lesson.title} — moneasey</title>
      <meta name="description" content={lesson.description} />
      <link rel="canonical" href={`https://moneasey.org/lessons/${lesson.id}`} />
      <meta property="og:title" content={`${lesson.title} — moneasey`} />
      <meta property="og:description" content={lesson.description} />
      <meta property="og:url" content={`https://moneasey.org/lessons/${lesson.id}`} />
      <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
    </Helmet>
    <main className="lesson-detail-page">
      {/* Header */}
      <div className="ld-header">
        <div className="ld-header-inner">
          <button onClick={() => navigate(-1)} className="back-btn">← Back to Lessons</button>
          <div className="ld-title-row">
            <span className="ld-icon">{lesson.icon}</span>
            <div>
              <div className="ld-badges">
                <span className={`difficulty diff-${lesson.difficulty.toLowerCase()}`}>{lesson.difficulty}</span>
                <span className="lesson-cat">{lesson.category}</span>
                <span className="lesson-dur">⏱ {lesson.duration}</span>
              </div>
              <h1>{lesson.title}</h1>
              <p className="ld-desc">{lesson.description}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-bar-wrap">
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${(completed.length / lesson.steps.length) * 100}%` }}
              />
            </div>
            <span className="progress-label">
              {completed.length}/{lesson.steps.length} steps completed
            </span>
          </div>
        </div>
      </div>

      <div className="ld-body">
        {/* Step sidebar */}
        <aside className="step-sidebar">
          <h3>Steps</h3>
          <div className="step-nav">
            {lesson.steps.map((s, i) => (
              <button
                key={i}
                className={`step-nav-item ${activeStep === i ? 'active' : ''} ${completed.includes(i) ? 'done' : ''}`}
                onClick={() => setActiveStep(i)}
              >
                <span className="step-num">
                  {completed.includes(i) ? '✓' : i + 1}
                </span>
                <span className="step-nav-title">{s.title}</span>
              </button>
            ))}
          </div>

          {allDone && (
            <div className="all-done-box">
              <span>🎉</span>
              <div>
                <strong>Lesson complete!</strong>
                <p>You've finished all steps.</p>
              </div>
            </div>
          )}
        </aside>

        {/* Step content */}
        <div className="step-content">
          <div className={`step-card ${isCompleted ? 'step-done' : ''}`}>
            <div className="step-card-header">
              <div className="step-number-badge">Step {activeStep + 1}</div>
              <h2>{step.title}</h2>
            </div>

            <div className="step-body">
              {renderContent(step.content)}
            </div>

            {step.tip && (
              <div className="step-tip">
                <span className="tip-label">💡 Pro Tip</span>
                <p>{step.tip}</p>
              </div>
            )}

            {step.action && (
              <div className="step-action">
                <span className="action-label">✅ Your Action</span>
                <p>{step.action}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="step-controls">
            <button
              className="ctrl-btn ctrl-prev"
              onClick={goPrev}
              disabled={activeStep === 0}
            >
              ← Previous
            </button>

            <button
              className={`ctrl-btn ctrl-check ${isCompleted ? 'ctrl-checked' : ''}`}
              onClick={toggleComplete}
            >
              {isCompleted ? '✓ Completed' : 'Mark Complete'}
            </button>

            {activeStep < lesson.steps.length - 1 ? (
              <button className="ctrl-btn ctrl-next" onClick={goNext}>
                Next Step →
              </button>
            ) : (
              <Link to="/lessons" className="ctrl-btn ctrl-next">
                More Lessons →
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
