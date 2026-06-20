/* ============================================================
   LONGRISE PC — EARN injection (replaces CRYPTO AI / 네비 01)
   • Compiled React bundle is NOT modified.
   • Detects the active 네비 01 tab, hides the original CRYPTO AI
     page, and mounts the EARN dashboard as a sibling in <main>.
   • Relabels nav: CRYPTO AI→EARN, PACKAGES→PLANS, REWARDS→NETWORK.
   Requires window.LRChart (reskin/candles.js) loaded first.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- EARN demo data (mirrors mobile HomeScreen) ---------- */
  var D = {
    user: { name: "Daniel Park", rank: "PURPLE" },
    bal: { available: 12480.50, earned: 1864.22, invested: 24000.00 },
    todayPnl: 412.18,
    spark: [21, 24, 22, 27, 25, 30, 28, 34, 31, 38, 36, 41, 39, 45, 43, 48],
    weekEarnings: [212, 248, 196, 284, 262, 318, 344],
    engine: { name: "NEURAL CORE V6", winRate: 87.4, dailyRoi: 1.42, signals: 1284, latency: 14 },
    portfolio: [
      { pkg: "STANDARD", amount: 24000, dailyRoi: 1.2, start: "Mar 14, 2026", end: "Sep 10, 2026", progress: 0.51, earned: 1864.22 },
      { pkg: "PREMIUM",  amount: 20000, dailyRoi: 1.6, start: "Apr 02, 2026", end: "Dec 28, 2026", progress: 0.28, earned: 1792.40 },
      { pkg: "FLEXIBLE", amount: 4200,  dailyRoi: 0.65, start: "May 20, 2026", end: "No lock",      progress: 0.12, earned: 168.90 }
    ],
    pairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "AVAX/USDT"],
    trades: [
      { pair: "BTC/USDT", side: "LONG",  pnl: 184.20, time: "14:32:08" },
      { pair: "ETH/USDT", side: "SHORT", pnl: 96.75,  time: "14:31:42" },
      { pair: "SOL/USDT", side: "LONG",  pnl: -22.40, time: "14:30:51" },
      { pair: "BNB/USDT", side: "LONG",  pnl: 61.10,  time: "14:29:33" },
      { pair: "XRP/USDT", side: "SHORT", pnl: 38.92,  time: "14:28:17" }
    ],
    news: [
      { title: "V6 Neural Engine throughput upgrade", tag: "ENGINE", date: "Jun 11" },
      { title: "CNYT market maker program opens",     tag: "MARKET", date: "Jun 07" },
      { title: "Q3 roadmap: advanced integrations",   tag: "ROADMAP", date: "Jun 02" }
    ]
  };
  function fmt(n, dec) { if (dec === undefined) dec = 2; return Number(n).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  function genTrade() {
    var pair = D.pairs[(Math.random() * D.pairs.length) | 0];
    var side = Math.random() > 0.45 ? "LONG" : "SHORT";
    var win = Math.random() > 0.16;
    var pnl = (win ? 1 : -1) * (8 + Math.random() * 220);
    var t = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    return { pair: pair, side: side, pnl: Math.round(pnl * 100) / 100, time: p(t.getHours()) + ":" + p(t.getMinutes()) + ":" + p(t.getSeconds()) };
  }
  var BRAND_ICON = "brand/icon-gold.png";

  /* ---------- nav relabel map ---------- */
  var RELABEL = [
    { from: "CRYPTO AI", to: "EARN" },
    { from: "PACKAGES",  to: "PLANS" },
    { from: "REWARDS",   to: "NETWORK" }
  ];

  /* =====================================================================
     USER RANK DISPLAY
     The account chip showed the literal word "Investor". Per product spec
     the title line must show the member's DRAGON RANK instead.
     Rank tiers (글로벌 직급 달성 조건):
        White  — Basic   ($200+)
        Blue   — Standard($500+)
        Purple — Premium ($1,000+)
        Red    — VIP     ($5,000+)
        Black  — $10,000+
     A brand-new signup or a sub-Basic ($<200) buyer holds NO rank → ROOKIE.
     ─ DEV (개발 AI) NOTE ───────────────────────────────────────────────
       This is a static preview: rank is hardcoded to the demo member's tier.
       In production, resolve the rank server-side from the member's highest
       active package and replace USER_RANK below (fallback "ROOKIE").
     ===================================================================== */
  var USER_RANK = "PURPLE"; // demo member tier — see DEV NOTE above

  /* ---------- global copy swaps (betting rebrand) ----------
     Phrase-level & case-sensitive so unrelated words are left untouched.
     Applied app-wide every reconcile; the compiled bundle is never modified.
     ORDER MATTERS: longer / more specific phrases must come before the
     generic catch-alls so partial matches don't clobber them. */
  var TEXT_SWAP = [
    /* --- explicit UI copy --- */
    ["INVEST NOW", "BETTING NOW"],
    ["Investment Plans", "AI Betting Plans"],
    ["INVESTMENT PLANS", "AI BETTING PLANS"],
    /* --- account chip: literal "Investor" title → member rank --- */
    ["Investor", USER_RANK],
    /* --- guide / help copy: "investment" rebranded to betting terms --- */
    ["investment packages", "betting plans"],
    ["investment package", "betting plan"],
    ["CONFIRM YOUR INVESTMENT", "CONFIRM YOUR BET"],
    ["MONITOR YOUR INVESTMENT", "MONITOR YOUR BET"],
    ["MANAGE YOUR INVESTMENT", "MANAGE YOUR BET"],
    ["Confirm Investment", "Confirm Bet"],
    ["investment details", "bet details"],
    ["Your Investment", "Your Bet"],
    ["your investment", "your bet"],
    ["How to Invest", "How to Bet"],
    ["Reinvest", "Re-bet"],
    ["reinvest", "re-bet"],
    ["Investments", "Bets"],
    ["investments", "bets"],
    ["Investment", "Betting"],
    ["investment", "betting"]
  ];
  function swapCopy() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      var p = n.parentNode;
      if (p && (p.nodeName === "SCRIPT" || p.nodeName === "STYLE")) continue;
      if (p && p.closest && p.closest("#lr-pc-footer")) continue; /* don't rewrite our own footer */
      var v = n.nodeValue;
      if (!v) continue;
      var nv = v;
      for (var i = 0; i < TEXT_SWAP.length; i++) {
        if (nv.indexOf(TEXT_SWAP[i][0]) !== -1) nv = nv.split(TEXT_SWAP[i][0]).join(TEXT_SWAP[i][1]);
      }
      if (nv !== v) n.nodeValue = nv;
    }
  }

  /* =====================================================================
     PLATFORM SETTINGS — hidden from the account menu.
     Spec: "Platform Settings" 메뉴는 아직 개발 전이라 UI에서 제거(비활성).
     We DO NOT delete the compiled source — only hide the menu item in the
     UI so the bundle still carries it for future development.
     ─ DEV (개발 AI) NOTE ───────────────────────────────────────────────
       To re-enable, remove the hidePlatformSettings() call in reconcile()
       (or delete this block). The original button still exists in the
       React bundle untouched.
     ===================================================================== */
  function hidePlatformSettings() {
    var spans = document.querySelectorAll("span,p,div,a,button");
    for (var i = 0; i < spans.length; i++) {
      var el = spans[i];
      if (el.children.length === 0 && (el.textContent || "").trim() === "Platform Settings") {
        var btn = el.closest("button") || el;
        if (btn && btn.style.display !== "none") btn.style.display = "none";
      }
    }
  }

  function topNavButtons() {
    var nav = document.querySelector("nav");
    if (!nav) return [];
    var buttons = Array.prototype.slice.call(nav.querySelectorAll("button"));
    var primary = buttons.filter(function (btn) {
      return (btn.className || "").indexOf("border-[1.5px]") !== -1;
    });
    return primary.length >= 3 ? primary : buttons;
  }
  /* Keep navigation identity independent from visible text. Browser translation
     rewrites labels, but the React navigation order remains stable. */
  function ensureNavIdentity() {
    var ids = ["earn", "plans", "network", "market", "wallet"];
    var btns = topNavButtons();
    for (var i = 0; i < btns.length && i < ids.length; i++) {
      if (!btns[i].dataset.lrNav) btns[i].dataset.lrNav = ids[i];
    }
    return btns;
  }
  /* find a top-nav button by its (original or relabeled) text */
  function findNavBtn(matches) {
    var idMap = {
      "EARN": "earn", "CRYPTO AI": "earn",
      "PLANS": "plans", "PACKAGES": "plans",
      "NETWORK": "network", "REWARDS": "network",
      "MARKET": "market", "WALLET": "wallet"
    };
    var btns = ensureNavIdentity();
    for (var m = 0; m < matches.length; m++) {
      var wantedId = idMap[matches[m]];
      if (!wantedId) continue;
      for (var n = 0; n < btns.length; n++) {
        if (btns[n].dataset.lrNav === wantedId) return btns[n];
      }
    }
    for (var i = 0; i < btns.length; i++) {
      var txt = (btns[i].textContent || "").trim().toUpperCase();
      if (matches.indexOf(txt) !== -1) return btns[i];
    }
    return null;
  }
  function isEarnActive() {
    var b = findNavBtn(["EARN", "CRYPTO AI"]);
    if (!b) return false;
    /* active tab = solid bg-red-600/10. NOTE: do NOT match border-red-600/60,
       it also appears in the inactive hover:border-red-600/60 class. */
    return /(^|\s)bg-red-600\/10(\s|$)/.test(b.className || "");
  }
  function goPlans() {
    var b = findNavBtn(["PLANS", "PACKAGES"]);
    if (b) b.click();
  }

  /* relabel nav button text in place (only the visible label, keep icon) */
  function relabelNav() {
    var labels = { earn: "EARN", plans: "PLANS", network: "NETWORK" };
    var btns = ensureNavIdentity();
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var label = labels[btn.dataset.lrNav];
      if (label && !btn.dataset.lrRelabeled) {
        setBtnLabel(btn, label);
        btn.dataset.lrRelabeled = "true";
        continue;
      }
      var cur = (btn.textContent || "").trim().toUpperCase();
      for (var r = 0; r < RELABEL.length; r++) {
        if (!btn.dataset.lrRelabeled && cur === RELABEL[r].from) {
          setBtnLabel(btn, RELABEL[r].to);
          btn.dataset.lrRelabeled = "true";
        }
      }
    }
  }
  /* replace the deepest text node of the button without nuking the icon */
  function setBtnLabel(btn, label) {
    var walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT, null);
    var node, target = null;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.trim()) target = node;
    }
    if (target && target.nodeValue.trim().toUpperCase() !== label) {
      target.nodeValue = label;
    }
  }

  /* ---------- sparkline ---------- */
  function sparkSVG(pts, w, h) {
    var min = Math.min.apply(null, pts), max = Math.max.apply(null, pts), rng = (max - min) || 1;
    var step = w / (pts.length - 1);
    var d = pts.map(function (v, i) { return (i ? "L" : "M") + (i * step).toFixed(1) + " " + (h - ((v - min) / rng) * (h - 6) - 3).toFixed(1); }).join(" ");
    var area = d + " L" + w + " " + h + " L0 " + h + " Z";
    return '<svg width="100%" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="epcSpark" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="rgba(251,191,36,.28)"/><stop offset="1" stop-color="rgba(251,191,36,0)"/>' +
      '</linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#epcSpark)"/>' +
      '<path d="' + d + '" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* ---------- build EARN panel ---------- */
  var chart = null, liveTimer = null;
  function buildPanel() {
    var total = D.bal.available + D.bal.earned + D.bal.invested;
    var weekMax = Math.max.apply(null, D.weekEarnings);
    var weekTotal = D.weekEarnings.reduce(function (a, b) { return a + b; }, 0);
    var days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    var el = document.createElement("div");
    el.className = "earn-pc";
    el.id = "earn-pc";

    el.innerHTML =
      /* greeting + rank */
      '<div class="epc-top">' +
        '<div class="epc-greet"><div class="eyebrow">Welcome back</div><div class="name display">' + D.user.name + '</div></div>' +
        '<div class="epc-rank"><span class="dot"></span>' + D.user.rank + ' DRAGON</div>' +
      '</div>' +

      '<div class="epc-grid">' +

        /* HERO total assets */
        '<div class="card hero col-8">' +
          '<div class="card-head"><div class="eyebrow">Total assets</div><span class="pill live">Live</span></div>' +
          '<div class="epc-total display gold-text num">$' + fmt(total) + '</div>' +
          '<div class="epc-sub"><span class="delta green num">+$' + fmt(D.todayPnl) + '</span><span class="muted">today · USDT</span></div>' +
          '<div class="epc-spark">' + sparkSVG(D.spark, 560, 70) + '</div>' +
          '<button class="btn-gold" data-act="plans">Get more Profit →</button>' +
        '</div>' +

        /* snapshot stats */
        '<div class="card col-4">' +
          '<div class="card-head"><div class="card-title">Performance</div></div>' +
          '<div class="snap">' +
            '<div class="snap-tile"><div class="v num gold-text">' + D.engine.winRate + '<small>%</small></div><div class="l">Win rate</div></div>' +
            '<div class="snap-tile"><div class="v num gold-text">' + D.engine.dailyRoi + '<small>%</small></div><div class="l">Daily ROI</div></div>' +
            '<div class="snap-tile"><div class="v num">$' + fmt(D.bal.earned) + '</div><div class="l">Earned</div></div>' +
            '<div class="snap-tile"><div class="v num">$' + fmt(D.bal.invested, 0) + '</div><div class="l">Invested</div></div>' +
          '</div>' +
        '</div>' +

        /* AI ENGINE */
        '<div class="card col-8">' +
          '<div class="card-head">' +
            '<div class="eng-head"><img src="' + BRAND_ICON + '" alt=""><div><div class="eng-name display">' + D.engine.name + '</div><div class="eng-tag">AI execution engine</div></div></div>' +
            '<span class="pill live">Active</span>' +
          '</div>' +
          '<div class="fchart">' +
            '<div class="fchart-bar">' +
              '<div class="fchart-pair"><span class="fchart-sym">BTC/USDT</span><span class="fchart-perp">PERP</span><span class="pill live" style="margin-left:4px">AI</span></div>' +
              '<div class="fchart-px num" id="epc-px">67,213.5 <span class="green" style="font-size:12px;font-weight:700">+0.00%</span></div>' +
            '</div>' +
            '<div class="fchart-canvas"><canvas id="epc-canvas"></canvas></div>' +
          '</div>' +
          '<div class="stat-grid">' +
            '<div class="st"><div class="v num">' + D.engine.winRate + '<small>%</small></div><div class="l">Win rate</div></div>' +
            '<div class="st"><div class="v num">' + D.engine.dailyRoi + '<small>%</small></div><div class="l">Daily ROI</div></div>' +
            '<div class="st"><div class="v num" id="epc-sig">' + fmt(D.engine.signals, 0) + '<small>/s</small></div><div class="l">Signals</div></div>' +
            '<div class="st"><div class="v num" id="epc-lat">' + D.engine.latency + '<small>ms</small></div><div class="l">Latency</div></div>' +
          '</div>' +
          '<div class="terminal">' +
            '<div><span class="g">▸</span> neural.core.v6 — session synced · 3 exchanges</div>' +
            '<div><span class="a">▸</span> pattern.match BTC/USDT conf 0.94 → <span class="g">executed</span></div>' +
            '<div><span class="g">▸</span> pnl.stream +' + fmt(D.todayPnl) + ' USDT realized today</div>' +
          '</div>' +
        '</div>' +

        /* MY PACKAGES */
        '<div class="card col-4">' +
          '<div class="card-head"><div class="card-title">My packages</div><button class="card-action" data-act="plans">View plans →</button></div>' +
          D.portfolio.map(function (p) {
            return '<div class="pkg">' +
              '<div class="pkg-top"><span class="pkg-name display">' + p.pkg + '</span><span class="num green" style="font-size:14px;font-weight:800">+$' + fmt(p.earned) + '</span></div>' +
              '<div class="pkg-meta"><span class="num">$' + fmt(p.amount, 0) + ' principal</span><span class="num gold-text" style="font-weight:800">' + p.dailyRoi + '%/day</span></div>' +
              '<div class="bar"><i style="width:' + Math.round(p.progress * 100) + '%"></i></div>' +
              '<div class="pkg-foot"><span>' + p.start + '</span><span>' + Math.round(p.progress * 100) + '% · ends ' + p.end + '</span></div>' +
            '</div>';
          }).join("") +
        '</div>' +

        /* LIVE TRADES */
        '<div class="card col-8">' +
          '<div class="card-head"><div class="card-title">Live trades</div><span class="pill live">Streaming</span></div>' +
          '<div id="epc-trades">' + tradesHTML(D.trades) + '</div>' +
        '</div>' +

        /* LAST 7 DAYS */
        '<div class="card col-4">' +
          '<div class="card-head"><div class="card-title">Last 7 days</div></div>' +
          '<div class="week-total"><span class="v num gold-text">+$' + fmt(weekTotal) + '</span><span class="muted" style="font-size:11.5px">dividends credited</span></div>' +
          '<div class="week-bars">' +
            D.weekEarnings.map(function (v, i) {
              return '<div class="wb' + (i === 6 ? ' last' : '') + '"><i style="height:' + Math.round((v / weekMax) * 92) + 'px"></i><span>' + days[i] + '</span></div>';
            }).join("") +
          '</div>' +
        '</div>' +

        /* NEWS */
        '<div class="card col-12">' +
          '<div class="card-head"><div class="card-title">News &amp; updates</div></div>' +
          '<div class="news-grid">' +
            D.news.map(function (n) {
              return '<div class="row"><div class="disc news">◆</div><div class="row-main"><div class="row-title">' + n.title + '</div><div class="row-sub">' + n.tag + ' · ' + n.date + '</div></div></div>';
            }).join("") +
          '</div>' +
        '</div>' +

      '</div>';

    /* wire nav buttons */
    Array.prototype.forEach.call(el.querySelectorAll('[data-act="plans"]'), function (b) {
      b.addEventListener("click", goPlans);
    });
    return el;
  }

  function tradesHTML(list) {
    return list.map(function (t) {
      var win = t.pnl >= 0;
      return '<div class="row">' +
        '<div class="disc ' + (win ? "up" : "down") + '">' + (win ? "▲" : "▼") + '</div>' +
        '<div class="row-main"><div class="row-title">' + t.pair + '</div><div class="row-sub">' + t.side + ' · ' + t.time + '</div></div>' +
        '<div class="row-trail num ' + (win ? "green" : "red") + '">' + (win ? "+" : "−") + '$' + fmt(Math.abs(t.pnl)) + '</div>' +
      '</div>';
    }).join("");
  }

  /* ---------- chart + live loops ---------- */
  function startChart() {
    var cv = document.getElementById("epc-canvas");
    if (!cv || !window.LRChart) return;
    var pxEl = document.getElementById("epc-px");
    var lastTs = 0;
    chart = window.LRChart(cv, {
      compact: false, start: 67213.5, decimals: 1, ai: true,
      onPrice: function (last, firstOpen) {
        var now = Date.now(); if (now - lastTs < 550) return; lastTs = now;
        if (!pxEl) return;
        var chg = firstOpen ? ((last - firstOpen) / firstOpen) * 100 : 0, up = chg >= 0;
        pxEl.innerHTML = fmt(last, 1) + ' <span class="' + (up ? "green" : "red") + '" style="font-size:12px;font-weight:700">' + (up ? "+" : "") + chg.toFixed(2) + '%</span>';
      },
      onStats: function (s) {
        var sg = document.getElementById("epc-sig"), lt = document.getElementById("epc-lat");
        if (sg) sg.innerHTML = fmt(s.sps, 0) + '<small>/s</small>';
        if (lt) lt.innerHTML = s.latency + '<small>ms</small>';
      }
    });
    if (chart && chart.render) chart.render();
  }
  function startLive() {
    liveTimer = setInterval(function () {
      var box = document.getElementById("epc-trades");
      if (!box) return;
      D.trades = [genTrade()].concat(D.trades).slice(0, 6);
      box.innerHTML = tradesHTML(D.trades);
    }, 3200);
  }
  function teardown() {
    if (chart) { try { chart.stop(); } catch (e) {} chart = null; }
    if (liveTimer) { clearInterval(liveTimer); liveTimer = null; }
  }

  /* ---------- mount / unmount ---------- */
  var applying = false;
  function getMain() { return document.querySelector("main"); }

  function showEarn() {
    var main = getMain(); if (!main) return;
    var panel = document.getElementById("earn-pc");
    if (!panel) {
      panel = buildPanel();
      main.appendChild(panel);
      startChart();
      startLive();
    }
    /* hide everything in <main> except our panel */
    Array.prototype.forEach.call(main.children, function (c) {
      if (c !== panel) c.style.display = "none";
    });
  }
  function hideEarn() {
    var main = getMain(); if (!main) return;
    var panel = document.getElementById("earn-pc");
    if (panel) { teardown(); panel.remove(); }
    Array.prototype.forEach.call(main.children, function (c) { c.style.display = ""; });
  }

  /* =====================================================================
     GLOBAL FOOTER — ported verbatim from the LONGRISE marketing site
     (kenwac74-svg.github.io/AIHP footer). Replaces the compiled app's
     own footer on every page. Bundle untouched: original <footer>s are
     hidden, ours is appended to <body> (outside the React root).
     ===================================================================== */
  function buildFooter() {
    var f = document.createElement("footer");
    f.className = "footer lr-pc-footer";
    f.id = "lr-pc-footer";
    f.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div>' +
            '<div class="brand">LONG<span>RISE</span></div>' +
            '<p>AI powered gaming and futures strategy platform. Users choose a product plan, AI runs automated strategies, and returns are tracked through the system.</p>' +
          '</div>' +
          '<div>' +
            '<h5>Risk Info</h5>' +
            '<a href="#">Terms</a><a href="#">Privacy Policy</a><a href="#">Risk Notice</a><a href="#">Responsible Gaming</a>' +
          '</div>' +
          '<div>' +
            '<h5>Contact</h5>' +
            '<a href="#">Telegram</a><a href="#">Email</a><a href="#">Support Center</a><a href="#">Business Inquiry</a>' +
          '</div>' +
          '<div>' +
            '<h5>Partners</h5>' +
            '<a href="#">CNYT Foundation ↗</a><a href="#">Gaming Partners ↗</a><a href="#">Strategic Alliance ↗</a>' +
          '</div>' +
        '</div>' +
        '<div class="legal">© 2026 LONGRISE GLOBAL FOUNDATION. AI Powered Gaming &amp; Futures Strategy Systems.<br><br>' +
          'LEGAL NOTICE: This platform involves high-risk automated casino betting and futures trading strategies. Results are not guaranteed. Users participate voluntarily and must understand all risks before depositing funds.</div>' +
      '</div>';
    return f;
  }
  function ensureFooter() {
    /* hide every footer the compiled app renders (marketing + dashboard) */
    var appFooters = document.querySelectorAll("footer:not(#lr-pc-footer)");
    for (var i = 0; i < appFooters.length; i++) {
      if (appFooters[i].style.display !== "none") appFooters[i].style.display = "none";
    }
    if (!document.getElementById("lr-pc-footer")) {
      document.body.appendChild(buildFooter());
    }
  }

  /* ---------- reconcile loop ---------- */
  var schedT = null;
  function reconcile() {
    schedT = null;
    if (applying) return;
    applying = true;
    try {
      relabelNav();
      swapCopy();
      hidePlatformSettings();
      ensureFooter();
      if (isEarnActive()) showEarn(); else hideEarn();
    } catch (e) { console.error("[earn-pc] reconcile error:", e); }
    finally { applying = false; }
  }
  function schedule() {
    if (schedT) return;
    schedT = setTimeout(reconcile, 60);
  }

  function boot() {
    if (!document.querySelector("nav") || !getMain()) { setTimeout(boot, 120); return; }
    var obs = new MutationObserver(function () { if (!applying) schedule(); });
    obs.observe(document.getElementById("root") || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    /* nav clicks → immediate reconcile */
    document.addEventListener("click", function () { setTimeout(schedule, 0); }, true);
    schedule();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
