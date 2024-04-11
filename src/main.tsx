import { createRoot } from 'react-dom/client';
import * as React from 'react';

import { fetchMastersPlayers } from './masterscom';
import { Roster, fetchRosters } from './rosters';
import { linkRosters } from './linkroster';
import { RankedRoster, mkleaderboard } from './scoreroster';

type RemoteState = { leaderboard: Array<RankedRoster> }

async function fetchRemoteState(abort: AbortSignal): Promise<RemoteState> {
  const [mplayers, rosters] = await Promise.all([fetchMastersPlayers(abort), fetchRosters(abort)]);
  const linkedrosters = linkRosters(rosters, mplayers);
  return { leaderboard: mkleaderboard(linkedrosters) };
}

function StateRoot() {
  const [rstate, setState] = React.useState<RemoteState>(null);
  const [error, setError] = React.useState<Error>(null);
    
  React.useEffect(() => {
    const abort = new AbortController();
    fetchRemoteState(abort.signal)
      .then(setState)
      .catch((error) => { console.error(error); setError(error); })
    return () => abort.abort();
  }, []);

  if (error !== null) {
    return (
      <>
        <h1>Error</h1>
        <pre>{error.message}</pre>
        <pre>
          {error.stack}
        </pre>
      </>
    )
  }

  if (rstate !== null) {
    return <NavRoot {...{rstate}}/>
  }

  return (
    <>
      <h1>Loading...</h1>
    </>
  )
}

function NavRoot(props: {rstate: RemoteState}) {
  const [roster, setSelectedRoster] = React.useState<RankedRoster>(null);
  if (roster === null) {
    return <Leaderboard rstate={props.rstate} select={setSelectedRoster} />
  } else {
    return <TeamDetails {...{roster}} gohome={() => setSelectedRoster(null)}/>
  }
}

function LeaderboardEntry(props: { roster: RankedRoster, onClick: () => void }) {
  return (
    <>
      <tr onClick={props.onClick} style={{cursor: 'pointer'}}>
          <td>{props.roster.rank}</td>
          <td>{props.roster.teamname}</td>
          <td>{props.roster.score}</td>
      </tr>
    </>
  )
}

function Leaderboard(props: { rstate: RemoteState, select: (arg0: RankedRoster) => void }) {
  return (
    <>
      <h1>Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <td>Rank</td>
            <td>Team</td>
            <td>Par</td>
          </tr>
        </thead>
        <tbody>
           {props.rstate.leaderboard.map((roster) => 
            <LeaderboardEntry key={roster.csvroster.rowid} {...{roster}}
              onClick={() => props.select(roster)} />
          )}
        </tbody>
      </table>
    </>
  )
}



function TeamDetails(props: { roster: RankedRoster, gohome: Function  }) {
  return (
    <>
      <h1>{props.roster.teamname}</h1>
      <div>
        <button onClick={() => props.gohome()}>
          Back to Home
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <td>Player</td>
            <td>Par</td>
            <td>Top 5</td>
          </tr>
        </thead>
        <tbody>
          {props.roster.players.toSorted((a, b) => a.mplayer.prs - b.mplayer.prs).map((player) => 
            <tr key={player.mplayer.name} style={{color: props.roster.bestplayers.includes(player) ? 'green' : 'red'}}>
              <td>{player.mplayer.name}</td>
              <td>{player.mplayer.prs}</td>
              <td>{props.roster.bestplayers.includes(player) ? 'T' : 'F'}</td>
            </tr>  
          )}
        </tbody>
      </table>
    </>
  )
}



const rootel = document.getElementById('root');
const rroot = createRoot(rootel);

rroot.render(<StateRoot/>);


