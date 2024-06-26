const YEAR = 2024;
const MASTERS_COM_URL = `https://www.masters.com/en_US/scores/feeds/${YEAR}/scores.json`;

export type MastersPlayer = {
  eliminated: boolean,
  name: string,
  prs: number,  // par-relative score (null if players score is unknown)
  hrem: number // the total number of holes this person has yet to play in the tournament
}

export async function fetchMastersPlayers(abort?: AbortSignal): Promise<Array<MastersPlayer>> {
  const response = await fetch(MASTERS_COM_URL, { signal: abort, cache: 'no-cache' });
  const body: any = (await response.json()).data;

  const players: Array<MastersPlayer> = [];
  for (const rawpd of body.player) {
    const name = rawpd.first_name + ' ' + rawpd.last_name;
    
    const UNKNOWN_SCORE_INDICATORS = ['E', null, undefined, ''];
    const isUnknownScore = UNKNOWN_SCORE_INDICATORS.includes(rawpd.topar);
    const prs = isUnknownScore ? 0 : parseInt(rawpd.topar);
    let hrem = [...rawpd.round1.scores, ...rawpd.round2.scores, ...rawpd.round3.scores,
      ...rawpd.round4.scores]
      .filter(v => v === null)
      .length;

    const eliminated = !rawpd.pos;
    if (eliminated) hrem = 0;

    players.push({ name, prs, hrem, eliminated });
  }
  return players;
}
