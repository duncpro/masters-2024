import { RosterPlayer, Roster } from './rosters';
import { MastersPlayer } from './masterscom';
import Fuse from 'fuse.js';

export type LinkedPlayer = {
  rplayer: RosterPlayer,
  mplayer: MastersPlayer
}

export type LinkedRoster = {
  teamname: string,
  players: Array<LinkedPlayer>,
  csvroster: Roster,
  totalhrem: number
}


export function linkRosters(rosters: Array<Roster>, players: Array<MastersPlayer>): Array<LinkedRoster> {
  const index = new Fuse(players, { keys: ['name'] });
  const lrosters: Array<LinkedRoster> = [];
  for (const csvroster of rosters) {
    let totalhrem = 0;
    const players: Array<LinkedPlayer> = [];
    for (const rplayer of csvroster.players) {
      const searchresults = index.search(rplayer.rpname);
      if (searchresults.length == 0) {
        console.error(`Failed to link RosterPlayer with MastersPlayer. Specifically, no matching` +
          ` MastersPlayer could be found for RosterPlayer with name: ${rplayer.rpname} on Roster: ${csvroster.teamname}.`);
        continue;
      }
      const mplayer: MastersPlayer = searchresults[0].item;
      totalhrem += mplayer.hrem;
      players.push({ rplayer, mplayer });
    }
    lrosters.push({ players, teamname: csvroster.teamname, csvroster, totalhrem });
  }
  return lrosters;
}

