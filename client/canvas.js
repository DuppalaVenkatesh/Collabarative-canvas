let ctx;
let canvas;
let isDrawing = false;
let lastPoint = null;

const resizeCanvas = () => {
  let tempImage = null;
  if (canvas.width > 0 && canvas.height > 0) {
    try {
      tempImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {
      console.warn("Could not save canvas content during resize");
    }
  }
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.putImageData(tempImage, 0, 0);
};

const getCoordinates = (e) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
};

const stopDrawing = () => {
  isDrawing = false;
  lastPoint = null;
};

const startDrawing = (e, settings) => {
  isDrawing = true;
  lastPoint = getCoordinates(e);
};

const draw = (e, settings) => {
  const currentPoint = getCoordinates(e);

  window.dispatchEvent(
    new CustomEvent("mouse-position", {
      detail: { x: currentPoint.x, y: currentPoint.y },
    })
  );

  if (!isDrawing) return;

  ctx.beginPath()
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(currentPoint.x, currentPoint.y);
  if (settings.tool == "eraser") {
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

  window.dispatchEvent(
    new CustomEvent("draw-event", {
      detail: {
        from: lastPoint,
        to: currentPoint,
        settings: { ...settings },
      },
    })
  );

  lastPoint = currentPoint;
};

export function initCanvas(settings) {
  canvas = document.getElementById("mainCanvas");
  ctx = canvas.getContext("2d", { desynchronized: true });

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  canvas.addEventListener("mousedown", (e) => startDrawing(e, settings));
  canvas.addEventListener("mousemove", (e) => draw(e, settings));
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);
}
