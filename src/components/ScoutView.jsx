import { useState, useMemo } from 'react';
import { ClipboardList, ChevronRight, Check, Trash2, ArrowRight } from 'lucide-react';
import { generateId } from '../utils/storage';

function QuestionInput({ question, value, onChange }) {
  switch (question.type) {
    case 'number':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-sm btn-secondary" style={{ width: 40, height: 40, fontSize: 20, padding: 0, fontWeight: 800 }} onClick={() => onChange(Math.max(0, (Number(value) || 0) - 1))}>-</button>
          <input className="form-input" type="number" min="0" style={{ textAlign: 'center', width: 70, fontSize: 20, fontWeight: 800 }} value={value ?? ''} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
          <button className="btn btn-sm btn-primary" style={{ width: 40, height: 40, fontSize: 20, padding: 0, fontWeight: 800 }} onClick={() => onChange((Number(value) || 0) + 1)}>+</button>
        </div>
      );
    case 'text':
      return <textarea className="form-textarea" placeholder="Enter notes..." value={value || ''} onChange={e => onChange(e.target.value)} />;
    case 'select':
      return (
        <div className="toggle-group" style={{ flexWrap: 'wrap' }}>
          {question.options.map(opt => (
            <button key={opt} className={`toggle-btn ${value === opt ? 'active' : ''}`} onClick={() => onChange(opt)}>{opt}</button>
          ))}
        </div>
      );
    case 'boolean':
      return (
        <div className="toggle-group">
          <button className={`toggle-btn ${value === true ? 'active' : ''}`} style={value === true ? { background: 'var(--success-light)', borderColor: 'var(--success)', color: 'var(--success)' } : {}} onClick={() => onChange(true)}>Yes</button>
          <button className={`toggle-btn ${value === false ? 'active' : ''}`} style={value === false ? { background: 'var(--danger-light)', borderColor: 'var(--danger)', color: 'var(--danger)' } : {}} onClick={() => onChange(false)}>No</button>
        </div>
      );
    case 'rating':
      return (
        <div className="rating">
          {Array.from({ length: question.max || 5 }, (_, i) => (
            <button key={i} className={`rating-star ${value > i ? 'active' : ''}`} onClick={() => onChange(i + 1)}>{i + 1}</button>
          ))}
        </div>
      );
    default:
      return <input className="form-input" value={value || ''} onChange={e => onChange(e.target.value)} />;
  }
}

