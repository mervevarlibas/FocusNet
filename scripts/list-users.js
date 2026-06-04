/**
 * Atlas'ta kaç kullanıcı var: npm run list:users
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

function normalizeMongoUri(raw) {
  let uri = String(raw || '').trim();
  if (uri.startsWith('MONGODB_URI=')) uri = uri.slice('MONGODB_URI='.length).trim();
  return uri;
}

const userSchema = new mongoose.Schema({
  email: String,
  displayName: String,
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

async function run() {
  const uri = normalizeMongoUri(process.env.MONGODB_URI);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 25000, family: 4 });
  const db = mongoose.connection.db.databaseName;
  const count = await User.countDocuments();
  const sample = await User.find().select('email displayName').limit(10).lean();
  console.log(`Veritabanı: ${db}`);
  console.log(`Koleksiyon: users`);
  console.log(`Toplam kullanıcı: ${count}`);
  if (sample.length) {
    console.log('Örnek kayıtlar:');
    sample.forEach((u) => console.log(`  - ${u.email} (${u.displayName || '-'})`));
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
