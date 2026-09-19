import { Heart, Code, Target, Users, Trophy, ArrowRight, AlertTriangle } from 'lucide-react';

export default function AboutView({ data, onNavigate, is404 }) {
  return (
    <>
      {is404 && (
        <div className="card" style={{ margin: '16px 16px 0', borderColor: 'var(--warning)', background: 'var(--warning-light)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={24} color="var(--warning)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--warning)' }}>404 - Page Not Found</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                The page you're looking for doesn't exist.{' '}
                <button onClick={() => onNavigate('dashboard')} style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}>
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hero" style={{ textAlign: 'center' }}>
        <div className="hero-content">
          <div className="hero-badge">About This Project</div>
          <h2 className="hero-title">BioBuzz Scout</h2>
          <p className="hero-subtitle" style={{ margin: '0 auto' }}>
            A custom-built scouting platform for the FTC 2026-2027 BioBuzz season
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ gap: 8 }}>
          <Users size={16} color="var(--primary)" />
          Our Team
        </div>
        <div className="card-body" style={{ lineHeight: 1.7, fontSize: 14 }}>
          <p>
            We are a <strong>second-year FTC team</strong> competing in the 2026-2027 BioBuzz season.
            Our team number is reused from a previous team that is no longer active, so while the
            number has history, we're writing our own chapter. This is our sophomore season, and
            we're bringing everything we learned from year one into this year.
          </p>
          {data.myTeam?.number && (
            <p style={{ marginTop: 12 }}>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 20 }}>
                Team #{data.myTeam.number}
              </span>
              {data.myTeam.name && (
                <span style={{ fontSize: 16, fontWeight: 600 }}> - {data.myTeam.name}</span>
              )}
              {data.myTeam.school && (
                <span style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {data.myTeam.school}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ gap: 8 }}>
          <Target size={16} color="var(--primary)" />
          Why We Built This
        </div>
        <div className="card-body" style={{ lineHeight: 1.7, fontSize: 14 }}>
          <p>
            At competitions, data wins matches. We saw teams making alliance picks based on
            gut feeling instead of real performance data. We wanted a tool that would let us
            scout every team, track OPR stats from FTCScout, record our own observations, and
            make <strong>data-driven decisions</strong> during alliance selection.
          </p>
          <p style={{ marginTop: 12 }}>
            Existing scouting apps were either too complicated, required paid accounts, or
            didn't integrate with FTC data. So we built our own - a free, open platform that
            anyone on the team can pull up on their phone or laptop at a competition and start
            scouting immediately. No accounts, no downloads, no cost.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ gap: 8 }}>
          <Code size={16} color="var(--primary)" />
          How It Works
        </div>
        <div className="card-body" style={{ lineHeight: 1.7, fontSize: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="stat-box stat-box-accent">
              <div className="stat-value" style={{ fontSize: 20 }}>7</div>
              <div className="stat-label">Modules</div>
            </div>
            <div className="stat-box stat-box-accent">
              <div className="stat-value" style={{ fontSize: 20 }}>Free</div>
              <div className="stat-label">Forever</div>
            </div>
          </div>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong>FTC Lookup</strong> - Search any team by number or name, pull live OPR and event data from FTCScout</li>
            <li><strong>Team Tracker</strong> - Build your competition watchlist with OPR rankings and scouting coverage</li>
            <li><strong>Match Schedule</strong> - Track your matches, record scores, see win/loss at a glance</li>
            <li><strong>Custom Scouting</strong> - Fully customizable forms for match scouting and pit scouting with ratings, counters, and notes</li>
            <li><strong>Pick List</strong> - Tier-ranked alliance selection board with 4 categories: Must Pick, Good Pick, Backup, Do Not Pick</li>
            <li><strong>Analytics</strong> - Compare teams side-by-side with OPR breakdowns, scouting averages, and data visualizations</li>
            <li><strong>Data Sharing</strong> - Export and import JSON files to share scouting data across the whole team</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ gap: 8 }}>
          <Trophy size={16} color="var(--primary)" />
          Engineering Process
        </div>
        <div className="card-body" style={{ lineHeight: 1.7, fontSize: 14 }}>
          <p>
            This app was designed, iterated, and deployed as part of our team's engineering
            process. We identified a problem (lack of accessible scouting tools), designed
            a solution, built iteratively with user feedback from team members, and deployed
            it as a free static website hosted on GitHub Pages.
          </p>
          <p style={{ marginTop: 12 }}>
            <strong>Tech stack:</strong> React, Vite, FTCScout GraphQL API, localStorage for
            offline-first data, GitHub Actions for CI/CD. All data stays on the user's device -
            no server, no database, no accounts needed.
          </p>
          <p style={{ marginTop: 12 }}>
            <strong>Design philosophy:</strong> Competition-day speed. Every screen is designed
            to be usable in the stands between matches - big touch targets, fast data entry,
            instant search. If a scout can't enter data in under 30 seconds, the form is too long.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <Heart size={24} color="var(--primary)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Built with passion for FTC</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            This project is open and free for any FTC team to use.
            Data powered by FTCScout.org.
          </div>
          {onNavigate && (
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => onNavigate('dashboard')}
            >
              <ArrowRight size={16} /> Start Scouting
            </button>
          )}
        </div>
      </div>

      <div className="app-footer">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>BioBuzz Scout v3.0</div>
        <div>FIRST Tech Challenge 2026-2027 Season</div>
        <div style={{ marginTop: 4, fontSize: 11, opacity: 0.7 }}>
          Data powered by FTCScout.org | Stored locally on device
        </div>
      </div>
    </>
  );
}
