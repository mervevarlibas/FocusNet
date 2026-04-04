require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI .env dosyasında tanımlı olmalı.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'focusnet' });
});

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
  mode: { type: String, enum: ['free', 'pomodoro_work', 'pomodoro_break'], default: 'free' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const DailyGoal = mongoose.model('DailyGoal', dailyGoalSchema);
const StudySession = mongoose.model('StudySession', studySessionSchema);

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
    const { email, password, displayName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-posta ve şifre gerekli' });
    if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: 'Bu e-posta kayıtlı' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName: displayName || 'Öğrenci',
    });
    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatarIndex: user.avatarIndex,
        theme: user.theme,
        streak: user.streak,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-posta ve şifre gerekli' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'E-posta veya şifre hatalı', wrongPassword: true });
    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatarIndex: user.avatarIndex,
        theme: user.theme,
        streak: user.streak,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'E-posta ve yeni şifre gerekli' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Yeni şifre en az 6 karakter' });
    const user = await User.findOne({ email: email.toLowerCase() });
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
      user,
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
    res.json({ user: await User.findById(req.userId).select('-passwordHash') });
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

app.post('/api/study/log', authMiddleware, async (req, res) => {
  try {
    const { durationMinutes, mode = 'free', date } = req.body;
    const dm = Math.max(0, Math.round(Number(durationMinutes) || 0));
    if (dm < 1) return res.status(400).json({ error: 'En az 1 dakika kaydedilmeli' });
    const d = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayStr();
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Kullanıcı yok' });

    await StudySession.create({
      userId: req.userId,
      date: d,
      durationMinutes: dm,
      mode: ['free', 'pomodoro_work', 'pomodoro_break'].includes(mode) ? mode : 'free',
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
      user: fresh,
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
    const top = await User.find({})
      .sort({ totalMinutesAllTime: -1 })
      .limit(20)
      .select('displayName email totalMinutesAllTime streak avatarIndex');
    const me = await User.findById(req.userId).select('totalMinutesAllTime');
    const rank = (await User.countDocuments({ totalMinutesAllTime: { $gt: me.totalMinutesAllTime || 0 } })) + 1;
    res.json({ top, myRank: rank, myMinutes: me.totalMinutesAllTime || 0 });
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
    const friend = await User.findOne({ email: email.toLowerCase() });
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

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB bağlandı');
    app.listen(PORT, '0.0.0.0', () => {
      const publicUrl = process.env.RENDER_EXTERNAL_URL;
      if (publicUrl) console.log('FocusNet:', publicUrl);
      else {
        console.log(`FocusNet (bu PC): http://localhost:${PORT}`);
        console.log('Aynı ağ: http://<YEREL-IP>:' + PORT);
      }
    });
  })
  .catch((e) => {
    console.error('MongoDB hatası:', e.message);
    process.exit(1);
  });
