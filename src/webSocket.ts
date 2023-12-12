import type { RawData } from 'ws';
import type WebSocket from 'ws';
import { WebSocketServer } from 'ws';

export type Send = (data: unknown) => void;

type SetupSocketProps = {
  onMessage: (data: RawData) => void;
  onConnection: () => void;
  port: number;
};

export let ws: WebSocket;
export const setupWebSocket = (props: SetupSocketProps): WebSocket.Server => {
  const wss = new WebSocketServer({ port: props.port });

  wss.on('connection', (ws_) => {
    ws = ws_;
    ws.on('message', (e) => props.onMessage(e));
    props.onConnection();
  });

  return wss;
};
