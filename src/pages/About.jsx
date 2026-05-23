import './About.css'

// ─── EDIT THIS ARRAY to add your real team members ───────────────────────────
// For each person:
//   name     — full name
//   role     — job title / role
//   bio      — 1-2 sentence description
//   photo    — URL to their photo (or import a local file and use the variable)
//   linkedin — optional LinkedIn URL
const team = [
  {
    name: "Your Name Here",
    role: "Founder & Executive Director",
    bio: "Replace this with a short bio. Paste your team's names, roles, bios, and photo URLs and I'll update this section instantly.",
    photo: "",
    linkedin: "",
  },
  {
    name: "Team Member",
    role: "Director of Programs",
    bio: "Replace this placeholder with the real person's information. Just paste names, roles, bios, and photos in chat.",
    photo: "",
    linkedin: "",
  },
  {
    name: "Team Member",
    role: "Content & Education Lead",
    bio: "Another placeholder — send me your team details and I'll fill these in right away.",
    photo: "",
    linkedin: "",
  },
]

const values = [
  { icon: "🌱", title: "Accessible to All", desc: "Financial education shouldn't be gated behind paywalls or jargon. We make it free, clear, and available to everyone." },
  { icon: "🎯", title: "Action-Oriented", desc: "We don't just teach theory. Every lesson ends with a concrete step you can take today." },
  { icon: "🤝", title: "Community First", desc: "We're a nonprofit — not driven by profit, but by the communities we serve and the futures we help build." },
  { icon: "📊", title: "Evidence-Based", desc: "Everything we publish is grounded in research, real financial data, and expert-reviewed best practices." },
]

function Avatar({ name, photo }) {
  if (photo) {
    return <img src={photo} alt={name} className="team-photo" />
  }
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return <div className="team-avatar-placeholder">{initials}</div>
}

export default function About() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="page-badge">🌱 Our Mission</span>
          <h1>We believe financial literacy is a right, not a privilege.</h1>
          <p>
            moneasey is a nonprofit organization on a mission to close the financial literacy gap.
            We create free, accessible, and genuinely useful financial education for people
            who were never taught how money really works.
          </p>
        </div>
      </section>

      {/* Mission stats */}
      <section className="about-stats">
        <div className="about-stats-inner">
          {[
            { val: "100%", label: "Free, forever" },
            { val: "60+",  label: "Articles published" },
            { val: "25",   label: "How-to lessons" },
            { val: "∞",    label: "People we aim to reach" },
          ].map(s => (
            <div key={s.label} className="about-stat">
              <span className="about-stat-val">{s.val}</span>
              <span className="about-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="about-section about-story">
        <div className="about-section-inner two-col">
          <div className="story-text">
            <span className="section-eyebrow">Our Story</span>
            <h2>Born from a gap nobody should have to fall into.</h2>
            <p>
              Most people graduate high school and college without ever learning how to
              budget, build credit, invest, or file taxes. That knowledge gap costs people
              thousands of dollars in missed opportunities, high-interest debt, and costly
              mistakes that take years to recover from.
            </p>
            <p>
              moneasey was founded to fix that. We build curriculum-quality financial
              education that's written in plain English, grounded in real data, and
              completely free — because the cost of not learning this is too high.
            </p>
          </div>
          <div className="story-card">
            <div className="story-quote">
              "The best time to learn about money was when you were young. The second best time is right now."
            </div>
            <span className="story-quote-attr">— moneasey</span>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-section">
        <div className="about-section-inner">
          <span className="section-eyebrow">What We Stand For</span>
          <h2>Our values</h2>
          <div className="values-grid">
            {values.map(v => (
              <div key={v.title} className="value-card">
                <span className="value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="about-section">
        <div className="about-section-inner">
          <span className="section-eyebrow">The People Behind It</span>
          <h2>Meet the team</h2>
          <p className="section-sub">
            We're a small, passionate team dedicated to making financial literacy free and accessible.
          </p>
          <div className="team-grid">
            {team.map((member) => (
              <div key={member.name} className="team-card">
                <Avatar name={member.name} photo={member.photo} />
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                  <p>{member.bio}</p>
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="team-linkedin">
                      LinkedIn →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="team-notice">
            <span>👋</span>
            <p>
              <strong>Want to see your real team here?</strong> Send me names, roles, short bios,
              and photo links (or upload photos) and I'll update this page instantly.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Ready to start learning?</h2>
        <p>Everything on moneasey is free. No sign-up, no paywall, no catch.</p>
        <div className="about-cta-actions">
          <a href="/lessons" className="btn-primary">Browse Lessons</a>
          <a href="/articles" className="btn-ghost">Read Articles</a>
        </div>
      </section>
    </main>
  )
}
