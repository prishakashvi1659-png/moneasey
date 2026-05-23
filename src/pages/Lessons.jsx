import { Link } from 'react-router-dom'
import { lessons } from '../data/lessons'
import './Lessons.css'

const categories = ['All', 'Budgeting', 'Banking', 'Investing', 'Credit', 'Income', 'Debt']

export default function Lessons() {
  return (
    <main className="lessons-page">
      <div className="lessons-hero">
        <div className="lessons-hero-inner">
          <span className="page-badge">🎓 Step-by-Step Guides</span>
          <h1>How-To Lessons</h1>
          <p>
            Practical, action-oriented guides that walk you through real financial tasks —
            one clear step at a time. Click any lesson to get started.
          </p>
        </div>
      </div>

      <div className="lessons-content">
        <div className="lessons-grid">
          {lessons.map((lesson, i) => (
            <Link to={`/lessons/${lesson.id}`} key={lesson.id} className="lesson-card">
              <div className="lesson-card-top">
                <span className="lesson-card-icon">{lesson.icon}</span>
                <div className="lesson-card-badges">
                  <span className={`difficulty diff-${lesson.difficulty.toLowerCase()}`}>
                    {lesson.difficulty}
                  </span>
                  <span className="lesson-cat">{lesson.category}</span>
                </div>
              </div>

              <h2>{lesson.title}</h2>
              <p>{lesson.description}</p>

              <div className="lesson-card-footer">
                <div className="lesson-steps-count">
                  <span className="steps-dot" />
                  {lesson.steps.length} steps
                </div>
                <div className="lesson-duration">⏱ {lesson.duration}</div>
              </div>

              <div className="lesson-card-cta">
                Start Lesson <span className="cta-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="lessons-tip">
          <span className="tip-icon">💡</span>
          <div>
            <strong>No account needed.</strong> All lessons are 100% free and accessible instantly.
            Work through them in any order — each one is self-contained.
          </div>
        </div>
      </div>
    </main>
  )
}
