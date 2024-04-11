import { parseCSV } from './csv';

export type RosterPlayer = {
  // The value of the name column in the spreadsheet.
  // This is not necessarily the actual name of the player
  // as it appears on masters.com
  rpname: string
}

export type Roster = {
  teamname: string,
  players: Array<RosterPlayer>,
  rowid: number
}

export async function fetchRosters(abort?: AbortSignal): Promise<Array<Roster>> {
  const rosters: Array<Roster> = [];
  const response = await fetch('rosters.csv', { signal: abort, cache: 'no-cache' });
  const body = await response.text();

  let rowid = 1;
  for (const entry of parseCSV(body, 1)) {
    const teamname: string = entry[0];
    const players: Array<RosterPlayer> = [];
    for (let i = 1; i < 9; i += 1) {
      players.push({ rpname: entry[i] })
    }
    rosters.push({ teamname, players, rowid });
    rowid += 1;
  }
  return rosters;
}
