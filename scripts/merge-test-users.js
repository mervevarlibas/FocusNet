/**
 * Eski Render kayitlari "test" DB'deyse focusnet'e kopyala (bir kez):
 * npm run merge:users
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

function normalizeMongoUri(raw) {
  let uri = String(raw || '').trim();
  if (uri.startsWith('MONGODB_URI=')) uri = uri.slice('MONGODB_URI='.length).trim();
  return uri;
}

/** Sadece veritabani adini degistir (focusnet_admin kullanicisina dokunma) */
function uriWithDb(baseUri, dbName) {
  if (/\/focusnet(\?|$)/.test(baseUri)) {
    return baseUri.replace(/\/focusnet(\?)/, `/${dbName}$1`);
  }
  if (/\/test(\?|$)/.test(baseUri)) {
    return baseUri.replace(/\/test(\?)/, `/${dbName}$1`);
  }
  if (baseUri.includes('?')) return baseUri.replace('?', `/${dbName}?`);
  return `${baseUri.replace(/\/?$/, '')}/${dbName}`;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: String,
  displayName: String,
  avatarIndex: Number,
  theme: String,
  friends: [mongoose.Schema.Types.ObjectId],
  streak: Number,
  lastStudyDay: String,
  totalMinutesAllTime: Number,
});

async function run() {
  const focusUri = normalizeMongoUri(process.env.MONGODB_URI);
  const testUri = uriWithDb(focusUri, 'test');

  console.log('test DB baglaniyor...');
  await mongoose.connect(testUri, { serverSelectionTimeoutMS: 30000, family: 4 });
  const TestUser = mongoose.model('User', userSchema, 'users');
  const fromTest = await TestUser.find().lean();
  console.log(`test veritabaninda ${fromTest.length} kullanici bulundu`);
  await mongoose.disconnect();

  console.log('focusnet DB baglaniyor...');
  await mongoose.connect(focusUri, { serverSelectionTimeoutMS: 30000, family: 4 });
  const FocusUser = mongoose.model('User', userSchema, 'users');
  let added = 0;
  let skipped = 0;
  for (const u of fromTest) {
    const exists = await FocusUser.findOne({ email: u.email });
    if (exists) {
      skipped++;
      continue;
    }
    const { _id, __v, ...rest } = u;
    await FocusUser.create(rest);
    added++;
    console.log('Eklendi:', u.email);
  }
  await mongoose.disconnect();
  console.log(`\nBitti: ${added} yeni, ${skipped} zaten vardi (focusnet).`);
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
