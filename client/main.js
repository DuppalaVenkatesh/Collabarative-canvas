import { initCanvas } from "./canvas.js";
import { initWebsocket } from "./websocket.js";

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const widthSlider = document.getElementById("widthSlider");
const widthVal = document.getElementById("widthVal");
const brushBtn = document.getElementById("brushBtn");
const eraserBtn = document.getElementById("eraserBtn");

const settings = {
  color: "#000000",
  width: 5,
  tool: "brush",
};

colorPicker.addEventListener("change", (e) => {
  settings.color = e.target.value;
});

widthSlider.addEventListener("change", (e) => {
  settings.width = e.target.value;
  widthVal.textContent = `${e.target.value}px`;
});

brushBtn.addEventListener("click", (e) => {
  settings.tool = "brush";
  brushBtn.classList.add("active");
  eraserBtn.classList.remove("active");
});

eraserBtn.addEventListener("click", (e) => {
  settings.tool = "eraser";
  eraserBtn.classList.add("active");
  brushBtn.classList.remove("active");
});

initCanvas(settings);
initWebsocket(ctx);