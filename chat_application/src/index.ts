import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  room: string;
}

let all_sockets: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === "join") {
      all_sockets.push({
        socket,
        room: parsedMessage.payload.roomId,
      });
    }

    if (parsedMessage.type === "chat") {
      const currentUser = all_sockets.find((x) => x.socket === socket);
      const curr_room = currentUser?.room;

      if (!curr_room) return;

      for (const user of all_sockets) {
        if (
          user.room === curr_room &&
          user.socket.readyState === WebSocket.OPEN
        ) {
          user.socket.send(parsedMessage.payload.message);
        }
      }
    }
  });

  socket.on("close", () => {
    all_sockets = all_sockets.filter((x) => x.socket !== socket);
  });
});