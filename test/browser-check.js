// Headless-Chrome check (google-chrome, Node >=20.10): node --experimental-websocket test/browser-check.js
// Every pack (and variant) in overlay + compact, at 1100px and 390px, via /widget/ and /widget (no slash).
// Asserts facing, variant, no sprite cropping, status/legal text fully visible. Screenshots -> screenshots/v5-*.png
const { spawn } = require("child_process"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "screenshots"), PORT = +process.env.BROWSER_PORT || 18899, BASE = `http://127.0.0.1:${PORT}`;
fs.mkdirSync(OUT, { recursive: true });
const PACKS = fs.readdirSync(path.join(ROOT, "packs")).filter(d => fs.existsSync(path.join(ROOT, "packs", d, "manifest.json")) && d !== "placeholder-blob");
const relay = spawn("node", ["relay/server.js"], { cwd: ROOT, env: { ...process.env, PORT, PET_HOST: "127.0.0.1" } });
const ch = spawn("google-chrome", ["--headless=new", "--no-sandbox", "--remote-debugging-port=19222", "--window-size=1100,900", "about:blank"]);
const sl = ms => new Promise(r => setTimeout(r, ms)); let bad = 0, n = 0; const fail = m => { bad++; console.log("FAIL", m); };
const post = ev => fetch(`${BASE}/events`, { method: "POST", body: JSON.stringify({ v: 1, player: "Matthew", ts: new Date().toISOString(), ...ev }) });
(async () => {
  await sl(2500);
  const t = (await (await fetch("http://127.0.0.1:19222/json")).json()).find(x => x.type === "page");
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {};
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) pend[d.id](d.result);
    if (d.method === "Runtime.exceptionThrown") fail("exception " + d.params.exceptionDetails.text);
    if (d.method === "Network.responseReceived" && d.params.response.status >= 400) fail(d.params.response.status + " " + d.params.response.url); };
  const call = (method, params = {}) => new Promise((r, j) => { const i = ++id; const to = setTimeout(() => j(new Error("CDP timeout " + method)), 20000); pend[i] = v => { clearTimeout(to); r(v); }; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async x => (await call("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result.value;
  await call("Runtime.enable"); await call("Network.enable"); await call("Network.setCacheDisabled", { cacheDisabled: true });
  const cases = [];
  for (const id of PACKS) {
    const m = JSON.parse(fs.readFileSync(path.join(ROOT, "packs", id, "manifest.json")));
    const vs = (m.variants || []).map(v => v.id); for (const v of vs.length ? vs : [""]) cases.push({ id, v, facing: m.facing || "right", def: m.defaultVariant || "" });
  }
  await post({ type: "activity", activity: { category: "skilling", skill: "Woodcutting", target: "yew logs" } });
  let T0; const check = async (tag, url, c, shotName) => { T0 = Date.now();
    await call("Page.navigate", { url });
    for (let i = 0; i < 100; i++) { await sl(50); if (await ev(`location.href===${JSON.stringify(url)}&&document.readyState==="complete"&&!!document.getElementById("pet")`)) break; }
    const s = await ev(`(async()=>{const $=i=>document.getElementById(i);for(let i=0;i<50&&!($("pet").style.backgroundImage&&$("player").textContent!=="…");i++)await new Promise(r=>setTimeout(r,100));
      const u=getComputedStyle($("pet")).backgroundImage.slice(5,-2);const im=new Image();im.src=u;const T=(p)=>Promise.race([p,new Promise(r=>setTimeout(r,3000))]);await T(im.decode().catch(()=>{}));await T(document.fonts.ready);
      await new Promise(r=>setTimeout(r,60));
      const p=$("pet"),c=$("w"),R=e=>e.getBoundingClientRect(),cr=R(c),pr=R(p),sr=R(c.querySelector(".stage")),st=$("statusline"),lg=$("note");
      return {pet:p.dataset.pet,variant:p.dataset.variant,flip:p.classList.contains("flip"),tall:c.classList.contains("tall"),petH:pr.height,
        inStage:pr.left>=sr.left-0.5&&pr.right<=sr.right+0.5&&pr.top>=sr.top-0.5&&pr.bottom<=sr.bottom+0.5,
        textOk:![st,lg].some(e=>R(e).right>cr.right-2||R(e).bottom>cr.bottom-2)&&![...st.children].some(e=>e.scrollWidth>e.clientWidth+1),
        tm:/Old School RuneScape is a trademark of Jagex Ltd\\./.test(lg.textContent)&&/Not affiliated with Jagex/.test(lg.textContent),
        url:location.pathname,w:cr.width,h:cr.height}})()`);
    n++; if (process.env.VERBOSE) console.log(tag, c.id, c.v, Date.now() - T0);
    const want = { pet: c.id, variant: c.v || c.def || "", flip: c.facing === "left" };
    for (const k in want) if (s[k] !== want[k]) fail(`${tag} ${c.id}/${c.v} ${k}=${s[k]} want ${want[k]}`);
    if (!s.inStage) fail(`${tag} ${c.id} sprite cropped/outside stage`);
    if (!s.textOk) fail(`${tag} ${c.id} text clipped`);
    if (!s.tm) fail(`${tag} ${c.id} legal notes missing`);
    if (shotName) { const r = await call("Page.captureScreenshot", { clip: { x: 0, y: 0, width: Math.ceil(s.w) + 14, height: Math.ceil(s.h) + 14, scale: 2 } });
      fs.writeFileSync(path.join(OUT, shotName), Buffer.from(r.data, "base64")); }
    return s;
  };
  for (const [vw, slash] of (process.env.QC_ONLY ? [] : [[1100, true], [1100, false], [390, true], [390, false]])) {
    const tag = `${vw}px/${slash ? "slash" : "noslash"}`; const before = bad;
    await call("Emulation.setDeviceMetricsOverride", { width: vw, height: 900, deviceScaleFactor: 1, mobile: vw < 500 });
    for (const c of cases) for (const size of ["", "compact"]) {
      const q = `?bg=1&pet=${c.id}${c.v ? "&variant=" + c.v : ""}${size ? "&size=compact" : ""}`;
      const shot = vw === 1100 && slash ? `v5-widget-${c.id}${c.v ? "-" + c.v : ""}${size ? "-compact" : ""}.png` : null;
      await check(tag, `${BASE}/widget${slash ? "/" : ""}${q}`, c, shot);
    }
    console.log(`${tag}: ${cases.length * 2} widgets ${bad === before ? "ok" : "FAILED"}`);
  }
  // v0.5 activities, driven by the mock sender (--only): correct activities sheet per pet/variant, fallback, no edge clipping.
  const mock = act => new Promise(r => spawn("node", ["mock-sender/send.js", "--url", `${BASE}/events`, "--only", act], { cwd: ROOT }).on("exit", r));
  const { resolveActivities, pickActivity } = require("../shared/pack");
  let actRenders = 0; const beforeAct = bad;
  for (const act of (process.env.SKIP_ACT ? [] : ["woodcutting", "mining", "fishing", "combat", "banking", "fallback"])) {
    if (act === "fallback") await post({ type: "activity", activity: { category: "bossing", target: "Vorkath" } }); else await mock(act);
    for (const c of cases) for (const [vw, size] of [[1100, ""], [390, "compact"]]) {
      await call("Emulation.setDeviceMetricsOverride", { width: vw, height: 900, deviceScaleFactor: 1, mobile: vw < 500 });
      const m = JSON.parse(fs.readFileSync(path.join(ROOT, "packs", c.id, "manifest.json")));
      const acts = resolveActivities(m, c.v || undefined);
      const want = act === "fallback" ? pickActivity(m, acts, { category: "bossing" }) : { source: "activities", key: act };
      const url = `${BASE}/widget/?bg=1&pet=${c.id}${c.v ? "&variant=" + c.v : ""}${size ? "&size=compact" : ""}`;
      await call("Page.navigate", { url });
      for (let i = 0; i < 100; i++) { await sl(50); if (await ev(`location.href===${JSON.stringify(url)}&&document.readyState==="complete"&&(document.getElementById("pet").dataset.anim||"").length>0&&document.getElementById("player").textContent!=="…"`)) break; }
      await sl(120);
      const s = await ev(`(async()=>{const $=i=>document.getElementById(i),p=$("pet"),st=document.querySelector(".stage"),R=e=>e.getBoundingClientRect();
        const u=getComputedStyle(p).backgroundImage.slice(5,-2);const im=new Image();im.src=u;await Promise.race([im.decode().catch(()=>{}),new Promise(r=>setTimeout(r,2000))]);
        const pr=R(p),sr=R(st),cl=st.clientLeft,ct=st.clientTop,inner={l:sr.left+cl,t:sr.top+ct,r:sr.left+cl+st.clientWidth,b:sr.top+ct+st.clientHeight},c=R($("w")),lg=R($("note"));
        return {anim:p.dataset.anim,sheet:p.dataset.sheet,img:u.replace(location.origin,""),flip:p.classList.contains("flip"),
          gapL:pr.left-inner.l,gapR:inner.r-pr.right,top:pr.top-inner.t,bottom:inner.b-pr.bottom,loaded:im.naturalWidth>0,legalIn:lg.bottom<=c.bottom-2,w:c.width,h:c.height}})()`);
      actRenders++; n++;
      const tag = `act ${act} ${c.id}${c.v ? "/" + c.v : ""}${size ? " compact" : ""}`;
      if (want.source === "activities") {
        if (s.anim !== "act:" + act || s.sheet !== "activities") fail(`${tag} wrong anim ${s.anim}/${s.sheet}`);
        if (!s.img.endsWith(`/packs/${c.id}/${acts.sheet}`)) fail(`${tag} wrong sheet ${s.img} want ${acts.sheet}`);
      } else if (s.anim !== want.key || s.sheet !== "base") fail(`${tag} fallback ${s.anim}/${s.sheet} want ${want.key}/base`);
      if (!s.loaded) fail(`${tag} sheet not loaded`);
      if (s.gapL < 1 || s.gapR < 1 || s.top < -0.5 || s.bottom < -0.5) fail(`${tag} edge clipping L${s.gapL} R${s.gapR} T${s.top} B${s.bottom}`);
      if (s.flip !== (c.facing === "left")) fail(`${tag} facing`);
      if (!s.legalIn) fail(`${tag} legal clipped`);
      if (!size || act === "fishing") { const r = await call("Page.captureScreenshot", { clip: { x: 0, y: 0, width: Math.ceil(s.w) + 14, height: Math.ceil(s.h) + 14, scale: 2 } });
        fs.writeFileSync(path.join(OUT, `v5-act-${act}-${c.id}${c.v ? "-" + c.v : ""}${size ? "-compact" : ""}.png`), Buffer.from(r.data, "base64")); }
    }
    console.log(`activities ${act}: ${cases.length * 2} renders ${bad === beforeAct ? "ok" : "FAILED"}`);
  }
  // Celebrate (level_up): sprite must stay inside the stage, incl. tall pets.
  await call("Emulation.setDeviceMetricsOverride", { width: 1100, height: 900, deviceScaleFactor: 1, mobile: false });
  await post({ type: "level_up", detail: { skill: "Woodcutting", level: 71 } });
  for (const c of cases.filter(c => ["olmlet", "butch", "heron", "baby-chinchompa"].includes(c.id) && (!c.v || c.v === c.def)))
    for (const size of ["", "&size=compact"]) await check("celebrate", `${BASE}/widget/?bg=1&pet=${c.id}${size}`, c, `v5-widget-${c.id}-celebrate${size ? "-compact" : ""}.png`);
  // QC (PR #5): compact status is one line; a long status ellipsizes and never pushes the trademark line out;
  // "Logged out · sleeping · 2h" stays in full; tall pets are upscaled ~1.6x crisply and not cropped.
  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  const twoH = new Date(Date.now() - 2 * 3600e3 - 60e3).toISOString();
  for (const [label, evt] of [["muspah", { type: "activity", ts: twoH, activity: { category: "bossing", target: "Phantom Muspah" } }],
                              ["loot", { type: "loot", detail: { item: "Tumeken's shadow (uncharged)" } }],
                              ["logout", { type: "logout", ts: twoH }]]) {
    await post(evt);
    for (const pid of ["olmlet", "butch", "baby-mole", "heron"]) {
      const url = `${BASE}/widget/?bg=1&size=compact&pet=${pid}`;
      await call("Page.navigate", { url });
      for (let i = 0; i < 100; i++) { await sl(50); if (await ev(`location.href===${JSON.stringify(url)}&&document.readyState==="complete"&&document.getElementById("player").textContent!=="…"`)) break; }
      await sl(150);
      const q = await ev(`(()=>{const $=i=>document.getElementById(i),R=e=>e.getBoundingClientRect(),c=R($("w")),st=$("statusline"),t=st.querySelector(".text"),lg=$("note"),p=R($("pet")),sg=R(document.querySelector(".stage"));
        return {text:st.textContent.replace(/\\s+/g," ").trim(),oneLine:R(st).height<=parseFloat(getComputedStyle(st).fontSize)*1.6,ellipsized:t.scrollWidth>t.clientWidth+1,
          sinceVisible:R($("since")).right<=c.right-2,legalIn:R(lg).bottom<=c.bottom-3&&R(lg).right<=c.right-2,petH:p.height,petW:p.width,
          inStage:p.top>=sg.top-0.5&&p.bottom<=sg.bottom+0.5&&p.left>=sg.left-0.5&&p.right<=sg.right+0.5,s:getComputedStyle($("pet")).getPropertyValue("--s").trim()||"1"}})()`);
      const tag = `compact-qc ${label} ${pid}`; n++;
      if (!q.oneLine) fail(`${tag} status not one line`);
      if (!q.legalIn) fail(`${tag} trademark/legal line clipped`);
      if (!q.sinceVisible) fail(`${tag} time not visible`);
      if (!q.inStage) fail(`${tag} pet cropped`);
      if (label === "logout" && (q.ellipsized || !/Logged out · sleeping ?· 2h/.test(q.text))) fail(`${tag} logout text truncated: ${q.text}`);
      if (label === "muspah" && !q.ellipsized) console.log(`  note: ${tag} fits without ellipsis`);
      if (["olmlet", "butch"].includes(pid) && (Math.abs(q.petH - 64) > 1 || Math.abs(+q.s - 1.6) > 0.01)) fail(`${tag} tall pet not ~1.6x: h=${q.petH} s=${q.s}`);
      if (process.env.VERBOSE) console.log(tag, JSON.stringify(q));
      if (label !== "loot") { const r = await call("Page.captureScreenshot", { clip: { x: 0, y: 0, width: 260, height: 100, scale: 3 } });
        fs.writeFileSync(path.join(OUT, `v5-compact-${label}-${pid}@3x.png`), Buffer.from(r.data, "base64")); }
    }
  }
  // Compact logged-out card text in full (tall pet).
  await post({ type: "logout", ts: new Date(Date.now() - 2 * 3600e3 - 60e3).toISOString() });
  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  await call("Page.navigate", { url: `${BASE}/widget/?bg=1&size=compact&pet=olmlet` }); await sl(1500);
  const lo = await ev(`document.getElementById("statusline").textContent.replace(/\\s+/g," ").trim()`);
  if (!/Logged out · sleeping ?· 2h/.test(lo)) fail("compact logout text: " + lo);
  const r = await call("Page.captureScreenshot", { clip: { x: 0, y: 0, width: 260, height: 100, scale: 2 } });
  fs.writeFileSync(path.join(OUT, "v5-widget-compact-logged-out-olmlet.png"), Buffer.from(r.data, "base64"));
  ch.kill(); relay.kill(); console.log(bad ? `FAIL (${bad})` : `PASS: browser check (${n} widget renders, ${cases.length} pet/variant cases)`); process.exit(bad ? 1 : 0);
})();
