import net from 'net';
import { useEffect, useRef, useState } from 'react';
import { Peer, ServerState } from './server';
import { ClientIndexMessage, GameState } from './state.interface';

const port = 1337;
const hostname = '127.0.0.1';

export type ClientState = {
  game: GameState | null;
  online: boolean;
};
export function useConnection({ enabled }: { enabled: boolean }): {
  clientState: ClientState;
  setIndex: (index: number) => void;
} {
  const [clientState, setClientState] = useState<ClientState>({
    game: null,
    online: false,
  });

  const clientRef = useRef<net.Socket | null>(null);

  const setIndex = (index: number) => {
    if (clientRef.current) {
      const data: ClientIndexMessage = { type: 'index', data: index };
      clientRef.current.write(JSON.stringify(data));
    }
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const client = new net.Socket();
    clientRef.current = client;

    client.connect(port, hostname, () => {
      setClientState((state) => ({ ...state, online: true }));
    });

    client.on('data', (data) => {
      const json: GameState = JSON.parse(data.toString());

      setClientState((state) => ({
        ...state,
        game: json,
      }));
    });

    client.on('close', () => {
      setClientState({ game: null, online: false });
    });

    client.on('error', () => {
      setClientState({ game: null, online: false });
    });

    return () => {
      client.destroy();
      clientRef.current = null;
    };
  }, [enabled]);

  return { clientState, setIndex };
}
