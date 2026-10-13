// Tests for the harness stale-Chrome sweep (argv-based matching) and site-sync drift messages.
const fs = require("fs"), os = require("os"), path = require("path"), { spawn } = require("child_process");
const H = require("./harness.js"), { manifestDrift } = require("./site-sync.js");
let bad = 0; const fail = m => { bad++; console.error("FAIL", m); };
const T = os.tmpdir(), CH = "google-chrome";

// Pure argv classification.
const prof = path.join(T, "ppp-test-chrome-abc");
const cases = [
  [[CH, "--headless=new", `--user-data-dir=${prof}`, "about:blank"], true, "our profile"],
  [[CH, `--user-data-dir=${prof}`, "about:blank"], false, "no --headless"],
  [[CH, "--headless=new", "--user-data-dir=/home/x/ppp-test-chrome-abc"], false, "profile outside tmpdir"],
  [[CH, "--headless=new", `--user-data-dir=${path.join(T, "sub", "ppp-test-chrome-abc")}`], false, "profile nested in tmpdir"],
  [[CH, "--headless=new", `--user-data-dir=${path.join(T, "other")}`, `https://x.test/?d=--user-data-dir=${prof}`], false, "marker only in a URL arg"],
  [[CH, "--headless", "--remote-debugging-port=19222", "--window-size=1100,900", "about:blank"], true, "legacy flags"],
  [[CH, "--headless", "--remote-debugging-port=192220", "--window-size=1100,900", "about:blank"], false, "legacy port prefix"],
  [[CH, "--headless", "--remote-debugging-port=19222 --window-size=1100,900 about:blank"], false, "legacy flags joined in one arg"],
  [["/usr/bin/node", "--headless", `--user-data-dir=${prof}`], false, "not chrome"],
];
for (const [argv, want, name] of cases) if (H.isOurs(argv) !== want) fail(`isOurs(${name}) should be ${want}`);
// removeProfile refuses anything not directly inside tmpdir with our prefix (incl. symlinks pointing elsewhere).
const outside = fs.mkdtempSync(path.join(T, "ppp-decoy-target-")), link = path.join(T, `ppp-test-chrome-link-${process.pid}`);
fs.symlinkSync(outside, link);
if (H.removeProfile(link) || !fs.existsSync(outside)) fail("removeProfile followed a symlink out of our prefix");
fs.unlinkSync(link); fs.rmSync(outside, { recursive: true, force: true });

// L3: a symlink to a sibling ppp-test-chrome-* folder is refused (lstat), and the sibling survives.
{ const sib = fs.mkdtempSync(path.join(T, "ppp-test-chrome-sibling-")), sl = path.join(T, `ppp-test-chrome-symlink-${process.pid}`);
  fs.symlinkSync(sib, sl);
  if (H.removeProfile(sl) || !fs.existsSync(sib)) fail("L3: symlink to a sibling ppp-test-chrome-* folder was followed");
  fs.unlinkSync(sl); fs.rmSync(sib, { recursive: true, force: true }); }

// Mock /proc for L4–L6. Each proc: { raw cmdline, ppid, start, uid, state }.
function mockSys(table, { onKill, onStat } = {}) {
  const logs = [];
  return { logs, myUid: () => 1000, pids: () => Object.keys(table).map(Number),
    cmdline: pid => table[pid] ? table[pid].raw : null,
    stat: pid => { if (onStat) onStat(pid); const p = table[pid]; return p ? { state: p.state || "S", ppid: p.ppid, start: p.start } : null; },
    uid: pid => table[pid] ? table[pid].uid : null,
    kill: (pid, sig) => { if (onKill) return onKill(pid, sig); if (!table[pid]) { const e = new Error("ESRCH"); e.code = "ESRCH"; throw e; } delete table[pid]; },
    sleep: () => {}, log: m => logs.push(m) };
}
const mkProf = tag => fs.mkdtempSync(path.join(T, `ppp-test-chrome-${tag}-`));
const chrome = d => [CH, "--headless=new", `--user-data-dir=${d}`, "about:blank"].join("\0") + "\0";
const helper = d => [CH, "--type=renderer", `--user-data-dir=${d}`].join("\0") + "\0";
const mk = (pid, raw, ppid, extra = {}) => ({ [pid]: { raw, ppid, start: "5000", uid: 1000, ...extra } });

