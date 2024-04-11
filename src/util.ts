import * as React from 'react';

// Denotes a condition which should always be true.
// If false, there is an inconsistency in the logic of the
// application. There is a bug.
export function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

export function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal.onabort = () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    }
  });
}

export type Poll<R> = (signal: AbortSignal) => Promise<R>;

export function usePoll<R>(initial: R, delay: number, poll: Poll<R>): [R, Error | null] {
  const [state, setState] = React.useState(initial);
  const [error, setError] = React.useState<Error>(null);
  
  React.useEffect(() => {
    const abortc = new AbortController();
    
    (async function() {
      for (;;) {
        try {
          const next = await poll(abortc.signal);  

          // In case poll() callback forgets to register the given AbortSignal,
          // manually check to ensure that the component was not unmounted
          // while poll() was being awaited. If it was unmounted, then
          // the signal will be aborted. We must break as to not call setState.
          // Recall setState should not be invoked within unmounted components.
          if (abortc.signal.aborted) return;
              
          setState(next); setError(null);
        } catch (caught) {
          // If aborted, then the component must have been unmounted.
          // Therefore the poll is no longer needed, thus return.
          if (caught.name === 'AbortError') { return; }

          // A non-AbortError occurred while invoking poll.
          // Note that the component may still have unmounted while awaiting
          // the completion of poll(), and so we must be careful not to invoke
          // setError in this case, as invoking setError (a state-setter) on an unmounted component
          // is illegal.  Recall that abortc.signal.aborted is true iff the component unmounted.
          if (abortc.signal.aborted) return;
          
          setError(caught);
        }

        // In this case poll() completed execution and the component is still mounted.
        // Thus we sleep in preparation for the next poll.
        try {
          await sleep(delay, abortc.signal);
        } catch (caught) {
          assert(caught.name === 'AbortError', 'sleep() only thows AbortErrors');

          // If an AbortError occurred, then the component must have been unmoutned while
          // awaiting the completion of sleep. In this case the poll is no longer needed.
          return;
        }
      }
    })();
    
    return () => abortc.abort();
  }, []);
  return [state, error];
}
