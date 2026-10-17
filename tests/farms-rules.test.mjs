// Security tests for farms/firestore.rules, run against Google's Firestore emulator.
// Each check reports as a GitHub annotation: PASS or FAIL.
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

const PROVIDER = "rahulvarmavuyyuri@gmail.com";
const env = await initializeTestEnvironment({
  projectId: "demo-aqualedger-farms",
  firestore: { rules: readFileSync("farms/firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
});
const as = (email, verified = true) => env.authenticatedContext(email.replace(/\W/g, "_"), { email, email_verified: verified }).firestore();
const anon = () => env.unauthenticatedContext().firestore();

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, "farms/A"), { name: "Farm A", status: "active", owner: "owner@a.test" });
  await setDoc(doc(db, "farms/A/members/owner@a.test"), { role: "owner" });
  await setDoc(doc(db, "farms/A/members/admin@a.test"), { role: "admin" });
  await setDoc(doc(db, "farms/A/members/staff@a.test"), { role: "staff" });
  await setDoc(doc(db, "farms/A/members/viewer@a.test"), { role: "viewer" });
  await setDoc(doc(db, "farms/A/tanks/t1"), { code: "A-01" });
  await setDoc(doc(db, "farms/A/config/settings"), { farmName: "Farm A" });
  await setDoc(doc(db, "memberships/owner@a.test/farms/A"), { role: "owner", farmName: "Farm A" });
  await setDoc(doc(db, "farms/B"), { name: "Farm B", status: "paused", owner: "owner@b.test" });
  await setDoc(doc(db, "farms/B/members/owner@b.test"), { role: "owner" });
  await setDoc(doc(db, "farms/B/tanks/t1"), { code: "B-01" });
});

let failed = 0;
async function check(name, p, shouldPass) {
  try { await (shouldPass ? assertSucceeds(p) : assertFails(p)); console.log(`::notice title=PASS::${name}`); }
  catch (e) { failed++; console.log(`::error title=FAIL::${name} — ${String(e && e.message || e).slice(0, 160)}`); }
}
const ok = (n, p) => check(n, p, true), no = (n, p) => check(n, p, false);

// Isolation between farms
await ok("Farm A owner reads Farm A tanks", getDocs(collection(as("owner@a.test"), "farms/A/tanks")));
await no("Farm A owner cannot read Farm B tanks", getDocs(collection(as("owner@a.test"), "farms/B/tanks")));
await no("Farm A owner cannot read Farm B profile", getDoc(doc(as("owner@a.test"), "farms/B")));
await no("Farm A owner cannot write into Farm B", setDoc(doc(as("owner@a.test"), "farms/B/tanks/x"), { code: "X" }));
await no("Farm A owner cannot list all farms", getDocs(collection(as("owner@a.test"), "farms")));
await no("Signed-out visitor cannot read Farm A", getDocs(collection(anon(), "farms/A/tanks")));
await no("Stranger cannot read Farm A", getDocs(collection(as("stranger@x.test"), "farms/A/tanks")));
await no("Unverified email cannot read Farm A even if listed", getDocs(collection(as("staff@a.test", false), "farms/A/tanks")));

