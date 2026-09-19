import { useState } from 'react';
import { ChevronRight, Plus, Search, Trash2, Edit2, RefreshCw, Loader2, Users } from 'lucide-react';
import { generateId } from '../utils/storage';
import { getTeamQuickLookup } from '../utils/ftcscout';

export default function TeamsView({ data, update, onSelectTeam }) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [form, setForm] = useState({ number: '', name: '', school: '', notes: '' });
  const [fetchingAll, setFetchingAll] = useState(false);

  const filtered = data.teams
    .filter(t =>
      t.number.toString().includes(search) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.school || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aOPR = data.ftcScoutCache?.[a.number]?.quickStats?.tot?.value || 0;
      const bOPR = data.ftcScoutCache?.[b.number]?.quickStats?.tot?.value || 0;
      return bOPR - aOPR || a.number - b.number;
    });

  const getOPR = (num) => data.ftcScoutCache?.[num]?.quickStats?.tot?.value;
  const getRank = (num) => data.ftcScoutCache?.[num]?.quickStats?.tot?.rank;
  const getScoutCount = (num) => data.scoutingEntries.filter(e => e.teamNumber === String(num)).length;

  function handleSave() {
    if (!form.number) return;
    if (editTeam) {
      update(d => ({ ...d, teams: d.teams.map(t => t.id === editTeam.id ? { ...t, ...form } : t) }));
    } else {
      update(d => ({ ...d, teams: [...d.teams, { id: generateId(), ...form }] }));
    }
    setForm({ number: '', name: '', school: '', notes: '' });
    setShowAdd(false);
    setEditTeam(null);
  }

  function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm('Remove this team from your list?')) return;
    update(d => ({ ...d, teams: d.teams.filter(t => t.id !== id) }));
  }

  function startEdit(team, e) {
    e.stopPropagation();
    setForm({ number: team.number, name: team.name, school: team.school || '', notes: team.notes || '' });
    setEditTeam(team);
    setShowAdd(true);
  }

  async function fetchAllOPR() {
    setFetchingAll(true);
    const cache = { ...data.ftcScoutCache };
    for (const team of data.teams) {
      if (!team.number) continue;
      try {
        const d = await getTeamQuickLookup(Number(team.number));
        if (d) {
          cache[team.number] = { ...cache[team.number], ...d, fetchedAt: Date.now() };
          if (d.name && !team.name) {
            update(prev => ({
              ...prev,
              teams: prev.teams.map(t => t.id === team.id ? { ...t, name: d.name, school: d.schoolName || t.school } : t),
            }));
          }
        }
      } catch {}
    }
    update(prev => ({ ...prev, ftcScoutCache: cache }));
    setFetchingAll(false);
  }

  return (
    <>
      <div style={{ padding: '8px 12px', display: 'flex', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-secondary)' }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {data.teams.length > 0 && (
          <button className="btn btn-sm btn-secondary" onClick={fetchAllOPR} disabled={fetchingAll} title="Fetch OPR for all teams">
            {fetchingAll ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
          </button>
        )}
      </div>

      <div style={{ padding: '12px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
          {filtered.length} team{filtered.length !== 1 ? 's' : ''}, sorted by OPR
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <Users size={48} />
          <p>{data.teams.length === 0 ? 'No teams yet. Tap + to add teams, or use the Lookup tab to search FTCScout.' : 'No teams match your search.'}</p>
        </div>
      ) : (
        <div className="card">
          {filtered.map((team) => {
            const opr = getOPR(team.number);
            const rank = getRank(team.number);
            const scouted = getScoutCount(team.number);
            return (
              <div key={team.id} className="card-row" onClick={() => onSelectTeam(team)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div className="team-avatar">
                    {String(team.number).slice(-3)}
                  </div>
                  <div className="card-row-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="card-row-number">#{team.number}</span>
                      {opr != null && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: opr >= 100 ? 'var(--success)' : opr >= 50 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                          {opr.toFixed(1)} OPR
                        </span>
                      )}
                    </div>
                    <span className="card-row-name">{team.name || 'Unknown'}</span>
                    {team.school && <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{team.school}</span>}
                  </div>
                </div>
                <div className="card-row-right">
                  {rank && <span className="badge badge-success">#{rank}</span>}
                  {scouted > 0 && <span className="badge badge-primary">{scouted}</span>}
                  <button className="btn btn-sm btn-secondary" onClick={(e) => startEdit(team, e)} style={{ padding: 4 }}>
                    <Edit2 size={12} />
                  </button>
                  <button className="btn btn-sm btn-secondary btn-delete" onClick={(e) => handleDelete(team.id, e)} style={{ padding: 4 }}>
                    <Trash2 size={12} />
                  </button>
                  <ChevronRight size={16} color="var(--text-secondary)" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ padding: '8px 16px' }}>
        <button className="btn-add" onClick={() => { setForm({ number: '', name: '', school: '', notes: '' }); setEditTeam(null); setShowAdd(true); }}>
          <Plus size={16} /> Add Team
        </button>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">
              {editTeam ? 'Edit Team' : 'Add Team'}
              <button className="btn btn-sm btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
            <div className="form-group">
              <label className="form-label">Team Number *</label>
              <input className="form-input" type="number" placeholder="e.g. 12345" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input className="form-input" placeholder="e.g. TechBots" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">School / Organization</label>
              <input className="form-input" placeholder="e.g. Lincoln High School" value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Any notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-block" onClick={handleSave}>
              {editTeam ? 'Save Changes' : 'Add Team'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
