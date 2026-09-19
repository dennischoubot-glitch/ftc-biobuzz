import { useMemo, useState, useEffect } from 'react';
import { RefreshCw, Globe, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { getTeamDetail } from '../utils/ftcscout';

export default function TeamDetail({ team, data, update, onBack, onDelete }) {
  const [ftcData, setFtcData] = useState(data.ftcScoutCache?.[team.number] || null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function fetchFTCData() {
    setLoading(true);
    try {
      const d = await getTeamDetail(Number(team.number));
      setFtcData(d);
      update(prev => ({
        ...prev,
        ftcScoutCache: { ...prev.ftcScoutCache, [team.number]: { ...d, fetchedAt: Date.now() } },
      }));
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => {
    if (!ftcData) fetchFTCData();
  }, [team.number]);

  const entries = useMemo(() =>
    data.scoutingEntries
      .filter(e => String(e.teamNumber) === String(team.number))
      .sort((a, b) => b.timestamp - a.timestamp),
    [data, team]
  );

  const stats = useMemo(() => {
    const numericAgg = {}, ratingAgg = {}, boolAgg = {}, selectAgg = {};
    entries.forEach(entry => {
      const form = data.forms.find(f => f.id === entry.formId);
      if (!form) return;
      form.questions.forEach(q => {
        const val = entry.answers[q.id];
        if (val === undefined || val === null || val === '') return;
        if (q.type === 'number') { (numericAgg[q.label] ??= []).push(Number(val)); }
        else if (q.type === 'rating') { (ratingAgg[q.label] ??= []).push(Number(val)); }
        else if (q.type === 'boolean') { (boolAgg[q.label] ??= { yes: 0, no: 0 })[val ? 'yes' : 'no']++; }
        else if (q.type === 'select') { (selectAgg[q.label] ??= {})[val] = ((selectAgg[q.label] ??= {})[val] || 0) + 1; }
      });
    });
    return { numericAgg, ratingAgg, boolAgg, selectAgg };
  }, [entries, data.forms]);

  const matchResults = useMemo(() =>
    data.matches.filter(m => [m.red1, m.red2, m.blue1, m.blue2].some(n => String(n) === String(team.number))),
    [data, team]
  );

  const qs = ftcData?.quickStats;

  function handleDelete() {
    if (onDelete) onDelete();
  }

  return (
    <>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 8 }}>
          <button className="btn btn-sm btn-secondary" onClick={fetchFTCData} disabled={loading}>
            {loading ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />} Refresh
          </button>
          <button className="btn btn-sm btn-secondary btn-delete" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={14} /> Remove
          </button>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', margin: '0 0 4px', letterSpacing: -0.5 }}>#{team.number}</h2>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{ftcData?.name || team.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          {ftcData?.schoolName || team.school}
          {ftcData?.location && ` — ${ftcData.location.city}, ${ftcData.location.state}`}
        </div>
        {ftcData?.rookieYear && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Rookie year: {ftcData.rookieYear}</div>}
        {ftcData?.website && (
          <a href={ftcData.website} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
            <ExternalLink size={11} /> Website
          </a>
        )}
      </div>

      <div className="tabs">
        {['overview', 'scouting', 'events', 'history'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {qs && (
            <>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Globe size={12} />
                FTCScout OPR — {ftcData?.statsSeason === 2025 ? 'BioBuzz 2025' : ftcData?.statsSeason === 2024 ? 'Into The Deep 2024' : 'Latest'}
              </div>
              <div className="stat-grid">
                <div className="stat-box">
                  <div className="stat-value">{qs.tot.value.toFixed(1)}</div>
                  <div className="stat-label">Total (#{qs.tot.rank})</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{qs.auto.value.toFixed(1)}</div>
                  <div className="stat-label">Auto (#{qs.auto.rank})</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{qs.dc.value.toFixed(1)}</div>
                  <div className="stat-label">TeleOp (#{qs.dc.rank})</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{qs.eg.value.toFixed(1)}</div>
                  <div className="stat-label">Endgame (#{qs.eg.rank})</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)', padding: '0 12px 8px' }}>
                Out of {qs.count.toLocaleString()} teams worldwide
              </div>
            </>
          )}

          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-value">{entries.length}</div>
              <div className="stat-label">Your Scouting</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{matchResults.length}</div>
              <div className="stat-label">Local Matches</div>
            </div>
          </div>

          {Object.keys(stats.ratingAgg).length > 0 && (
            <>
              <div className="section-title">Your Ratings</div>
              <div className="card">
                <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {Object.entries(stats.ratingAgg).map(([label, vals]) => {
                    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                    return (
                      <div key={label} style={{ textAlign: 'center', minWidth: 70 }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: avg >= 4 ? 'var(--success)' : avg >= 3 ? 'var(--warning)' : 'var(--danger)' }}>{avg.toFixed(1)}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {Object.keys(stats.boolAgg).length > 0 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(stats.boolAgg).map(([label, counts]) => {
                const rate = counts.yes / (counts.yes + counts.no);
                return (
                  <span key={label} className={`badge ${rate > 0.5 ? (label.toLowerCase().includes('broke') || label.toLowerCase().includes('penalt') ? 'badge-danger' : 'badge-success') : 'badge-primary'}`}>
                    {label.replace(/\?$/, '')}: {(rate * 100).toFixed(0)}%
                  </span>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'scouting' && (
        <>
          {Object.keys(stats.numericAgg).length > 0 && (
            <>
              <div className="section-title">Scoring Data</div>
              <div className="card">
                <div className="card-body">
                  {Object.entries(stats.numericAgg).map(([label, vals]) => {
                    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                    const max = Math.max(...vals);
                    const min = Math.min(...vals);
                    return (
                      <div key={label} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13 }}>{label}</span>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{avg.toFixed(1)}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Min: {min} | Max: {max} | {vals.length} obs</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {Object.keys(stats.selectAgg).length > 0 && (
            <>
              <div className="section-title">Selections</div>
              <div className="card">
                <div className="card-body">
                  {Object.entries(stats.selectAgg).map(([label, counts]) => {
                    const total = Object.values(counts).reduce((a, b) => a + b, 0);
                    return (
                      <div key={label} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</div>
                        {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([opt, count]) => (
                          <div key={opt} className="bar-row">
                            <div className="bar-label">{opt}</div>
                            <div className="bar-track">
                              <div className="bar-fill" style={{ width: `${(count / total) * 100}%` }}>{count}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {entries.length === 0 && <div className="empty"><p>No scouting data yet for this team.</p></div>}
        </>
      )}

      {tab === 'events' && (
        <>
          {ftcData?.events?.length > 0 ? (
            ftcData.events.map(ev => (
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
                        <div style={{ fontSize: 22, fontWeight: 800 }}>{ev.stats.qualMatchesPlayed}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Matches</div>
                      </div>
                    </div>
                    {ev.stats.avg && (
                      <div style={{ fontSize: 12 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Averages</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                          <div>Total: <strong>{ev.stats.avg.totalPoints?.toFixed(1)}</strong></div>
                          <div>Auto: <strong>{ev.stats.avg.autoPoints?.toFixed(1)}</strong></div>
                          <div>TeleOp: <strong>{ev.stats.avg.dcPoints?.toFixed(1)}</strong></div>
                        </div>
                      </div>
                    )}
                    {ev.stats.opr && (
                      <div style={{ fontSize: 12, marginTop: 8 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>OPR Breakdown</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                          <div>Total: <strong>{ev.stats.opr.totalPoints?.toFixed(1)}</strong></div>
                          <div>Auto: <strong>{ev.stats.opr.autoPoints?.toFixed(1)}</strong></div>
                          <div>TeleOp: <strong>{ev.stats.opr.dcPoints?.toFixed(1)}</strong></div>
                          {ev.stats.opr.autoArtifactPoints != null && <div>Auto Art.: <strong>{ev.stats.opr.autoArtifactPoints?.toFixed(1)}</strong></div>}
                          {ev.stats.opr.dcBasePoints != null && <div>Base: <strong>{ev.stats.opr.dcBasePoints?.toFixed(1)}</strong></div>}
                          {ev.stats.opr.dcArtifactPoints != null && <div>DC Art.: <strong>{ev.stats.opr.dcArtifactPoints?.toFixed(1)}</strong></div>}
                          {ev.stats.opr.dcDepotPoints != null && <div>Depot: <strong>{ev.stats.opr.dcDepotPoints?.toFixed(1)}</strong></div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : loading ? (
            <div className="empty"><Loader2 size={32} className="spin" /><p>Loading events...</p></div>
          ) : (
            <div className="empty"><p>No event data available.</p></div>
          )}
        </>
      )}

      {tab === 'history' && (
        <>
          <div className="section-title">Scouting History ({entries.length})</div>
          {entries.length === 0 ? (
            <div className="empty"><p>No scouting entries yet.</p></div>
          ) : (
            <div className="card">
              {entries.map(entry => {
                const form = data.forms.find(f => f.id === entry.formId);
                const textAnswers = form?.questions
                  .filter(q => q.type === 'text' && entry.answers[q.id])
                  .map(q => ({ label: q.label, value: entry.answers[q.id] })) || [];
                return (
                  <div key={entry.id} className="card-row" style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{entry.formName} {entry.matchNumber && `— Match ${entry.matchNumber}`}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {new Date(entry.timestamp).toLocaleDateString()} {entry.scoutName && `by ${entry.scoutName}`}
                      </span>
                    </div>
                    {textAnswers.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        {textAnswers.map(a => (
                          <div key={a.label} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            <strong>{a.label}:</strong> {a.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
              <Trash2 size={32} color="var(--danger)" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Remove Team #{team.number}?</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                This will remove <strong>{team.name || `Team ${team.number}`}</strong> from your team list. Scouting data will be kept.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Remove Team</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 24 }} />
    </>
  );
}