// Roles inside a farm
await ok("Staff adds a record", setDoc(doc(as("staff@a.test"), "farms/A/tanks/t2"), { code: "A-02" }));
await ok("Viewer reads records", getDocs(collection(as("viewer@a.test"), "farms/A/tanks")));
await no("Viewer cannot add records", setDoc(doc(as("viewer@a.test"), "farms/A/tanks/t3"), { code: "A-03" }));
await no("Staff cannot change farm settings", setDoc(doc(as("staff@a.test"), "farms/A/config/settings"), { farmName: "Hacked" }));
await no("Staff cannot add team members", setDoc(doc(as("staff@a.test"), "farms/A/members/friend@x.test"), { role: "staff" }));
await ok("Owner adds a staff member", setDoc(doc(as("owner@a.test"), "farms/A/members/new@a.test"), { role: "staff" }));
await ok("Owner adds the staff member's farm listing", setDoc(doc(as("owner@a.test"), "memberships/new@a.test/farms/A"), { role: "staff", farmName: "Farm A" }));
await no("Owner cannot make someone an owner", setDoc(doc(as("owner@a.test"), "farms/A/members/x@a.test"), { role: "owner" }));
await no("Admin cannot demote the owner", setDoc(doc(as("admin@a.test"), "farms/A/members/owner@a.test"), { role: "staff" }));
await no("Admin cannot remove the owner", deleteDoc(doc(as("admin@a.test"), "farms/A/members/owner@a.test")));
await no("Owner cannot pause their own farm", setDoc(doc(as("owner@a.test"), "farms/A"), { status: "active", name: "Farm A", plan: "Free forever" }));
await no("Owner cannot create a new farm", setDoc(doc(as("owner@a.test"), "farms/C"), { name: "C", status: "active" }));
await no("Records outside the allowed list are blocked", setDoc(doc(as("owner@a.test"), "farms/A/secrets/x"), { a: 1 }));

// Paused farm
await ok("Paused farm owner can still read", getDocs(collection(as("owner@b.test"), "farms/B/tanks")));
await no("Paused farm owner cannot add records", setDoc(doc(as("owner@b.test"), "farms/B/tanks/t2"), { code: "B-02" }));
await no("Paused farm owner cannot add staff", setDoc(doc(as("owner@b.test"), "farms/B/members/s@b.test"), { role: "staff" }));

// Memberships listing
await ok("A person reads their own farm list", getDocs(collection(as("owner@a.test"), "memberships/owner@a.test/farms")));
await no("A person cannot read someone else's farm list", getDocs(collection(as("staff@a.test"), "memberships/owner@a.test/farms")));

// Activity stats and provider settings
await ok("Staff updates the farm's activity count", setDoc(doc(as("staff@a.test"), "farms/A/stats/activity"), { days: { "2026-10-18": 3 }, lastEntry: "2026-10-18" }, { merge: true }));
await ok("Owner updates the farm summary", setDoc(doc(as("owner@a.test"), "farms/A/stats/activity"), { ponds: 4, live: 120000, team: 3 }, { merge: true }));
await no("Viewer cannot update activity", setDoc(doc(as("viewer@a.test"), "farms/A/stats/activity"), { lastEntry: "2026-10-18" }, { merge: true }));
await no("Activity doc rejects other fields", setDoc(doc(as("staff@a.test"), "farms/A/stats/activity"), { secret: 1 }, { merge: true }));
await no("Farm A owner cannot read Farm B activity", getDoc(doc(as("owner@a.test"), "farms/B/stats/activity")));
await no("Paused farm cannot update activity", setDoc(doc(as("owner@b.test"), "farms/B/stats/activity"), { lastEntry: "2026-10-18" }, { merge: true }));
await ok("Provider reads a farm's activity", getDoc(doc(as(PROVIDER), "farms/A/stats/activity")));
await ok("Provider saves prices and UPI", setDoc(doc(as(PROVIDER), "provider/settings"), { monthly: 1500, yearly: 15000, upi: "x@upi" }));
await no("Farm owner cannot read provider settings", getDoc(doc(as("owner@a.test"), "provider/settings")));

// Provider
await ok("Provider creates a farm", setDoc(doc(as(PROVIDER), "farms/C"), { name: "Farm C", status: "active", owner: "o@c.test" }));
await ok("Provider makes the owner", setDoc(doc(as(PROVIDER), "farms/C/members/o@c.test"), { role: "owner" }));
await ok("Provider lists all farms", getDocs(collection(as(PROVIDER), "farms")));
await ok("Provider pauses a farm", setDoc(doc(as(PROVIDER), "farms/A"), { status: "paused" }, { merge: true }));
await ok("Provider supports a paused farm (writes a record)", setDoc(doc(as(PROVIDER), "farms/B/tanks/t9"), { code: "B-09" }));

await env.cleanup();
console.log(failed ? `::error title=Security test::${failed} check(s) failed` : "::notice title=Security test::All checks passed");
process.exit(failed ? 1 : 0);
