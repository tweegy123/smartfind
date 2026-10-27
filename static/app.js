const $ = s => document.querySelector(s), E = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])),
    LOC = ["Library", "Classroom", "Computer Laboratory", "Canteen", "Gymnasium", "Administration Office", "Hallway", "Restroom", "Campus Grounds"],
    CAT = ["Wallet", "ID Card", "Mobile Phone", "Keys", "Charger", "Umbrella", "Bag", "Book/Notebook", "Other"],
    STOP = new Set("the and with for was has had its from near under found lost item".split(" ")),
    U = [{ id: "2022-0147", n: "Ana R.", r: "s" }, { id: "2022-0398", n: "Ben T.", r: "s" }, { id: "ADM-01", n: "Security Office", r: "a" }],
    TABS = ["Overview", "Report", "Items", "Alerts", "Admin", "Evaluation"], W = { v: .5, t: .25, l: .15, d: .1 }, day = 864e5, today = () => new Date().toISOString().slice(0, 10),
    Q = [["Functionality", "The system lets me report lost or found items completely."], ["Functionality", "The suggested matches are relevant to the item I reported."], ["Usability", "The system is easy to learn and use."], ["Usability", "Reports, matches, claims, and statuses are easy to follow."], ["Reliability", "The system works consistently without errors."], ["Reliability", "My reports and claim statuses are saved and shown correctly."], ["Efficiency", "Possible matches appear within a reasonable time."], ["Efficiency", "The system helps me recover items faster than manual methods."]];
let S, cu = U[0], tab = "Overview", flt = { q: "", k: "", c: "", l: "" }, op = {}, cf = null;
const gi = id => S.items.find(x => x.id == id), nm = id => (U.find(u => u.id == id) || {}).n || id, pc = x => Math.round(x * 100) + "%",
    save = () => fetch("/api/state", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(S) }).catch(() => msg("Cannot reach the server. Is server.py running?")),
    note = (to, tx) => S.notes.unshift({ to, tx, at: new Date().toLocaleString() }), mine = () => S.notes.filter(n => n.to == cu.id),
    msg = t => { const e = $("#toast"); e.textContent = t; e.style.display = "block"; setTimeout(() => e.style.display = "none", 3500) },
    ip = m => m >= 4.21 ? "Highly acceptable" : m >= 3.41 ? "Acceptable" : m >= 2.61 ? "Moderately acceptable" : m >= 1.81 ? "Slightly acceptable" : "Not acceptable",
    tr = (l, f) => { const k = l.id + "|" + f.id; return k in S.labels ? S.labels[k] : (l.g != null && f.g != null ? l.g == f.g : undefined) };
