import { useMemo } from 'react';
import { Search, Users, Calendar, ClipboardList, ListOrdered, BarChart3, Trophy, TrendingUp, Target, Zap } from 'lucide-react';

export default function DashboardView({ data, onNavigate }) {
  const stats = useMemo(() => {
    const teamsWithOPR = data.teams.filter(t => data.ftcScoutCache?.[t.number]?.quickStats?.tot?.value);
    const topTeams = data.teams
      .map(t => ({
        ...t,
        opr: data.ftcScoutCache?.[t.number]?.quickStats?.tot?.value || 0,
        rank: data.ftcScoutCache?.[t.number]?.quickStats?.tot?.rank,
      }))
      .filter(t => t.opr > 0)
      .sort((a, b) => b.opr - a.opr)
      .slice(0, 5);

    const scoutedTeams = new Set(data.scoutingEntries.map(e => e.teamNumber));
    const coverage = data.teams.length > 0 ? (scoutedTeams.size / data.teams.length * 100) : 0;

    const recentEntries = data.scoutingEntries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    const matchesPlayed = data.matches.filter(m => m.redScore || m.blueScore).length;

    return { teamsWithOPR: teamsWithOPR.length, topTeams, coverage, scoutedTeams: scoutedTeams.size, recentEntries, matchesPlayed };
  }, [data]);

  return (
    <>
      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge">FTC 2025-2026 BioBuzz Season</div>
          <h2 className="hero-title">
            {data.myTeam?.name ? `Team ${data.myTeam.name}` : 'BioBuzz Scout'}
            {data.myTeam?.number && <span className="hero-number"> #{data.myTeam.number}</span>}
          </h2>
          <p className="hero-subtitle">
            {data.teams.length === 0
              ? 'Get started by searching for teams or adding them manually.'
              : `Tracking ${data.teams.length} teams with ${data.scoutingEntries.length} scouting entries`}
          </p>
        </div>
      </div>

      <div className="stat-grid stat-grid-4">
        <div className="stat-box stat-box-accent">
          <div className="stat-value">{data.teams.length}</div>
          <div className="stat-label">Teams</div>
        </div>
        <div className="stat-box stat-box-accent">
          <div className="stat-value">{data.scoutingEntries.length}</div>
          <div className="stat-label">Scouted</div>
        </div>
        <div className="stat-box stat-box-accent">
          <div className="stat-value">{data.matches.length}</div>
          <div className="stat-label">Matches</div>
        </div>
        <div className="stat-box stat-box-accent">
          <div className="stat-value">{Math.round(stats.coverage)}%</div>
          <div className="stat-label">Coverage</div>
        </div>
      </div>

      {data.teams.length > 0 && (
        <>
          <div className="section-title">
            <Target size={12} style={{ display: 'inline', verticalAlign: -1 }} /> Scouting Progress
          </div>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>{stats.scoutedTeams} of {data.teams.length} teams scouted</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{Math.round(stats.coverage)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${stats.coverage}%` }} />
              </div>
              {stats.matchesPlayed > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                  {stats.matchesPlayed} of {data.matches.length} matches scored
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {stats.topTeams.length > 0 && (
        <>
          <div className="section-title">
            <Trophy size={12} style={{ display: 'inline', verticalAlign: -1 }} /> Top Teams by OPR
          </div>
          <div className="card">
            {stats.topTeams.map((team, i) => (
              <div key={team.number} className="card-row" onClick={() => onNavigate('teams')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <div className="picklist-rank" style={{
                    background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--bg-secondary)',
                    color: i < 3 ? '#000' : 'var(--text)',
                    width: 30, height: 30, fontSize: 14
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>#{team.number}</span>
                      <span style={{ fontSize: 13 }}>{team.name}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--primary)' }}>{team.opr.toFixed(1)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>OPR{team.rank ? ` #${team.rank}` : ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-title">
        <Zap size={12} style={{ display: 'inline', verticalAlign: -1 }} /> Quick Actions
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '0 16px 8px' }}>
        <button className="feature-card" onClick={() => onNavigate('search')}>
          <Search size={20} />
          <span>Search FTC</span>
        </button>
        <button className="feature-card" onClick={() => onNavigate('scout')}>
          <ClipboardList size={20} />
          <span>Scout Team</span>
        </button>
        <button className="feature-card" onClick={() => onNavigate('picklist')}>
          <ListOrdered size={20} />
          <span>Pick List</span>
        </button>
      </div>

      {stats.recentEntries.length > 0 && (
        <>
          <div className="section-title">
            <TrendingUp size={12} style={{ display: 'inline', verticalAlign: -1 }} /> Recent Activity
          </div>
          <div className="card">
            {stats.recentEntries.map(entry => (
              <div key={entry.id} className="card-row" style={{ cursor: 'default' }}>
                <div className="card-row-left">
                  <span className="card-row-number">#{entry.teamNumber}</span>
                  <span className="card-row-name">
                    {entry.formName} {entry.matchNumber && `- Match ${entry.matchNumber}`}
                  </span>
                </div>
                <div className="card-row-right">
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="app-footer">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>BioBuzz Scout</div>
        <div>FIRST Tech Challenge 2025-2026</div>
        <div style={{ marginTop: 4, fontSize: 11, opacity: 0.7 }}>
          Data powered by FTCScout.org | Stored locally on device
        </div>
      </div>
    </>
  );
}
