import net, { Socket } from 'net';

const port = 1337;

export class Server<PeerData, ServerState> {
  peers: ({ socket: Socket } & PeerData)[] = [];
  online = false;

  private server: net.Server;

  constructor(private initialPeerData: PeerData) {
    this.server = net.createServer();

    this.server.listen(port, () => {
      this.online = true;
    });

    this.server.on('connection', (socket) => {
      this.peers.push({ socket, ...this.initialPeerData });

      socket.on('data', (buffer) => {
        const json: PeerData = JSON.parse(buffer.toString());

        this.peers = this.peers.map((peer) => {
          return peer.socket === socket ? { ...peer, index: json } : peer;
        });
      });

      socket.on('end', () => {
        this.online = false;
        this.peers = this.peers.filter((peer) => peer.socket !== socket);
      });

      socket.on('error', (err) => {
        this.peers = this.peers.filter((peer) => peer.socket !== socket);
        this.peers = this.peers.filter((peer) => peer.socket !== socket);
      });
    });
  }
}