function draw(c, col, v) {
    const k = document.createElement("canvas"); k.width = k.height = 96; const g = k.getContext("2d"); g.fillStyle = "#dfe3e8"; g.fillRect(0, 0, 96, 96); g.fillStyle = col;
    if (c == "Wallet") g.fillRect(14 + v, 28, 68, 42); else if (c == "ID Card") { g.fillRect(12, 30 + v, 72, 44); g.fillStyle = "#fff"; g.fillRect(18, 36 + v, 20, 24) } else if (c == "Mobile Phone") g.fillRect(34 + v, 10, 30, 76); else if (c == "Keys") { g.beginPath(); g.arc(30, 40 + v, 16, 0, 7); g.fill(); g.fillRect(40, 38 + v, 44, 8) } else if (c == "Umbrella") { g.beginPath(); g.arc(48, 50, 38, Math.PI, 0); g.fill(); g.fillRect(46, 50, 4, 34 + v) } else g.fillRect(20, 20, 56 + v, 60); return k
}
function feat(c) {
    const t = (w, h, x = 0, y = 0, s = c.width) => { const k = document.createElement("canvas"); k.width = w; k.height = h; const g = k.getContext("2d"); g.drawImage(c, x, y, s, s, 0, 0, w, h); return g.getImageData(0, 0, w, h).data };
    let d = t(9, 8), a = [], h = [], H = new Array(64).fill(0); for (let i = 0; i < 72; i++)a.push(d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11);
    for (let y = 0; y < 8; y++)for (let x = 0; x < 8; x++)h.push(a[y * 9 + x] > a[y * 9 + x + 1] ? 1 : 0);
    d = t(32, 32, c.width / 4, c.width / 4, c.width / 2); for (let i = 0; i < 1024; i++)H[(d[i * 4] >> 6) * 16 + (d[i * 4 + 1] >> 6) * 4 + (d[i * 4 + 2] >> 6)]++; return { h, H: H.map(v => v / 1024) }
}
const rd = f => new Promise(r => { if (!f) return r(null); const fr = new FileReader; fr.onload = () => { const i = new Image; i.onload = () => { const k = document.createElement("canvas"); k.width = k.height = 96; const m = Math.min(i.width, i.height); k.getContext("2d").drawImage(i, (i.width - m) / 2, (i.height - m) / 2, m, m, 0, 0, 96, 96); r(k) }; i.onerror = () => r(null); i.src = fr.result }; fr.onerror = () => r(null); fr.readAsDataURL(f) });
const tok = s => new Set((s.toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter(w => !STOP.has(w)));
function sc(l, f) {
    let hs = 0, hi = 0; if (l.f && f.f) { let m = 0; l.f.h.forEach((b, i) => m += b == f.f.h[i]); hs = Math.max(0, (m / 64 - .5) * 2); l.f.H.forEach((v, i) => hi += Math.min(v, f.f.H[i])) }
    const v = .35 * hs + .65 * hi, a = tok(l.t + " " + l.d), b = tok(f.t + " " + f.d), x = [...a].filter(w => b.has(w)).length, t = .4 * (l.c == f.c) + .6 * x / ((a.size + b.size - x) || 1), lo = +(l.loc == f.loc), dd = (new Date(f.dt) - new Date(l.dt)) / day, d = dd < 0 ? 0 : Math.exp(-dd / 7);
    return { s: W.v * v + W.t * t + W.l * lo + W.d * d, v, t, lo, d }
}
function cands(o) { const t0 = performance.now(), L = o.k == "L", r = S.items.filter(x => x.k != o.k && (L ? x.st != "Released" : x.st != "Resolved")).map(x => ({ o: x, r: L ? sc(o, x) : sc(x, o) })).filter(c => c.r.s >= S.th).sort((a, b) => b.r.s - a.r.s); S.times = S.times.concat(performance.now() - t0).slice(-50); return r }
function ev() {
    let tp = 0, fp = 0, fn = 0, tn = 0; S.items.filter(x => x.k == "L").forEach(l => S.items.filter(x => x.k == "F").forEach(f => { const t = tr(l, f); if (t === undefined) return; const p = sc(l, f).s >= S.th; t ? (p ? tp++ : fn++) : (p ? fp++ : tn++) }));
    const n = tp + fp + fn + tn, r = (a, b) => b ? a / b : 0, pr = r(tp, tp + fp), rc = r(tp, tp + fn); return { tp, fp, fn, tn, n, acc: r(tp + tn, n), pr, rc, f1: r(2 * pr * rc, pr + rc) }
}
function init() {
    S = { items: [], claims: [], notes: [], labels: {}, times: [], surveys: [], seq: 1, th: .55 }; const A = "2022-0147", O = "ADM-01",
        R = (k, t, c, col, v, loc, ago, d, g, by, sec) => { const cv = draw(c, col, v); S.items.push({ id: S.seq++, k, t, c, d, loc, dt: new Date(Date.now() - ago * day).toISOString().slice(0, 10), by, img: cv.toDataURL("image/jpeg", .7), f: feat(cv), st: k == "L" ? "Open" : "In custody", g, sec }) };
    R("L", "Black wallet", "Wallet", "#222", 0, "Library", 6, "Black leather wallet with a small scratch near the corner", 1, A);
    R("L", "Blue umbrella", "Umbrella", "#2a5fb0", 0, "Classroom", 5, "Blue folding umbrella with a wooden handle", 2, A);
    R("L", "Student ID card", "ID Card", "#7a1523", 0, "Canteen", 4, "Maroon lanyard with university ID card", 3, A);
    R("L", "Black smartphone", "Mobile Phone", "#222", 0, "Computer Laboratory", 3, "Black phone with cracked screen and clear case", 4, A);
    R("L", "House keys", "Keys", "#2e8b57", 0, "Hallway", 3, "Keys on a green keychain with three keys", 5, A);
    R("F", "Black leather wallet", "Wallet", "#222", 2, "Library", 5, "Black wallet picked up under a desk, scratch on corner", 1, O, "Contains a library card and PHP 200");
    R("F", "Blue umbrella", "Umbrella", "#2a5fb0", 3, "Hallway", 4, "Folding blue umbrella, wooden handle", 2, O, "Initials R.C. written inside the cover");
    R("F", "ID card with maroon lanyard", "ID Card", "#7a1523", 2, "Canteen", 3, "University ID with maroon lanyard", 3, O, "Photo shows a student wearing glasses");
    R("F", "Black phone", "Mobile Phone", "#222", 3, "Computer Laboratory", 2, "Cracked screen phone, clear case", 4, O, "Lock screen shows a basketball");
    R("F", "Keys with green keychain", "Keys", "#2e8b57", 2, "Hallway", 2, "Three keys on a green keychain", 5, O, "One key has red tape");
    R("F", "Brown wallet", "Wallet", "#7b4a26", 1, "Gymnasium", 4, "Brown wallet near the bleachers", 0, O, "Contains a gym receipt");
    R("F", "Silver phone", "Mobile Phone", "#aab2bd", 1, "Restroom", 1, "Silver phone with no case", 0, O, "Wallpaper is a beach photo"); save()
}
function cform() { return `<div class=sub><label>Linked lost report</label><select id=cl><option value="">None</option>${S.items.filter(i => i.k == "L" && i.by == cu.id && i.st != "Resolved").map(i => `<option value=${i.id} ${i.id == cf.l ? "selected" : ""}>${E(i.t)}</option>`).join("")}</select><label>Verification: describe a detail only the owner would know (contents, marks, lock screen)</label><textarea id=ca rows=2></textarea><p><button class=p onclick="claim()">Submit claim</button> <button onclick="cf=null;lst()">Cancel</button></p></div>` }
function card(x) {
    const L = x.k == "L", adm = cu.r == "a", ST = L ? ["Open", "Matched", "Resolved"] : ["In custody", "Claim pending", "Released"]; let a = "", p = "";
    if (L && (x.by == cu.id || adm)) a += `<button onclick="op[${x.id}]=!op[${x.id}];lst()">${op[x.id] ? "Hide" : "Show"} possible matches</button> `;
    if (!L && !adm && x.st == "In custody") a += `<button class=p onclick="cf={f:${x.id}};lst()">Claim this item</button> `;
    if (adm) a += `<select onchange="setSt(${x.id},this.value)">${ST.map(s => `<option ${s == x.st ? "selected" : ""}>${s}`).join("")}</select>`;
    if (L && op[x.id]) p = `<div class=sub><b>Possible matches (score at least ${pc(S.th)})</b>${cands(x).map(m => `<div class=it><img class=th src="${m.o.img}"><div><b>${E(m.o.t)}</b> <span class=tag>${m.o.st}</span><br><b>${pc(m.r.s)}</b> overall: visual ${pc(m.r.v)}, text ${pc(m.r.t)}, location ${pc(m.r.lo)}, time ${pc(m.r.d)}<div class=bar><i style="width:${pc(m.r.s)}"></i></div><small class=m>${E(m.o.loc)}, ${m.o.dt}</small>${!adm && m.o.st == "In custody" ? `<br><button class=p onclick="cf={f:${m.o.id},l:${x.id}};lst()">Claim this item</button>` : ""}${cf && cf.f == m.o.id && cf.l == x.id ? cform() : ""}</div></div>`).join("") || "<p class=m>No candidates above the threshold yet. You will get an alert when a likely match is reported.</p>"}<small class=m>Suggestions only. Release requires Admin verification.</small></div>`;
    return `<div class=card><div class=it style="margin:0"><img class=th src="${x.img}"><div><b>${E(x.t)}</b> <span class=tag>${L ? "Lost" : "Found"}</span> <span class=tag>${x.st}</span><br><small class=m>${E(x.c)}, ${E(x.loc)}, ${x.dt}, reported by ${E(nm(x.by))}</small><p style="margin:4px 0">${E(x.d)}</p>${a}</div></div>${cf && cf.f == x.id && !cf.l ? cform() : ""}${p}</div>`
}
function lst() { const q = flt.q.toLowerCase(), a = S.items.filter(x => (!flt.k || x.k == flt.k) && (!flt.c || x.c == flt.c) && (!flt.l || x.loc == flt.l) && (!q || (x.t + " " + x.d).toLowerCase().includes(q))).sort((a, b) => b.id - a.id); $("#list").innerHTML = a.map(card).join("") || "<p class=m>No records match the filters.</p>" }
async function sub() {
    const g = i => $("#" + i).value.trim(), k = g("rk"), cv = await rd($("#rp").files[0]);
    if (!g("rt") || !g("rd")) return msg("Enter an item name and description."); if (!cv) return msg("Attach a photo of the item.");
    const o = { id: S.seq++, k, t: g("rt"), c: g("rc"), d: g("rd"), loc: g("rl"), dt: g("rdt") || today(), by: cu.id, img: cv.toDataURL("image/jpeg", .7), f: feat(cv), st: k == "L" ? "Open" : "In custody", sec: k == "F" ? g("rs") : "" };
    S.items.push(o); const c = cands(o); note(cu.id, `Your ${k == "L" ? "lost" : "found"} report for “${o.t}” was recorded.`);
    if (k == "L") { if (c.length) note(cu.id, `${c.length} possible match(es) found for “${o.t}”. Open Items to review.`); op[o.id] = 1 } else c.forEach(m => note(m.o.by, `A newly found item may match your lost report “${m.o.t}”.`));
    save(); tab = "Items"; render(); msg("Report submitted.")
}
function claim() {
    const a = $("#ca").value.trim(); if (!a) return msg("Answer the verification question."); const f = gi(cf.f), l = $("#cl").value;
    S.claims.push({ id: S.seq++, fid: f.id, lid: l ? +l : null, by: cu.id, ans: a, st: "Pending" }); f.st = "Claim pending";
    note(cu.id, `Claim submitted for “${f.t}”. Awaiting Admin verification.`); note("ADM-01", `New claim from ${nm(cu.id)} for “${f.t}”.`); cf = null; save(); render(); msg("Claim submitted.")
}
function dec(id, ok) {
    const c = S.claims.find(x => x.id == id), f = gi(c.fid), l = c.lid && gi(c.lid); c.st = ok ? "Approved" : "Rejected";
    if (ok) { f.st = "Released"; if (l) l.st = "Resolved" } else if (!S.claims.some(x => x.fid == f.id && x.st == "Pending")) f.st = "In custody";
    if (l) S.labels[l.id + "|" + f.id] = !!ok;
    note(c.by, ok ? `Your claim for “${f.t}” was approved. Present your university ID at the Security Office.` : `Your claim for “${f.t}” was not approved. Provide more details or visit the Security Office.`); save(); render()
}
function mdec(l, f, ok) { S.labels[l + "|" + f] = !!ok; if (ok) { const L = gi(l); if (L.st == "Open") L.st = "Matched"; note(L.by, `Admin confirmed a likely match for “${L.t}”. Submit a claim on the found item.`) } save(); render() }
function setSt(id, v) { gi(id).st = v; save(); lst() }
function ans() { const a = Q.map((q, i) => { const e = document.querySelector(`input[name=q${i}]:checked`); return e ? +e.value : 0 }); if (a.includes(0)) return msg("Answer all statements."); S.surveys.push({ r: $("#sr").value, a }); save(); render(); msg("Response recorded.") }
const mx = () => { const e = ev(), t = S.times, m = t.length ? t.reduce((a, b) => a + b, 0) / t.length : 0; return `<div class=g>${[["Accuracy", e.acc], ["Precision", e.pr], ["Recall", e.rc], ["F1-score", e.f1]].map(a => `<div class=card><b style="font-size:22px">${pc(a[1])}</b><br>${a[0]}</div>`).join("")}</div><p>TP ${e.tp}, FP ${e.fp}, FN ${e.fn}, TN ${e.tn} (${e.n} labelled pairs)</p><p class=m>Performance efficiency: mean matching time ${m.toFixed(2)} ms per query over ${t.length} recorded runs (runs are recorded when matches are generated).</p>` };
const sv = () => { const r = S.surveys, cr = [...new Set(Q.map(q => q[0]))], all = r.flatMap(x => x.a), om = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0; return `<table><tr><th>Criterion<th>Mean<th>Interpretation</tr>${cr.map(c => { const ix = Q.map((q, i) => q[0] == c ? i : -1).filter(i => i >= 0), v = r.flatMap(x => ix.map(i => x.a[i])), m = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; return `<tr><td>${c}<td>${m ? m.toFixed(2) : "-"}<td>${m ? ip(m) : "No responses"}</tr>` }).join("")}</table><p class=m>Respondents: ${r.length}${om ? `. Overall mean ${om.toFixed(2)} (${ip(om)}).` : "."}</p>` };
const V = {
    Overview: () => `<div class=card><h2 style="margin-top:0">NWU SmartFind</h2><p><b>General objective.</b> Design, develop, and evaluate a computer vision-based lost-and-found item identification and recovery system that helps students and university personnel report, identify, claim, and recover lost belongings at Northwestern University.</p><p><b>Problem.</b> Digital lost-and-found records are hard to search when descriptions are incomplete, people use different words, or several belongings look alike. Existing platforms rely on keywords and manual comparison, and photos only serve as references.</p><p><b>How matching works.</b> Each lost and found pair gets a score: 50% visual (difference hash and colour histogram), 25% text (category and description overlap), 15% location, and 10% time. Pairs at or above the threshold become suggestions. Human review stays necessary: only an Admin can release an item after checking the claimant’s answer against the hidden detail on file.</p><p class=m>Prototype note: matching runs in your browser with classical image features, so it needs no server or model download. Production should replace them with deep embeddings (for example MobileNetV2 or CLIP), as the literature review describes. Data is stored in this browser only, and the demo photos are synthetic.</p></div>
<div class="card tw"><h3 style="margin-top:0">Research questions and where the system answers them</h3><table><tr><th>RQ<th>Question<th>System component</tr>
<tr><td>1<td>Requirements and challenges in reporting, searching, claiming, and monitoring<td>Report form, search and filters, claim flow, status tracking, Alerts</tr>
<tr><td>2<td>Design: architecture, database, interfaces, item management, matching, notifications, claim verification<td>Student and Admin interfaces; records for items, claims, labels, and alerts; fusion matching; Admin verification queue</tr>
<tr><td>3<td>Development with web technologies and computer vision<td>Browser app with image features fused with text, location, and time</tr>
<tr><td>4<td>Computer vision performance: accuracy, precision, recall, F1<td>Evaluation tab: confusion matrix at an adjustable threshold</tr>
<tr><td>5<td>Acceptability: functionality, usability, reliability, efficiency<td>Evaluation tab: Likert survey, means with interpretation, measured matching time</tr></table></div>`,
    Report: () => `<div class=card><h3 style="margin-top:0">Report an item</h3><p class=m>Reporting as ${E(cu.n)} (ID ${cu.id}). A photo is required because image matching is the core of the system.</p>
<label>Report type</label><select id=rk onchange="$('#sw').style.display=this.value=='F'?'block':'none'"><option value=L>I lost an item<option value=F>I found an item</select>
<label>Item name</label><input id=rt placeholder="e.g., Black wallet"><label>Category</label><select id=rc>${CAT.map(c => `<option>${c}`).join("")}</select>
<label>Description and distinguishing features</label><textarea id=rd rows=3 placeholder="Color, brand, scratches, stickers, keychain, printed name"></textarea>
<label>Location</label><select id=rl>${LOC.map(c => `<option>${c}`).join("")}</select><label>Date</label><input id=rdt type=date value="${today()}">
<label>Photo</label><input id=rp type=file accept="image/*"><div id=sw style="display:none"><label>Hidden verification detail (visible to Admin only)</label><input id=rs placeholder="e.g., contents, lock-screen image, mark inside"></div>
<p><button class=p onclick="sub()">Submit report</button></p></div>`,
    Items: () => `<div class=card><div class=g><input placeholder="Search name or description" value="${E(flt.q)}" oninput="flt.q=this.value;lst()"><select onchange="flt.k=this.value;lst()">${[["", "All reports"], ["L", "Lost"], ["F", "Found"]].map(o => `<option value="${o[0]}" ${flt.k == o[0] ? "selected" : ""}>${o[1]}`).join("")}</select><select onchange="flt.c=this.value;lst()"><option value="">All categories${CAT.map(c => `<option ${flt.c == c ? "selected" : ""}>${c}`).join("")}</select><select onchange="flt.l=this.value;lst()"><option value="">All locations${LOC.map(c => `<option ${flt.l == c ? "selected" : ""}>${c}`).join("")}</select></div></div><div id=list></div>`,
    Alerts: () => mine().map(n => `<div class=card>${E(n.tx)}<br><small class=m>${n.at}</small></div>`).join("") || "<p class=m>No alerts yet. Submit a report to start receiving match alerts.</p>",
    Admin: () => {
        const n = (k, s) => S.items.filter(x => x.k == k && x.st == s).length, pend = S.claims.filter(c => c.st == "Pending"), sug = [];
        S.items.filter(x => x.k == "L" && x.st != "Resolved").forEach(l => S.items.filter(x => x.k == "F" && x.st != "Released").forEach(f => { const r = sc(l, f); if (r.s >= S.th && !((l.id + "|" + f.id) in S.labels)) sug.push({ l, f, r }) }));
        return `<div class=g>${[["Open lost reports", n("L", "Open")], ["Matched lost reports", n("L", "Matched")], ["Found in custody", n("F", "In custody")], ["Pending claims", pend.length], ["Resolved or released", n("L", "Resolved") + n("F", "Released")]].map(a => `<div class=card><b style="font-size:22px">${a[1]}</b><br>${a[0]}</div>`).join("")}</div>
<h3>Claims awaiting verification</h3>${pend.map(c => { const f = gi(c.fid), l = c.lid && gi(c.lid); return `<div class=card><div class=it style="margin:0"><img class=th src="${f.img}"><div><b>${E(f.t)}</b><br><small class=m>Claimant: ${E(nm(c.by))} (ID ${c.by})${l ? `, linked lost report: ${E(l.t)} (match ${pc(sc(l, f).s)})` : ", no linked report"}</small><p style="margin:4px 0"><b>Hidden detail on file:</b> ${E(f.sec || "none")}<br><b>Claimant’s answer:</b> ${E(c.ans)}</p><button class=p onclick="dec(${c.id},1)">Approve and release</button> <button onclick="dec(${c.id},0)">Reject</button></div></div></div>` }).join("") || "<p class=m>No pending claims.</p>"}
<h3>Suggested matches to review</h3>${sug.map(o => `<div class=card><div class=it style="margin:0"><img class=th src="${o.l.img}"><img class=th src="${o.f.img}"><div><b>${E(o.l.t)}</b> (lost, ${E(nm(o.l.by))}) and <b>${E(o.f.t)}</b> (found)<br>Score <b>${pc(o.r.s)}</b>: visual ${pc(o.r.v)}, text ${pc(o.r.t)}, location ${pc(o.r.lo)}, time ${pc(o.r.d)}<br><button class=p onclick="mdec(${o.l.id},${o.f.id},1)">Confirm match</button> <button onclick="mdec(${o.l.id},${o.f.id},0)">Not a match</button></div></div></div>`).join("") || "<p class=m>No unreviewed suggestions.</p>"}<p class=m>Change an item’s status from the Items tab. Your decisions here also feed the Evaluation metrics.</p>`
    },
    Evaluation: () => `<div class=card><h3 style="margin-top:0">Computer vision component (RQ4)</h3><p class=m>Ground truth comes from labelled pairs: the seeded demo set and Admin decisions. Replace the demo set with real NWU photographs for the study.</p><label>Match threshold: <span id=thv>${S.th}</span></label><input type=range min=.3 max=.9 step=.05 value=${S.th} oninput="S.th=+this.value;$('#thv').textContent=S.th;$('#mx').innerHTML=mx()" onchange="save()"><div id=mx>${mx()}</div></div>
<div class=card><h3 style="margin-top:0">Acceptability survey (RQ5)</h3><p class=m>5 Strongly agree, 4 Agree, 3 Neutral, 2 Disagree, 1 Strongly disagree. Criteria follow the ISO/IEC 25010 characteristics chosen in the proposal; usability and efficiency items also reflect TAM ease of use and usefulness.</p><label>Respondent</label><select id=sr><option>Student<option>University personnel</select>
${Q.map((q, i) => `<label>${q[0]}: ${q[1]}</label><div class=lk>${[5, 4, 3, 2, 1].map(n => `<label><input type=radio name=q${i} value=${n}> ${n}</label>`).join("")}</div>`).join("")}<button class=p onclick="ans()">Submit response</button><h4>Results</h4><div class=tw>${sv()}</div></div>
<p><button onclick="init();render()">Reset demo data</button></p>`};
function render() { $("#nav").innerHTML = TABS.filter(t => t != "Admin" || cu.r == "a").map(t => `<button class="${t == tab ? "on" : ""}" onclick="tab='${t}';cf=null;render()">${t}${t == "Alerts" ? " (" + mine().length + ")" : ""}</button>`).join(""); $("#main").innerHTML = V[tab](); if (tab == "Items") lst() }
$("#us").innerHTML = U.map(u => `<option value="${u.id}">${u.n} (${u.r == "a" ? "Admin" : "Student"})`).join("");
$("#us").onchange = e => { cu = U.find(u => u.id == e.target.value); if (cu.r != "a" && tab == "Admin") tab = "Overview"; cf = null; render() };
fetch("/api/state").then(r => r.json()).then(j => { S = j.items ? j : null; if (!S) init(); render() }).catch(() => { $("#main").innerHTML = "<p class=m>Cannot reach the server. Run <code>python server.py</code>, then open http://localhost:5000</p>" });
