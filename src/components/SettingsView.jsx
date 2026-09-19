import { useState } from 'react';
import { Download, Upload, Trash2, Share2, Shield, Users, Copy, Check, UserPlus } from 'lucide-react';
import { exportData, importData, importMergeFile, loadData } from '../utils/storage';

export default function SettingsView({ data, update }) {
  const [importStatus, setImportStatus] = useState(null);
  const [mergeResult, setMergeResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const scoutName = localStorage.getItem('scout-name') || '';

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    importData(file)
      .then((d) => {
        update(d);
        setImportStatus('success');
        setTimeout(() => setImportStatus(null), 3000);
      })
      .catch(() => {
        setImportStatus('error');
        setTimeout(() => setImportStatus(null), 3000);
      });
    e.target.value = '';
  }

  function handleMergeImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    importMergeFile(file)
      .then(({ merged, added }) => {
        update(merged);
        setMergeResult(added);
        setTimeout(() => setMergeResult(null), 5000);
      })
      .catch(() => {
        setImportStatus('error');
        setTimeout(() => setImportStatus(null), 3000);
      });
    e.target.value = '';
  }

  function clearAll() {
    if (!confirm('Delete ALL scouting data, teams, matches, and custom forms? This cannot be undone.')) return;
    if (!confirm('Are you really sure? This will erase everything.')) return;
    update({
      myTeam: { number: '', name: '', school: '' },
      teams: [],
      matches: [],
      scoutingEntries: [],
    });
  }

  async function shareData() {
    const exportObj = {
      teams: data.teams,
      scoutingEntries: data.scoutingEntries,
      matches: data.matches,
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(exportObj);
    if (navigator.share) {
      const blob = new Blob([json], { type: 'application/json' });
      const file = new File([blob], `biobuzz-scout-${new Date().toISOString().slice(0, 10)}.json`, { type: 'application/json' });
      try {
        await navigator.share({ files: [file], title: 'BioBuzz Scouting Data' });
      } catch {}
    } else {
      exportData();
    }
  }

  async function copyDataToClipboard() {
    const exportObj = {
      teams: data.teams,
      scoutingEntries: data.scoutingEntries,
      matches: data.matches,
      picklist: data.picklist,
      exportedAt: new Date().toISOString(),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportObj));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      exportData();
    }
  }

  function handleScoutNameChange(e) {
    localStorage.setItem('scout-name', e.target.value);
  }

  const scoutNames = [...new Set(data.scoutingEntries.map(e => e.scoutName).filter(Boolean))];

  return (
    <>
      <div className="section-title">Your Scout Profile</div>
      <div className="card">
        <div className="card-body">
          <div className="form-group" style={{ marginBottom: 8 }}>
            <label className="form-label">Your Name</label>
            <input
              className="form-input"
              placeholder="Enter your name"
              defaultValue={scoutName}
              onChange={handleScoutNameChange}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Your name is attached to every scouting entry you submit so the team knows who scouted what.
          </div>
        </div>
      </div>

      <div className="section-title">My Team</div>
      <div className="card">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Team Number</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 16278"
              value={data.myTeam?.number || ''}
              onChange={e => update(d => ({ ...d, myTeam: { ...d.myTeam, number: e.target.value } }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Team Name</label>
            <input
              className="form-input"
              placeholder="e.g. Error 404"
              value={data.myTeam?.name || ''}
              onChange={e => update(d => ({ ...d, myTeam: { ...d.myTeam, name: e.target.value } }))}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">School</label>
            <input
              className="form-input"
              placeholder="e.g. Lincoln Middle School"
              value={data.myTeam?.school || ''}
              onChange={e => update(d => ({ ...d, myTeam: { ...d.myTeam, school: e.target.value } }))}
            />
          </div>
        </div>
      </div>

      <div className="section-title">Team Sync</div>
      <div className="card">
        <div className="card-body" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingBottom: 8 }}>
          Each team member scouts on their own device. Use <strong>Merge Import</strong> to combine everyone's data without losing your own. Duplicates are automatically skipped.
        </div>
        <label className="card-row" style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserPlus size={18} color="var(--success)" />
            <div className="card-row-left">
              <span style={{ fontWeight: 600, fontSize: 14 }}>Merge Import</span>
              <span className="card-row-name">Add a teammate's data to yours (no overwrites)</span>
            </div>
          </div>
          <input type="file" accept=".json" onChange={handleMergeImport} style={{ display: 'none' }} />
        </label>
        <div className="card-row" onClick={shareData} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Share2 size={18} color="var(--primary)" />
            <div className="card-row-left">
              <span style={{ fontWeight: 600, fontSize: 14 }}>Share My Data</span>
              <span className="card-row-name">Send your scouting data to teammates</span>
            </div>
          </div>
        </div>
        <div className="card-row" onClick={copyDataToClipboard} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} color="var(--primary)" />}
            <div className="card-row-left">
              <span style={{ fontWeight: 600, fontSize: 14 }}>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              <span className="card-row-name">Copy data as text to paste to a teammate</span>
            </div>
          </div>
        </div>
      </div>

      {mergeResult && (
        <div className="card" style={{ margin: '8px 12px' }}>
          <div className="card-body" style={{ color: 'var(--success)', fontWeight: 600 }}>
            Merged! Added {mergeResult.teams} team{mergeResult.teams !== 1 ? 's' : ''}, {mergeResult.entries} scouting entr{mergeResult.entries !== 1 ? 'ies' : 'y'}, {mergeResult.matches} match{mergeResult.matches !== 1 ? 'es' : ''}.
          </div>
        </div>
      )}

      {scoutNames.length > 0 && (
        <>
          <div className="section-title">Active Scouts</div>
          <div className="card">
            {scoutNames.map(name => {
              const count = data.scoutingEntries.filter(e => e.scoutName === name).length;
              return (
                <div key={name} className="card-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--primary)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14,
                    }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="card-row-left">
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
                      <span className="card-row-name">{count} entr{count !== 1 ? 'ies' : 'y'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="section-title">Data Management</div>
      <div className="card">
        <div className="card-row" onClick={exportData} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Download size={18} color="var(--primary)" />
            <div className="card-row-left">
              <span style={{ fontWeight: 600, fontSize: 14 }}>Export Full Backup</span>
              <span className="card-row-name">Download all data as JSON file</span>
            </div>
          </div>
        </div>
        <label className="card-row" style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Upload size={18} color="var(--primary)" />
            <div className="card-row-left">
              <span style={{ fontWeight: 600, fontSize: 14 }}>Import (Replace All)</span>
              <span className="card-row-name">Overwrite with a backup file</span>
            </div>
          </div>
          <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </label>
      </div>

      {importStatus && (
        <div className="card" style={{ margin: '8px 12px' }}>
          <div className="card-body" style={{ color: importStatus === 'success' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
            {importStatus === 'success' ? 'Data imported successfully!' : 'Import failed. Check file format.'}
          </div>
        </div>
      )}

      <div className="section-title">Summary</div>
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-value">{data.teams.length}</div>
          <div className="stat-label">Teams</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{data.matches.length}</div>
          <div className="stat-label">Matches</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{data.scoutingEntries.length}</div>
          <div className="stat-label">Scouted</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{scoutNames.length}</div>
          <div className="stat-label">Scouts</div>
        </div>
      </div>

      <div className="section-title" style={{ color: 'var(--danger)' }}>Danger Zone</div>
      <div className="danger-zone">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Trash2 size={20} color="var(--danger)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--danger)' }}>Clear All Data</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Delete all teams, matches, and scouting entries</div>
          </div>
          <button className="btn btn-sm btn-danger" onClick={clearAll}>Clear</button>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '24px 20px 12px', color: 'var(--text-secondary)', fontSize: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>BioBuzz Scout v3.0</div>
        <div>FIRST Tech Challenge 2026-2027</div>
        <div style={{ marginTop: 4, fontSize: 11 }}>Data stored locally on this device</div>
        <div style={{ marginTop: 2, fontSize: 11 }}>Stats from FTCScout.org</div>
      </div>
    </>
  );
}
