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
  paperTexture(window.innerWidth, window.innerHeight);
  crayonSpeckles(window.innerWidth, window.innerHeight);
  requestAnimationFrame(loop);
}

function skyGradient(w, h, top, mid, bottom) {
  const bands = [top, mixColor(top, mid, 0.45), mid, mixColor(mid, bottom, 0.5), bottom];
  const bandHeight = h / bands.length;
  bands.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, i * bandHeight - 2, w, bandHeight + 4);
  });
  ctx.save();
  ctx.globalAlpha = 0.28;
  for (let y = 18; y < h * 0.62; y += 28) {
    const color = bands[Math.min(bands.length - 1, Math.floor(y / bandHeight))];
    crayonWave(0, y, w, color, 9, 2);
  }
  ctx.restore();
}

function mixColor(a, b, t) {
  const from = hexToRgb(a);
  const to = hexToRgb(b);
  const mix = from.map((value, i) => Math.round(value + (to[i] - value) * t));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16)
  ];
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

function crayonWave(x, y, width, color, strokeWidth = 6, waves = 3) {
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

function crayonBlob(points, fill, outline = "#8b6b4e", width = 6) {
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
  ctx.globalAlpha = 0.52;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();
}

function crayonCloud(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  crayonOval(-26, 6, 28, 18, "rgba(255, 246, 218, 0.82)", "#c8a47a");
  crayonOval(0, -2, 34, 24, "rgba(255, 250, 226, 0.86)", "#c8a47a");
  crayonOval(32, 8, 30, 17, "rgba(255, 246, 218, 0.82)", "#c8a47a");
  ctx.restore();
}

function crayonFlower(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  crayonLine(0, 16, 0, -4, "#579b61", 3, 2);
  ["#ff8fb1", "#ffc15d", "#87c9ff", "#ff8fb1"].forEach((color, i) => {
    const angle = (i * Math.PI) / 2;
    crayonOval(Math.cos(angle) * 8, -8 + Math.sin(angle) * 8, 8, 6, color, "#8b6b4e");
  });
  crayonOval(0, -8, 5, 5, "#ffe36f", "#8b6b4e");
  ctx.restore();
}

function paperTexture(w, h) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.strokeStyle = "rgba(121, 86, 55, 0.07)";
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
  ctx.globalAlpha = 0.16;
  for (let i = 0; i < 180; i += 1) {
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
  ctx.strokeStyle = "rgba(112, 91, 59, 0.34)";
  ctx.lineWidth = 8;
  ctx.stroke();
  crayonWave(0, y + 22, w, "rgba(255, 255, 186, 0.34)", 8, 2);
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
  crayonOval(0, -47, 28, 26, "#ffd9bd", "#8f6b55");
  ctx.fillStyle = "#6aa6d9";
  ctx.beginPath();
  ctx.roundRect(-23, -28, 46, 40, 22);
  ctx.fill();
  ctx.strokeStyle = "rgba(89, 91, 124, 0.46)";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#5b6755";
  ctx.beginPath();
  ctx.roundRect(-17, 8, 13, 19, 7);
  ctx.roundRect(4, 8, 13, 19, 7);
  ctx.fill();
  crayonLine(24, -11, 42, 12, "#8b6d55", 7, 5);
  ctx.fillStyle = "#4b3a34";
  ctx.beginPath();
  ctx.arc(-9, -50, 3.2, 0, Math.PI * 2);
  ctx.arc(10, -50, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(89, 61, 50, 0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(1, -42, 6, 0.1, Math.PI - 0.1);
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
  skyGradient(w, h, "#5f78b4", "#a9d3e8", "#ffe59d");
  crayonCloud(w * 0.16, h * 0.18, 1.1);
  crayonCloud(w * 0.54, h * 0.13, 0.82);
  softCircle(w * 0.8, h * 0.18, 92, "rgba(255,245,184,0.58)");
  hill(h * 0.63, "#c9e87d", 0);
  hill(h * 0.72, "#91d85f", 2);
  grass(w, h, h * 0.65, 150);
  for (let i = 0; i < 18; i += 1) crayonFlower((i * 89) % w, h * 0.78 + (i % 5) * 18, 0.7);
  drawParticles(w * 0.72, h * 0.42);
  drawAdventurer(w * 0.43, h * 0.66 + Math.sin(t) * 1.5, 1.05);
}

function drawPlatform(w, h) {
  skyGradient(w, h, "#6664a0", "#8295ae", "#ffc982");
  crayonCloud(w * 0.22, h * 0.2, 0.78);
  softCircle(w * 0.84, h * 0.42, 56 + Math.sin(time) * 3, "rgba(255, 226, 135, 0.66)");
  crayonBlob(
    [[-20, h * 0.66], [w * 0.24, h * 0.63], [w * 0.58, h * 0.67], [w + 20, h * 0.64], [w + 20, h * 0.84], [-20, h * 0.84]],
    "#c99558",
    "#805b42",
    7
  );
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
  skyGradient(w, h, "#aee0eb", "#ffd58f", "#fff2a9");
  crayonCloud(w * 0.64, h * 0.15, 0.72);
  softCircle(w * 0.2, h * 0.2, 140, "rgba(255, 232, 125, 0.56)");
  crayonBlob(
    [[0, h * 0.69], [w * 0.25, h * 0.65], [w * 0.52, h * 0.7], [w * 0.8, h * 0.66], [w, h * 0.7], [w, h], [0, h]],
    "#dfb374",
    "#9c7052",
    7
  );
  for (let i = 0; i < 5; i += 1) {
    const x = i * w * 0.23 - 40;
    ctx.fillStyle = i % 2 ? "#ffd09a" : "#ffe3ad";
    ctx.beginPath();
    ctx.roundRect(x, h * 0.34, w * 0.18, h * 0.34, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(128, 86, 70, 0.36)";
    ctx.lineWidth = 5;
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
  crayonOval(w * 0.78, h * 0.69, 23, 10, "#806f63", "#665950");
  crayonOval(w * 0.8, h * 0.675, 11, 10, "#806f63", "#665950");
  drawAdventurer(w * 0.43, h * 0.7, 0.72, -1);
  drawAdventurer(w * 0.48, h * 0.71, 0.68, -1);
  drawAdventurer(w * 0.54, h * 0.705, 0.7, -1);
}

function drawRoom(w, h) {
  skyGradient(w, h, "#ffc872", "#ffe6a5", "#fff7c8");
  crayonBlob(
    [[0, h * 0.72], [w * 0.2, h * 0.69], [w * 0.48, h * 0.74], [w * 0.76, h * 0.7], [w, h * 0.73], [w, h], [0, h]],
    "#eec67e",
    "#9b7450",
    7
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
