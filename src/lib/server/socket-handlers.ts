import type { Server as SocketServer } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket-events";

export function setupSocketHandlers(
  io: SocketServer<ClientToServerEvents, ServerToClientEvents>
): void {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
