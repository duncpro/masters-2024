import { LinkedRoster, LinkedPlayer } from './linkroster';

export type ScoredRoster = LinkedRoster & { 
  bestplayers: Array<LinkedPlayer>,
  score: number,
  penalties: Map<LinkedPlayer, number>
}

export function scoreroster(roster: LinkedRoster): ScoredRoster {
  const penalties = new Map<LinkedPlayer, number>();
  for (const player of roster.players) {
    if (player.mplayer.eliminated) {
      penalties.set(player, 10);
    }
  }
  
  const players = roster.players.toSorted(
    (a, b) => (a.mplayer.prs + (penalties.get(a) || 0)) - (b.mplayer.prs + (penalties.get(b) || 0)));
  
  let score = 0;
  const bestplayers: Array<LinkedPlayer> = [];
  for (let i = 0; i < 5; i++) {
    score += players[i].mplayer.prs;
    score += penalties.get(players[i]) || 0;
    bestplayers.push(players[i]);
  }


  return { ...roster, score, bestplayers, players, penalties };
}

export type RankedRoster = ScoredRoster & { rank: number };

export function rank(rosters: Array<ScoredRoster>): Array<RankedRoster> {
  const sorted = rosters.toSorted((a, b) => a.score - b.score);  
  const scores = sorted.map((roster) => roster.score);

  for (let i = 1; i < scores.length; i++) {
    if (scores[i - 1] === scores[i]) {
      scores.splice(i, 1);
      i -= 1;
    }
  }

  const ranked: Array<RankedRoster> = [];
  for (const roster of sorted) {
    const rank = scores.indexOf(roster.score) + 1;
    ranked.push({ ...roster, rank });
  }
  return ranked;
}

export function mkleaderboard(rosters: Array<LinkedRoster>): Array<RankedRoster> {
  return rank(rosters.map(scoreroster));
}
