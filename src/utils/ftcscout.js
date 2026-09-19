const API = 'https://api.ftcscout.org/graphql';

async function gql(query, variables = {}) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

export async function searchTeams(searchText, limit = 30) {
  const isNumber = /^\d+$/.test(searchText.trim());

  if (isNumber) {
    const num = parseInt(searchText.trim());
    const [directResult, searchResult] = await Promise.allSettled([
      gql(`query($n: Int!) { teamByNumber(number: $n) { number name schoolName location { city state country } rookieYear activeSeasons quickStats(season: 2024) { tot { value rank } auto { value rank } dc { value rank } eg { value rank } count } } }`, { n: num }),
      gql(`query($s: String!, $l: Int!) { teamsSearch(searchText: $s, limit: $l) { number name schoolName location { city state country } rookieYear activeSeasons } }`, { s: searchText.trim(), l: limit }),
    ]);

    const teams = new Map();
    if (directResult.status === 'fulfilled' && directResult.value.teamByNumber) {
      const t = directResult.value.teamByNumber;
      teams.set(t.number, t);
    }
    if (searchResult.status === 'fulfilled') {
      for (const t of searchResult.value.teamsSearch) {
        if (!teams.has(t.number)) teams.set(t.number, t);
      }
    }
    return Array.from(teams.values());
  }

  const data = await gql(`
    query($s: String!, $l: Int!) {
      teamsSearch(searchText: $s, limit: $l) {
        number name schoolName
        location { city state country }
        rookieYear activeSeasons
      }
    }
  `, { s: searchText.trim(), l: limit });
  return data.teamsSearch;
}

export async function getTeamDetail(number) {
  const data = await gql(`
    query($n: Int!) {
      teamByNumber(number: $n) {
        number name schoolName website
        location { city state country }
        rookieYear activeSeasons
        stats2025: quickStats(season: 2025) { tot { value rank } auto { value rank } dc { value rank } eg { value rank } count }
        stats2024: quickStats(season: 2024) { tot { value rank } auto { value rank } dc { value rank } eg { value rank } count }
        awards2025: awards(season: 2025) { type placement event { name } }
        awards2024: awards(season: 2024) { type placement event { name } }
        events2025: events(season: 2025) {
          eventCode
          event { name start end }
          stats {
            ... on TeamEventStats2025 {
              rank rp wins losses ties qualMatchesPlayed
              avg { totalPoints autoPoints dcPoints totalPointsNp autoLeavePoints autoArtifactPoints autoPatternPoints dcBasePoints dcArtifactPoints dcPatternPoints dcDepotPoints }
              opr { totalPoints autoPoints dcPoints autoLeavePoints autoArtifactPoints autoPatternPoints dcBasePoints dcArtifactPoints dcPatternPoints dcDepotPoints }
              max { totalPoints autoPoints dcPoints }
            }
          }
        }
        events2024: events(season: 2024) {
          eventCode
          event { name start end }
          stats {
            ... on TeamEventStats2024 {
              rank rp wins losses ties qualMatchesPlayed
              avg { totalPoints autoPoints dcPoints totalPointsNp }
              opr { totalPoints autoPoints dcPoints }
              max { totalPoints autoPoints dcPoints }
            }
          }
        }
      }
    }
  `, { n: number });

  const team = data.teamByNumber;
  if (!team) return null;

  team.quickStats = team.stats2025 || team.stats2024 || null;
  team.statsSeason = team.stats2025 ? 2025 : team.stats2024 ? 2024 : null;
  team.awards = [...(team.awards2025 || []), ...(team.awards2024 || [])];
  team.events = [...(team.events2025 || []), ...(team.events2024 || [])];
  team.eventsSeason = (team.events2025?.length > 0) ? 2025 : (team.events2024?.length > 0) ? 2024 : null;

  return team;
}

export async function getTeamQuickLookup(number) {
  const data = await gql(`
    query($n: Int!) {
      teamByNumber(number: $n) {
        number name schoolName
        location { city state }
        rookieYear activeSeasons
        stats2025: quickStats(season: 2025) { tot { value rank } auto { value rank } dc { value rank } eg { value rank } count }
        stats2024: quickStats(season: 2024) { tot { value rank } auto { value rank } dc { value rank } eg { value rank } count }
      }
    }
  `, { n: number });

  const team = data.teamByNumber;
  if (!team) return null;
  team.quickStats = team.stats2025 || team.stats2024 || null;
  team.statsSeason = team.stats2025 ? 2025 : team.stats2024 ? 2024 : null;
  return team;
}

export async function searchEvents(limit = 50, season = 2025) {
  const data = await gql(`
    query($l: Int!, $s: Int!) {
      eventsSearch(season: $s, limit: $l) {
        code name season type
        location { city state country }
        start end
      }
    }
  `, { l: limit, s: season });
  return data.eventsSearch;
}
