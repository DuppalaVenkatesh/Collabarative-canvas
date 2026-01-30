const socket = io("http://localhost:3000");

const drawRemote = (ctx, data) => {
  const { from, to, settings } = data;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  if (settings.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = settings.width * 4;
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = settings.color;
    ctx.lineWidth = settings.width;
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
};

const updateRemoteCursor = ({ id, x, y, color }) => {
  let el = document.getElementById(`cursor-${id}`);
  if (!el) {
    el = document.createElement("div");
    el.id = `cursor-${id}`;
    el.className = "remote-cursor";
    el.innerHTML = `<span style="background:${color}; padding:2px; color:white; border-radius:3px;">${id.slice(
      0,
      4
    )}</span>`;
    document.getElementById("cursor-layer").appendChild(el);
  }
  el.style.transform = `translate(${x}px, ${y}px)`;
};

export function initWebsocket(ctx) {
  socket.on("init", ({ history }) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    history.forEach((data) => {
      drawRemote(ctx, data);
    });
  });
  window.addEventListener("draw-event", (e) => {
    socket.emit("draw", e.detail);
  });

  window.addEventListener("mouse-position", (e) => {
    socket.emit("mouse-move", e.detail);
  });

  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");

  undoBtn.addEventListener("click", () => {
    socket.emit("undo");
  });

  redoBtn.addEventListener("click", () => {
    socket.emit("redo");
  });
  //Receive remote actions from server
  socket.on("on-draw", (data) => {
    drawRemote(ctx, data);
  });

  socket.on("update-canvas", (history) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    history.forEach((item) => drawRemote(ctx, item));
  });

  socket.on("on-mouse-move", (data) => {
    updateRemoteCursor(data);
  });
}
