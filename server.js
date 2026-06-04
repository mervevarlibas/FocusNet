require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const { connectRedis, redisPing } = require('./lib/redis');
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function normalizeMongoUri(raw) {
  let uri = String(raw || '').trim();
  if (uri.startsWith('MONGODB_URI=')) {
    uri = uri.slice('MONGODB_URI='.length).trim();
  }
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }
  return ensureFocusnetDatabase(uri);
}

/** Render URI'de /focusnet yoksa kayitlar "test" DB'ye gider — duzelt */
function ensureFocusnetDatabase(uri) {
  if (/\/focusnet(\?|&|$)/.test(uri)) return uri;
  if (/\.mongodb\.net\/\?/.test(uri)) {
    console.warn('MONGODB_URI: veritabani adi yoktu → /focusnet eklendi (test DB hatasi onlendi)');
    return uri.replace('.mongodb.net/?', '.mongodb.net/focusnet?');
  }
  if (/\.mongodb\.net\?/.test(uri)) {
    console.warn('MONGODB_URI: veritabani adi yoktu → /focusnet eklendi');
    return uri.replace('.mongodb.net?', '.mongodb.net/focusnet?');
  }
  if (/\.mongodb\.net\/?$/.test(uri)) {
    return uri.replace(/\/?$/, '/focusnet');
  }
  return uri;
}

const MONGODB_URI = normalizeMongoUri(process.env.MONGODB_URI);

if (!MONGODB_URI) {
  console.error('MONGODB_URI .env dosyasında tanımlı olmalı.');
  process.exit(1);
}

if (!/^mongodb(\+srv)?:\/\//i.test(MONGODB_URI)) {
  console.error(
    'MONGODB_URI geçersiz. mongodb:// veya mongodb+srv:// ile başlamalı.\n' +
      'Örnek satır (tek MONGODB_URI= olmalı):\n' +
      'MONGODB_URI=mongodb://kullanici:sifre@host:27017/focusnet'
  );
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, default: 'Öğrenci' },
  avatarIndex: { type: Number, default: 0, min: 0, max: 7 },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  streak: { type: Number, default: 0 },
  lastStudyDay: { type: String, default: '' },
  totalMinutesAllTime: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  energy: { type: Number, default: 100, min: 0, max: 100 },
  pomodoroCombo: { type: Number, default: 0, min: 0 },
});

const dailyGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  targetMinutes: { type: Number, required: true, min: 1 },
  completedMinutes: { type: Number, default: 0, min: 0 },
});
dailyGoalSchema.index({ userId: 1, date: 1 }, { unique: true });

const studySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  durationMinutes: { type: Number, required: true, min: 0 },
  mode: {
    type: String,
    enum: ['free', 'pomodoro_work', 'pomodoro_break', 'pomodoro_give_up'],
    default: 'free',
  },
  focusCategory: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const DailyGoal = mongoose.model('DailyGoal', dailyGoalSchema);
const StudySession = mongoose.model('StudySession', studySessionSchema);

app.get('/api/health', async (req, res) => {
  const mongoOk = mongoose.connection.readyState === 1;
  const redisOk = await redisPing();
  let database = null;
  let usersCount = null;
  if (mongoOk && mongoose.connection.db) {
    database = mongoose.connection.db.databaseName;
    try {
      usersCount = await User.countDocuments();
    } catch {
      /* */
    }
  }
  res.status(200).json({
    ok: mongoOk,
    service: 'focusnet',
    mongo: mongoOk,
    redis: redisOk,
    database,
    usersCount,
    collection: 'users',
  });
});

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

const POMODORO_BASE_XP = 50;
const COMBO_BONUS_PER_STACK = 0.15;

const FOCUS_CATEGORIES = new Set([
  'math',
  'coding',
  'reading',
  'language',
  'science',
  'exam',
  'other',
]);

function normalizeFocusCategory(raw) {
  const c = String(raw || 'other').trim().toLowerCase();
  return FOCUS_CATEGORIES.has(c) ? c : 'other';
}

