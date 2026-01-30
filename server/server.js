import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;
const io = new Server(server, {
  cors: { origin: "*" },
});

let drawingHistory = [];
let redoStack = [];
let users = {};

io.on("connection", (socket) => {
  //Assign random color to the new user
  users[socket.id] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  socket.emit("init", {
    history: drawingHistory,
    users: users,
  });

  socket.on("draw", (data) => {
    drawingHistory.push(data);
    redoStack = [];
    socket.broadcast.emit("on-draw", data);
  });

  socket.on("mouse-move", (pos) => {
    socket.broadcast.emit("on-mouse-move", {
      id: socket.id,
      x: pos.x,
      y: pos.y,
      color: users[socket.id],
    });
  });

  //Undo
  socket.on("undo", () => {
    if (drawingHistory.length > 0) {
      const undoneAction = drawingHistory.pop();
      redoStack.push(undoneAction);
      io.emit("update-canvas", drawingHistory);
    }
  });

  socket.on("redo", () => {
    if (redoStack.length > 0) {
      const action = redoStack.pop();
      drawingHistory.push(action);
      io.emit("update-canvas", drawingHistory);
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("user-left", socket.id);
  });
});

server.listen(port, () => {
  console.log("server started successfully");
});
