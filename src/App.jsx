import { useState } from 'react';
import { Users, Calendar, ClipboardList, BarChart3, Settings, FileEdit, Globe, ListOrdered, ArrowLeft } from 'lucide-react';
import { useData } from './hooks/useData';
import TeamsView from './components/TeamsView';
import MatchesView from './components/MatchesView';
import ScoutView from './components/ScoutView';
import FormsView from './components/FormsView';
import AnalyticsView from './components/AnalyticsView';
import FTCSearchView from './components/FTCSearchView';
import TeamDetail from './components/TeamDetail';
import SettingsView from './components/SettingsView';
import PicklistView from './components/PicklistView';

const TABS = [
  { id: 'search', label: 'Lookup', icon: Globe },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'matches', label: 'Matches', icon: Calendar },
  { id: 'scout', label: 'Scout', icon: ClipboardList },
  { id: 'picklist', label: 'Picks', icon: ListOrdered },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
];

export default function App() {
  const [data, update] = useData();
  const [tab, setTab] = useState('search');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [scoutTarget, setScoutTarget] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showForms, setShowForms] = useState(false);

  function handleSelectTeam(team) {
    setSelectedTeam(team);
  }

  function handleDeleteTeam(teamId) {
    update(d => ({ ...d, teams: d.teams.filter(t => t.id !== teamId) }));
    setSelectedTeam(null);
  }

  function handleScoutFromMatch(teamNumber, matchNumber) {
    setScoutTarget({ team: teamNumber, match: matchNumber });
    setTab('scout');
  }

  function renderContent() {
    if (showSettings) {
      return <SettingsView data={data} update={update} />;
    }
    if (showForms) {
      return <FormsView data={data} update={update} />;
    }
    if (selectedTeam) {
      return <TeamDetail team={selectedTeam} data={data} update={update} onBack={() => setSelectedTeam(null)} onDelete={() => handleDeleteTeam(selectedTeam.id)} />;
    }
    switch (tab) {
      case 'search':
        return <FTCSearchView data={data} update={update} onViewTeam={handleSelectTeam} />;
      case 'teams':
        return <TeamsView data={data} update={update} onSelectTeam={handleSelectTeam} />;
      case 'matches':
        return <MatchesView data={data} update={update} onScout={handleScoutFromMatch} />;
      case 'scout':
        return (
          <ScoutView
            data={data}
            update={update}
            initialTeam={scoutTarget?.team || ''}
            initialMatch={scoutTarget?.match || ''}
          />
        );
      case 'picklist':
        return <PicklistView data={data} update={update} onSelectTeam={handleSelectTeam} />;
      case 'analytics':
        return <AnalyticsView data={data} onSelectTeam={handleSelectTeam} />;
      default:
        return null;
    }
  }

  const isSubView = showSettings || showForms || selectedTeam;

  const headerTitle = showSettings ? 'Settings'
    : showForms ? 'Scouting Forms'
    : selectedTeam ? `Team #${selectedTeam.number}`
    : null;

  return (
    <>
      <div className="header">
        {isSubView && (
          <button className="header-back" onClick={() => {
            if (showSettings) setShowSettings(false);
            else if (showForms) setShowForms(false);
            else if (selectedTeam) setSelectedTeam(null);
          }}>
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h1>{headerTitle || 'BioBuzz Scout'}</h1>
          {!isSubView && <div className="header-season">FTC 2025-2026 Season</div>}
        </div>
        {!isSubView && (
          <div className="nav">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`nav-item ${tab === t.id ? 'active' : ''}`}
                onClick={() => { setTab(t.id); setScoutTarget(null); }}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 4 }}>
          {!isSubView && (
            <>
              <button className="header-action" onClick={() => setShowForms(true)} title="Edit Forms">
                <FileEdit size={18} />
              </button>
              <button className="header-action" onClick={() => setShowSettings(true)} title="Settings">
                <Settings size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="content">
        {renderContent()}
      </div>
    </>
  );
}
