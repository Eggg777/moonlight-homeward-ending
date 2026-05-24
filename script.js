const canvas = document.querySelector("#scene");
const ctx = canvas.getContext("2d");
const dialogue = document.querySelector("#dialogue");
const sceneTitle = document.querySelector("#sceneTitle");
const nextButton = document.querySelector("#nextButton");
const nextLabel = document.querySelector("#nextLabel");
const complete = document.querySelector("#complete");

const scenes = [
  {
    title: "第 1 張",
    lines: [
      "原來打倒最後的敵人後，世界不會立刻改變。",
      "只是風，終於慢了下來。"
    ],
    draw: drawField
  },
  {
    title: "第 2 張",
    lines: [
      "比起勝利，大家更在意——",
      "今晚能不能一起回家。"
    ],
    draw: drawPlatform
  },
  {
    title: "第 3 張",
    lines: [
      "有些冒險，不會被寫進傳說。",
      "但會留在某個普通的早晨裡。"
    ],
    draw: drawTown
  },
  {
    title: "第 4 張",
    lines: [
      "辛苦了。",
      "這次真的，可以好好休息了。"
    ],
    draw: drawRoom
  }
];

let index = 0;
let time = 0;
let finished = false;

function fitCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function renderText() {
  sceneTitle.textContent = scenes[index].title;
  dialogue.innerHTML = scenes[index].lines.map((line) => `<p>${line}</p>`).join("");
  nextLabel.textContent = index === scenes.length - 1 ? "完成" : "點一下，繼續";
}

function nextScene() {
  if (finished) return;
  if (index < scenes.length - 1) {
    index += 1;
    renderText();
    return;
  }
  finished = true;
  complete.hidden = false;
  nextButton.hidden = true;
}

function loop() {
  time += 0.012;
  scenes[index].draw(window.innerWidth, window.innerHeight, time);
  requestAnimationFrame(loop);
}

function skyGradient(w, h, top, mid, bottom) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.52, mid);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function softCircle(x, y, r, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function hill(y, color, lift = 0) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 28) {
    ctx.lineTo(x, y + Math.sin(x * 0.008 + time + lift) * 10);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
}

function grass(w, h, base, count) {
  ctx.strokeStyle = "rgba(79, 122, 82, 0.42)";
  ctx.lineWidth = 1;
  for (let i = 0; i < count; i += 1) {
    const x = (i * 47) % w;
    const y = base + ((i * 29) % Math.max(40, h - base));
    const sway = Math.sin(time * 2 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + sway, y - 12, x + sway * 1.6, y - 25);
    ctx.stroke();
  }
}

function drawAdventurer(x, y, scale = 1, facing = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * facing, scale);
  ctx.fillStyle = "#f7dcc2";
  ctx.beginPath();
  ctx.arc(0, -42, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6f8fb1";
  ctx.beginPath();
  ctx.roundRect(-16, -28, 32, 40, 12);
  ctx.fill();
  ctx.fillStyle = "#4d514d";
  ctx.fillRect(-13, 10, 8, 20);
  ctx.fillRect(5, 10, 8, 20);
  ctx.strokeStyle = "#786a5b";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(18, -12);
  ctx.lineTo(34, 12);
  ctx.stroke();
  ctx.fillStyle = "#3d3834";
  ctx.beginPath();
  ctx.arc(-6, -44, 2, 0, Math.PI * 2);
  ctx.arc(8, -44, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFriend(x, y, color, item) {
  drawAdventurer(x, y, 0.72);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x - 10, y - 18, 20, 24, 8);
  ctx.fill();
  ctx.fillStyle = "#8b674f";
  if (item === "tea") {
    ctx.beginPath();
    ctx.roundRect(x + 14, y - 24, 14, 12, 4);
    ctx.fill();
    softCircle(x + 21, y - 35, 18, "rgba(255,255,255,0.28)");
  } else {
    ctx.beginPath();
    ctx.roundRect(x + 12, y - 14, 24, 18, 5);
    ctx.fill();
  }
}

function drawParticles(cx, cy) {
  for (let i = 0; i < 34; i += 1) {
    const angle = i * 0.7;
    const r = 26 + (i % 7) * 8 + Math.sin(time + i) * 5;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r * 0.5;
    softCircle(x, y, 9, "rgba(255, 236, 158, 0.52)");
  }
}

function drawField(w, h, t) {
  skyGradient(w, h, "#1f2947", "#6d91bd", "#f2d5ad");
  softCircle(w * 0.8, h * 0.18, 80, "rgba(255,245,205,0.48)");
  hill(h * 0.64, "#9fc38d", 0);
  hill(h * 0.72, "#7fb078", 2);
  grass(w, h, h * 0.65, 160);
  drawParticles(w * 0.72, h * 0.42);
  drawAdventurer(w * 0.43, h * 0.66 + Math.sin(t) * 1.5, 1.05);
}

function drawPlatform(w, h) {
  skyGradient(w, h, "#25283d", "#3f5267", "#8d7660");
  softCircle(w * 0.84, h * 0.42, 44 + Math.sin(time) * 3, "rgba(255, 221, 145, 0.55)");
  ctx.fillStyle = "#8c6d4d";
  ctx.fillRect(0, h * 0.66, w, h * 0.16);
  ctx.fillStyle = "#70563d";
  for (let x = 0; x < w; x += 84) ctx.fillRect(x, h * 0.64, 48, h * 0.2);
  ctx.strokeStyle = "rgba(68, 49, 37, 0.35)";
  ctx.lineWidth = 3;
  for (let x = 0; x < w; x += 38) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.66);
    ctx.lineTo(x + 16, h * 0.82);
    ctx.stroke();
  }
  drawAdventurer(w * 0.35, h * 0.65, 0.92);
  drawFriend(w * 0.44, h * 0.66, "#c89a5f", "tea");
  drawFriend(w * 0.53, h * 0.66, "#8da982", "bag");
  drawFriend(w * 0.62, h * 0.66, "#b98994", "bag");
}

