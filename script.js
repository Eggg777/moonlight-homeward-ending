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
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
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
  paintedTexture(window.innerWidth, window.innerHeight);
  requestAnimationFrame(loop);
}

function skyGradient(w, h, top, mid, bottom) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.48, mid);
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

function softLine(x1, y1, x2, y2, color, width = 4, alpha = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function paintedWave(x, y, width, color, strokeWidth = 6, waves = 3) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  for (let pass = 0; pass < waves; pass += 1) {
    ctx.globalAlpha = 0.2 + pass * 0.12;
    ctx.lineWidth = strokeWidth + pass;
    ctx.beginPath();
    for (let px = x; px <= x + width; px += 28) {
      const py = y + Math.sin(px * 0.02 + pass * 1.7) * 5 + Math.cos(px * 0.007) * 3;
      if (px === x) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function softOval(x, y, rx, ry, color, outline = "rgba(64, 50, 42, 0.28)") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(1.5, Math.min(rx, ry) * 0.08);
  ctx.stroke();
  ctx.restore();
}

function paintedBlob(points, fill, outline = "rgba(83, 66, 45, 0.22)", width = 4) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    ctx.quadraticCurveTo(current[0], current[1], (current[0] + next[0]) / 2, (current[1] + next[1]) / 2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.globalAlpha = 0.32;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();
}

function softCloud(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  softOval(-26, 6, 28, 18, "rgba(255, 255, 240, 0.62)");
  softOval(0, -2, 34, 24, "rgba(255, 255, 245, 0.72)");
  softOval(32, 8, 30, 17, "rgba(255, 255, 240, 0.62)");
  ctx.restore();
}

function wildFlower(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  softLine(0, 16, 0, -4, "#5a9b67", 2, 0.78);
  ["#ff8fb1", "#ffc15d", "#87c9ff", "#ff8fb1"].forEach((color, i) => {
    const angle = (i * Math.PI) / 2;
    softOval(Math.cos(angle) * 8, -8 + Math.sin(angle) * 8, 6, 4, color);
  });
  softOval(0, -8, 4, 4, "#ffe36f");
  ctx.restore();
}

function paintedTexture(w, h) {
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let y = 10; y < h; y += 18) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 42) {
      const jitter = Math.sin(x * 0.025 + y * 0.02 + time) * 1.2;
      if (x === 0) ctx.moveTo(x, y + jitter);
      else ctx.lineTo(x, y + jitter);
    }
    ctx.stroke();
  }
  ctx.restore();
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
  ctx.strokeStyle = "rgba(78, 105, 67, 0.16)";
  ctx.lineWidth = 4;
  ctx.stroke();
  paintedWave(0, y + 20, w, "rgba(255, 255, 205, 0.24)", 8, 2);
}

function grass(w, h, base, count) {
  for (let i = 0; i < count; i += 1) {
    const x = (i * 47) % w;
    const y = base + ((i * 29) % Math.max(40, h - base));
    const sway = Math.sin(time * 2 + i) * 4;
    softLine(x, y, x + sway * 1.6, y - 25, "rgba(73, 135, 75, 0.46)", 1.2, 0.86);
  }
}

