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
  paperTexture(window.innerWidth, window.innerHeight);
  crayonSpeckles(window.innerWidth, window.innerHeight);
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

function crayonLine(x1, y1, x2, y2, color, width = 4, passes = 4) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < passes; i += 1) {
    ctx.globalAlpha = 0.26 + i * 0.08;
    ctx.lineWidth = width + Math.sin(i) * 1.6;
    ctx.beginPath();
    ctx.moveTo(x1 + Math.sin(i * 2.1) * 1.8, y1 + Math.cos(i * 1.7) * 1.8);
    ctx.lineTo(x2 + Math.cos(i * 1.9) * 1.8, y2 + Math.sin(i * 2.3) * 1.8);
    ctx.stroke();
  }
  ctx.restore();
}

function crayonOval(x, y, rx, ry, color, outline = "#8f6b55") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(2, Math.min(rx, ry) * 0.12);
  ctx.stroke();
  ctx.restore();
}

function paperTexture(w, h) {
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.strokeStyle = "rgba(121, 86, 55, 0.08)";
  ctx.lineWidth = 1;
  for (let y = 12; y < h; y += 22) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 32) {
      const jitter = Math.sin(x * 0.04 + y * 0.03) * 1.8;
      if (x === 0) ctx.moveTo(x, y + jitter);
      else ctx.lineTo(x, y + jitter);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function crayonSpeckles(w, h) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 95; i += 1) {
    const x = (i * 97) % w;
    const y = (i * 53) % h;
    ctx.fillStyle = i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#9f765a" : "#d6a054";
    ctx.fillRect(x, y, 1.6, 1.6);
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
}

function grass(w, h, base, count) {
  for (let i = 0; i < count; i += 1) {
    const x = (i * 47) % w;
    const y = base + ((i * 29) % Math.max(40, h - base));
    const sway = Math.sin(time * 2 + i) * 4;
    crayonLine(x, y, x + sway * 1.6, y - 25, "rgba(88, 149, 83, 0.44)", 2, 2);
  }
}

function drawAdventurer(x, y, scale = 1, facing = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * facing, scale);
  crayonOval(0, -42, 20, 19, "#ffd9bd");
  ctx.fillStyle = "#6aa6d9";
  ctx.beginPath();
  ctx.roundRect(-18, -28, 36, 42, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(89, 91, 124, 0.46)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#5b6755";
  ctx.beginPath();
  ctx.roundRect(-14, 8, 10, 23, 5);
  ctx.roundRect(4, 8, 10, 23, 5);
  ctx.fill();
  crayonLine(18, -11, 35, 12, "#8b6d55", 5, 4);
  ctx.fillStyle = "#4b3a34";
  ctx.beginPath();
  ctx.arc(-6, -44, 2, 0, Math.PI * 2);
  ctx.arc(8, -44, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(89, 61, 50, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(1, -37, 4, 0.1, Math.PI - 0.1);
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
  skyGradient(w, h, "#415a8e", "#93b9d6", "#ffe0a8");
  softCircle(w * 0.8, h * 0.18, 92, "rgba(255,245,184,0.58)");
  hill(h * 0.64, "#b7d881", 0);
  hill(h * 0.72, "#8ed06d", 2);
  grass(w, h, h * 0.65, 150);
  drawParticles(w * 0.72, h * 0.42);
  drawAdventurer(w * 0.43, h * 0.66 + Math.sin(t) * 1.5, 1.05);
}

function drawPlatform(w, h) {
  skyGradient(w, h, "#4b4c7d", "#6b7890", "#d4a777");
  softCircle(w * 0.84, h * 0.42, 56 + Math.sin(time) * 3, "rgba(255, 226, 135, 0.66)");
  ctx.fillStyle = "#b78655";
  ctx.fillRect(0, h * 0.66, w, h * 0.16);
  ctx.fillStyle = "#8f6847";
  for (let x = 0; x < w; x += 84) {
    ctx.beginPath();
    ctx.roundRect(x, h * 0.64, 48, h * 0.2, 10);
    ctx.fill();
  }
  for (let x = 0; x < w; x += 38) {
    crayonLine(x, h * 0.66, x + 16, h * 0.82, "rgba(97, 66, 48, 0.42)", 3, 3);
  }
  drawAdventurer(w * 0.35, h * 0.65, 0.92);
  drawFriend(w * 0.44, h * 0.66, "#f3b66d", "tea");
  drawFriend(w * 0.53, h * 0.66, "#9fd37e", "bag");
  drawFriend(w * 0.62, h * 0.66, "#e69aa7", "bag");
}

function drawTown(w, h) {
  skyGradient(w, h, "#9cc7da", "#ffd38d", "#fff0bc");
  softCircle(w * 0.2, h * 0.2, 140, "rgba(255, 232, 125, 0.56)");
  ctx.fillStyle = "#d8ac76";
  ctx.fillRect(0, h * 0.67, w, h * 0.33);
  for (let i = 0; i < 5; i += 1) {
    const x = i * w * 0.23 - 40;
    ctx.fillStyle = i % 2 ? "#ffd09a" : "#ffe3ad";
    ctx.beginPath();
    ctx.roundRect(x, h * 0.34, w * 0.18, h * 0.34, 14);
    ctx.fill();
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
  crayonOval(w * 0.78, h * 0.69, 23, 10, "#806f63", "#665950");
  crayonOval(w * 0.8, h * 0.675, 11, 10, "#806f63", "#665950");
  drawAdventurer(w * 0.43, h * 0.7, 0.72, -1);
  drawAdventurer(w * 0.48, h * 0.71, 0.68, -1);
  drawAdventurer(w * 0.54, h * 0.705, 0.7, -1);
}

function drawRoom(w, h) {
  skyGradient(w, h, "#ffd68a", "#ffe9b9", "#fff8d8");
  ctx.fillStyle = "#e5bd7b";
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
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
  crayonLine(w * 0.2, h * 0.55, w * 0.28, h * 0.78, "#8a6856", 7, 5);
  softCircle(w * 0.62, h * 0.54, 28 + Math.sin(time * 2) * 3, "rgba(255, 239, 124, 0.72)");
  ctx.fillStyle = "#f4d985";
  star(w * 0.62, h * 0.54, 14, 7);
  drawSleepingAdventurer(w * 0.55, h * 0.57);
}

function drawSleepingAdventurer(x, y) {
  ctx.fillStyle = "#6aa6d9";
  ctx.beginPath();
  ctx.roundRect(x - 28, y - 19, 76, 30, 17);
  ctx.fill();
  crayonOval(x - 20, y - 22, 19, 18, "#ffd9bd");
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
