const STORAGE_KEY = 'ftc-biobuzz-data';

const defaultData = {
  myTeam: { number: '', name: '', school: '' },
  teams: [],
  matches: [],
  forms: [
    {
      id: 'match-scout',
      name: 'Match Scouting',
      description: 'BioBuzz 2026-2027 in-match scouting',
      questions: [
        // Autonomous
        { id: 'auto-leave', label: 'Auto: Left starting zone?', type: 'boolean', required: true, section: 'Autonomous' },
        { id: 'auto-artifacts-classified', label: 'Auto: Artifacts in classified zone', type: 'number', required: true, section: 'Autonomous' },
        { id: 'auto-artifacts-overflow', label: 'Auto: Artifacts in overflow zone', type: 'number', required: false, section: 'Autonomous' },
        { id: 'auto-pattern', label: 'Auto: Pattern bonus achieved?', type: 'boolean', required: true, section: 'Autonomous' },
        { id: 'auto-notes', label: 'Auto notes', type: 'text', required: false, section: 'Autonomous' },

        // Driver-Controlled
        { id: 'dc-base-level', label: 'DC: Max base level reached', type: 'select', options: ['None', 'Level 1', 'Level 2', 'Level 3'], required: true, section: 'TeleOp' },
        { id: 'dc-artifacts-classified', label: 'DC: Artifacts in classified zone', type: 'number', required: true, section: 'TeleOp' },
        { id: 'dc-artifacts-overflow', label: 'DC: Artifacts in overflow zone', type: 'number', required: false, section: 'TeleOp' },
        { id: 'dc-pattern', label: 'DC: Pattern bonus achieved?', type: 'boolean', required: true, section: 'TeleOp' },
        { id: 'dc-depot', label: 'DC: Artifacts deposited in depot', type: 'number', required: false, section: 'TeleOp' },

        // Endgame / RP
        { id: 'movement-rp', label: 'Movement RP earned?', type: 'boolean', required: false, section: 'Endgame' },
        { id: 'goal-rp', label: 'Goal RP earned?', type: 'boolean', required: false, section: 'Endgame' },
        { id: 'pattern-rp', label: 'Pattern RP earned?', type: 'boolean', required: false, section: 'Endgame' },

        // Qualitative
        { id: 'robot-speed', label: 'Robot speed', type: 'rating', max: 5, required: false, section: 'Performance' },
        { id: 'driver-skill', label: 'Driver skill', type: 'rating', max: 5, required: false, section: 'Performance' },
        { id: 'artifact-handling', label: 'Artifact handling accuracy', type: 'rating', max: 5, required: false, section: 'Performance' },
        { id: 'defense', label: 'Defense capability', type: 'rating', max: 5, required: false, section: 'Performance' },
        { id: 'breakdown', label: 'Robot broke down?', type: 'boolean', required: false, section: 'Performance' },
        { id: 'penalties', label: 'Penalties received', type: 'select', options: ['None', '1 Minor', '2+ Minor', 'Major'], required: false, section: 'Performance' },
        { id: 'match-notes', label: 'Match notes', type: 'text', required: false, section: 'Performance' },
      ],
    },
    {
      id: 'pit-scout',
      name: 'Pit Scouting',
      description: 'Interview teams in the pit area',
      questions: [
        { id: 'drivetrain', label: 'Drivetrain type', type: 'select', options: ['Mecanum', 'Tank/Differential', 'Swerve', 'Omni', 'Other'], required: true, section: 'Hardware' },
        { id: 'weight', label: 'Robot weight (lbs)', type: 'number', required: false, section: 'Hardware' },
        { id: 'frame-size', label: 'Robot fits in 18" cube?', type: 'boolean', required: true, section: 'Hardware' },

        { id: 'can-classify', label: 'Can classify artifacts?', type: 'boolean', required: true, section: 'Capabilities' },
        { id: 'artifact-capacity', label: 'Artifacts held at once', type: 'select', options: ['1', '2', '3+'], required: false, section: 'Capabilities' },
        { id: 'can-pattern', label: 'Can score pattern bonus?', type: 'boolean', required: true, section: 'Capabilities' },
        { id: 'max-base', label: 'Max base level', type: 'select', options: ['None', 'Level 1', 'Level 2', 'Level 3'], required: true, section: 'Capabilities' },
        { id: 'can-depot', label: 'Can deposit in depot?', type: 'boolean', required: false, section: 'Capabilities' },

        { id: 'auto-capable', label: 'Has autonomous routine?', type: 'boolean', required: true, section: 'Software' },
        { id: 'auto-desc', label: 'Autonomous description', type: 'text', required: false, section: 'Software' },
        { id: 'language', label: 'Programming language', type: 'select', options: ['Java', 'Kotlin', 'Blocks', 'OnBot Java', 'Other'], required: false, section: 'Software' },
        { id: 'vision', label: 'Uses vision/camera?', type: 'boolean', required: false, section: 'Software' },

        { id: 'strategy', label: 'Preferred strategy', type: 'text', required: false, section: 'Strategy' },
        { id: 'strengths', label: 'Team strengths', type: 'text', required: false, section: 'Strategy' },
        { id: 'weaknesses', label: 'Team weaknesses', type: 'text', required: false, section: 'Strategy' },
      ],
    },
    {
      id: 'alliance-pick',
      name: 'Alliance Picklist',
      description: 'Quick evaluation for alliance selection',
      questions: [
        { id: 'overall-rank', label: 'Overall robot quality', type: 'rating', max: 5, required: true, section: 'Rating' },
        { id: 'auto-rank', label: 'Autonomous reliability', type: 'rating', max: 5, required: true, section: 'Rating' },
        { id: 'teleop-rank', label: 'TeleOp scoring ability', type: 'rating', max: 5, required: true, section: 'Rating' },
        { id: 'endgame-rank', label: 'Endgame performance', type: 'rating', max: 5, required: true, section: 'Rating' },
        { id: 'partner-rank', label: 'Alliance partner compatibility', type: 'rating', max: 5, required: true, section: 'Rating' },
        { id: 'reliability', label: 'Reliability (no breakdowns)', type: 'rating', max: 5, required: true, section: 'Rating' },
        { id: 'would-pick', label: 'Would pick for alliance?', type: 'select', options: ['First pick', 'Second pick', 'Backup', 'Would not pick'], required: true, section: 'Decision' },
        { id: 'pick-notes', label: 'Notes for alliance selection', type: 'text', required: false, section: 'Decision' },
      ],
    },
  ],
  scoutingEntries: [],
  ftcScoutCache: {},
  picklist: [],
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed };
  } catch {
    return { ...defaultData };
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData() {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ftc-biobuzz-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        saveData({ ...defaultData, ...data });
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}

export function mergeData(incoming) {
  const current = loadData();
  const existingTeamKeys = new Set(current.teams.map(t => String(t.number)));
  const existingEntryIds = new Set(current.scoutingEntries.map(e => e.id));
  const existingMatchKeys = new Set(current.matches.map(m => `${m.matchNumber}-${m.red1}-${m.blue1}`));

  const newTeams = (incoming.teams || []).filter(t => !existingTeamKeys.has(String(t.number)));
  const newEntries = (incoming.scoutingEntries || []).filter(e => !existingEntryIds.has(e.id));
  const newMatches = (incoming.matches || []).filter(m => !existingMatchKeys.has(`${m.matchNumber}-${m.red1}-${m.blue1}`));

  const merged = {
    ...current,
    teams: [...current.teams, ...newTeams],
    scoutingEntries: [...current.scoutingEntries, ...newEntries],
    matches: [...current.matches, ...newMatches],
  };
  saveData(merged);
  return { merged, added: { teams: newTeams.length, entries: newEntries.length, matches: newMatches.length } };
}

export function importMergeFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const incoming = JSON.parse(e.target.result);
        const result = mergeData(incoming);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
