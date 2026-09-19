import { useState } from 'react';
import { Download, Upload, Trash2, Share2, Shield } from 'lucide-react';
import { exportData, importData } from '../utils/storage';

export default function SettingsView({ data, update }) {
  const [importStatus, setImportStatus] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);

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

  return (
    <>
      <div className="section-title">My Team</div>
      <div className="card">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Team Number</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 12345"
              value={data.myTeam?.number || ''}
              onChange={e => update(d => ({ ...d, myTeam: { ...d.myTeam, number: e.target.value } }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Team Name</label>
            <input
              className="form-input"
              placeholder="e.g. TechBots"
              value={data.myTeam?.name || ''}
              onChange={e => update(d => ({ ...d, myTeam: { ...d.myTeam, name: e.target.value } }))}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">School</label>
            <input
              className="form-input"
              placeholder="e.g. Lincoln High School"
              value={data.myTeam?.school || ''}
              onChange={e => update(d => ({ ...d, myTeam: { ...d.myTeam, school: e.target.value } }))}
            />
          </div>
        </div>
      </div>

      <div className="section-title">Data Management</div>
      <div className="card">
        <div className="card-row" onClick={shareData} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Share2 size={18} color="var(--primary)" />
            <div className="card-row-left">
              <span style={{ fontWeight: 600, fontSize: 14 }}>Share Data</span>
              <span className="card-row-name">Share scouting data with your team</span>
            </div>
          </div>
        </div>
        <div className="card-row" onClick={exportData} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Download size={18} color="var(--primary)" />
            <div className="card-row-left">
              <span style={{ fontWeight: 600, fontSize: 14 }}>Export Backup</span>
              <span className="card-row-name">Download all data as JSON</span>
            </div>
          </div>
        </div>
        <label className="card-row" style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Upload size={18} color="var(--primary)" />
            <div className="card-row-left">
              <span style={{ fontWeight: 600, fontSize: 14 }}>Import Data</span>
              <span className="card-row-name">Load from a JSON backup</span>
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
          <div className="stat-value">{data.forms.length}</div>
          <div className="stat-label">Forms</div>
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
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>BioBuzz Scout v2.0</div>
        <div>FIRST Tech Challenge 2025-2026</div>
        <div style={{ marginTop: 4, fontSize: 11 }}>Data stored locally on this device</div>
        <div style={{ marginTop: 2, fontSize: 11 }}>Stats from FTCScout.org</div>
      </div>
    </>
  );
}
