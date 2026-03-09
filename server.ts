import { config } from "dotenv";
const result = config({ path: ".env.local" });
console.log("dotenv loaded:", result.error ? `ERROR: ${result.error.message}` : "OK");
console.log("GENAI_API_KEY set:", !!process.env.GENAI_API_KEY, process.env.GENAI_API_KEY?.slice(0, 10) + "...");

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketServer } from "socket.io";
import { setupSocketHandlers } from "./src/lib/server/socket-handlers";
import type { ClientToServerEvents, ServerToClientEvents } from "./src/types/socket-events";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url!, true));
  });

  const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: "*" },
  });

  setupSocketHandlers(io);

  const port = parseInt(process.env.PORT || "3000");
  httpServer.listen(port, () => {
    console.log(`Alan server running on port ${port}`);
  });
});
