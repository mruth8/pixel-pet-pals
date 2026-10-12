// Headless-Chrome check (needs google-chrome, Node >=20.10): node --experimental-websocket test/browser-check.js
const {spawn,execSync}=require("child_process");
const relay=spawn("node",["relay/server.js"],{env:{...process.env,PORT:18899}});
const ch=spawn("google-chrome",["--headless=new","--no-sandbox","--remote-debugging-port=19222","--window-size=260,200","about:blank"]);
const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await sl(2500);
const t=(await (await fetch("http://localhost:19222/json")).json()).find(x=>x.type=="page");
const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id])pend[d.id](d.result);if(d.method=="Runtime.consoleAPICalled")console.log("console:",JSON.stringify(d.params.args.map(a=>a.value)));if(d.method=="Runtime.exceptionThrown")console.log("EXC",JSON.stringify(d.params.exceptionDetails).slice(0,400))};
const call=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
await call("Runtime.enable");await call("Page.navigate",{url:"http://localhost:18899/widget/"});await sl(1500);
const state=async()=>(await call("Runtime.evaluate",{expression:`["player","pet","status"].map(i=>document.getElementById(i)).map(e=>e.textContent+"("+(e.dataset.anim||"")+e.className+")").join(" | ")`})).result.value;
console.log("before:",await state());
const evs=[["activity",{activity:{category:"skilling",skill:"Woodcutting",target:"yews"}}],["level_up",{detail:{skill:"Woodcutting",level:70}}],["activity",{activity:{category:"bossing",target:"Vorkath"}}],["logout",{}]];
let n=0;for(const [type,x] of evs){await fetch("http://localhost:18899/events",{method:"POST",body:JSON.stringify({v:1,player:"Matthew",ts:new Date().toISOString(),type,...x})});await sl(400);console.log("after",type,":",await state());
const s=await call("Page.captureScreenshot");require("fs").writeFileSync(`/tmp/ppp-widget-${n++}.png`,Buffer.from(s.data,"base64"));}
ch.kill();relay.kill();process.exit(0)})();