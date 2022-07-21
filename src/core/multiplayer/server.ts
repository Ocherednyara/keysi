import net, { Socket } from 'net';
import { useEffect, useState } from 'react';
import { Test } from '../generate-test';
import { GameState } from './state.interface';

const port = 1337;

export type Peer = {
  socket: Socket;
  index: number;
};

export type ServerState = {
  peers: Peer[];
  online: boolean;
  test: Test | null;
};

export function useServer({ enabled }: { enabled: boolean }): {
  state: ServerState;
  setTest: (test: Test) => void;
} {
  const [serverState, setServerState] = useState<ServerState>({
    peers: [],
    online: false,
    test: null,
  });

  const setTest = (test: Test) => {
    setServerState({ ...serverState, test });
  };

  useEffect(() => {
    if (!serverState.test) {
      return;
    }
    const state: GameState = {
      test: serverState.test,
      peers: serverState.peers.map((peer) => ({ id: '1', index: peer.index })),
    };

    serverState.peers.forEach((peer) => {
      peer.socket.write(JSON.stringify(state));
    });
  }, [serverState.peers, serverState.test]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const server = net.createServer();

    server.listen(port, () => {
      setServerState((state) => ({ ...state, online: true }));
    });

    server.on('connection', (socket) => {
      setServerState((state) => ({
        ...state,
        peers: [...state.peers, { socket, index: 0 }],
      }));

      socket.on('data', (buffer) => {
        const json = JSON.parse(buffer.toString());
        setServerState((state) => ({
          ...state,
          peers: state.peers.map((peer) => {
            return peer.socket === socket
              ? { ...peer, index: json.data }
              : peer;
          }),
        }));
      });

      socket.on('end', () => {
        setServerState((state) => ({
          ...state,
          peers: state.peers.filter((peer) => peer.socket !== socket),
        }));
      });

      socket.on('error', (err) => {
        setServerState((state) => ({
          ...state,
          peers: state.peers.filter((peer) => peer.socket !== socket),
        }));
      });
    });

    return () => {
      server.close();
    };
  }, [enabled]);

  return { state: serverState, setTest };
}
