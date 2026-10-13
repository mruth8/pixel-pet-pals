// Headless-Chrome check (google-chrome, Node >=20.10): node --experimental-websocket test/browser-check.js
// Every pack (and variant) in overlay + compact, at 1100px and 390px, via /widget/ and /widget (no slash).
// Asserts facing, variant, no sprite cropping, status/legal text fully visible. Screenshots -> screenshots/v6-*.png
const { spawn } = require("child_process"), fs = require("fs"), path = require("path");
const H = require("./harness");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "screenshots"); let PORT, BASE;  // PORT from BROWSER_PORT or a free port
fs.mkdirSync(OUT, { recursive: true });
const PACKS = fs.readdirSync(path.join(ROOT, "packs")).filter(d => fs.existsSync(path.join(ROOT, "packs", d, "manifest.json")) && d !== "placeholder-blob" && !d.startsWith("zz-test-"));
const sl = ms => new Promise(r => setTimeout(r, ms)); let bad = 0, n = 0; const fail = m => { bad++; console.log("FAIL", m); };
const post = ev => fetch(`${BASE}/events`, { method: "POST", body: JSON.stringify({ v: 1, player: "Matthew", ts: new Date().toISOString(), ...ev }) });
(async () => {
  PORT = await H.port("BROWSER_PORT"); BASE = `http://127.0.0.1:${PORT}`;
  H.child("node", ["relay/server.js"], { cwd: ROOT, env: { ...process.env, PORT, PET_HOST: "127.0.0.1" } });
  const chrome = await H.launchChrome({ envPort: "CHROME_DEBUG_PORT" });
  for (let i = 0; i < 50; i++) { try { await fetch(`${BASE}/state`); break; } catch { await sl(100); } }
  const ws = new WebSocket(chrome.wsUrl); H.onCleanup(() => ws.close()); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {};
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) pend[d.id](d.result);
    if (d.method === "Runtime.exceptionThrown") fail("exception " + d.params.exceptionDetails.text);
    if (d.method === "Network.responseReceived" && d.params.response.status >= 400 && !d.params.response.url.endsWith("/zz-test-broken-acts/activities/missing.png")) fail(d.params.response.status + " " + d.params.response.url); };
  const call = (method, params = {}) => new Promise((r, j) => { const i = ++id; const to = setTimeout(() => j(new Error("CDP timeout " + method)), 20000); pend[i] = v => { clearTimeout(to); r(v); }; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async x => (await call("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result.value;
  await call("Runtime.enable"); await call("Network.enable"); await call("Network.setCacheDisabled", { cacheDisabled: true });
  const cases = [];
  for (const id of PACKS) {
    const m = JSON.parse(fs.readFileSync(path.join(ROOT, "packs", id, "manifest.json")));
    const vs = (m.variants || []).map(v => v.id); for (const v of vs.length ? vs : [""]) cases.push({ id, v, facing: ((m.variants || []).find(x => x.id === (v || m.defaultVariant)) || {}).facing || m.facing || "right", def: m.defaultVariant || "" });
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
        topGap:(()=>{const st=c.querySelector(".stage");return pr.top-(sr.top+st.clientTop)})(),
        textOk:![st,lg].some(e=>R(e).right>cr.right-2||R(e).bottom>cr.bottom-2)&&![...st.children].some(e=>e.scrollWidth>e.clientWidth+1),
        tm:/Old School RuneScape is a trademark of Jagex Ltd\\./.test(lg.textContent)&&/Not affiliated with Jagex/.test(lg.textContent),
        url:location.pathname,w:cr.width,h:cr.height}})()`);
    n++; if (process.env.VERBOSE) console.log(tag, c.id, c.v, Date.now() - T0);
    const want = { pet: c.id, variant: c.v || c.def || "", flip: c.facing === "left" };
    for (const k in want) if (s[k] !== want[k]) fail(`${tag} ${c.id}/${c.v} ${k}=${s[k]} want ${want[k]}`);
    if (!s.inStage) fail(`${tag} ${c.id} sprite cropped/outside stage`);
    if (!(s.topGap >= 1)) fail(`${tag} ${c.id} art touches the top edge (gap ${s.topGap})`);
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
      const shot = vw === 1100 && slash ? `v6-widget-${c.id}${c.v ? "-" + c.v : ""}${size ? "-compact" : ""}.png` : null;
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
      if (s.gapL < 1 || s.gapR < 1 || s.top < 1 || s.bottom < -0.5) fail(`${tag} edge clipping L${s.gapL} R${s.gapR} T${s.top} B${s.bottom}`);
      if (s.flip !== (c.facing === "left")) fail(`${tag} facing`);
      if (!s.legalIn) fail(`${tag} legal clipped`);
      if (!size || act === "fishing") { const r = await call("Page.captureScreenshot", { clip: { x: 0, y: 0, width: Math.ceil(s.w) + 14, height: Math.ceil(s.h) + 14, scale: 2 } });
        fs.writeFileSync(path.join(OUT, `v6-act-${act}-${c.id}${c.v ? "-" + c.v : ""}${size ? "-compact" : ""}.png`), Buffer.from(r.data, "base64")); }
    }
    console.log(`activities ${act}: ${cases.length * 2} renders ${bad === beforeAct ? "ok" : "FAILED"}`);
  }
  // L2: broken custom pack whose activities sheet 404s -> falls back to activityMap/base, never a blank stage.
  {
    const src = path.join(ROOT, "packs", "heron"), dst = path.join(ROOT, "packs", "zz-test-broken-acts");
    fs.rmSync(dst, { recursive: true, force: true }); fs.mkdirSync(dst);
    H.onCleanup(() => fs.rmSync(dst, { recursive: true, force: true }));
    const m = JSON.parse(fs.readFileSync(path.join(src, "manifest.json")));
    fs.copyFileSync(path.join(src, m.sheet.file), path.join(dst, "sheet.png"));
    Object.assign(m, { id: "zz-test-broken-acts", sheet: { ...m.sheet, file: "sheet.png" }, activities: { ...m.activities, sheet: "activities/missing.png" } });
    fs.writeFileSync(path.join(dst, "manifest.json"), JSON.stringify(m));
    await call("Emulation.setDeviceMetricsOverride", { width: 1100, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const act of ["woodcutting", "combat", "banking"]) {
      await mock(act);
      const url = `${BASE}/widget/?bg=1&pet=zz-test-broken-acts`;
      await call("Page.navigate", { url });
      let r; for (let i = 0; i < 60; i++) { await sl(100); r = await ev(`(()=>{const p=document.getElementById("pet");return {anim:p.dataset.anim,sheet:p.dataset.sheet,err:p.dataset.actsError,img:p.style.backgroundImage}})()`); if (r.err) break; }
      await sl(200); r = await ev(`(async()=>{const p=document.getElementById("pet"),u=getComputedStyle(p).backgroundImage.slice(5,-2),im=new Image();im.src=u;await im.decode().catch(()=>{});
        return {anim:p.dataset.anim,sheet:p.dataset.sheet,err:p.dataset.actsError,loaded:im.naturalWidth>0,img:u.replace(location.origin,"")}})()`);
      const want = m.activityMap[act === "woodcutting" ? "skilling" : act] || m.default;
      n++;
      if (r.err !== "1" || r.sheet !== "base" || r.anim !== want || !r.loaded || !r.img.endsWith("/zz-test-broken-acts/sheet.png")) fail(`broken pack ${act}: ${JSON.stringify(r)} want base/${want}`);
      const shot = await call("Page.captureScreenshot", { clip: { x: 0, y: 0, width: 380, height: 140, scale: 2 } });
      fs.writeFileSync(path.join(OUT, `v6-broken-acts-${act}.png`), Buffer.from(shot.data, "base64"));
    }
    console.log(`broken activities sheet: fallback checked (expected 404 on missing.png ignored)`);
  }
  // v6: batch-2 pets and variants, every base animation and every frame, overlay + compact. The art's opaque bbox per frame
  // (from the PNG) is placed on the rendered sprite box; it must stay >=1px inside the stage (Lil' Sot's 6px hop included).
  // Chaos elemental: celebrate squashes instead of hopping (intended): its art top never rises above idle, and it gets shorter.
  {
    const { readPng } = require("./png"), { resolveVariant } = require("../shared/pack"); const before = bad; let k = 0;
    const NEW = ["baron", "callisto-cub", "chaos-elemental", "penance-queen", "soup", "lil-zik"];
    const bbox = (img, fx, fy, fw, fh) => { let t = fh, b = -1, l = fw, r = -1;
      for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (img.data[((fy + y) * img.width + fx + x) * 4 + 3]) { t = Math.min(t, y); b = Math.max(b, y); l = Math.min(l, x); r = Math.max(r, x); }
      return { t, b, l, r }; };
    for (const c of cases.filter(c => NEW.includes(c.id))) {
      const m = JSON.parse(fs.readFileSync(path.join(ROOT, "packs", c.id, "manifest.json"))), V = resolveVariant(m, c.v || undefined);
      const img = readPng(path.join(ROOT, "packs", c.id, V.file)), fw = m.sheet.frameWidth, fh = m.sheet.frameHeight;
      const boxes = {}; for (const a of ["idle", "walk", "sleep", "happy", "celebrate"]) { const A = V.animations[a]; boxes[a] = [...Array(A.frames)].map((_, i) => bbox(img, i * fw, A.row * fh, fw, fh)); }
      if (c.id === "chaos-elemental") { const it = Math.min(...boxes.idle.map(x => x.t)), ih = Math.max(...boxes.idle.map(x => x.b - x.t));
        if (boxes.celebrate.some(x => x.t < it)) fail(`chaos-elemental celebrate hops above idle (top ${boxes.celebrate.map(x => x.t)} vs ${it})`);
        if (!boxes.celebrate.some(x => x.b - x.t < ih)) fail("chaos-elemental celebrate never squashes");
        if (boxes.celebrate.some(x => x.b !== Math.max(...boxes.idle.map(y => y.b)))) fail("chaos-elemental celebrate leaves the floor"); }
      if (c.id === "lil-zik" && c.v === "sot") {  // the ground shadow stays on the floor row, so the hop is the gap of empty rows above it
        const gap = (A, i) => { let b = -1, g = 0; for (let y = fh - 1; y >= 0; y--) { let any = false; for (let x = 0; x < fw; x++) if (img.data[((A.row * fh + y) * img.width + i * fw + x) * 4 + 3]) any = true;
          if (b < 0) { if (any) b = y; } else if (!any) g++; else break; } return g; };
        const lift = Math.max(...[...Array(V.animations.celebrate.frames)].map((_, i) => gap(V.animations.celebrate, i)));
        if (lift < 1) fail(`lil-zik/sot celebrate does not hop (lift ${lift})`); else console.log(`  lil-zik/sot celebrate hop ${lift}px, top row ${Math.min(...boxes.celebrate.map(x => x.t))}`); }
      for (const [vw, size] of [[1100, ""], [390, "compact"]]) {
        await call("Emulation.setDeviceMetricsOverride", { width: vw, height: 900, deviceScaleFactor: 1, mobile: vw < 500 });
        const url = `${BASE}/widget/?bg=1&pet=${c.id}${c.v ? "&variant=" + c.v : ""}${size ? "&size=compact" : ""}`;
        await call("Page.navigate", { url });
        for (let i = 0; i < 100; i++) { await sl(50); if (await ev(`location.href===${JSON.stringify(url)}&&document.readyState==="complete"&&!!window.__petPlay&&!!document.getElementById("pet").dataset.anim`)) break; }
        for (const a of Object.keys(boxes)) {
          const s = await ev(`(()=>{window.__petPlay(${JSON.stringify(a)});const p=document.getElementById("pet"),st=document.querySelector(".stage"),R=e=>e.getBoundingClientRect(),pr=R(p),sr=R(st);
            return {anim:p.dataset.anim,sheet:p.dataset.sheet,img:p.style.backgroundImage,flip:p.classList.contains("flip"),l:pr.left,t:pr.top,w:pr.width,h:pr.height,
              il:sr.left+st.clientLeft,it:sr.top+st.clientTop,ir:sr.left+st.clientLeft+st.clientWidth,ib:sr.top+st.clientTop+st.clientHeight,cw:R(document.getElementById("w")).width,ch:R(document.getElementById("w")).height}})()`);
          const tag = `v6 ${c.id}${c.v ? "/" + c.v : ""} ${a}${size ? " compact" : ""}`; n++; k++;
          if (s.anim !== a || s.sheet !== "base" || !s.img.includes(`/packs/${c.id}/${V.file}`)) fail(`${tag} wrong anim/sheet ${s.anim} ${s.img}`);
          if (s.flip !== (c.facing === "left")) fail(`${tag} facing`);
          const px = s.h / fh;
          boxes[a].forEach((b, i) => { if (b.b < 0) return;
            const top = s.t + b.t * px - s.it, bot = s.ib - (s.t + (b.b + 1) * px), left = s.l + b.l * px - s.il, right = s.ir - (s.l + (b.r + 1) * px);
            if (top < 1 || bot < -0.5 || left < 1 || right < 1) fail(`${tag} frame ${i} art outside stage T${top} B${bot} L${left} R${right}`); });
          if (!size && (a === "celebrate" || c.id === "lil-zik") || (size && a === "celebrate")) {
            await sl(30); const r = await call("Page.captureScreenshot", { clip: { x: 0, y: 0, width: Math.ceil(s.cw) + 14, height: Math.ceil(s.ch) + 14, scale: 2 } });
            fs.writeFileSync(path.join(OUT, `v6-anim-${c.id}${c.v ? "-" + c.v : ""}-${a}${size ? "-compact" : ""}.png`), Buffer.from(r.data, "base64")); }
        }
      }
    }
    console.log(`v6 new pets: ${k} animation renders (every frame bbox in stage) ${bad === before ? "ok" : "FAILED"}`);
  }
  // Celebrate (level_up): sprite must stay inside the stage, incl. tall pets.
  await call("Emulation.setDeviceMetricsOverride", { width: 1100, height: 900, deviceScaleFactor: 1, mobile: false });
  await post({ type: "level_up", detail: { skill: "Woodcutting", level: 71 } });
  for (const c of cases.filter(c => (["olmlet", "butch", "heron", "baby-chinchompa", "chaos-elemental", "baron"].includes(c.id) && (!c.v || c.v === c.def) || (c.id === "lil-zik" && c.v === "sot"))))
    for (const size of ["", "&size=compact"]) await check("celebrate", `${BASE}/widget/?bg=1&pet=${c.id}${c.v ? "&variant=" + c.v : ""}${size}`, c, `v6-widget-${c.id}${c.v ? "-" + c.v : ""}-celebrate${size ? "-compact" : ""}.png`);
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
          inStage:p.top>=sg.top-0.5&&p.bottom<=sg.bottom+0.5&&p.left>=sg.left-0.5&&p.right<=sg.right+0.5,topGap:p.top-(sg.top+document.querySelector(".stage").clientTop),stageInCard:sg.top>=c.top+3&&sg.bottom<=c.bottom-3,s:getComputedStyle($("pet")).getPropertyValue("--s").trim()||"1"}})()`);
      const tag = `compact-qc ${label} ${pid}`; n++;
      if (!q.oneLine) fail(`${tag} status not one line`);
      if (!q.legalIn) fail(`${tag} trademark/legal line clipped`);
      if (!q.sinceVisible) fail(`${tag} time not visible`);
      if (!q.inStage) fail(`${tag} pet cropped`);
      if (!(q.topGap >= 1)) fail(`${tag} art touches top edge (gap ${q.topGap})`);
      if (!q.stageInCard) fail(`${tag} stage outside card border`);
      if (label === "logout" && (q.ellipsized || !/Logged out · sleeping ?· 2h/.test(q.text))) fail(`${tag} logout text truncated: ${q.text}`);
      if (label === "muspah" && !q.ellipsized) console.log(`  note: ${tag} fits without ellipsis`);
      if (["olmlet", "butch"].includes(pid) && (Math.abs(q.petH - 64) > 1 || Math.abs(+q.s - 1.6) > 0.01)) fail(`${tag} tall pet not ~1.6x: h=${q.petH} s=${q.s}`);
      if (process.env.VERBOSE) console.log(tag, JSON.stringify(q));
      if (label !== "loot") { const r = await call("Page.captureScreenshot", { clip: { x: 0, y: 0, width: 260, height: 100, scale: 3 } });
        fs.writeFileSync(path.join(OUT, `v6-compact-${label}-${pid}@3x.png`), Buffer.from(r.data, "base64")); }
    }
  }
  // Compact logged-out card text in full (tall pet).
  await post({ type: "logout", ts: new Date(Date.now() - 2 * 3600e3 - 60e3).toISOString() });
  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  await call("Page.navigate", { url: `${BASE}/widget/?bg=1&size=compact&pet=olmlet` }); await sl(1500);
  const lo = await ev(`document.getElementById("statusline").textContent.replace(/\\s+/g," ").trim()`);
  if (!/Logged out · sleeping ?· 2h/.test(lo)) fail("compact logout text: " + lo);
  const r = await call("Page.captureScreenshot", { clip: { x: 0, y: 0, width: 260, height: 100, scale: 2 } });
  fs.writeFileSync(path.join(OUT, "v6-widget-compact-logged-out-olmlet.png"), Buffer.from(r.data, "base64"));
  H.cleanup(); console.log(bad ? `FAIL (${bad})` : `PASS: browser check (${n} widget renders, ${cases.length} pet/variant cases)`); process.exit(bad ? 1 : 0);
})().catch(e => { console.error("FAIL", e.stack || e); H.cleanup(); process.exit(1); });
