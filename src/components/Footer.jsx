import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">moneasey</span>
          <p>Financial literacy for everyone.<br />Knowledge is the first step to freedom.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Learn</h4>
            <Link to="/articles">Articles</Link>
            <Link to="/lessons">How-To Lessons</Link>
            <Link to="/chatbot">Trade Simulator</Link>
          </div>
          <div className="footer-col">
            <h4>Topics</h4>
            <Link to="/articles?topic=budgeting">Budgeting</Link>
            <Link to="/articles?topic=investing">Investing</Link>
            <Link to="/articles?topic=credit">Credit</Link>
            <Link to="/articles?topic=saving">Saving</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} moneasey nonprofit. All rights reserved.</span>
        <span>Built with ♥ for financial freedom</span>
      </div>
    </footer>
  )
}