function awardPomodoroComplete(user) {
  user.pomodoroCombo = (user.pomodoroCombo || 0) + 1;
  const multiplier = 1 + Math.max(0, user.pomodoroCombo - 1) * COMBO_BONUS_PER_STACK;
  const xpGain = Math.round(POMODORO_BASE_XP * multiplier);
  user.xp = (user.xp || 0) + xpGain;
  user.energy = Math.min(100, (user.energy ?? 100) + 5);
  return {
    xpGain,
    combo: user.pomodoroCombo,
    multiplier: Math.round(multiplier * 100) / 100,
    energy: user.energy,
  };
}

function applyGiveUpPenalty(user, elapsedSeconds, plannedSeconds = 25 * 60) {
  user.pomodoroCombo = 0;
  const progress = Math.min(1, Math.max(0, elapsedSeconds / plannedSeconds));
  const energyLoss = Math.round(12 + progress * 28);
  user.energy = Math.max(0, (user.energy ?? 100) - energyLoss);
  return { energyLoss, energy: user.energy, combo: 0 };
}

function userToJson(user) {
  return {
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    avatarIndex: user.avatarIndex,
    theme: user.theme,
    streak: user.streak,
    totalMinutesAllTime: user.totalMinutesAllTime || 0,
    xp: user.xp || 0,
    energy: user.energy ?? 100,
    pomodoroCombo: user.pomodoroCombo || 0,
  };
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  const token = h && h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Giriş gerekli' });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Oturum geçersiz' });
  }
}

