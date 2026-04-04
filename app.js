(function () {
  "use strict";

  const STORAGE_USERS = "studyApp_users_v1";
  const STORAGE_SESSION = "studyApp_sessionUser";
  const STORAGE_THEME = "studyApp_theme";

  /** Çalışma süresi: 60 dk altı "X dk", üzeri "Y sa Z dk" / tam saat "Y sa" */
  function formatStudyMinutes(totalMins) {
    const m = Math.max(0, Math.round(Number(totalMins)) || 0);
    if (m < 60) return m + " dk";
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (rem === 0) return h + " sa";
    return h + " sa " + rem + " dk";
  }

  const CHAR_KEYS = ["char_knight", "char_mage", "char_archer", "char_rogue", "char_tank"];
  const CHAR_LABELS = {
    char_knight: "Şövalye",
    char_mage: "Büyücü",
    char_archer: "Okçu",
    char_rogue: "Hırsız",
    char_tank: "Tank",
  };

  const CHAR_SVG = {
    char_knight: `<svg class="char-svg" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="19" rx="9" ry="10" fill="#fdba74"/><path d="M15 11l9-4 9 4-1 12H16Z" fill="#94a3b8"/><rect x="20" y="17" width="8" height="3" rx="1" fill="#475569"/><path d="M17 23h14v11H17Z" fill="#2563eb"/><path d="M14 26h6v14h-5Zm14 0h6v14h-5Z" fill="#1d4ed8"/><rect x="21" y="34" width="6" height="6" rx="1" fill="#64748b"/></svg>`,
    char_mage: `<svg class="char-svg" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 4 L34 20 H14 Z" fill="#7c3aed"/><circle cx="24" cy="10" r="3" fill="#fbbf24"/><ellipse cx="24" cy="22" rx="8" ry="9" fill="#fca5a5"/><path d="M16 24h16v14H16Z" fill="#6d28d9"/><rect x="12" y="28" width="5" height="12" rx="2" fill="#5b21b6"/><rect x="31" y="28" width="5" height="12" rx="2" fill="#5b21b6"/><ellipse cx="24" cy="40" rx="4" ry="2" fill="#4c1d95"/></svg>`,
    char_archer: `<svg class="char-svg" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M14 8 Q24 4 34 8 L32 18 Q24 14 16 18Z" fill="#166534"/><ellipse cx="24" cy="21" rx="7" ry="8" fill="#fcd9bd"/><path d="M17 26h14v12H17Z" fill="#15803d"/><path d="M8 22c8 0 16 2 24 6" fill="none" stroke="#92400e" stroke-width="2"/><path d="M30 26l8-6v12Z" fill="#a8a29e"/><rect x="13" y="30" width="5" height="10" rx="1" fill="#14532d"/><rect x="30" y="30" width="5" height="10" rx="1" fill="#14532d"/></svg>`,
    char_rogue: `<svg class="char-svg" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M12 14 L24 8 36 14 34 24 H14Z" fill="#1e293b"/><ellipse cx="24" cy="20" rx="6" ry="7" fill="#fca5a5"/><rect x="18" y="21" width="4" height="2" fill="#0f172a"/><rect x="26" y="21" width="4" height="2" fill="#0f172a"/><path d="M20 25h8v2h-8Z" fill="#7f1d1d"/><path d="M16 27h16v11H16Z" fill="#334155"/><path d="M10 30 L6 36 8 38 14 32Z" fill="#64748b"/><path d="M38 30 L42 36 40 38 34 32Z" fill="#64748b"/><rect x="14" y="36" width="5" height="8" rx="1" fill="#1e293b"/><rect x="29" y="36" width="5" height="8" rx="1" fill="#1e293b"/></svg>`,
    char_tank: `<svg class="char-svg" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="16" width="14" height="22" rx="2" fill="#78716c"/><rect x="12" y="20" width="10" height="8" fill="#57534e"/><ellipse cx="24" cy="12" rx="7" ry="8" fill="#d6d3d1"/><rect x="20" y="10" width="8" height="5" rx="1" fill="#a8a29e"/><path d="M24 38h12v6H24Z" fill="#44403c"/><rect x="26" y="14" width="14" height="20" rx="2" fill="#a8a29e"/><path d="M28 18h10v12H28Z" fill="#d6d3d1"/><circle cx="33" cy="24" r="2" fill="#57534e"/><rect x="15" y="36" width="6" height="8" fill="#44403c"/></svg>`,
  };

  function normalizeAvatar(a) {
    if (CHAR_KEYS.includes(a)) return a;
    return "char_knight";
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function setProfileAvatarPreview(avatar) {
    const el = $("#profile-avatar-big");
    el.innerHTML = CHAR_SVG[normalizeAvatar(avatar)];
  }

  function setHeaderUser(u) {
    const el = $("#header-user");
    const name = escapeHtml(u.displayName || u.username);
    const k = normalizeAvatar(u.avatar);
    el.innerHTML = `<span class="header-av-wrap">${CHAR_SVG[k]}</span><span>${name}</span>`;
  }

  function friendAvatarHtml(avatar) {
    const k = normalizeAvatar(avatar);
    return `<span class="friend-av friend-av-char">${CHAR_SVG[k]}</span>`;
  }

  function lbAvatarHtml(avatar) {
    const k = normalizeAvatar(avatar);
    return `<span class="lb-av lb-av-char">${CHAR_SVG[k]}</span>`;
  }

  const defaultUser = () => ({
    password: "",
    displayName: "",
    avatar: "char_knight",
    friends: [],
    dailyGoalMinutes: 120,
    weeklyGoalMinutes: 600,
    studyLog: {},
  });

  function loadUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_USERS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }

  function getSessionUser() {
    return localStorage.getItem(STORAGE_SESSION) || "";
  }

  function setSessionUser(username) {
    if (username) localStorage.setItem(STORAGE_SESSION, username);
    else localStorage.removeItem(STORAGE_SESSION);
  }

  function encodePass(p) {
    return btoa(unescape(encodeURIComponent(p)));
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function formatKey(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /** Haftanın başlangıcı: Pazartesi */
  function startOfWeek(d) {
    const x = new Date(d);
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function minutesThisWeek(log) {
    const start = startOfWeek(new Date());
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const k = formatKey(addDays(start, i));
      total += log[k] || 0;
    }
    return total;
  }

  function minutesTodayForUser(u) {
    return u.studyLog[todayKey()] || 0;
  }

  function minutesThisWeekForUser(u) {
    return minutesThisWeek(u.studyLog);
  }

  function computeStreak(log) {
    let d = new Date();
    let key = formatKey(d);
    if (!log[key] || log[key] <= 0) {
      d = addDays(d, -1);
      key = formatKey(d);
    }
    let streak = 0;
    while (true) {
      const k = formatKey(d);
      const m = log[k] || 0;
      if (m > 0) {
        streak++;
        d = addDays(d, -1);
      } else break;
    }
    return streak;
  }

  function getCurrentUser() {
    const name = getSessionUser();
    if (!name) return null;
    const users = loadUsers();
    return users[name] ? { username: name, ...users[name] } : null;
  }

  function updateCurrentUser(mutator) {
    const name = getSessionUser();
    if (!name) return;
    const users = loadUsers();
    if (!users[name]) return;
    const u = { ...users[name] };
    mutator(u);
    users[name] = u;
    saveUsers(users);
  }

  /* ---------- UI ---------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  const viewAuth = $("#view-auth");
  const viewMain = $("#view-main");
  const authMessage = $("#auth-message");

  function showAuth(msg, isError) {
    authMessage.textContent = msg || "";
    authMessage.className = "message " + (isError ? "error" : msg ? "ok" : "");
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    localStorage.setItem(STORAGE_THEME, theme === "dark" ? "dark" : "light");
  }

  function loadTheme() {
    const t = localStorage.getItem(STORAGE_THEME) || "dark";
    applyTheme(t);
  }

  const authFormsBlock = $("#auth-forms-block");
  const recoverBlock = $("#recover-block");

  function showRecover(prefillUsername) {
    authFormsBlock.classList.add("hidden");
    recoverBlock.classList.remove("hidden");
    if (prefillUsername) $("#reset-user").value = prefillUsername;
    showAuth("");
  }

  function hideRecover() {
    recoverBlock.classList.add("hidden");
    authFormsBlock.classList.remove("hidden");
  }

  function showPage(id) {
    $$(".page").forEach((p) => p.classList.toggle("active", p.id === "page-" + id));
    $$(".pill").forEach((b) => b.classList.toggle("active", b.dataset.page === id));
  }

  function refreshAll() {
    const u = getCurrentUser();
    if (!u) return;

    $("#dash-name").textContent = u.displayName || u.username;
    const todayM = minutesTodayForUser(u);
    const weekM = minutesThisWeekForUser(u);
    $("#dash-today").textContent = formatStudyMinutes(todayM);
    $("#dash-week").textContent = formatStudyMinutes(weekM);

    const dg = u.dailyGoalMinutes || 1;
    const wg = u.weeklyGoalMinutes || 1;
    $("#dash-daily-goal").textContent = formatStudyMinutes(dg);
    $("#dash-week-goal").textContent = formatStudyMinutes(wg);

    const dp = Math.min(100, Math.round((todayM / dg) * 100));
    const wp = Math.min(100, Math.round((weekM / wg) * 100));
    $("#dash-daily-bar").style.width = dp + "%";
    $("#dash-week-bar").style.width = wp + "%";
    $("#dash-daily-pct").textContent = dp + "%";
    $("#dash-week-pct").textContent = wp + "%";
    $("#dash-streak").textContent = computeStreak(u.studyLog) + " gün";

    setHeaderUser(u);

    $("#goal-daily").value = u.dailyGoalMinutes;
    $("#goal-weekly").value = u.weeklyGoalMinutes;

    renderFriends(u);
    renderLeaderboard("today");
    renderStats(u);
    $("#profile-display-name").textContent = u.displayName || u.username;
    $("#profile-username").textContent = "@" + u.username;
    $("#profile-name-input").value = u.displayName || "";
    setProfileAvatarPreview(u.avatar);
    renderAvatarPicker(u.avatar);

    renderCalendar();
  }

  function renderFriends(u) {
    const users = loadUsers();
    const list = $("#friends-list");
    list.innerHTML = "";
    const msg = $("#friends-message");
    msg.textContent = "";
    msg.className = "message";

    (u.friends || []).forEach((fun) => {
      const fu = users[fun];
      const li = document.createElement("li");
      const todayOther = fu ? minutesTodayForUser(fu) : 0;
      const nm = fu ? fu.displayName || fun : fun + " (bulunamadı)";
      li.innerHTML = `
        <div class="friend-meta">
          ${friendAvatarHtml(fu ? fu.avatar : "❓")}
          <span>${nm}</span>
        </div>
        <strong>${formatStudyMinutes(todayOther)}</strong>
      `;
      list.appendChild(li);
    });

    if (!u.friends || u.friends.length === 0) {
      const li = document.createElement("li");
      li.className = "muted";
      li.textContent = "Henüz arkadaş yok. Kullanıcı adı ile ekle.";
      list.appendChild(li);
    }
  }

  let leaderboardMode = "today";

  function renderLeaderboard(mode) {
    leaderboardMode = mode || leaderboardMode;
    const users = loadUsers();
    const arr = Object.keys(users).map((username) => {
      const uu = users[username];
      let score = 0;
      if (leaderboardMode === "today") score = minutesTodayForUser(uu);
      else score = minutesThisWeekForUser(uu);
      return {
        username,
        displayName: uu.displayName || username,
        avatar: normalizeAvatar(uu.avatar),
        score,
      };
    });
    arr.sort((a, b) => b.score - a.score);
    const ol = $("#leaderboard-list");
    ol.innerHTML = "";
    arr.forEach((row, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>#${i + 1}</strong> ${lbAvatarHtml(row.avatar)} ${escapeHtml(row.displayName)} <span class="muted">(@${escapeHtml(row.username)})</span> — <strong>${formatStudyMinutes(row.score)}</strong>`;
      ol.appendChild(li);
    });
  }

  function renderStats(u) {
    const log = u.studyLog || {};
    const keys = Object.keys(log).filter((k) => log[k] > 0).sort();
    const totalMin = keys.reduce((s, k) => s + log[k], 0);
    $("#stat-days").textContent = String(keys.length);
    $("#stat-total-min").textContent = formatStudyMinutes(totalMin);
    $("#stat-avg").textContent = keys.length ? formatStudyMinutes(Math.round(totalMin / keys.length)) : "0 dk";

    let bestK = null;
    let bestV = 0;
    keys.forEach((k) => {
      if (log[k] > bestV) {
        bestV = log[k];
        bestK = k;
      }
    });
    $("#stat-best").textContent = bestK ? `${bestK} (${formatStudyMinutes(bestV)})` : "—";

    const bars = $("#stat-bars");
    bars.innerHTML = "";
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const k = formatKey(d);
      const m = log[k] || 0;
      const max = 120;
      const h = Math.min(100, Math.round((m / max) * 100)) || (m > 0 ? 8 : 4);
      const wrap = document.createElement("div");
      wrap.className = "stat-bar-wrap";
      wrap.innerHTML = `
        <div class="stat-bar" style="height:${h}px" title="${formatStudyMinutes(m)}"></div>
        <span class="stat-bar-label">${pad(d.getDate())}/${pad(d.getMonth() + 1)}</span>
      `;
      bars.appendChild(wrap);
    }
  }

  let calCursor = new Date();

  function renderCalendar() {
    const u = getCurrentUser();
    if (!u) return;
    const log = u.studyLog || {};
    const y = calCursor.getFullYear();
    const m = calCursor.getMonth();
    $("#cal-title").textContent = `${y} — ${m + 1}. ay`;
    const first = new Date(y, m, 1);
    const startWeekday = first.getDay();
    const mondayOffset = startWeekday === 0 ? 6 : startWeekday - 1;
    const gridStart = addDays(first, -mondayOffset);
    const grid = $("#cal-grid");
    grid.innerHTML = "";
    const todayK = todayKey();

    for (let i = 0; i < 42; i++) {
      const d = addDays(gridStart, i);
      const k = formatKey(d);
      const inMonth = d.getMonth() === m;
      const mins = log[k] || 0;
      const cell = document.createElement("div");
      cell.className = "cal-cell" + (!inMonth ? " other-month" : "") + (k === todayK ? " today" : "");
      cell.innerHTML = `<span class="day-num">${d.getDate()}</span><span class="day-min">${mins > 0 ? formatStudyMinutes(mins) : "—"}</span>`;
      grid.appendChild(cell);
    }
  }

  function renderAvatarPicker(current) {
    const box = $("#avatar-picker");
    box.innerHTML = "";
    const cur = normalizeAvatar(current);
    const pick = (val) => {
      $$(".avatar-opt").forEach((x) => x.classList.remove("selected"));
      window._pickedAvatar = val;
      setProfileAvatarPreview(val);
    };

    CHAR_KEYS.forEach((key) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "avatar-opt avatar-opt-char" + (key === cur ? " selected" : "");
      b.title = CHAR_LABELS[key];
      b.setAttribute("aria-label", CHAR_LABELS[key]);
      b.innerHTML = CHAR_SVG[key];
      b.addEventListener("click", () => {
        $$(".avatar-opt").forEach((x) => x.classList.remove("selected"));
        b.classList.add("selected");
        pick(key);
      });
      box.appendChild(b);
    });
    window._pickedAvatar = cur;
  }

  /* ---------- Auth handlers ---------- */
  $$(".tab[data-auth-tab]").forEach((t) => {
    t.addEventListener("click", () => {
      hideRecover();
      const tab = t.dataset.authTab;
      $$(".tab[data-auth-tab]").forEach((x) => x.classList.toggle("active", x === t));
      $("#form-login").classList.toggle("active", tab === "login");
      $("#form-register").classList.toggle("active", tab === "register");
      showAuth("");
    });
  });

  $("#btn-show-recover").addEventListener("click", () => {
    const u = $("#login-user").value.trim().toLowerCase();
    showRecover(u || undefined);
  });

  $("#btn-back-login").addEventListener("click", () => {
    hideRecover();
    $$(".tab[data-auth-tab]").forEach((x) => x.classList.toggle("active", x.dataset.authTab === "login"));
    $("#form-login").classList.add("active");
    $("#form-register").classList.remove("active");
    showAuth("");
  });

  $("#form-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const user = $("#login-user").value.trim().toLowerCase();
    const pass = $("#login-pass").value;
    const users = loadUsers();
    if (!users[user]) {
      showAuth("Kullanıcı bulunamadı. Kayıt olabilir veya kullanıcı adını kontrol edebilirsin.", true);
      return;
    }
    if (users[user].password !== encodePass(pass)) {
      showAuth("Şifre hatalı. Şifre sıfırlama formu açıldı.", true);
      showRecover(user);
      return;
    }
    hideRecover();
    setSessionUser(user);
    showAuth("Giriş başarılı.", false);
    enterApp();
  });

  $("#form-register").addEventListener("submit", (e) => {
    e.preventDefault();
    const displayName = $("#reg-name").value.trim();
    const user = $("#reg-user").value.trim().toLowerCase();
    const pass = $("#reg-pass").value;
    const users = loadUsers();
    if (users[user]) {
      showAuth("Bu kullanıcı adı alınmış.", true);
      return;
    }
    users[user] = {
      ...defaultUser(),
      displayName: displayName || user,
      password: encodePass(pass),
    };
    saveUsers(users);
    setSessionUser(user);
    showAuth("Kayıt tamam. Hoş geldin!", false);
    enterApp();
  });

  $("#form-reset").addEventListener("submit", (e) => {
    e.preventDefault();
    const user = $("#reset-user").value.trim().toLowerCase();
    const pass = $("#reset-pass").value;
    const users = loadUsers();
    if (!users[user]) {
      showAuth("Bu kullanıcı adı kayıtlı değil.", true);
      return;
    }
    users[user].password = encodePass(pass);
    saveUsers(users);
    $("#reset-pass").value = "";
    $("#login-pass").value = "";
    hideRecover();
    $$(".tab[data-auth-tab]").forEach((x) => x.classList.toggle("active", x.dataset.authTab === "login"));
    $("#form-login").classList.add("active");
    $("#form-register").classList.remove("active");
    showAuth("Şifre güncellendi. Giriş yapabilirsin.", false);
  });

  function enterApp() {
    viewAuth.classList.add("hidden");
    viewMain.classList.remove("hidden");
    refreshAll();
    initTimersFromStorage();
  }

  function leaveApp() {
    setSessionUser("");
    viewMain.classList.add("hidden");
    viewAuth.classList.remove("hidden");
    hideRecover();
    stopAllTimers();
  }

  $("#btn-logout").addEventListener("click", leaveApp);

  $("#theme-toggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(cur === "dark" ? "light" : "dark");
  });

  $$(".pill[data-page]").forEach((p) => {
    p.addEventListener("click", () => showPage(p.dataset.page));
  });

  $$("[data-goto]").forEach((b) => {
    b.addEventListener("click", () => showPage(b.dataset.goto));
  });

  $$(".tab[data-lb]").forEach((t) => {
    t.addEventListener("click", () => {
      $$(".tab[data-lb]").forEach((x) => x.classList.toggle("active", x === t));
      renderLeaderboard(t.dataset.lb);
    });
  });

  $("#form-goals").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = parseInt($("#goal-daily").value, 10);
    const w = parseInt($("#goal-weekly").value, 10);
    if (d < 1 || w < 1) {
      $("#goals-message").textContent = "Hedefler en az 1 dakika olmalı.";
      $("#goals-message").className = "message error";
      return;
    }
    updateCurrentUser((u) => {
      u.dailyGoalMinutes = d;
      u.weeklyGoalMinutes = w;
    });
    $("#goals-message").textContent = "Hedefler kaydedildi.";
    $("#goals-message").className = "message ok";
    refreshAll();
  });

  const btnResetGoals = document.createElement("button");
  btnResetGoals.type = "button";
  btnResetGoals.className = "btn danger";
  btnResetGoals.textContent = "Hedefleri varsayılana sıfırla (120 / 600 dk)";
  btnResetGoals.style.marginTop = "0.75rem";
  $("#form-goals").appendChild(btnResetGoals);
  btnResetGoals.addEventListener("click", () => {
    updateCurrentUser((u) => {
      u.dailyGoalMinutes = 120;
      u.weeklyGoalMinutes = 600;
    });
    $("#goals-message").textContent = "Varsayılan hedeflere dönüldü.";
    $("#goals-message").className = "message ok";
    refreshAll();
  });

  $("#form-add-friend").addEventListener("submit", (e) => {
    e.preventDefault();
    const fu = $("#friend-user").value.trim().toLowerCase();
    const msg = $("#friends-message");
    msg.className = "message";
    if (!fu) return;
    const users = loadUsers();
    const me = getSessionUser();
    if (fu === me) {
      msg.textContent = "Kendini arkadaş olarak ekleyemezsin.";
      msg.className = "message error";
      return;
    }
    if (!users[fu]) {
      msg.textContent = "Bu kullanıcı adı kayıtlı değil (aynı tarayıcıda kayıtlı olmalı).";
      msg.className = "message error";
      return;
    }
    updateCurrentUser((u) => {
      u.friends = u.friends || [];
      if (!u.friends.includes(fu)) u.friends.push(fu);
    });
    msg.textContent = "Arkadaş eklendi.";
    msg.className = "message ok";
    $("#friend-user").value = "";
    refreshAll();
  });

  $("#btn-save-profile").addEventListener("click", () => {
    const name = $("#profile-name-input").value.trim();
    const av = normalizeAvatar(window._pickedAvatar || "char_knight");
    updateCurrentUser((u) => {
      u.displayName = name || u.displayName;
      u.avatar = av;
    });
    $("#profile-message").textContent = "Profil güncellendi.";
    $("#profile-message").className = "message ok";
    refreshAll();
  });

  $("#cal-prev").addEventListener("click", () => {
    calCursor.setMonth(calCursor.getMonth() - 1);
    renderCalendar();
  });
  $("#cal-next").addEventListener("click", () => {
    calCursor.setMonth(calCursor.getMonth() + 1);
    renderCalendar();
  });

  /* ---------- Timers ---------- */
  let freeInterval = null;
  let freeStartedAt = null;
  let freeAccumMs = 0;
  let freeRunning = false;

  let pomoInterval = null;
  let pomoSecondsLeft = 25 * 60;
  let pomoPhase = "work";
  let pomoRunning = false;
  const POMO_WORK = 25 * 60;
  const POMO_BREAK = 5 * 60;

  function formatHMS(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  }

  function formatMS(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${pad(m)}:${pad(s)}`;
  }

  function updateFreeDisplay() {
    let ms = freeAccumMs;
    if (freeRunning && freeStartedAt) ms += Date.now() - freeStartedAt;
    $("#timer-free").textContent = formatHMS(ms);
  }

  function updatePomoDisplay() {
    $("#timer-pomo").textContent = formatMS(pomoSecondsLeft);
    $("#pomo-phase").textContent = pomoPhase === "work" ? "Çalışma (25 dk)" : "Mola (5 dk)";
  }

  function addMinutesToToday(minutes) {
    if (minutes <= 0) return;
    updateCurrentUser((u) => {
      u.studyLog = u.studyLog || {};
      const k = todayKey();
      u.studyLog[k] = (u.studyLog[k] || 0) + minutes;
    });
    refreshAll();
  }

  function setFreeButtons() {
    $("#btn-free-start").disabled = freeRunning;
    $("#btn-free-pause").disabled = !freeRunning;
    $("#btn-free-stop").disabled = !freeRunning && freeAccumMs === 0;
  }

  $("#btn-free-start").addEventListener("click", () => {
    if (freeRunning) return;
    freeRunning = true;
    freeStartedAt = Date.now();
    freeInterval = setInterval(updateFreeDisplay, 250);
    setFreeButtons();
  });

  $("#btn-free-pause").addEventListener("click", () => {
    if (!freeRunning) return;
    freeAccumMs += Date.now() - freeStartedAt;
    freeStartedAt = null;
    freeRunning = false;
    clearInterval(freeInterval);
    freeInterval = null;
    updateFreeDisplay();
    setFreeButtons();
  });

  $("#btn-free-stop").addEventListener("click", () => {
    if (freeRunning) {
      freeAccumMs += Date.now() - freeStartedAt;
      freeStartedAt = null;
      freeRunning = false;
    }
    clearInterval(freeInterval);
    freeInterval = null;
    const mins = Math.floor(freeAccumMs / 60000);
    freeAccumMs = 0;
    updateFreeDisplay();
    setFreeButtons();
    if (mins > 0) addMinutesToToday(mins);
  });

  function setPomoButtons() {
    $("#btn-pomo-start").disabled = pomoRunning;
    $("#btn-pomo-pause").disabled = !pomoRunning;
  }

  function pomoTick() {
    if (!pomoRunning) return;
    pomoSecondsLeft -= 1;
    if (pomoSecondsLeft <= 0) {
      if (pomoPhase === "work") {
        addMinutesToToday(25);
        pomoPhase = "break";
        pomoSecondsLeft = POMO_BREAK;
      } else {
        pomoPhase = "work";
        pomoSecondsLeft = POMO_WORK;
      }
    }
    updatePomoDisplay();
  }

  $("#btn-pomo-start").addEventListener("click", () => {
    if (pomoRunning) return;
    pomoRunning = true;
    pomoInterval = setInterval(pomoTick, 1000);
    setPomoButtons();
  });

  $("#btn-pomo-pause").addEventListener("click", () => {
    pomoRunning = false;
    clearInterval(pomoInterval);
    pomoInterval = null;
    setPomoButtons();
  });

  $("#btn-pomo-reset").addEventListener("click", () => {
    pomoRunning = false;
    clearInterval(pomoInterval);
    pomoInterval = null;
    pomoPhase = "work";
    pomoSecondsLeft = POMO_WORK;
    updatePomoDisplay();
    setPomoButtons();
  });

  function stopAllTimers() {
    freeRunning = false;
    clearInterval(freeInterval);
    freeInterval = null;
    pomoRunning = false;
    clearInterval(pomoInterval);
    pomoInterval = null;
  }

  function initTimersFromStorage() {
    freeAccumMs = 0;
    freeStartedAt = null;
    freeRunning = false;
    clearInterval(freeInterval);
    freeInterval = null;
    updateFreeDisplay();
    setFreeButtons();

    pomoPhase = "work";
    pomoSecondsLeft = POMO_WORK;
    pomoRunning = false;
    clearInterval(pomoInterval);
    pomoInterval = null;
    updatePomoDisplay();
    setPomoButtons();
  }

  /* ---------- Boot ---------- */
  loadTheme();
  updatePomoDisplay();
  setFreeButtons();
  setPomoButtons();

  const session = getSessionUser();
  const users = loadUsers();
  if (session && users[session]) {
    viewAuth.classList.add("hidden");
    viewMain.classList.remove("hidden");
    refreshAll();
  }
})();
