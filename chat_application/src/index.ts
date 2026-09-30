import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let all_sockets: WebSocket[] = [];

wss.on("connection", (socket) => {
  all_sockets.push(socket);

  socket.on("message", (message) => {
    for (const sc of all_sockets) {
      sc.send(message.toString() + " sent from server");
    }
  });

  socket.on("close", () => {
    all_sockets = all_sockets.filter((s) => s !== socket);
  });
});