import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, BarChart3 } from 'lucide-react';

export default function AnalyticsView({ data, onSelectTeam }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('oprTotal');
  const [compareMode, setCompareMode] = useState(false);
  const [compareTeams, setCompareTeams] = useState([]);

  const teamStats = useMemo(() => {
    const stats = {};

    data.teams.forEach(t => {
      stats[t.number] = {
        number: t.number,
        name: t.name,
        school: t.school || '',
        entries: [],
        numericAverages: {},
        ratingAverages: {},
        booleanRates: {},
        oprTotal: 0,
        oprAuto: 0,
        oprDC: 0,
        oprEG: 0,
        oprRank: null,
      };

      const cached = data.ftcScoutCache?.[t.number];
      if (cached?.quickStats) {
        const qs = cached.quickStats;
        stats[t.number].oprTotal = qs.tot.value;
        stats[t.number].oprAuto = qs.auto.value;
        stats[t.number].oprDC = qs.dc.value;
        stats[t.number].oprEG = qs.eg.value;
        stats[t.number].oprRank = qs.tot.rank;
      }
    });

    data.scoutingEntries.forEach(entry => {
      const num = entry.teamNumber;
      if (!stats[num]) {
        stats[num] = {
          number: num,
          name: data.teams.find(t => String(t.number) === String(num))?.name || `Team ${num}`,
          entries: [], numericAverages: {}, ratingAverages: {}, booleanRates: {},
          oprTotal: 0, oprAuto: 0, oprDC: 0, oprEG: 0, oprRank: null,
        };
      }
      stats[num].entries.push(entry);
    });

    Object.values(stats).forEach(team => {
      const numericAnswers = {}, ratingAnswers = {}, booleanAnswers = {};
      team.entries.forEach(entry => {
        const form = data.forms.find(f => f.id === entry.formId);
        if (!form) return;
        form.questions.forEach(q => {
          const val = entry.answers[q.id];
          if (val === undefined || val === null || val === '') return;
          if (q.type === 'number') (numericAnswers[q.label] ??= []).push(Number(val));
          else if (q.type === 'rating') (ratingAnswers[q.label] ??= []).push(Number(val));
          else if (q.type === 'boolean') { (booleanAnswers[q.label] ??= { yes: 0, no: 0 })[val ? 'yes' : 'no']++; }
        });
      });
      Object.entries(numericAnswers).forEach(([key, vals]) => { team.numericAverages[key] = vals.reduce((a, b) => a + b, 0) / vals.length; });
      Object.entries(ratingAnswers).forEach(([key, vals]) => { team.ratingAverages[key] = vals.reduce((a, b) => a + b, 0) / vals.length; });
      Object.entries(booleanAnswers).forEach(([key, counts]) => { team.booleanRates[key] = counts.yes / (counts.yes + counts.no); });

      const allRatings = Object.values(team.ratingAverages);
      team.avgRating = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
    });

    return Object.values(stats);
  }, [data]);

  const filtered = teamStats
    .filter(t =>
      t.number.toString().includes(search) ||
      t.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'oprTotal') return b.oprTotal - a.oprTotal;
      if (sortBy === 'oprAuto') return b.oprAuto - a.oprAuto;
      if (sortBy === 'oprDC') return b.oprDC - a.oprDC;
      if (sortBy === 'avgRating') return b.avgRating - a.avgRating;
      if (sortBy === 'entries') return b.entries.length - a.entries.length;
      return a.number.toString().localeCompare(b.number.toString());
    });

  const overallStats = useMemo(() => ({
    totalEntries: data.scoutingEntries.length,
    totalTeams: data.teams.length,
    teamsWithOPR: teamStats.filter(t => t.oprTotal !== 0).length,
    totalMatches: data.matches.length,
  }), [data, teamStats]);

  const toggleCompare = (num) => {
    setCompareTeams(prev =>
      prev.includes(num) ? prev.filter(n => n !== num) : prev.length < 4 ? [...prev, num] : prev
    );
  };

  const compareData = useMemo(() => {
    if (compareTeams.length < 2) return null;
    return compareTeams.map(num => teamStats.find(t => String(t.number) === String(num))).filter(Boolean);
  }, [compareTeams, teamStats]);

  const maxOPR = useMemo(() => Math.max(...teamStats.map(t => t.oprTotal), 1), [teamStats]);

  return (
    <>
      <div className="stat-grid stat-grid-4">
        <div className="stat-box stat-box-accent">
          <div className="stat-value">{overallStats.totalTeams}</div>
          <div className="stat-label">My Teams</div>
        </div>
        <div className="stat-box stat-box-accent">
          <div className="stat-value">{overallStats.teamsWithOPR}</div>
          <div className="stat-label">With OPR</div>
        </div>
        <div className="stat-box stat-box-accent">
          <div className="stat-value">{overallStats.totalEntries}</div>
          <div className="stat-label">Scouted</div>
        </div>
        <div className="stat-box stat-box-accent">
          <div className="stat-value">{overallStats.totalMatches}</div>
          <div className="stat-label">Matches</div>
        </div>
      </div>

      <div style={{ padding: '0 12px 8px', display: 'flex', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-secondary)' }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto', fontSize: 12, fontWeight: 600 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="oprTotal">OPR Total</option>
          <option value="oprAuto">OPR Auto</option>
          <option value="oprDC">OPR TeleOp</option>
          <option value="avgRating">Rating</option>
          <option value="entries"># Scouted</option>
          <option value="number">Number</option>
        </select>
      </div>

      <div style={{ padding: '0 12px 8px' }}>
        <button className={`btn btn-sm ${compareMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setCompareMode(!compareMode); setCompareTeams([]); }}>
          <ArrowUpDown size={14} /> {compareMode ? 'Exit Compare' : 'Compare Teams'}
        </button>
        {compareMode && <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>Tap teams to select (max 4)</span>}
      </div>

      {compareMode && compareData && (
        <div className="card" style={{ margin: '0 12px 8px' }}>
          <div className="card-header">
            <span>Comparing {compareData.length} teams</span>
          </div>
          <div className="card-body" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700 }}>Metric</th>
                  {compareData.map(t => (
                    <th key={t.number} style={{ padding: '6px 8px', color: 'var(--primary)', fontWeight: 800 }}>#{t.number}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'OPR Total', key: 'oprTotal' },
                  { label: 'OPR Auto', key: 'oprAuto' },
                  { label: 'OPR TeleOp', key: 'oprDC' },
                  { label: 'OPR Endgame', key: 'oprEG' },
                  { label: 'World Rank', key: 'oprRank' },
                  { label: 'Scouted', key: 'entries', isCount: true },
                  { label: 'Avg Rating', key: 'avgRating' },
                ].map(row => {
                  const values = compareData.map(t => row.isCount ? t[row.key]?.length : t[row.key]);
                  const best = row.key === 'oprRank' ? Math.min(...values.filter(Boolean)) : Math.max(...values);
                  return (
                    <tr key={row.key} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 600, fontSize: 11 }}>{row.label}</td>
                      {values.map((v, i) => (
                        <td key={i} style={{ padding: '6px 8px', textAlign: 'center', fontWeight: v === best && v ? 800 : 400, color: v === best && v ? 'var(--success)' : undefined }}>
                          {row.key === 'oprRank' ? (v ? `#${v}` : '—') : typeof v === 'number' ? v.toFixed(1) : v || '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.filter(t => t.oprTotal > 0).length >= 2 && (
        <div className="card" style={{ margin: '0 12px 8px' }}>
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BarChart3 size={14} /> OPR Distribution</span>
          </div>
          <div className="card-body" style={{ padding: '12px 16px' }}>
            {filtered.filter(t => t.oprTotal > 0).slice(0, 15).map(team => {
              const autoW = maxOPR > 0 ? (team.oprAuto / maxOPR) * 100 : 0;
              const dcW = maxOPR > 0 ? (team.oprDC / maxOPR) * 100 : 0;
              const egW = maxOPR > 0 ? (team.oprEG / maxOPR) * 100 : 0;
              return (
                <div key={team.number} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, width: 48, textAlign: 'right', color: 'var(--primary)', flexShrink: 0 }}>#{team.number}</span>
                  <div style={{ flex: 1, display: 'flex', height: 18, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                    <div style={{ width: `${autoW}%`, background: '#2196f3', transition: 'width 0.5s' }} title={`Auto: ${team.oprAuto.toFixed(1)}`} />
                    <div style={{ width: `${dcW}%`, background: '#ff9800', transition: 'width 0.5s' }} title={`TeleOp: ${team.oprDC.toFixed(1)}`} />
                    <div style={{ width: `${egW}%`, background: '#4caf50', transition: 'width 0.5s' }} title={`Endgame: ${team.oprEG.toFixed(1)}`} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, width: 36, flexShrink: 0 }}>{team.oprTotal.toFixed(0)}</span>
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 11 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#2196f3', display: 'inline-block' }} /> Auto</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#ff9800', display: 'inline-block' }} /> TeleOp</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#4caf50', display: 'inline-block' }} /> Endgame</span>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty">
          <BarChart3 size={48} />
          <p>No teams yet. Add teams in the Teams tab or search FTCScout.</p>
        </div>
      ) : (
        filtered.map((team, idx) => (
          <div
            key={team.number}
            className="card"
            onClick={() => {
              if (compareMode) { toggleCompare(team.number); return; }
              const t = data.teams.find(t => String(t.number) === String(team.number));
              if (t) onSelectTeam(t);
            }}
            style={{ cursor: 'pointer', border: compareTeams.includes(team.number) ? '2px solid var(--primary)' : undefined }}
          >
            <div className="card-body" style={{ padding: '10px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 15 }}>#{team.number}</span>
                  <span style={{ fontSize: 13 }}>{team.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {team.entries.length > 0 && <span className="badge badge-primary">{team.entries.length} scouted</span>}
                  {team.oprRank && <span className="badge badge-success">#{team.oprRank}</span>}
                </div>
              </div>

              {team.oprTotal !== 0 && (
                <>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, marginTop: 4 }}>
                    <span>OPR: <strong>{team.oprTotal.toFixed(1)}</strong></span>
                    <span>Auto: <strong>{team.oprAuto.toFixed(1)}</strong></span>
                    <span>TeleOp: <strong>{team.oprDC.toFixed(1)}</strong></span>
                    <span>EG: <strong>{team.oprEG.toFixed(1)}</strong></span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <div className="bar-track" style={{ height: 6 }}>
                      <div className="bar-fill" style={{ width: `${(team.oprTotal / maxOPR) * 100}%`, height: 6, padding: 0 }} />
                    </div>
                  </div>
                </>
              )}

              {Object.keys(team.ratingAverages).length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {Object.entries(team.ratingAverages).slice(0, 4).map(([label, avg]) => (
                    <span key={label} style={{ fontSize: 11, color: avg >= 4 ? 'var(--success)' : avg >= 3 ? 'var(--warning)' : 'var(--danger)' }}>
                      {label.replace(/^(Auto|TeleOp|DC|Endgame):\s*/i, '').slice(0, 15)}: <strong>{avg.toFixed(1)}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </>
  );
}
