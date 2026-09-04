import { WebSocketServer, WebSocket } from "ws";

const WS_PORT = parseInt(process.env.WS_PORT!);

const clients = new Set<WebSocket>();

function send(client: WebSocket, data: Record<string, unknown>) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
}

export function broadcast(data: Record<string, unknown>) {
  for (const client of clients) {
    send(client, data);
  }
}

export function startWebSocketServer(): WebSocketServer {
  const wss = new WebSocketServer({ port: WS_PORT });

  console.log(`[WS] listening on ws://localhost:${WS_PORT}`);

  wss.on("connection", (client) => {
    console.log("[WS] Client connected");

    clients.add(client);

    client.on("close", () => {
      clients.delete(client);
      console.log("[WS] Client disconnected");
    });

    client.on("error", (err) => {
      console.error(err);
      clients.delete(client);
    });
  });

  return wss;
}