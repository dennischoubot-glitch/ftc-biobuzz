import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus, X, GripVertical, ListOrdered } from 'lucide-react';

const TIERS = [
  { id: 'must-pick', label: 'Must Pick', color: 'var(--tier-1)', tierClass: 'tier-1' },
  { id: 'good-pick', label: 'Good Pick', color: 'var(--tier-2)', tierClass: 'tier-2' },
  { id: 'okay-pick', label: 'Backup', color: 'var(--tier-3)', tierClass: 'tier-3' },
  { id: 'do-not-pick', label: 'Do Not Pick', color: 'var(--tier-4)', tierClass: 'tier-4' },
];

export default function PicklistView({ data, update, onSelectTeam }) {
  const [showAdd, setShowAdd] = useState(false);
  const [addSearch, setAddSearch] = useState('');

  const picklist = data.picklist || [];

  function updatePicklist(newList) {
    update(d => ({ ...d, picklist: newList }));
  }

  function addTeam(team, tier) {
    if (picklist.some(p => String(p.number) === String(team.number))) return;
    const entry = {
      number: String(team.number),
      name: team.name || '',
      tier: tier,
      notes: '',
      addedAt: Date.now(),
    };
    updatePicklist([...picklist, entry]);
    setShowAdd(false);
    setAddSearch('');
  }

  function removeTeam(number) {
    if (!confirm('Remove from pick list?')) return;
    updatePicklist(picklist.filter(p => String(p.number) !== String(number)));
  }

  function changeTier(number, newTier) {
    updatePicklist(picklist.map(p => String(p.number) === String(number) ? { ...p, tier: newTier } : p));
  }

  function moveInTier(number, direction) {
    const idx = picklist.findIndex(p => String(p.number) === String(number));
    if (idx < 0) return;
    const item = picklist[idx];
    const sameT = picklist.filter(p => p.tier === item.tier);
    const posInTier = sameT.findIndex(p => String(p.number) === String(number));
    const targetPos = posInTier + direction;
    if (targetPos < 0 || targetPos >= sameT.length) return;

    const swapWith = sameT[targetPos];
    const newList = [...picklist];
    const idxA = newList.findIndex(p => String(p.number) === String(item.number));
    const idxB = newList.findIndex(p => String(p.number) === String(swapWith.number));
    [newList[idxA], newList[idxB]] = [newList[idxB], newList[idxA]];
    updatePicklist(newList);
  }

  const getOPR = (num) => data.ftcScoutCache?.[num]?.quickStats?.tot?.value;
  const getRank = (num) => data.ftcScoutCache?.[num]?.quickStats?.tot?.rank;

  const availableTeams = useMemo(() =>
    data.teams.filter(t => !picklist.some(p => String(p.number) === String(t.number)))
      .filter(t => {
        if (!addSearch) return true;
        return t.number.toString().includes(addSearch) || (t.name || '').toLowerCase().includes(addSearch.toLowerCase());
      }),
    [data.teams, picklist, addSearch]
  );

  const scoutingScore = (num) => {
    const entries = data.scoutingEntries.filter(e => String(e.teamNumber) === String(num));
    if (entries.length === 0) return null;
    let totalRating = 0, ratingCount = 0;
    entries.forEach(entry => {
      const form = data.forms.find(f => f.id === entry.formId);
      if (!form) return;
      form.questions.forEach(q => {
        if (q.type === 'rating' && entry.answers[q.id] != null) {
          totalRating += Number(entry.answers[q.id]);
          ratingCount++;
        }
      });
    });
    return ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null;
  };

  return (
    <>
      <div style={{ padding: '12px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Alliance Pick List</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{picklist.length} teams ranked</div>
        </div>
        <button className="btn btn-sm btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Team
        </button>
      </div>

      {picklist.length === 0 ? (
        <div className="empty" style={{ paddingTop: 60 }}>
          <ListOrdered size={48} style={{ opacity: 0.3, marginBottom: 12, display: 'inline-block' }} />
          <p>No teams in your pick list yet.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Add teams from your team list to rank them for alliance selection.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Teams
          </button>
        </div>
      ) : (
        TIERS.map(tier => {
          const tierTeams = picklist.filter(p => p.tier === tier.id);
          if (tierTeams.length === 0) return null;
          return (
            <div key={tier.id}>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: tier.color, display: 'inline-block' }} />
                {tier.label} ({tierTeams.length})
              </div>
              <div className="card">
                {tierTeams.map((item, idx) => {
                  const opr = getOPR(item.number);
                  const rank = getRank(item.number);
                  const scout = scoutingScore(item.number);
                  const overallRank = picklist.filter(p => p.tier === tier.id).indexOf(item);
                  return (
                    <div key={item.number} className="picklist-item">
                      <div className={`picklist-rank ${tier.tierClass}`}>
                        {overallRank + 1}
                      </div>
                      <div className="picklist-info" onClick={() => {
                        const t = data.teams.find(t => String(t.number) === String(item.number));
                        if (t) onSelectTeam(t);
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>#{item.number}</span>
                          {opr != null && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>{opr.toFixed(1)} OPR</span>}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.name}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                          {rank && <span className="badge badge-success" style={{ fontSize: 10 }}>World #{rank}</span>}
                          {scout && <span className="badge badge-primary" style={{ fontSize: 10 }}>Scout: {scout}/5</span>}
                        </div>
                      </div>
                      <div className="picklist-actions">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <button className="btn btn-sm btn-secondary" style={{ padding: 3 }} onClick={() => moveInTier(item.number, -1)}>
                            <ChevronUp size={12} />
                          </button>
                          <button className="btn btn-sm btn-secondary" style={{ padding: 3 }} onClick={() => moveInTier(item.number, 1)}>
                            <ChevronDown size={12} />
                          </button>
                        </div>
                        <button className="btn btn-sm btn-secondary btn-delete" onClick={() => removeTeam(item.number)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => { setShowAdd(false); setAddSearch(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">
              Add to Pick List
              <button className="btn btn-sm btn-secondary" onClick={() => { setShowAdd(false); setAddSearch(''); }}>
                <X size={14} />
              </button>
            </div>

            <input
              className="form-input"
              placeholder="Search your teams..."
              value={addSearch}
              onChange={e => setAddSearch(e.target.value)}
              style={{ marginBottom: 12 }}
            />

            {availableTeams.length === 0 ? (
              <div className="empty" style={{ padding: 20 }}>
                <p>{data.teams.length === 0 ? 'No teams added yet. Use the Teams or Lookup tab first.' : 'All your teams are already in the pick list.'}</p>
              </div>
            ) : (
              availableTeams.map(team => {
                const opr = getOPR(team.number);
                return (
                  <div key={team.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>#{team.number}</span>
                        <span style={{ fontSize: 13, marginLeft: 6 }}>{team.name}</span>
                        {opr != null && <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--success)' }}>{opr.toFixed(1)} OPR</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {TIERS.map(tier => (
                        <button
                          key={tier.id}
                          className="btn btn-sm"
                          style={{ flex: 1, fontSize: 10, padding: '5px 4px', background: tier.color, color: 'white', border: 'none', fontWeight: 700 }}
                          onClick={() => addTeam(team, tier.id)}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}
