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
    console.log(`PASS: sweep argv matching (${cases.length} cases, URL-arg decoy + its folder survive, orphan killed) and drift message (${msg})`);
  }, 800);
}, 2000);
