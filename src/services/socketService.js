// src/services/socketService.js
import io from "socket.io-client";

const socket = io(
  "ws://test-log-viewer-backend.stg.onepunch.agency/view-log-ws",
  {
    transports: ["websocket"],
  }
);

// Subscribe to logs from the WebSocket connection
export const subscribeToLogs = (cb) => {
  socket.on("log", (log) => cb(log));
};

// Disconnect the WebSocket when it's no longer needed
export const disconnectSocket = () => {
  socket.disconnect();
};
