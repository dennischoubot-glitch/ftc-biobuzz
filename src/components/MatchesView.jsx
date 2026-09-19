import { useState, useMemo } from 'react';
import { Plus, Trash2, ClipboardList, TrendingUp } from 'lucide-react';
import { generateId } from '../utils/storage';

export default function MatchesView({ data, update, onScout }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    matchNumber: '',
    red1: '', red2: '',
    blue1: '', blue2: '',
    redScore: '', blueScore: '',
  });

  function handleSave() {
    if (!form.matchNumber) return;
    update(d => ({
      ...d,
      matches: [...d.matches, { id: generateId(), ...form, timestamp: Date.now() }]
        .sort((a, b) => Number(a.matchNumber) - Number(b.matchNumber)),
    }));
    setForm({ matchNumber: '', red1: '', red2: '', blue1: '', blue2: '', redScore: '', blueScore: '' });
    setShowAdd(false);
  }

  function deleteMatch(id) {
    if (!confirm('Delete this match?')) return;
    update(d => ({ ...d, matches: d.matches.filter(m => m.id !== id) }));
  }

  function updateScore(id, field, value) {
    update(d => ({
      ...d,
      matches: d.matches.map(m => m.id === id ? { ...m, [field]: value } : m),
    }));
  }

  const myNum = data.myTeam?.number;
  const isMyTeam = (num) => myNum && String(num) === String(myNum);

  const teamName = (num) => {
    if (!num) return '';
    const t = data.teams.find(t => String(t.number) === String(num));
    return t ? t.name : `Team ${num}`;
  };

  const getOPR = (num) => data.ftcScoutCache?.[num]?.quickStats?.tot?.value || 0;

  const getWinner = (match) => {
    const r = Number(match.redScore);
    const b = Number(match.blueScore);
    if (!r && !b) return null;
    if (r > b) return 'red';
    if (b > r) return 'blue';
    return 'tie';
  };

  const predictions = useMemo(() => {
    const preds = {};
    data.matches.forEach(match => {
      const redOPR = getOPR(match.red1) + getOPR(match.red2);
      const blueOPR = getOPR(match.blue1) + getOPR(match.blue2);
      if (redOPR > 0 || blueOPR > 0) {
        const diff = redOPR - blueOPR;
        const confidence = Math.min(Math.abs(diff) / Math.max(redOPR, blueOPR, 1) * 100, 99);
        preds[match.id] = {
          redOPR: redOPR.toFixed(1),
          blueOPR: blueOPR.toFixed(1),
          predicted: diff > 0 ? 'red' : diff < 0 ? 'blue' : 'tie',
          confidence: confidence.toFixed(0),
        };
      }
    });
    return preds;
  }, [data]);

  const record = useMemo(() => {
    if (!myNum) return null;
    let wins = 0, losses = 0, ties = 0;
    data.matches.forEach(m => {
      const winner = getWinner(m);
      if (!winner) return;
      const myAlliance = (isMyTeam(m.red1) || isMyTeam(m.red2)) ? 'red' : (isMyTeam(m.blue1) || isMyTeam(m.blue2)) ? 'blue' : null;
      if (!myAlliance) return;
      if (winner === 'tie') ties++;
      else if (winner === myAlliance) wins++;
      else losses++;
    });
    if (wins + losses + ties === 0) return null;
    return { wins, losses, ties };
  }, [data, myNum]);

  return (
    <>
      <div style={{ padding: '12px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Match Schedule</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {data.matches.length} match{data.matches.length !== 1 ? 'es' : ''}
            {record && (
              <span style={{ marginLeft: 8 }}>
                Record: <span className="score-win">{record.wins}W</span>-<span className="score-loss">{record.losses}L</span>
                {record.ties > 0 && `-${record.ties}T`}
              </span>
            )}
          </div>
        </div>
        <button className="btn-add" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Match
        </button>
      </div>

      {data.matches.length === 0 ? (
        <div className="empty">
          <ClipboardList size={48} />
          <p>No matches added yet.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Add your match schedule to track scores and predict outcomes.</p>
        </div>
      ) : (
        data.matches.map(match => {
          const myAlliance = isMyTeam(match.red1) || isMyTeam(match.red2) ? 'red' : isMyTeam(match.blue1) || isMyTeam(match.blue2) ? 'blue' : null;
          const winner = getWinner(match);
          const pred = predictions[match.id];
          return (
            <div key={match.id} className="card">
              <div className="card-header">
                <span style={{ fontSize: 15, fontWeight: 800 }}>Match {match.matchNumber}</span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {myAlliance && <span className={`badge ${myAlliance === 'red' ? 'badge-danger' : 'badge-blue'}`}>Your match</span>}
                  {winner && winner !== 'tie' && (
                    <span className={`badge ${winner === 'red' ? 'badge-danger' : 'badge-blue'}`}>
                      {winner === 'red' ? 'Red' : 'Blue'} wins
                    </span>
                  )}
                  <button className="btn btn-sm btn-secondary btn-delete" onClick={() => deleteMatch(match.id)} style={{ padding: 4 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid var(--border)` }}>
                <div style={{ padding: '12px 14px', borderRight: '1px solid var(--border)', background: winner === 'red' ? 'var(--danger-light)' : undefined }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', marginBottom: 4, letterSpacing: 0.5 }}>RED ALLIANCE</div>
                  <div style={{ fontSize: 13, fontWeight: isMyTeam(match.red1) ? 700 : 400, marginBottom: 2 }}>
                    {match.red1 ? `#${match.red1}` : '—'} {match.red1 && <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{teamName(match.red1)}</span>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: isMyTeam(match.red2) ? 700 : 400, marginBottom: 6 }}>
                    {match.red2 ? `#${match.red2}` : '—'} {match.red2 && <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{teamName(match.red2)}</span>}
                  </div>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Score"
                    value={match.redScore}
                    onChange={e => updateScore(match.id, 'redScore', e.target.value)}
                    style={{ padding: '6px 8px', fontSize: 18, fontWeight: 800, color: 'var(--danger)', textAlign: 'center' }}
                  />
                </div>
                <div style={{ padding: '12px 14px', background: winner === 'blue' ? '#e3f2fd' : undefined }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1565c0', marginBottom: 4, letterSpacing: 0.5 }}>BLUE ALLIANCE</div>
                  <div style={{ fontSize: 13, fontWeight: isMyTeam(match.blue1) ? 700 : 400, marginBottom: 2 }}>
                    {match.blue1 ? `#${match.blue1}` : '—'} {match.blue1 && <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{teamName(match.blue1)}</span>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: isMyTeam(match.blue2) ? 700 : 400, marginBottom: 6 }}>
                    {match.blue2 ? `#${match.blue2}` : '—'} {match.blue2 && <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{teamName(match.blue2)}</span>}
                  </div>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Score"
                    value={match.blueScore}
                    onChange={e => updateScore(match.id, 'blueScore', e.target.value)}
                    style={{ padding: '6px 8px', fontSize: 18, fontWeight: 800, color: '#1565c0', textAlign: 'center' }}
                  />
                </div>
              </div>

              {pred && !winner && (
                <div style={{ padding: '8px 14px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <TrendingUp size={14} color="var(--primary)" />
                  <span style={{ fontWeight: 600 }}>OPR Prediction:</span>
                  <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Red {pred.redOPR}</span>
                  <span>vs</span>
                  <span style={{ color: '#1565c0', fontWeight: 700 }}>Blue {pred.blueOPR}</span>
                  <span className={`badge ${pred.predicted === 'red' ? 'badge-danger' : 'badge-blue'}`} style={{ marginLeft: 'auto' }}>
                    {pred.predicted === 'red' ? 'Red' : 'Blue'} favored ({pred.confidence}%)
                  </span>
                </div>
              )}

              <div style={{ padding: '8px 14px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[match.red1, match.red2, match.blue1, match.blue2].filter(Boolean).map(num => (
                  <button key={num} className="btn btn-sm btn-secondary" onClick={() => onScout(num, match.matchNumber)} style={{ fontSize: 11 }}>
                    <ClipboardList size={11} /> Scout #{num}
                  </button>
                ))}
              </div>
            </div>
          );
        })
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              Add Match
              <button className="btn btn-sm btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
            <div className="form-group">
              <label className="form-label">Match Number *</label>
              <input className="form-input" type="number" placeholder="e.g. 1" value={form.matchNumber} onChange={e => setForm({ ...form, matchNumber: e.target.value })} />
            </div>
            <div className="section-title" style={{ padding: '8px 0', color: 'var(--danger)' }}>Red Alliance</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="form-group">
                <label className="form-label">Red 1</label>
                <input className="form-input" type="number" placeholder="Team #" value={form.red1} onChange={e => setForm({ ...form, red1: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Red 2</label>
                <input className="form-input" type="number" placeholder="Team #" value={form.red2} onChange={e => setForm({ ...form, red2: e.target.value })} />
              </div>
            </div>
            <div className="section-title" style={{ padding: '8px 0', color: '#1565c0' }}>Blue Alliance</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="form-group">
                <label className="form-label">Blue 1</label>
                <input className="form-input" type="number" placeholder="Team #" value={form.blue1} onChange={e => setForm({ ...form, blue1: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Blue 2</label>
                <input className="form-input" type="number" placeholder="Team #" value={form.blue2} onChange={e => setForm({ ...form, blue2: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary btn-block" onClick={handleSave}>Add Match</button>
          </div>
        </div>
      )}
    </>
  );
}