// L4: start time or cmdline changing between match and kill (pid reuse) => skipped, not killed, folder kept.
{ const d = mkProf("l4"), table = { ...mk(101, chrome(d), 1), ...mk(102, helper(d), 101) };
  let n = 0; const sys = mockSys(table, { onStat: pid => { if (pid === 101 && ++n === 2) table[101].start = "9999"; } });   // 1st read = snapshot, 2nd = pre-kill check
  const r = H.sweepStaleChromes({ sys, waitMs: 10 });
  if (!r.skipped.includes(101) || r.killed.includes(101) || !fs.existsSync(d)) fail(`L4 starttime mismatch not skipped: ${JSON.stringify(r)}`);
  const d2 = mkProf("l4b"), t2 = { ...mk(111, chrome(d2), 1) }; let m = 0;
  const sys2 = mockSys(t2, { onStat: pid => { if (++m === 2) t2[111].raw = chrome(d2).replace("about:blank", "https://other"); } });
  const r2 = H.sweepStaleChromes({ sys: sys2, waitMs: 10 });
  if (!r2.skipped.includes(111) || !fs.existsSync(d2)) fail(`L4 cmdline mismatch not skipped: ${JSON.stringify(r2)}`);
  for (const x of [d, d2]) fs.rmSync(x, { recursive: true, force: true }); }

// L5a: another uid's process is ignored entirely.
{ const d = mkProf("l5uid"), table = { ...mk(201, chrome(d), 1, { uid: 0 }) }; const r = H.sweepStaleChromes({ sys: mockSys(table), waitMs: 10 });
  if (r.targets.length || !table[201] || !fs.existsSync(d)) fail(`L5 other uid touched: ${JSON.stringify(r)}`); fs.rmSync(d, { recursive: true, force: true }); }
// L5b: a failed kill (EPERM) keeps the folder; L5c: still alive after the wait keeps the folder.
{ const d = mkProf("l5fail"), table = { ...mk(301, chrome(d), 1), ...mk(302, helper(d), 301) };
  const sys = mockSys(table, { onKill: pid => { if (pid === 302) { const e = new Error("EPERM"); e.code = "EPERM"; throw e; } delete table[pid]; } });
  const r = H.sweepStaleChromes({ sys, waitMs: 10 });
  if (!r.failed.includes(302) || !r.kept.includes(d) || !fs.existsSync(d) || !sys.logs.some(l => /302 failed/.test(l))) fail(`L5 failed kill deleted folder: ${JSON.stringify(r)}`);
  const d2 = mkProf("l5alive"), t2 = { ...mk(311, chrome(d2), 1) }, sys2 = mockSys(t2, { onKill: () => {} });   // signal "sent" but never dies
  const r2 = H.sweepStaleChromes({ sys: sys2, waitMs: 30 });
  if (!r2.failed.includes(311) || !fs.existsSync(d2) || !sys2.logs.some(l => /still alive/.test(l))) fail(`L5 survivor's folder deleted: ${JSON.stringify(r2)}`);
  for (const x of [d, d2]) fs.rmSync(x, { recursive: true, force: true }); }

// L6: processes vanishing mid-sweep (ENOENT on every read) and throwing /proc reads never throw out of the sweep.
{ const d = mkProf("l6"), table = { ...mk(401, chrome(d), 1), ...mk(402, helper(d), 401) };
  let k = 0; const sys = mockSys(table, { onKill: pid => { delete table[pid]; } });
  sys.stat = pid => { if (++k > 3) { const e = new Error("ENOENT"); e.code = "ENOENT"; throw e; } const p = table[pid]; return p ? { state: "S", ppid: p.ppid, start: p.start } : null; };
  let threw = null, r; try { r = H.sweepStaleChromes({ sys, waitMs: 20 }); } catch (e) { threw = e; }
  if (threw) fail(`L6 sweep threw: ${threw.message}`);
  const allThrow = { ...mockSys({}), pids: () => { throw new Error("EACCES /proc"); } };
  try { H.sweepStaleChromes({ sys: allThrow }); } catch (e) { fail("L6 sweep threw on unreadable /proc"); }
  fs.rmSync(d, { recursive: true, force: true }); }

