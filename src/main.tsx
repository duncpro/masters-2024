import { createRoot } from 'react-dom/client';
import * as React from 'react';

import { fetchMastersPlayers } from './masterscom';
import { fetchRosters } from './rosters';
import { linkRosters } from './linkroster';
import { RankedRoster, mkleaderboard } from './scoreroster';
import { usePoll } from './util';

type RemoteState = { leaderboard: Array<RankedRoster> }

async function fetchRemoteState(abort: AbortSignal): Promise<RemoteState> {
  const [mplayers, rosters] = await Promise.all([fetchMastersPlayers(abort), fetchRosters(abort)]);
  const linkedrosters = linkRosters(rosters, mplayers);
  return { leaderboard: mkleaderboard(linkedrosters) };
}

function ErrorReport(props: { error: Error }) {
  return (
    <div style={{backgroundColor: 'palevioletred', border: '1px solid red', borderRadius: '2px'}}>
      <h1>Error</h1>
      <pre>{props.error.message}</pre>
      <pre>
        {props.error.stack}
      </pre>
    </div>
  )
}

function StateRoot() {
  const [rstate, error] = usePoll(null, 5000, 
    async (signal) => fetchRemoteState(signal));

  return (
    <>
      { error !== null ? <ErrorReport {...{error}} /> : null }
      { rstate === null ? <p>Loading...</p> : <NavRoot {...{rstate}} /> }
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
          {props.roster.players.map((player) => 
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


