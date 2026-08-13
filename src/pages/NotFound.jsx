import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <main className="notfound-page">
      <div className="notfound-inner">
        <div className="notfound-code">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or was moved.<br />Let's get you back on track.</p>
        <div className="notfound-actions">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/articles" className="btn-ghost">Browse Articles</Link>
          <Link to="/lessons" className="btn-ghost">View Lessons</Link>
        </div>
        <div className="notfound-links">
          <span>Popular pages:</span>
          <Link to="/chatbot">Trade Simulator</Link>
          <Link to="/about">About Us</Link>
        </div>
      </div>
    </main>
  )
}