// Live decoy: a headless Chrome with ppp-test-chrome- only in a URL argument must survive the sweep, and
// the folder named in that URL must not be deleted. A real orphan with our profile must be killed and its dir removed.
const decoyDir = fs.mkdtempSync(path.join(T, "ppp-test-chrome-decoyfolder-")), decoyProfile = fs.mkdtempSync(path.join(T, "ppp-decoy-profile-"));
const orphanDir = fs.mkdtempSync(path.join(T, "ppp-test-chrome-orphan-"));
const start = args => spawn(CH, ["--no-sandbox", "--remote-debugging-port=0", ...args], { detached: true, stdio: "ignore" });
const decoy = start(["--headless=new", `--user-data-dir=${decoyProfile}`, `data:text/html,${decoyDir}?--user-data-dir=${decoyDir}`]);
// Orphan: started via a shell that exits at once, so it is reparented away from this test process (as a real leftover would be).
spawn("sh", ["-c", `"${CH}" --no-sandbox --headless=new --remote-debugging-port=0 --user-data-dir="${orphanDir}" about:blank >/dev/null 2>&1 &`], { detached: true, stdio: "ignore" }).unref();
const orphanPids = () => fs.readdirSync("/proc").filter(d => /^\d+$/.test(d)).filter(d => { try { return fs.readFileSync(`/proc/${d}/cmdline`, "utf8").split("\0").includes(`--user-data-dir=${orphanDir}`); } catch { return false; } });
const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
setTimeout(() => {
  if (!orphanPids().length) fail("orphan Chrome did not start");
  // The sweep must spare processes under a live test node, so run it from a child that isn't a test script.
  const r = require("child_process").spawnSync(process.execPath, ["-e", `require(${JSON.stringify(path.join(__dirname, "harness.js"))}).sweepStaleChromes()`], { encoding: "utf8" });
  setTimeout(() => {
    if (!alive(decoy.pid)) fail("decoy Chrome (marker only in URL arg) was killed");
    if (!fs.existsSync(decoyDir)) fail("decoy folder named in the URL arg was deleted");
    if (!fs.existsSync(decoyProfile)) fail("decoy's own profile was deleted");
    if (orphanPids().length) fail("orphan with our profile survived the sweep");
    if (fs.existsSync(orphanDir)) fail("orphan profile dir not removed");
    for (const p of [decoy.pid]) try { process.kill(-p, "SIGKILL"); } catch {}
    for (const d of [decoyDir, decoyProfile, orphanDir]) fs.rmSync(d, { recursive: true, force: true });

    // Drift message names file, key path, expected and actual.
    const R = path.join(__dirname, ".."), src = path.join(R, "packs", "heron", "manifest.json");
    const tmpPack = fs.mkdtempSync(path.join(T, "ppp-drift-")), siteRel = "site/packs/heron/manifest.json";
    fs.cpSync(path.join(R, "site", "packs", "heron"), tmpPack, { recursive: true });
    const m = JSON.parse(fs.readFileSync(path.join(tmpPack, "manifest.json"))); m.activities.map.mining.fps = 99;
    fs.writeFileSync(path.join(tmpPack, "manifest.json"), JSON.stringify(m));
    const msg = manifestDrift(src, path.join(tmpPack, "manifest.json"), siteRel) || "";
    if (!(msg.includes(siteRel) && msg.includes("activities.map.mining.fps") && /expected 8 but got 99/.test(msg))) fail(`drift message lacks file/key/values: ${msg}`);
    if (manifestDrift(src, path.join(R, siteRel), siteRel)) fail("clean site manifest reported drift");
    fs.rmSync(tmpPack, { recursive: true, force: true });
    if (bad) process.exit(1);
    console.log(`PASS: sweep argv matching (${cases.length} cases, L3 symlink/L4 pid-reuse/L5 uid+failed-kill+survivor/L6 vanish checks, URL-arg decoy + its folder survive, orphan killed) and drift message (${msg})`);
  }, 800);
}, 2000);
