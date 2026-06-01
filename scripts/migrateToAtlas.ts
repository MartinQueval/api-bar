import 'dotenv/config';
import mongoose from 'mongoose';

const SOURCE_URI = process.env.SOURCE_URI || 'mongodb://127.0.0.1:27017/statbar';
const TARGET_URI = process.env.TARGET_URI || process.env.MONGODB_URI;

if (!TARGET_URI) {
  console.error('TARGET_URI (or MONGODB_URI) must be defined.');
  process.exit(1);
}

async function main() {
  console.log(`Source : ${SOURCE_URI}`);
  console.log(`Target : ${TARGET_URI?.replace(/:[^:@]+@/, ':***@')}`);

  const source = await mongoose.createConnection(SOURCE_URI).asPromise();
  const target = await mongoose.createConnection(TARGET_URI!).asPromise();

  const sourceCollections = await source.db!.listCollections().toArray();
  console.log(`Found ${sourceCollections.length} collection(s) in source.`);

  for (const { name } of sourceCollections) {
    const sourceColl = source.db!.collection(name);
    const targetColl = target.db!.collection(name);

    const docs = await sourceColl.find({}).toArray();
    console.log(`  • ${name}: ${docs.length} document(s)`);

    if (docs.length === 0) continue;

    const targetExisting = await targetColl.countDocuments();
    if (targetExisting > 0) {
      console.log(`    target already has ${targetExisting} documents — clearing first.`);
      await targetColl.deleteMany({});
    }

    await targetColl.insertMany(docs);
    console.log(`    ✓ inserted ${docs.length} into target.${name}`);
  }

  await source.close();
  await target.close();
  console.log('Migration done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