function drawTown(w, h) {
  skyGradient(w, h, "#8fb4c2", "#f0cf97", "#f7e8c3");
  softCircle(w * 0.2, h * 0.2, 120, "rgba(255, 231, 144, 0.48)");
  ctx.fillStyle = "#c9a47b";
  ctx.fillRect(0, h * 0.67, w, h * 0.33);
  for (let i = 0; i < 5; i += 1) {
    const x = i * w * 0.23 - 40;
    ctx.fillStyle = i % 2 ? "#d8bb91" : "#e2cfa8";
    ctx.fillRect(x, h * 0.34, w * 0.18, h * 0.34);
    ctx.fillStyle = "#7d6153";
    ctx.beginPath();
    ctx.moveTo(x - 12, h * 0.35);
    ctx.lineTo(x + w * 0.09, h * 0.25);
    ctx.lineTo(x + w * 0.2, h * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffd581";
    ctx.fillRect(x + 24, h * 0.45, 30, 24);
  }
  ctx.fillStyle = "#7a695c";
  ctx.beginPath();
  ctx.ellipse(w * 0.78, h * 0.69, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.8, h * 0.675, 10, 0, Math.PI * 2);
  ctx.fill();
  drawAdventurer(w * 0.43, h * 0.7, 0.72, -1);
  drawAdventurer(w * 0.48, h * 0.71, 0.68, -1);
  drawAdventurer(w * 0.54, h * 0.705, 0.7, -1);
}

function drawRoom(w, h) {
  skyGradient(w, h, "#f4dca9", "#f8e8c5", "#fff8e8");
  ctx.fillStyle = "#d7b283";
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
  ctx.fillStyle = "#f2d7a9";
  ctx.fillRect(w * 0.12, h * 0.12, w * 0.28, h * 0.32);
  ctx.fillStyle = "rgba(255, 251, 221, 0.78)";
  ctx.fillRect(w * 0.145, h * 0.15, w * 0.21, h * 0.26);
  softCircle(w * 0.24, h * 0.27, 170, "rgba(255, 238, 157, 0.4)");
  ctx.fillStyle = "#966f4f";
  ctx.fillRect(w * 0.42, h * 0.58, w * 0.32, 24);
  ctx.fillRect(w * 0.45, h * 0.6, 20, h * 0.18);
  ctx.fillRect(w * 0.69, h * 0.6, 20, h * 0.18);
  ctx.strokeStyle = "#7e6a5b";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h * 0.55);
  ctx.lineTo(w * 0.28, h * 0.78);
  ctx.stroke();
  softCircle(w * 0.62, h * 0.54, 28 + Math.sin(time * 2) * 3, "rgba(255, 239, 124, 0.72)");
  ctx.fillStyle = "#f4d985";
  star(w * 0.62, h * 0.54, 14, 7);
  drawSleepingAdventurer(w * 0.55, h * 0.57);
}

function drawSleepingAdventurer(x, y) {
  ctx.fillStyle = "#6f8fb1";
  ctx.beginPath();
  ctx.roundRect(x - 26, y - 18, 72, 28, 14);
  ctx.fill();
  ctx.fillStyle = "#f7dcc2";
  ctx.beginPath();
  ctx.arc(x - 20, y - 22, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5c4e44";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x - 22, y - 24, 5, 0.1, Math.PI - 0.1);
  ctx.stroke();
}

function star(x, y, outer, inner) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 ? inner : outer;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
}

window.addEventListener("resize", fitCanvas);
canvas.addEventListener("click", nextScene);
nextButton.addEventListener("click", nextScene);
window.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") nextScene();
});

fitCanvas();
renderText();
loop();
