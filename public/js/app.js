(function () {
  'use strict';

  const API = '';
  const LS_TOKEN = 'focusnet_token';
  const LS_THEME = 'focusnet_theme';

  const WORK_SEC = 25 * 60;
  const BREAK_SEC = 5 * 60;

  const AVATAR_GRADS = [
    'linear-gradient(135deg,#0ea5e9,#2dd4bf)',
    'linear-gradient(135deg,#6366f1,#a78bfa)',
    'linear-gradient(135deg,#ec4899,#f472b6)',
    'linear-gradient(135deg,#f59e0b,#fbbf24)',
    'linear-gradient(135deg,#10b981,#34d399)',
    'linear-gradient(135deg,#3b82f6,#22d3ee)',
    'linear-gradient(135deg,#8b5cf6,#d946ef)',
    'linear-gradient(135deg,#14b8a6,#06b6d4)',
  ];

  let token = localStorage.getItem(LS_TOKEN);
  let freeRunning = false;
  let freeStarted = 0;
  let freeElapsed = 0;
  let freeRaf = null;

  let pomoRunning = false;
  let pomoPaused = false;
  let pomoPhase = 'work';
  let pomoRemaining = WORK_SEC;
  let pomoTick = null;

  const $ = (id) => document.getElementById(id);

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    };
  }

  async function api(path, opts = {}) {
    const res = await fetch(API + path, {
      ...opts,
      headers: { ...authHeaders(), ...opts.headers },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  }

  function applyTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
    localStorage.setItem(LS_THEME, theme === 'light' ? 'light' : 'dark');
    const btn = $('themeToggle');
    if (btn) btn.textContent = theme === 'light' ? '☀' : '☾';
  }

  function loadSavedTheme() {
    const t = localStorage.getItem(LS_THEME);
    if (t === 'light' || t === 'dark') applyTheme(t);
    else applyTheme('dark');
  }

  loadSavedTheme();

  function showView(name) {
    document.querySelectorAll('.view').forEach((v) => {
      v.hidden = v.id !== 'view' + name.charAt(0).toUpperCase() + name.slice(1);
    });
    if (name === 'Auth') {
      $('navMain').hidden = true;
      $('headerActions').hidden = true;
    } else {
      $('navMain').hidden = false;
      $('headerActions').hidden = false;
    }
  }

  function setNavActive(view) {
    document.querySelectorAll('.nav-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.view === view);
    });
  }

  function avatarStyle(index) {
    return AVATAR_GRADS[Math.min(7, Math.max(0, index))] || AVATAR_GRADS[0];
  }

  function setAvatarEl(el, index, letter) {
    if (!el) return;
    el.style.background = avatarStyle(index);
    el.textContent = (letter || '?').charAt(0).toUpperCase();
  }

  function formatHMS(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
  }

  function formatMMSS(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function updateRing(percent) {
    const ring = $('goalRing');
    if (!ring) return;
    const c = 2 * Math.PI * 52;
    const off = c - (Math.min(100, percent) / 100) * c;
    ring.style.strokeDasharray = String(c);
    ring.style.strokeDashoffset = String(off);
  }

  async function refreshDashboard() {
    const data = await api('/api/me');
    const u = data.user;
    $('dashName').textContent = u.displayName || 'Öğrenci';
    $('dashEmail').textContent = u.email;
    $('dashStreak').textContent = u.streak || 0;
    setAvatarEl($('dashAvatar'), u.avatarIndex, u.displayName || u.email);

    const g = data.todayGoal;
    const target = g ? g.targetMinutes : 0;
    const done = g ? g.completedMinutes : 0;
    $('goalTarget').textContent = target;
    $('goalDone').textContent = done;
    const pct = data.todayProgressPercent != null ? data.todayProgressPercent : 0;
    $('goalPercent').textContent = pct + '%';
    updateRing(pct);

    if (g) {
      $('goalH').value = Math.floor(g.targetMinutes / 60);
      $('goalM').value = g.targetMinutes % 60;
    }
    return data;
  }

  async function logStudy(minutes, mode) {
    if (minutes < 1) return;
    await api('/api/study/log', {
      method: 'POST',
      body: JSON.stringify({ durationMinutes: minutes, mode }),
    });
    await refreshDashboard();
  }

  function stopFreeTimer() {
    freeRunning = false;
    if (freeRaf) cancelAnimationFrame(freeRaf);
    freeRaf = null;
    $('freeStart').disabled = false;
    $('freeStop').disabled = true;
  }

  function tickFree() {
    if (!freeRunning) return;
    const now = performance.now();
    const total = freeElapsed + (now - freeStarted);
    $('freeTimerDisplay').textContent = formatHMS(total);
    freeRaf = requestAnimationFrame(tickFree);
  }

  $('freeStart').addEventListener('click', () => {
    if (freeRunning) return;
    freeRunning = true;
    freeStarted = performance.now();
    $('freeStart').disabled = true;
    $('freeStop').disabled = false;
    tickFree();
  });

  $('freeStop').addEventListener('click', async () => {
    if (!freeRunning) return;
    const now = performance.now();
    const totalMs = freeElapsed + (now - freeStarted);
    stopFreeTimer();
    freeElapsed = 0;
    $('freeTimerDisplay').textContent = '00:00:00';
    const mins = Math.max(1, Math.round(totalMs / 60000));
    try {
      await logStudy(mins, 'free');
    } catch (e) {
      alert(e.message);
    }
  });

  function updatePomoDisplay() {
    $('pomoDisplay').textContent = formatMMSS(pomoRemaining);
    $('pomoPhase').textContent = pomoPhase === 'work' ? 'Çalışma' : 'Mola';
  }

  function clearPomoInterval() {
    if (pomoTick) clearInterval(pomoTick);
    pomoTick = null;
  }

  function finishPomoPhase() {
    if (pomoPhase === 'work') {
      logStudy(25, 'pomodoro_work').catch((e) => alert(e.message));
      pomoPhase = 'break';
      pomoRemaining = BREAK_SEC;
    } else {
      pomoPhase = 'work';
      pomoRemaining = WORK_SEC;
    }
    updatePomoDisplay();
  }

  $('pomoStart').addEventListener('click', () => {
    if (pomoRunning && !pomoPaused) return;
    if (!pomoRunning) {
      pomoRunning = true;
      pomoPaused = false;
      if (pomoRemaining <= 0) {
        pomoPhase = 'work';
        pomoRemaining = WORK_SEC;
      }
    } else {
      pomoPaused = false;
    }
    $('pomoStart').disabled = true;
    $('pomoPause').disabled = false;
    $('pomoStop').disabled = false;
    clearPomoInterval();
    pomoTick = setInterval(async () => {
      pomoRemaining -= 1;
      updatePomoDisplay();
      if (pomoRemaining <= 0) {
        finishPomoPhase();
      }
    }, 1000);
  });

  $('pomoPause').addEventListener('click', () => {
    if (!pomoRunning || pomoPaused) return;
    pomoPaused = true;
    clearPomoInterval();
    $('pomoStart').disabled = false;
  });

  $('pomoStop').addEventListener('click', () => {
    clearPomoInterval();
    pomoRunning = false;
    pomoPaused = false;
    pomoPhase = 'work';
    pomoRemaining = WORK_SEC;
    updatePomoDisplay();
    $('pomoStart').disabled = false;
    $('pomoPause').disabled = true;
    $('pomoStop').disabled = true;
  });

  updatePomoDisplay();

  $('formGoal').addEventListener('submit', async (e) => {
    e.preventDefault();
    const h = parseInt($('goalH').value, 10) || 0;
    const m = parseInt($('goalM').value, 10) || 0;
    try {
      await api('/api/goals', {
        method: 'POST',
        body: JSON.stringify({ hours: h, minutes: m }),
      });
      await refreshDashboard();
    } catch (err) {
      alert(err.message);
    }
  });

  $('deleteTodayGoal').addEventListener('click', async () => {
    const d = new Date().toISOString().slice(0, 10);
    if (!confirm('Bugünkü hedef silinsin mi?')) return;
    try {
      await api('/api/goals/' + d, { method: 'DELETE' });
      await refreshDashboard();
    } catch (e) {
      alert(e.message);
    }
  });

  let calYear = new Date().getFullYear();
  let calMonth = new Date().getMonth() + 1;

  function renderCalendar(data) {
    const first = new Date(calYear, calMonth - 1, 1);
    const startWeekday = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(calYear, calMonth, 0).getDate();
    $('calTitle').textContent =
      new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(
        new Date(calYear, calMonth - 1, 1)
      );

    const grid = $('calGrid');
    grid.innerHTML = '';
    for (let i = 0; i < startWeekday; i++) {
      const cell = document.createElement('div');
      cell.className = 'cal-cell empty';
      grid.appendChild(cell);
    }
    const sm = String(calMonth).padStart(2, '0');
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = String(d).padStart(2, '0');
      const key = calYear + '-' + sm + '-' + ds;
      const mins = data.sessionMap[key] || 0;
      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      cell.innerHTML = '<span class="day-num">' + d + '</span><span class="day-min">' + mins + ' dk</span>';
      grid.appendChild(cell);
    }
  }

  async function loadCalendar() {
    const q = '?year=' + calYear + '&month=' + calMonth;
    const data = await api('/api/calendar' + q);
    renderCalendar(data);
  }

  $('calPrev').addEventListener('click', () => {
    calMonth -= 1;
    if (calMonth < 1) {
      calMonth = 12;
      calYear -= 1;
    }
    loadCalendar().catch((e) => alert(e.message));
  });
  $('calNext').addEventListener('click', () => {
    calMonth += 1;
    if (calMonth > 12) {
      calMonth = 1;
      calYear += 1;
    }
    loadCalendar().catch((e) => alert(e.message));
  });

  async function loadFriends() {
    const data = await api('/api/friends');
    const ul = $('friendList');
    ul.innerHTML = '';
    data.friends.forEach((f) => {
      const li = document.createElement('li');
      const left = document.createElement('div');
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.gap = '0.75rem';
      const av = document.createElement('span');
      av.className = 'avatar';
      av.style.width = '40px';
      av.style.height = '40px';
      av.style.fontSize = '1rem';
      setAvatarEl(av, f.avatarIndex, f.displayName);
      const info = document.createElement('div');
      info.innerHTML = '<strong>' + (f.displayName || '') + '</strong><br><span class="muted">' + (f.email || '') + '</span>';
      left.appendChild(av);
      left.appendChild(info);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-danger-outline';
      btn.style.marginTop = '0';
      btn.style.width = 'auto';
      btn.style.padding = '0.35rem 0.65rem';
      btn.textContent = 'Sil';
      btn.addEventListener('click', async () => {
        if (!confirm('Arkadaşı listeden çıkar?')) return;
        try {
          await api('/api/friends/' + f._id, { method: 'DELETE' });
          await loadFriends();
        } catch (e) {
          alert(e.message);
        }
      });
      li.appendChild(left);
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  $('formAddFriend').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('friendError').hidden = true;
    try {
      await api('/api/friends', {
        method: 'POST',
        body: JSON.stringify({ email: $('friendEmail').value.trim() }),
      });
      $('friendEmail').value = '';
      await loadFriends();
    } catch (err) {
      $('friendError').textContent = err.message;
      $('friendError').hidden = false;
    }
  });

  async function loadLeaderboard() {
    const data = await api('/api/leaderboard');
    $('lbMe').textContent =
      'Sıranız: #' + data.myRank + ' · Toplam ' + data.myMinutes + ' dk';
    const ol = $('lbList');
    ol.innerHTML = '';
    data.top.forEach((u, i) => {
      const li = document.createElement('li');
      li.textContent =
        i + 1 + '. ' + (u.displayName || u.email) + ' — ' + (u.totalMinutesAllTime || 0) + ' dk (streak ' + (u.streak || 0) + ')';
      ol.appendChild(li);
    });
  }

  let selectedAvatar = 0;

  function buildAvatarPicker(current) {
    selectedAvatar = current;
    const wrap = $('avatarPicker');
    wrap.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'avatar-option' + (i === current ? ' selected' : '');
      b.textContent = String.fromCharCode(65 + i);
      b.style.background = avatarStyle(i);
      b.style.color = '#fff';
      b.style.textShadow = '0 1px 2px rgba(0,0,0,.4)';
      b.addEventListener('click', () => {
        selectedAvatar = i;
        wrap.querySelectorAll('.avatar-option').forEach((x, j) => x.classList.toggle('selected', j === i));
      });
      wrap.appendChild(b);
    }
  }

  $('saveProfile').addEventListener('click', async () => {
    $('profileOk').hidden = true;
    try {
      const theme = localStorage.getItem(LS_THEME) === 'light' ? 'light' : 'dark';
      await api('/api/me', {
        method: 'PUT',
        body: JSON.stringify({
          displayName: $('profileName').value.trim(),
          avatarIndex: selectedAvatar,
          theme,
        }),
      });
      applyTheme(theme);
      $('profileOk').hidden = false;
      await refreshDashboard();
    } catch (e) {
      alert(e.message);
    }
  });

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.view;
      setNavActive(v);
      showView(v.charAt(0).toUpperCase() + v.slice(1));
      if (v === 'calendar') loadCalendar().catch((e) => alert(e.message));
      if (v === 'friends') loadFriends().catch((e) => alert(e.message));
      if (v === 'leaderboard') loadLeaderboard().catch((e) => alert(e.message));
      if (v === 'profile') {
        api('/api/me')
          .then((d) => {
            $('profileName').value = d.user.displayName || '';
            buildAvatarPicker(d.user.avatarIndex || 0);
          })
          .catch((e) => alert(e.message));
      }
    });
  });

  $('themeToggle').addEventListener('click', () => {
    const next = document.body.classList.contains('theme-light') ? 'dark' : 'light';
    applyTheme(next);
    if (token) {
      api('/api/me', {
        method: 'PUT',
        body: JSON.stringify({ theme: next }),
      }).catch(() => {});
    }
  });

  $('logoutBtn').addEventListener('click', () => {
    token = null;
    localStorage.removeItem(LS_TOKEN);
    showAuth();
  });

  function showAuth() {
    showView('Auth');
  }

  async function bootApp() {
    if (!token) {
      showAuth();
      return;
    }
    try {
      const d = await api('/api/me');
      applyTheme(d.user.theme || localStorage.getItem(LS_THEME) || 'dark');
      showView('Dashboard');
      setNavActive('dashboard');
      await refreshDashboard();
    } catch {
      token = null;
      localStorage.removeItem(LS_TOKEN);
      showAuth();
    }
  }

  document.querySelectorAll('.tab').forEach((t) => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      const name = t.dataset.tab;
      $('formLogin').hidden = name !== 'login';
      $('formRegister').hidden = name !== 'register';
      $('formReset').hidden = true;
      $('loginError').hidden = true;
      $('regError').hidden = true;
    });
  });

  $('showReset').addEventListener('click', () => {
    $('formLogin').hidden = true;
    $('formRegister').hidden = true;
    $('formReset').hidden = false;
    $('resetEmail').value = $('loginEmail').value || '';
  });

  $('backToLogin').addEventListener('click', () => {
    $('formReset').hidden = true;
    $('formLogin').hidden = false;
    document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x.dataset.tab === 'login'));
  });

  $('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('loginError').hidden = true;
    try {
      const res = await fetch(API + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: $('loginEmail').value.trim(),
          password: $('loginPassword').value,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        $('loginError').textContent = data.error || 'Hata';
        $('loginError').hidden = false;
        if (data.wrongPassword) {
          $('loginError').textContent += ' — Şifre sıfırlamak için aşağıdaki bağlantıyı kullanın.';
        }
        return;
      }
      token = data.token;
      localStorage.setItem(LS_TOKEN, token);
      applyTheme(data.user.theme || 'dark');
      $('loginPassword').value = '';
      showView('Dashboard');
      $('navMain').hidden = false;
      $('headerActions').hidden = false;
      setNavActive('dashboard');
      await refreshDashboard();
    } catch (err) {
      $('loginError').textContent = err.message;
      $('loginError').hidden = false;
    }
  });

  $('formRegister').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('regError').hidden = true;
    try {
      const res = await fetch(API + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: $('regEmail').value.trim(),
          password: $('regPassword').value,
          displayName: $('regName').value.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        $('regError').textContent = data.error || 'Hata';
        $('regError').hidden = false;
        return;
      }
      token = data.token;
      localStorage.setItem(LS_TOKEN, token);
      applyTheme('dark');
      showView('Dashboard');
      $('navMain').hidden = false;
      $('headerActions').hidden = false;
      setNavActive('dashboard');
      await refreshDashboard();
    } catch (err) {
      $('regError').textContent = err.message;
      $('regError').hidden = false;
    }
  });

  $('formReset').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('resetError').hidden = true;
    $('resetOk').hidden = true;
    try {
      const res = await fetch(API + '/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: $('resetEmail').value.trim(),
          newPassword: $('resetPassword').value,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        $('resetError').textContent = data.error || 'Hata';
        $('resetError').hidden = false;
        return;
      }
      $('resetOk').textContent = data.message || 'Tamam';
      $('resetOk').hidden = false;
      $('resetPassword').value = '';
    } catch (err) {
      $('resetError').textContent = err.message;
      $('resetError').hidden = false;
    }
  });

  bootApp();
})();
