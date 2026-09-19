import { useState, useCallback } from 'react';
import { Search, Plus, ChevronRight, Globe, Trophy, MapPin, Loader2, Check, ExternalLink } from 'lucide-react';
import { searchTeams, getTeamDetail } from '../utils/ftcscout';
import { generateId } from '../utils/storage';

export default function FTCSearchView({ data, update, onViewTeam }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setDetail(null);
    try {
      const r = await searchTeams(query.trim());
      setResults(r);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [query]);

  async function viewTeamDetail(number) {
    setDetailLoading(true);
    try {
      const d = await getTeamDetail(number);
      setDetail(d);
      update(prev => ({
        ...prev,
        ftcScoutCache: { ...prev.ftcScoutCache, [number]: { ...d, fetchedAt: Date.now() } },
      }));
    } catch (e) {
      setError(e.message);
    }
    setDetailLoading(false);
  }

  function addTeamToList(team) {
    const exists = data.teams.some(t => String(t.number) === String(team.number));
    if (exists) return;
    update(prev => ({
      ...prev,
      teams: [...prev.teams, {
        id: generateId(),
        number: String(team.number),
        name: team.name,
        school: team.schoolName,
        location: team.location ? `${team.location.city}, ${team.location.state}` : '',
        notes: '',
        ftcScoutLinked: true,
      }],
    }));
  }

  const isAdded = (num) => data.teams.some(t => String(t.number) === String(num));

  if (detail) {
    const qs = detail.quickStats;
    return (
      <>
        <div style={{ padding: 12 }}>
          <button className="btn btn-sm btn-secondary" onClick={() => setDetail(null)} style={{ marginBottom: 8 }}>
            &larr; Back to results
          </button>
        </div>

        <div className="card">
          <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>#{detail.number}</span>
              {!isAdded(detail.number) ? (
                <button className="btn btn-sm btn-primary" onClick={() => addTeamToList(detail)}>
                  <Plus size={14} /> Add to My Teams
                </button>
              ) : (
                <span className="badge badge-success" style={{ padding: '4px 10px' }}>
                  <Check size={12} style={{ marginRight: 3 }} /> In your teams
                </span>
              )}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{detail.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} /> {detail.schoolName}, {detail.location?.city}, {detail.location?.state}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
              <span>Rookie year: {detail.rookieYear}</span>
              {detail.activeSeasons?.length > 0 && <span>Seasons: {detail.activeSeasons.slice(-4).join(', ')}</span>}
            </div>
            {detail.website && (
              <a href={detail.website} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                <ExternalLink size={11} /> Website
              </a>
            )}
          </div>
        </div>

        {qs && (
          <>
            <div className="section-title">
              Season OPR ({detail.statsSeason === 2026 ? 'BioBuzz 2026' : detail.statsSeason === 2025 ? '2025 Season' : 'Latest'})
            </div>
            <div className="stat-grid">
              <div className="stat-box">
                <div className="stat-value">{qs.tot.value.toFixed(1)}</div>
                <div className="stat-label">Total OPR (#{qs.tot.rank})</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{qs.auto.value.toFixed(1)}</div>
                <div className="stat-label">Auto OPR (#{qs.auto.rank})</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{qs.dc.value.toFixed(1)}</div>
                <div className="stat-label">TeleOp OPR (#{qs.dc.rank})</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{qs.eg.value.toFixed(1)}</div>
                <div className="stat-label">Endgame OPR (#{qs.eg.rank})</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)', padding: '0 12px' }}>
              Ranked out of {qs.count.toLocaleString()} teams worldwide
            </div>
          </>
        )}

        {detail.events?.length > 0 && (
          <>
            <div className="section-title">Events This Season ({detail.events.length})</div>
            {detail.events.map(ev => (
              <div key={ev.eventCode} className="card">
                <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span>{ev.event.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-secondary)' }}>
                    {ev.event.start && new Date(ev.event.start).toLocaleDateString()}
                  </span>
                </div>
                {ev.stats && (
                  <div className="card-body">
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>#{ev.stats.rank}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Rank</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>
                          <span className="score-win">{ev.stats.wins}W</span>-<span className="score-loss">{ev.stats.losses}L</span>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Record</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>{ev.stats.rp?.toFixed(1)}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>RP</div>
                      </div>
                    </div>

                    {ev.stats.avg && (
                      <div style={{ fontSize: 12 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Averages</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                          <div>Total: <strong>{ev.stats.avg.totalPoints?.toFixed(1)}</strong></div>
                          <div>Auto: <strong>{ev.stats.avg.autoPoints?.toFixed(1)}</strong></div>
                          <div>TeleOp: <strong>{ev.stats.avg.dcPoints?.toFixed(1)}</strong></div>
                        </div>
                      </div>
                    )}

                    {ev.stats.opr && (
                      <div style={{ fontSize: 12, marginTop: 8 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>OPR Breakdown</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                          <div>Total: <strong>{ev.stats.opr.totalPoints?.toFixed(1)}</strong></div>
                          <div>Auto: <strong>{ev.stats.opr.autoPoints?.toFixed(1)}</strong></div>
                          <div>TeleOp: <strong>{ev.stats.opr.dcPoints?.toFixed(1)}</strong></div>
                          {ev.stats.opr.autoArtifactPoints != null && <div>Auto Art.: <strong>{ev.stats.opr.autoArtifactPoints?.toFixed(1)}</strong></div>}
                          {ev.stats.opr.dcBasePoints != null && <div>DC Base: <strong>{ev.stats.opr.dcBasePoints?.toFixed(1)}</strong></div>}
                          {ev.stats.opr.dcArtifactPoints != null && <div>DC Art.: <strong>{ev.stats.opr.dcArtifactPoints?.toFixed(1)}</strong></div>}
                          {ev.stats.opr.dcPatternPoints != null && <div>Pattern: <strong>{ev.stats.opr.dcPatternPoints?.toFixed(1)}</strong></div>}
                          {ev.stats.opr.dcDepotPoints != null && <div>Depot: <strong>{ev.stats.opr.dcDepotPoints?.toFixed(1)}</strong></div>}
                        </div>
                      </div>
                    )}

                    {ev.stats.max && (
                      <div style={{ fontSize: 12, marginTop: 8 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Best Match</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                          <div>Total: <strong>{ev.stats.max.totalPoints}</strong></div>
                          <div>Auto: <strong>{ev.stats.max.autoPoints}</strong></div>
                          <div>TeleOp: <strong>{ev.stats.max.dcPoints}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {detail.awards?.length > 0 && (
          <>
            <div className="section-title">Awards</div>
            <div className="card">
              {detail.awards.map((a, i) => (
                <div key={i} className="card-row" style={{ cursor: 'default' }}>
                  <div className="card-row-left">
                    <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Trophy size={14} color="var(--warning)" /> {a.type.replace(/_/g, ' ')}
                    </span>
                    <span className="card-row-name">{a.event?.name}</span>
                  </div>
                  <span className="badge badge-warning">#{a.placement}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ height: 80 }} />
      </>
    );
  }

  return (
    <>
      <div style={{ padding: '12px' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
          Search FTCScout for any team by number or name
        </div>
        <form onSubmit={e => { e.preventDefault(); doSearch(); }} style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-secondary)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36 }}
              placeholder="Team # or name..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="card" style={{ margin: '0 12px' }}>
          <div className="card-body" style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>
        </div>
      )}

      {detailLoading && (
        <div className="empty">
          <Loader2 size={32} className="spin" />
          <p>Loading team data from FTCScout...</p>
        </div>
      )}

      {results && !detailLoading && (
        <>
          <div className="section-title">Results ({results.length})</div>
          {results.length === 0 ? (
            <div className="empty"><p>No teams found. Try a different search.</p></div>
          ) : (
            <div className="card">
              {results.map(team => (
                <div key={team.number} className="card-row" onClick={() => viewTeamDetail(team.number)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div className="team-avatar">
                      {String(team.number).slice(-3)}
                    </div>
                    <div className="card-row-left">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="card-row-number">#{team.number}</span>
                        {team.quickStats && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>
                            {team.quickStats.tot.value.toFixed(1)} OPR
                          </span>
                        )}
                      </div>
                      <span className="card-row-name">{team.name}</span>
                      {team.location?.city && (
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={10} /> {team.location.city}, {team.location.state}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-row-right">
                    {!isAdded(team.number) ? (
                      <button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); addTeamToList(team); }} style={{ padding: '4px 8px' }}>
                        <Plus size={12} /> Add
                      </button>
                    ) : (
                      <span className="badge badge-success"><Check size={10} /> Added</span>
                    )}
                    <ChevronRight size={16} color="var(--text-secondary)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!results && !loading && (
        <div className="empty" style={{ paddingTop: 60 }}>
          <Globe size={48} />
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Search any FTC team</p>
          <p style={{ fontSize: 12 }}>Data from FTCScout.org: OPR, events, awards</p>
        </div>
      )}
    </>
  );
}
