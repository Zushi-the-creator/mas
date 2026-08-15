// popup — ניהול התיק, תצוגת תוכנית המילוי, והפעלת פעולות ה-content script.

let caseData = null;

const $ = (id) => document.getElementById(id);
const fmt = (n) => Number(n).toLocaleString("he-IL");

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function send(msg) {
  const tab = await activeTab();
  try {
    return await chrome.tabs.sendMessage(tab.id, msg);
  } catch (e) {
    return { error: "הדף אינו דף של מערכת רשות המסים, או שיש לרענן אותו" };
  }
}

function renderPlan() {
  const plan = $("plan");
  plan.innerHTML = "";
  if (!caseData) return;
  const entries = Object.entries(caseData.fields || {}).filter(([, v]) => v);
  for (const [code, v] of entries) {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `<span>שדה ${code}</span><span class="v">${fmt(v)}</span>`;
    plan.appendChild(div);
  }
  for (const [row, cols] of Object.entries(caseData.children || {})) {
    for (const [col, n] of Object.entries(cols)) {
      if (!n) continue;
      const div = document.createElement("div");
      div.className = "row";
      div.innerHTML = `<span>ילדים ${row} · ${col}</span><span class="v">${n}</span>`;
      plan.appendChild(div);
    }
  }
  if (caseData.expectedRefund) {
    const div = document.createElement("div");
    div.className = "row ok";
    div.innerHTML = `<span>החזר צפוי</span><span class="v">${fmt(caseData.expectedRefund)} ₪</span>`;
    plan.appendChild(div);
  }
}

function setButtons(screenKey) {
  $("fill").disabled = !(caseData && screenKey === "income_details");
  $("verify").disabled = !(caseData && screenKey === "income_details");
  $("readResult").disabled = !(caseData && screenKey === "result");
}

async function refreshScreen() {
  const res = await send({ type: "DETECT" });
  const badge = $("screen");
  if (res && res.screen) {
    badge.textContent = "מסך מזוהה: " + res.screen.title;
    badge.className = "screen-badge known";
    setButtons(res.screen.key);
  } else {
    badge.textContent = "מסך לא מזוהה — נווט לאחד ממסכי הדוח השנתי";
    badge.className = "screen-badge unknown";
    setButtons(null);
  }
}

$("loadCase").addEventListener("click", async () => {
  try {
    caseData = JSON.parse($("caseInput").value);
    await chrome.storage.local.set({ caseData });
    renderPlan();
    refreshScreen();
    $("log").textContent = "התיק נטען: " + Object.keys(caseData.fields || {}).length + " שדות";
  } catch {
    $("log").textContent = "JSON לא תקין — העתק שוב מהמחשבון";
  }
});

$("fill").addEventListener("click", async () => {
  const res = await send({ type: "FILL", caseData });
  if (res.error) { $("log").textContent = res.error; return; }
  const filled = res.log.filter((l) => l.status === "filled").length;
  const problems = res.log.filter((l) => l.status !== "filled");
  $("log").innerHTML =
    `מולאו ${filled} שדות ✓` +
    (problems.length
      ? "<br>בעיות: " + problems.map((p) => `${p.code} (${p.status})`).join(", ")
      : "");
});

$("verify").addEventListener("click", async () => {
  const res = await send({ type: "VERIFY", caseData });
  if (res.error) { $("log").textContent = res.error; return; }
  $("log").textContent = res.issues.length
    ? "נמצאו פערים: " + res.issues.map((i) => `${i.code}: ${i.actual} במקום ${i.expected}`).join(" | ")
    : "אימות עבר — כל השדות במסך תואמים לתיק ✓";
});

$("readResult").addEventListener("click", async () => {
  const res = await send({ type: "READ_RESULT", caseData });
  const v = $("verdict");
  if (res.error || !res.result?.found) { $("log").textContent = "לא נמצאה שורת תוצאה בדף"; return; }
  const r = res.result;
  if (r.verdict === "debt_stop") {
    v.className = "verdict debt";
    v.textContent = "⛔ החישוב מציג חוב — אל תשדר! חזור לבדיקת הנתונים.";
  } else if (r.verdict === "match") {
    v.className = "verdict match";
    v.textContent = `✓ תוצאה תואמת לצפי: החזר ${fmt(Math.abs(r.amount))} ₪ — אפשר לשדר.`;
  } else {
    v.className = "verdict dev";
    v.textContent = `תוצאה ${fmt(Math.abs(r.amount))} ₪ סוטה מהצפי (${fmt(Math.abs(r.expected || 0))} ₪) — בדוק לפני שידור.`;
  }
});

(async function init() {
  const stored = await chrome.storage.local.get("caseData");
  if (stored.caseData) {
    caseData = stored.caseData;
    $("caseInput").value = JSON.stringify(caseData);
    renderPlan();
  }
  refreshScreen();
})();
