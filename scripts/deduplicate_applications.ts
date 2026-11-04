import mongoose from 'mongoose';

async function deduplicate() {
  await mongoose.connect('mongodb://127.0.0.1:27017/niyamsetu_dev');
  const db = mongoose.connection.db!;
  const appColl = db.collection('applications');
  const auditColl = db.collection('core_audit');

  console.log('--- Scanning for Duplicate Applications ---');
  const allApps = await appColl.find({}).toArray();
  console.log(`Total applications found: ${allApps.length}`);

  const canonicalPrefixes = ['APP-2026-COEP', 'APP-2026-GIITS', 'APP-2026-PDIMTR', 'APP-2026-APEX', 'APP-2026-BATU'];
  const toDelete: string[] = [];

  for (const app of allApps) {
    const appId = app.caseData?.id || app._id.toString();
    const isCanonical = canonicalPrefixes.includes(appId);

    // If it's an old timestamped NSWS test app (e.g. APP-2026-NSWS-\d+), flag for removal
    if (!isCanonical && /^APP-2026-NSWS-\d+$/.test(appId)) {
      toDelete.push(appId);
      console.log(`Identified orphan test duplicate to remove: ${appId} (Ref: ${app.applicationNumber})`);
    }
  }

  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} orphan duplicate records...`);
    const delRes = await appColl.deleteMany({ 'caseData.id': { $in: toDelete } });
    console.log(`Deleted count: ${delRes.deletedCount}`);
  } else {
    console.log('No duplicate applications found to remove.');
  }

  // Verify remaining
  const remaining = await appColl.find({}).toArray();
  console.log(`\nRemaining applications count: ${remaining.length}`);
  for (const r of remaining) {
    console.log(`- ${r.caseData?.id} | ${r.applicationNumber} | ${r.institutionCode} | ${r.caseData?.state}`);
  }

  await mongoose.disconnect();
}

deduplicate().catch(console.error);