function drawAdventurer(x, y, scale = 1, facing = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * facing, scale);
  softOval(0, -46, 22, 21, "#f4cfb1");
  ctx.fillStyle = "#5e86a8";
  ctx.beginPath();
  ctx.roundRect(-17, -28, 34, 42, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(48, 57, 68, 0.32)";
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.fillStyle = "#384b45";
  ctx.beginPath();
  ctx.roundRect(-13, 9, 9, 23, 4);
  ctx.roundRect(4, 9, 9, 23, 4);
  ctx.fill();
  softLine(18, -11, 35, 11, "#7f6753", 4.2, 0.9);
  ctx.fillStyle = "#3c332f";
  ctx.beginPath();
  ctx.arc(-7, -48, 2.2, 0, Math.PI * 2);
  ctx.arc(8, -48, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(89, 61, 50, 0.38)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(1, -41, 4.5, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.restore();
}

function drawFriend(x, y, color, item) {
  drawAdventurer(x, y, 0.72);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x - 12, y - 20, 24, 26, 13);
  ctx.fill();
  ctx.strokeStyle = "rgba(103, 75, 64, 0.34)";
  ctx.lineWidth = 2;
  ctx.stroke();
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
  skyGradient(w, h, "#526a99", "#92b9d1", "#f6d69c");
  softCloud(w * 0.16, h * 0.18, 1.1);
  softCloud(w * 0.54, h * 0.13, 0.82);
  softCircle(w * 0.8, h * 0.18, 92, "rgba(255,245,184,0.58)");
  hill(h * 0.63, "#adc783", 0);
  hill(h * 0.72, "#7fae68", 2);
  grass(w, h, h * 0.65, 170);
  for (let i = 0; i < 16; i += 1) wildFlower((i * 89) % w, h * 0.78 + (i % 5) * 18, 0.6);
  drawParticles(w * 0.72, h * 0.42);
  drawAdventurer(w * 0.43, h * 0.66 + Math.sin(t) * 1.5, 1.05);
}

function drawPlatform(w, h) {
  skyGradient(w, h, "#343953", "#647a86", "#c6986f");
  softCloud(w * 0.22, h * 0.2, 0.78);
  softCircle(w * 0.84, h * 0.42, 56 + Math.sin(time) * 3, "rgba(255, 226, 135, 0.66)");
  paintedBlob(
    [[-20, h * 0.66], [w * 0.24, h * 0.63], [w * 0.58, h * 0.67], [w + 20, h * 0.64], [w + 20, h * 0.84], [-20, h * 0.84]],
    "#9e774e",
    "rgba(67, 48, 34, 0.38)",
    4
  );
  ctx.fillStyle = "#8e6c47";
  ctx.fillRect(0, h * 0.66, w, h * 0.16);
  ctx.fillStyle = "#6c5239";
  for (let x = 0; x < w; x += 84) {
    ctx.beginPath();
    ctx.roundRect(x, h * 0.64, 48, h * 0.2, 10);
    ctx.fill();
  }
  for (let x = 0; x < w; x += 38) {
    softLine(x, h * 0.66, x + 16, h * 0.82, "rgba(64, 43, 32, 0.42)", 2.2, 0.72);
  }
  drawAdventurer(w * 0.35, h * 0.65, 0.92);
  drawFriend(w * 0.44, h * 0.66, "#c98f5d", "tea");
  drawFriend(w * 0.53, h * 0.66, "#8ca56b", "bag");
  drawFriend(w * 0.62, h * 0.66, "#b9808c", "bag");
}

function drawTown(w, h) {
  skyGradient(w, h, "#9cc6d4", "#efc990", "#f7e2b1");
  softCloud(w * 0.64, h * 0.15, 0.72);
  softCircle(w * 0.2, h * 0.2, 140, "rgba(255, 232, 125, 0.56)");
  paintedBlob(
    [[0, h * 0.69], [w * 0.25, h * 0.65], [w * 0.52, h * 0.7], [w * 0.8, h * 0.66], [w, h * 0.7], [w, h], [0, h]],
    "#c79e71",
    "rgba(94, 65, 45, 0.28)",
    4
  );
  for (let i = 0; i < 5; i += 1) {
    const x = i * w * 0.23 - 40;
    ctx.fillStyle = i % 2 ? "#ffd09a" : "#ffe3ad";
    ctx.beginPath();
    ctx.roundRect(x, h * 0.34, w * 0.18, h * 0.34, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(94, 70, 58, 0.22)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#a36a5d";
    ctx.beginPath();
    ctx.moveTo(x - 12, h * 0.35);
    ctx.lineTo(x + w * 0.09, h * 0.25);
    ctx.lineTo(x + w * 0.2, h * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe37b";
    ctx.beginPath();
    ctx.roundRect(x + 24, h * 0.45, 30, 24, 8);
    ctx.fill();
  }
  softOval(w * 0.78, h * 0.69, 23, 10, "#75685d");
  softOval(w * 0.8, h * 0.675, 11, 10, "#75685d");
  drawAdventurer(w * 0.43, h * 0.7, 0.72, -1);
  drawAdventurer(w * 0.48, h * 0.71, 0.68, -1);
  drawAdventurer(w * 0.54, h * 0.705, 0.7, -1);
}

function drawRoom(w, h) {
  skyGradient(w, h, "#efc27c", "#f8e2ae", "#fff3ca");
  paintedBlob(
    [[0, h * 0.72], [w * 0.2, h * 0.69], [w * 0.48, h * 0.74], [w * 0.76, h * 0.7], [w, h * 0.73], [w, h], [0, h]],
    "#d4a66a",
    "rgba(96, 68, 43, 0.26)",
    4
  );
  ctx.fillStyle = "#ffd89d";
  ctx.beginPath();
  ctx.roundRect(w * 0.12, h * 0.12, w * 0.28, h * 0.32, 18);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 251, 221, 0.78)";
  ctx.beginPath();
  ctx.roundRect(w * 0.145, h * 0.15, w * 0.21, h * 0.26, 10);
  ctx.fill();
  softCircle(w * 0.24, h * 0.27, 180, "rgba(255, 239, 126, 0.46)");
  ctx.fillStyle = "#b98257";
  ctx.beginPath();
  ctx.roundRect(w * 0.42, h * 0.58, w * 0.32, 26, 12);
  ctx.roundRect(w * 0.45, h * 0.6, 22, h * 0.18, 8);
  ctx.roundRect(w * 0.69, h * 0.6, 22, h * 0.18, 8);
  ctx.fill();
  softLine(w * 0.2, h * 0.55, w * 0.28, h * 0.78, "#7b6253", 5.5, 0.86);
  softCircle(w * 0.62, h * 0.54, 28 + Math.sin(time * 2) * 3, "rgba(255, 239, 124, 0.72)");
  ctx.fillStyle = "#f4d985";
  star(w * 0.62, h * 0.54, 14, 7);
  drawSleepingAdventurer(w * 0.55, h * 0.57);
}

function drawSleepingAdventurer(x, y) {
  ctx.fillStyle = "#5e86a8";
  ctx.beginPath();
  ctx.roundRect(x - 28, y - 19, 76, 30, 17);
  ctx.fill();
  softOval(x - 20, y - 22, 17, 16, "#f4cfb1");
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