export default function ScoutView({ data, update, initialTeam, initialMatch }) {
  const [selectedForm, setSelectedForm] = useState(null);
  const [teamNumber, setTeamNumber] = useState(initialTeam || '');
  const [matchNumber, setMatchNumber] = useState(initialMatch || '');
  const [scoutName, setScoutName] = useState(localStorage.getItem('scout-name') || '');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const teamInfo = useMemo(() => {
    if (!teamNumber) return null;
    return data.teams.find(t => String(t.number) === String(teamNumber));
  }, [teamNumber, data.teams]);

  function setAnswer(qId, value) {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }

  function handleSubmit() {
    if (!teamNumber) { alert('Please enter a team number'); return; }
    const entry = {
      id: generateId(),
      formId: selectedForm.id,
      formName: selectedForm.name,
      teamNumber: String(teamNumber),
      matchNumber: String(matchNumber),
      scoutName,
      answers: { ...answers },
      timestamp: Date.now(),
    };
    update(d => ({ ...d, scoutingEntries: [...d.scoutingEntries, entry] }));
    if (scoutName) localStorage.setItem('scout-name', scoutName);
    setSubmitted(true);
  }

  function deleteEntry(id) {
    if (!confirm('Delete this scouting entry?')) return;
    update(d => ({ ...d, scoutingEntries: d.scoutingEntries.filter(e => e.id !== id) }));
  }

  function reset() {
    setAnswers({});
    setTeamNumber('');
    setMatchNumber('');
    setSubmitted(false);
    setSelectedForm(null);
  }

  function scoutAnother() {
    setAnswers({});
    setTeamNumber('');
    setMatchNumber('');
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="empty" style={{ paddingTop: 80 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '3px solid var(--success)' }}>
          <Check size={32} color="var(--success)" />
        </div>
        <h2 style={{ color: 'var(--success)', marginBottom: 8, fontSize: 22, fontWeight: 800 }}>Scouting Saved!</h2>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Team #{teamNumber} {teamInfo && `(${teamInfo.name})`}</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Match {matchNumber || 'N/A'}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          <button className="btn btn-primary" onClick={scoutAnother}>
            <ArrowRight size={16} /> Scout Another
          </button>
          <button className="btn btn-secondary" onClick={reset}>Back to Forms</button>
        </div>
      </div>
    );
  }

  if (!selectedForm) {
    return (
      <>
        <div className="section-title">Select a Scouting Form</div>
        <div className="card">
          {data.forms.map(form => (
            <div key={form.id} className="card-row" onClick={() => setSelectedForm(form)}>
              <div className="card-row-left">
                <span className="card-row-number" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ClipboardList size={16} /> {form.name}
                </span>
                <span className="card-row-name">{form.description || `${form.questions.length} questions`}</span>
              </div>
              <div className="card-row-right">
                <span className="badge badge-primary">{form.questions.length} Q</span>
                <ChevronRight size={16} color="var(--text-secondary)" />
              </div>
            </div>
          ))}
        </div>

        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 }}>
          <span>Recent Entries ({data.scoutingEntries.length})</span>
          {data.scoutingEntries.length > 0 && (
            <button className="btn btn-sm btn-secondary" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Hide' : 'Show all'}
            </button>
          )}
        </div>
        {data.scoutingEntries.length === 0 ? (
          <div className="empty"><p>No scouting data yet. Pick a form above to start.</p></div>
        ) : (
          <div className="card">
            {data.scoutingEntries.slice(showHistory ? 0 : -5).reverse().map(entry => (
              <div key={entry.id} className="card-row">
                <div className="card-row-left">
                  <span className="card-row-number">#{entry.teamNumber}</span>
                  <span className="card-row-name">
                    {entry.formName} {entry.matchNumber && `/ Match ${entry.matchNumber}`}
                    {entry.scoutName && ` (${entry.scoutName})`}
                  </span>
                </div>
                <div className="card-row-right">
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button className="btn btn-sm btn-secondary btn-delete" onClick={e => { e.stopPropagation(); deleteEntry(entry.id); }} style={{ padding: 4 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  const sections = {};
  selectedForm.questions.forEach(q => {
    const sec = q.section || 'General';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(q);
  });

  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null && answers[k] !== '').length;
  const totalQuestions = selectedForm.questions.length;

  return (
    <>
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{selectedForm.name}</div>
          <span className="badge badge-primary">{answeredCount}/{totalQuestions}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Team # *</label>
            <input className="form-input" type="number" placeholder="12345" value={teamNumber} onChange={e => setTeamNumber(e.target.value)} style={{ fontWeight: 700 }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Match #</label>
            <input className="form-input" type="number" placeholder="1" value={matchNumber} onChange={e => setMatchNumber(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Scout</label>
            <input className="form-input" placeholder="Name" value={scoutName} onChange={e => setScoutName(e.target.value)} />
          </div>
        </div>
        {teamInfo && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
            {teamInfo.name} {teamInfo.school && `(${teamInfo.school})`}
          </div>
        )}
      </div>

      <div style={{ padding: '0 12px 80px' }}>
        {Object.entries(sections).map(([section, questions]) => (
          <div key={section}>
            <div className="section-title" style={{ paddingLeft: 0 }}>{section}</div>
            {questions.map(q => (
              <div key={q.id} className="form-group">
                <label className="form-label">
                  {q.label} {q.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                </label>
                <QuestionInput question={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, zIndex: 10 }}>
        <button className="btn btn-secondary" onClick={() => setSelectedForm(null)} style={{ flex: 1 }}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} style={{ flex: 2, fontSize: 16, padding: '14px 20px', fontWeight: 800 }}>
          Submit Scouting
        </button>
      </div>
    </>
  );
}
