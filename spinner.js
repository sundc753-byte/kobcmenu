// ───────────────────────────────────────────────
//  마린시티 식당 돌림판 — 메인 로직
// ───────────────────────────────────────────────

const WHEEL_COLORS = [
  "#7F77DD", "#1D9E75", "#D85A30", "#378ADD",
  "#639922", "#BA7517", "#D4537E", "#888780",
  "#E24B4A", "#0F6E56", "#993C1D", "#185FA5",
];

const MAX_SLICES = 16;   // 돌림판에 표시할 최대 항목 수

let usedToday    = loadHistory();
let currentFilter = "전체";
let spinning     = false;
let currentAngle = 0;

// ── 초기화 ──────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  updateHistoryUI();
  drawWheel(getFiltered(), currentAngle);
});

// ── 필터 ────────────────────────────────────────
function setFilter(btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter;
  currentAngle  = 0;
  drawWheel(getFiltered(), currentAngle);
}

function getFiltered() {
  let pool = RESTAURANTS.filter(r => !usedToday.includes(r.name));
  if (currentFilter !== "전체") {
    pool = pool.filter(r => r.type === currentFilter);
  }
  return pool;
}

// ── 히스토리 ────────────────────────────────────
function loadHistory() {
  try {
    const saved = localStorage.getItem("marinSpinner_usedToday");
    const { date, list } = JSON.parse(saved);
    const today = new Date().toDateString();
    return date === today ? list : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  const payload = {
    date: new Date().toDateString(),
    list: usedToday,
  };
  localStorage.setItem("marinSpinner_usedToday", JSON.stringify(payload));
}

function resetHistory() {
  usedToday = [];
  saveHistory();
  updateHistoryUI();
  currentAngle = 0;
  drawWheel(getFiltered(), currentAngle);
  document.getElementById("results").innerHTML =
    '<div class="empty-state">돌림판을 돌려<br>오늘의 식당을 정해보세요! 🍽️</div>';
}

function updateHistoryUI() {
  const el = document.getElementById("history-list");
  if (usedToday.length === 0) {
    el.innerHTML = '<span class="history-pill" style="font-style:italic;">아직 없음</span>';
  } else {
    el.innerHTML = usedToday
      .map(n => `<span class="history-pill">${n}</span>`)
      .join("");
  }
}

// ── 돌림판 그리기 ────────────────────────────────
function drawWheel(pool, angle) {
  const canvas = document.getElementById("wheel");
  const ctx    = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, R = cx - 12;

  ctx.clearRect(0, 0, W, H);

  if (!pool || pool.length === 0) {
    ctx.fillStyle = "#ccc";
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#555";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("해당 메뉴 없음", cx, cy);
    return;
  }

  const n    = Math.min(pool.length, MAX_SLICES);
  const arc  = (Math.PI * 2) / n;

  for (let i = 0; i < n; i++) {
    const start = angle + i * arc;
    const end   = start + arc;

    // 부채꼴
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, start, end);
    ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // 라벨
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + arc / 2);
    ctx.textAlign    = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = "#ffffff";
    ctx.font         = "500 11px sans-serif";
    const raw   = pool[i].name;
    const label = raw.length > 7 ? raw.slice(0, 6) + "…" : raw;
    ctx.fillText(label, R - 10, 0);
    ctx.restore();
  }

  // 중앙 허브
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, Math.PI * 2);
  ctx.fillStyle   = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth   = 1;
  ctx.stroke();

  // 오른쪽 포인터 (삼각형)
  ctx.beginPath();
  ctx.moveTo(W - 4,      cy);
  ctx.lineTo(W - 4 - 20, cy - 11);
  ctx.lineTo(W - 4 - 20, cy + 11);
  ctx.closePath();
  ctx.fillStyle = "#E24B4A";
  ctx.fill();
}

// ── 스핀 ────────────────────────────────────────
function spin() {
  const pool = getFiltered();

  if (pool.length < 3) {
    alert(`현재 필터(${currentFilter})에서 제외 후 남은 식당이 3개 미만입니다.\n기록을 초기화하거나 다른 필터를 선택해주세요.`);
    return;
  }
  if (spinning) return;

  spinning = true;
  document.getElementById("spin-btn").disabled = true;

  const totalRotation = Math.PI * 2 * (8 + Math.random() * 6);
  const duration      = 4000;
  const startAngle    = currentAngle;
  const startTime     = performance.now();

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  function animate(now) {
    const elapsed = now - startTime;
    const t       = Math.min(elapsed / duration, 1);
    currentAngle  = startAngle + totalRotation * easeOut(t);
    drawWheel(pool, currentAngle);

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      document.getElementById("spin-btn").disabled = false;
      pickResults(pool, currentAngle);
    }
  }

  requestAnimationFrame(animate);
}

// ── 결과 선택 ───────────────────────────────────
function pickResults(pool, finalAngle) {
  const n     = Math.min(pool.length, MAX_SLICES);
  const slice = pool.slice(0, n);
  const arc   = (Math.PI * 2) / n;

  // 포인터(오른쪽, 0도)가 가리키는 슬라이스 계산
  const normalized = ((finalAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const pointed    = (Math.PI * 2 - normalized) % (Math.PI * 2);
  const idx        = Math.floor(pointed / arc) % n;

  const picked = [slice[idx]];

  // 2·3순위: 나머지에서 랜덤
  const remaining = pool.filter(r => r.name !== picked[0].name);
  for (let rank = 1; rank < 3 && remaining.length > 0; rank++) {
    const ri = Math.floor(Math.random() * remaining.length);
    picked.push(remaining.splice(ri, 1)[0]);
  }

  // 1순위를 오늘 먹은 메뉴에 추가
  usedToday.push(picked[0].name);
  saveHistory();
  updateHistoryUI();

  // 제외 후 휠 재드로잉
  currentAngle = 0;
  drawWheel(getFiltered(), currentAngle);

  renderResults(picked);
}

// ── 결과 렌더링 ──────────────────────────────────
function renderResults(picked) {
  const rankLabels  = ["1순위 — 오늘의 선택!", "2순위", "3순위"];
  const rankClasses = ["rank-1", "rank-2", "rank-3"];

  const html = picked.map((r, i) => `
    <div class="result-card ${rankClasses[i]}">
      <span class="rank-badge">${rankLabels[i]}</span>
      <div class="restaurant-name">${r.name}</div>
      <div class="restaurant-meta">
        <span class="tag">${r.type}</span>
        <span class="tag">${r.loc}</span>
        <span class="tag">약 ${r.price}만원</span>
      </div>
      <div class="menu-text">${r.menu}</div>
    </div>
  `).join("");

  document.getElementById("results").innerHTML = html;
}
