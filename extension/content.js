// content script — רץ בתוך דפי secapp.taxes.gov.il בלבד.
// עקרונות בטיחות (אל תשבור אותם):
//   1. לעולם לא לוחצים על כפתורי שידור/אישור — רק ממלאים שדות. הקליק האחרון של המשתמש.
//   2. אין קריאות רשת. כל הנתונים מ-chrome.storage.local, כל הלוגיקה לוקאלית.
//   3. כל כתיבה נרשמת ביומן פעולות שמוחזר ל-popup.

const SCREENS = window.__MAS_SCREENS;

function detectScreen() {
  const href = location.href;
  for (const [key, sc] of Object.entries(SCREENS)) {
    const m = href.match(sc.urlPattern);
    if (m) {
      if (sc.probe && !document.querySelector(sc.probe)) {
        return { key, title: sc.title, year: m[1] || null, ready: false };
      }
      return { key, title: sc.title, year: m[1] || null, ready: true };
    }
  }
  return null;
}

// ASP.NET WebForms: חובה לירות אירועי input+change אחרי קביעת ערך,
// אחרת ולידציות צד-לקוח והחישובים בדף לא ירוצו.
function setValue(el, value) {
  el.focus();
  el.value = String(value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.blur();
}

function markFilled(el, status) {
  el.classList.remove("mas-filled-ok", "mas-filled-diff");
  el.classList.add(status === "ok" ? "mas-filled-ok" : "mas-filled-diff");
}

function fillIncomeScreen(caseData) {
  const sc = SCREENS.income_details;
  const log = [];
  const fields = caseData.fields || {};

  for (const [code, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value === "") continue;
    const el = document.getElementById("txt" + code);
    const label = sc.amountFields[code] || "שדה " + code;
    if (!el) {
      log.push({ code, label, value, status: "not_found" });
      continue;
    }
    setValue(el, value);
    const ok = normalizeNum(el.value) === normalizeNum(value);
    markFilled(el, ok ? "ok" : "diff");
    log.push({ code, label, value, status: ok ? "filled" : "mismatch", domValue: el.value });
  }

  for (const code of caseData.checkboxes || []) {
    const el = document.getElementById("chk" + code);
    const label = sc.checkboxFields[code] || "סימון " + code;
    if (!el) { log.push({ code, label, value: "✓", status: "not_found" }); continue; }
    if (!el.checked) {
      el.click(); // click ולא checked=true — כדי שה-handlers של הדף ירוצו
    }
    markFilled(el, "ok");
    log.push({ code, label, value: "✓", status: el.checked ? "filled" : "mismatch" });
  }

  const kids = caseData.children || {}; // { "260": { age4_5: 1, age6_17: 1 } }
  for (const [row, cols] of Object.entries(kids)) {
    for (const [colKey, count] of Object.entries(cols)) {
      if (!count) continue;
      const suffix = sc.childrenCols[colKey];
      const el = document.getElementById("txt" + row + (suffix ? "_" + suffix : ""));
      const label = "ילדים " + row + " / " + colKey;
      if (!el) { log.push({ code: row, label, value: count, status: "not_found" }); continue; }
      setValue(el, count);
      markFilled(el, "ok");
      log.push({ code: row, label, value: count, status: "filled" });
    }
  }
  return log;
}

// אימות לאחר מילוי: קורא את ה-DOM מחדש ומשווה לתיק — שכבת ההגנה מפני טעויות הקלדה.
function verifyIncomeScreen(caseData) {
  const issues = [];
  for (const [code, value] of Object.entries(caseData.fields || {})) {
    if (value === null || value === undefined || value === "") continue;
    const el = document.getElementById("txt" + code);
    if (!el) { issues.push({ code, expected: value, actual: null, kind: "missing" }); continue; }
    if (normalizeNum(el.value) !== normalizeNum(value)) {
      issues.push({ code, expected: value, actual: el.value, kind: "mismatch" });
    }
  }
  return issues;
}

// מסך תוצאות: קורא את שורת "מס לאחר ניכוי במקור" ומשווה להחזר הצפוי מהתיק.
function readResult(caseData) {
  const text = document.body.innerText;
  const m = text.match(/מס לאחר ניכוי במקור\s*(-?[\d,]+)/);
  if (!m) return { found: false };
  const amount = normalizeNum(m[1]);
  const expected = caseData.expectedRefund != null ? -Math.abs(caseData.expectedRefund) : null;
  let verdict = "unknown";
  if (expected != null) {
    const diff = Math.abs(amount - expected);
    verdict = amount > 0 ? "debt_stop" : diff <= Math.abs(expected) * 0.1 ? "match" : "deviation";
  } else if (amount > 0) {
    verdict = "debt_stop";
  }
  return { found: true, amount, expected, verdict };
}

function normalizeNum(v) {
  return Number(String(v).replace(/[,\s₪]/g, "")) || 0;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const screen = detectScreen();
  if (msg.type === "DETECT") {
    sendResponse({ screen });
  } else if (msg.type === "FILL") {
    if (!screen || screen.key !== "income_details" || !screen.ready) {
      sendResponse({ error: "זה אינו מסך פירוט ההכנסות — נווט אליו קודם" });
    } else {
      sendResponse({ log: fillIncomeScreen(msg.caseData) });
    }
  } else if (msg.type === "VERIFY") {
    sendResponse({ issues: verifyIncomeScreen(msg.caseData) });
  } else if (msg.type === "READ_RESULT") {
    sendResponse({ result: readResult(msg.caseData) });
  } else if (msg.type === "GUIDANCE") {
    const sc = screen && SCREENS[screen.key];
    sendResponse({ guidance: (sc && sc.manualGuidance) || [] });
  }
  return true;
});