async function applyStudyToUser(user, studyDay, addedMinutes) {
  user.totalMinutesAllTime = (user.totalMinutesAllTime || 0) + addedMinutes;
  if (user.lastStudyDay !== studyDay) {
    const y = yesterdayStr();
    if (user.lastStudyDay === y) user.streak = (user.streak || 0) + 1;
    else user.streak = 1;
    user.lastStudyDay = studyDay;
  }
  await user.save();
  return user;
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const displayName = String(req.body.displayName || '').trim() || 'Öğrenci';
    if (!email || !password) return res.status(400).json({ error: 'E-posta ve şifre gerekli' });
    if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Bu e-posta kayıtlı' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      displayName,
    });
    console.log(`[Kayıt] ${email} → db: ${mongoose.connection.db?.databaseName}, koleksiyon: users`);
    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: userToJson(user) });
  } catch (e) {
    console.error('[Kayıt hata]', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ error: 'E-posta ve şifre gerekli' });
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'E-posta veya şifre hatalı', wrongPassword: true });
    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: userToJson(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const newPassword = String(req.body.newPassword || '');
    if (!email || !newPassword) return res.status(400).json({ error: 'E-posta ve yeni şifre gerekli' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Yeni şifre en az 6 karakter' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Bu e-posta ile kayıt yok' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ ok: true, message: 'Şifre güncellendi. Giriş yapabilirsiniz.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'Kullanıcı yok' });
    const t = todayStr();
    let goal = await DailyGoal.findOne({ userId: user._id, date: t });
    const pct = goal && goal.targetMinutes > 0
      ? Math.min(100, Math.round((goal.completedMinutes / goal.targetMinutes) * 100))
      : 0;
    res.json({
      user: userToJson(user),
      todayGoal: goal,
      todayProgressPercent: pct,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/me', authMiddleware, async (req, res) => {
  try {
    const { displayName, avatarIndex, theme } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Kullanıcı yok' });
    if (displayName != null) user.displayName = String(displayName).slice(0, 80);
    if (avatarIndex != null && avatarIndex >= 0 && avatarIndex <= 7) user.avatarIndex = avatarIndex;
    if (theme === 'dark' || theme === 'light') user.theme = theme;
    await user.save();
    const updated = await User.findById(req.userId).select('-passwordHash');
    res.json({ user: userToJson(updated) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/goals', authMiddleware, async (req, res) => {
  try {
    const { hours = 0, minutes = 0, date } = req.body;
    const h = Math.max(0, parseInt(hours, 10) || 0);
    const m = Math.max(0, parseInt(minutes, 10) || 0);
    const targetMinutes = h * 60 + m;
    if (targetMinutes < 1) return res.status(400).json({ error: 'Hedef en az 1 dakika olmalı' });
    const d = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayStr();
    const goal = await DailyGoal.findOneAndUpdate(
      { userId: req.userId, date: d },
      { $set: { targetMinutes, userId: req.userId, date: d } },
      { upsert: true, new: true }
    );
    res.json(goal);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'Bu gün için hedef zaten var; güncellemek için PUT kullanın' });
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/goals/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Geçersiz tarih' });
    const { hours = 0, minutes = 0 } = req.body;
    const h = Math.max(0, parseInt(hours, 10) || 0);
    const m = Math.max(0, parseInt(minutes, 10) || 0);
    const targetMinutes = h * 60 + m;
    if (targetMinutes < 1) return res.status(400).json({ error: 'Hedef en az 1 dakika' });
    const goal = await DailyGoal.findOneAndUpdate(
      { userId: req.userId, date },
      { $set: { targetMinutes } },
      { new: true }
    );
    if (!goal) return res.status(404).json({ error: 'Bu tarih için hedef yok' });
    res.json(goal);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/goals/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    const r = await DailyGoal.deleteOne({ userId: req.userId, date });
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Hedef bulunamadı' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/pomodoro/give-up', authMiddleware, async (req, res) => {
  try {
    const focusCategory = normalizeFocusCategory(req.body.focusCategory);
    const elapsedSeconds = Math.max(0, Math.round(Number(req.body.elapsedSeconds) || 0));
    const plannedSeconds = Math.max(60, Math.round(Number(req.body.plannedSeconds) || 25 * 60));
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Kullanıcı yok' });

    const penalty = applyGiveUpPenalty(user, elapsedSeconds, plannedSeconds);
    await user.save();

    await StudySession.create({
      userId: req.userId,
      date: todayStr(),
      durationMinutes: 0,
      mode: 'pomodoro_give_up',
      focusCategory,
    });

    res.json({
      ok: true,
      penalty,
      user: userToJson(user),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/study/log', authMiddleware, async (req, res) => {
  try {
    const { durationMinutes, mode = 'free', date, focusCategory: rawCategory } = req.body;
    const dm = Math.max(0, Math.round(Number(durationMinutes) || 0));
    if (dm < 1) return res.status(400).json({ error: 'En az 1 dakika kaydedilmeli' });
    const d = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayStr();
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Kullanıcı yok' });

    const sessionMode = ['free', 'pomodoro_work', 'pomodoro_break'].includes(mode) ? mode : 'free';
    const focusCategory =
      sessionMode === 'pomodoro_work' ? normalizeFocusCategory(rawCategory) : '';

    let pomodoroReward = null;
    if (sessionMode === 'pomodoro_work') {
      pomodoroReward = awardPomodoroComplete(user);
    }

    await StudySession.create({
      userId: req.userId,
      date: d,
      durationMinutes: dm,
      mode: sessionMode,
      focusCategory,
    });

    await applyStudyToUser(user, d, dm);

    let goal = await DailyGoal.findOne({ userId: req.userId, date: d });
    if (goal) {
      goal.completedMinutes = (goal.completedMinutes || 0) + dm;
      await goal.save();
    }

    const pct = goal && goal.targetMinutes > 0
      ? Math.min(100, Math.round((goal.completedMinutes / goal.targetMinutes) * 100))
      : null;

    const fresh = await User.findById(req.userId).select('-passwordHash');
    res.json({
      ok: true,
      streak: fresh.streak,
      todayGoal: goal,
      todayProgressPercent: pct,
      user: userToJson(fresh),
      pomodoroReward,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/calendar', authMiddleware, async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getUTCFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getUTCMonth() + 1;
    const pad = (n) => String(n).padStart(2, '0');
    const prefix = `${year}-${pad(month)}`;
    const sessions = await StudySession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId), date: new RegExp(`^${prefix}`) } },
      { $group: { _id: '$date', minutes: { $sum: '$durationMinutes' } } },
    ]);
    const goals = await DailyGoal.find({ userId: req.userId, date: new RegExp(`^${prefix}`) });
    const goalMap = Object.fromEntries(goals.map((g) => [g.date, g]));
    const sessionMap = Object.fromEntries(sessions.map((s) => [s._id, s.minutes]));
    res.json({ sessionMap, goalMap });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/leaderboard', authMiddleware, async (req, res) => {
  try {
    const me = await User.findById(req.userId)
      .populate('friends', 'displayName email totalMinutesAllTime streak avatarIndex')
      .select('displayName email totalMinutesAllTime streak avatarIndex friends');
    if (!me) return res.status(404).json({ error: 'Kullanıcı yok' });

    const friendRows = (me.friends || []).map((f) => ({
      _id: f._id,
      displayName: f.displayName,
      email: f.email,
      totalMinutesAllTime: f.totalMinutesAllTime || 0,
      streak: f.streak || 0,
      avatarIndex: f.avatarIndex ?? 0,
    }));

    const selfRow = {
      _id: me._id,
      displayName: me.displayName,
      email: me.email,
      totalMinutesAllTime: me.totalMinutesAllTime || 0,
      streak: me.streak || 0,
      avatarIndex: me.avatarIndex ?? 0,
    };

    const myId = me._id.toString();
    const hasSelf = friendRows.some((f) => f._id.toString() === myId);
    const combined = hasSelf ? [...friendRows] : [...friendRows, selfRow];
    combined.sort((a, b) => (b.totalMinutesAllTime || 0) - (a.totalMinutesAllTime || 0));

    const myMinutes = me.totalMinutesAllTime || 0;
    const myRank = combined.findIndex((r) => r._id.toString() === myId) + 1;

    res.json({ top: combined, myRank: myRank || 1, myMinutes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/friends', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('friends', 'displayName email avatarIndex totalMinutesAllTime streak');
    res.json({ friends: user.friends || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/friends', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-posta gerekli' });
    const friend = await User.findOne({ email: normalizeEmail(email) });
    if (!friend) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    if (friend._id.equals(req.userId)) return res.status(400).json({ error: 'Kendinizi ekleyemezsiniz' });
    const user = await User.findById(req.userId);
    if (user.friends.some((id) => id.equals(friend._id))) return res.status(400).json({ error: 'Zaten arkadaş' });
    user.friends.push(friend._id);
    await user.save();
    const populated = await User.findById(req.userId).populate('friends', 'displayName email avatarIndex totalMinutesAllTime streak');
    res.json({ friends: populated.friends });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/friends/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.friends = user.friends.filter((id) => !id.equals(req.params.id));
    await user.save();
    const populated = await User.findById(req.userId).populate('friends', 'displayName email avatarIndex totalMinutesAllTime streak');
    res.json({ friends: populated.friends });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 25000,
      family: 4,
    });
    const dbName = mongoose.connection.db?.databaseName || '(bilinmiyor)';
    console.log(`MongoDB bağlandı — veritabanı: "${dbName}", koleksiyon: users`);

    app.listen(PORT, '0.0.0.0', () => {
      const publicUrl = process.env.RENDER_EXTERNAL_URL;
      if (publicUrl) console.log('FocusNet:', publicUrl);
      else {
        console.log(`FocusNet: http://localhost:${PORT}`);
        console.log('Mobil .env: http://<Wi-Fi-IPv4>:' + PORT);
      }
      connectRedis().then((ok) => {
        if (ok) console.log('Redis bağlandı');
      });
    });
  } catch (e) {
    console.error('Başlatma hatası:', e.message);
    process.exit(1);
  }
}

startServer();
