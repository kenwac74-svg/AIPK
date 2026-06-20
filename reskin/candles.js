/* LONGRISE — lightweight TradingView-style candlestick engine (vanilla canvas) */
(function () {
  var C = {
    up: "#10b981", down: "#ef4444", upFill: "rgba(16,185,129,0.9)", downFill: "rgba(239,68,68,0.9)",
    upVol: "rgba(16,185,129,0.20)", downVol: "rgba(239,68,68,0.20)",
    gold: "#fbbf24", goldDim: "#b99a6b", grid: "rgba(255,255,255,0.05)",
    text: "#7c726a", ink: "#070504"
  };

  window.LRChart = function (canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d");
    var dpr = Math.max(1, window.devicePixelRatio || 1);
    var compact = !!opts.compact;             // mobile: no axis/volume
    var N = opts.count || (compact ? 36 : 64); // visible candles
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var candles = [];
    var decimals = opts.decimals || 1;
    function mk(p) {
      var open = p, vol = p * (0.0015 + Math.random() * 0.0048);
      var close = open + (Math.random() - 0.475) * vol * 2.1;
      var high = Math.max(open, close) + Math.random() * vol * 0.8;
      var low = Math.min(open, close) - Math.random() * vol * 0.8;
      return { o: open, h: high, l: low, c: close, v: 0.25 + Math.random() };
    }
    function attachSig(c) { c.sig = { side: Math.random() > 0.5 ? "BUY" : "SELL", conf: 0.8 + Math.random() * 0.18 }; }
    function build(startPrice) {
      candles.length = 0;
      var price = startPrice + (Math.random() - 0.5) * startPrice * 0.012;
      for (var i = 0; i < N + 40; i++) { var k = mk(price); candles.push(k); price = k.c; }
      for (var si = candles.length - 30; si < candles.length; si++) { if (Math.random() > 0.7) attachSig(candles[si]); }
    }
    build(opts.start || 67200);
    var scanT = Math.random();

    function ema(period) {
      var kk = 2 / (period + 1), prev = null, out = [];
      for (var i2 = 0; i2 < candles.length; i2++) { var c = candles[i2].c; prev = prev == null ? c : c * kk + prev * (1 - kk); out.push(prev); }
      return out;
    }

    var W = 0, H = 0;
    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width || 300; H = r.height || (compact ? 120 : 320);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function render() {
      if (!W) resize();
      ctx.clearRect(0, 0, W, H);
      var vis = candles.slice(candles.length - N);
      var emaAll = ema(9), emaVis = emaAll.slice(emaAll.length - N);
      var padR = compact ? 0 : 56;
      var volH = compact ? 0 : H * 0.18;
      var chartH = H - volH - (compact ? 0 : 6);
      var hi = -Infinity, lo = Infinity, mv = 0;
      for (var i3 = 0; i3 < vis.length; i3++) { if (vis[i3].h > hi) hi = vis[i3].h; if (vis[i3].l < lo) lo = vis[i3].l; if (vis[i3].v > mv) mv = vis[i3].v; }
      var pad = (hi - lo) * 0.12 || 1; hi += pad; lo -= pad;
      var plotW = W - padR, step = plotW / N, cw = Math.max(2, step * 0.6);
      function y(p) { return ((hi - p) / (hi - lo)) * chartH; }

      // grid + axis
      if (!compact) {
        ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.font = "10px ui-monospace,monospace"; ctx.fillStyle = C.text; ctx.textBaseline = "middle"; ctx.textAlign = "left";
        for (var g = 0; g <= 4; g++) {
          var gy = (chartH / 4) * g + 0.5;
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(plotW, gy); ctx.stroke();
          ctx.fillText((hi - ((hi - lo) / 4) * g).toFixed(0), plotW + 8, gy);
        }
      }
      // volume
      if (!compact) {
        for (var i4 = 0; i4 < vis.length; i4++) {
          var cv = vis[i4], vx = i4 * step + step / 2, vh = (cv.v / mv) * (volH - 4);
          ctx.fillStyle = cv.c >= cv.o ? C.upVol : C.downVol;
          ctx.fillRect(vx - cw / 2, H - vh, cw, vh);
        }
      }
      // candles
      for (var i5 = 0; i5 < vis.length; i5++) {
        var c2 = vis[i5], cx = i5 * step + step / 2, up = c2.c >= c2.o;
        ctx.strokeStyle = up ? C.up : C.down; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx + 0.5, y(c2.h)); ctx.lineTo(cx + 0.5, y(c2.l)); ctx.stroke();
        ctx.fillStyle = up ? C.upFill : C.downFill;
        var yo = y(c2.o), yc = y(c2.c), top = Math.min(yo, yc), bh = Math.max(1, Math.abs(yc - yo));
        ctx.fillRect(cx - cw / 2, top, cw, bh);
      }
      // EMA
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.9; ctx.beginPath();
      for (var i6 = 0; i6 < emaVis.length; i6++) { var ex = i6 * step + step / 2, ey = y(emaVis[i6]); if (i6 === 0) ctx.moveTo(ex, ey); else ctx.lineTo(ex, ey); }
      ctx.stroke(); ctx.globalAlpha = 1;
      // current price line + tag
      var last = vis[vis.length - 1].c, ly = y(last);
      ctx.strokeStyle = "rgba(251,191,36,0.5)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(plotW, ly); ctx.stroke(); ctx.setLineDash([]);
      if (!compact) {
        ctx.fillStyle = C.gold; ctx.fillRect(plotW, ly - 9, padR, 18);
        ctx.fillStyle = C.ink; ctx.font = "bold 10px ui-monospace,monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
        ctx.fillText(last.toFixed(decimals), plotW + 7, ly + 1);
      }
      if (opts.ai !== false) {
        // focus box around the most recent candles ("AI analyzing")
        var focusN = compact ? 6 : 9;
        var fx = (N - focusN) * step;
        ctx.fillStyle = "rgba(185,154,107,0.05)";
        ctx.fillRect(fx, 0, plotW - fx, chartH);
        ctx.strokeStyle = "rgba(185,154,107,0.28)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        ctx.strokeRect(fx + 0.5, 0.5, plotW - fx - 1, chartH - 1); ctx.setLineDash([]);
        if (!compact) {
          ctx.fillStyle = C.goldDim; ctx.font = "bold 9px ui-monospace,monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
          ctx.fillText("AI ANALYZING", fx + 6, 6);
        }
        // signal markers
        for (var im = 0; im < vis.length; im++) {
          var cm = vis[im]; if (!cm.sig) continue;
          var mx = im * step + step / 2, buy = cm.sig.side === "BUY";
          var my = buy ? y(cm.l) + 11 : y(cm.h) - 11;
          ctx.fillStyle = buy ? C.up : C.gold;
          ctx.beginPath();
          if (buy) { ctx.moveTo(mx, my - 5); ctx.lineTo(mx - 4.5, my + 3); ctx.lineTo(mx + 4.5, my + 3); }
          else { ctx.moveTo(mx, my + 5); ctx.lineTo(mx - 4.5, my - 3); ctx.lineTo(mx + 4.5, my - 3); }
          ctx.closePath(); ctx.fill();
          if (!compact) {
            ctx.font = "7px ui-monospace,monospace"; ctx.textAlign = "center"; ctx.textBaseline = buy ? "top" : "bottom";
            ctx.fillText(cm.sig.conf.toFixed(2), mx, buy ? my + 6 : my - 6);
          }
        }
        // scan line (sweeping AI analysis beam)
        var sxp = scanT * plotW;
        var grad = ctx.createLinearGradient(sxp - 22, 0, sxp + 4, 0);
        grad.addColorStop(0, "rgba(251,191,36,0)");
        grad.addColorStop(1, "rgba(251,191,36,0.16)");
        ctx.fillStyle = grad; ctx.fillRect(sxp - 22, 0, 26, chartH);
        ctx.strokeStyle = "rgba(251,191,36,0.5)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sxp + 0.5, 0); ctx.lineTo(sxp + 0.5, chartH); ctx.stroke();
        ctx.fillStyle = C.gold;
        ctx.beginPath(); ctx.arc(sxp, y(vis[Math.min(vis.length - 1, Math.round(scanT * (N - 1)))].c), 2.5, 0, 6.3); ctx.fill();
      }
      if (opts.onPrice) opts.onPrice(last, vis[0].o);
    }

    function tickForm() {
      var c = candles[candles.length - 1];
      c.c += (Math.random() - 0.5) * c.c * 0.0016;
      if (c.c > c.h) c.h = c.c; if (c.c < c.l) c.l = c.c;
      c.v = Math.min(1.2, c.v + Math.random() * 0.05);
    }
    function newCandle() {
      var p = candles[candles.length - 1].c; var nc = mk(p);
      if (Math.random() > 0.55) attachSig(nc);
      candles.push(nc);
      if (candles.length > N + 80) candles.shift();
      if (opts.onStats) opts.onStats({ sps: 1180 + Math.floor(Math.random() * 220), latency: 11 + Math.floor(Math.random() * 8) });
    }

    var t1, t2, ro, raf;
    function frame() {
      scanT += compact ? 0.006 : 0.0042; if (scanT > 1) scanT = 0;
      render();
      raf = window.requestAnimationFrame(frame);
    }
    resize();
    if (!reduce) {
      t1 = setInterval(tickForm, 900);
      t2 = setInterval(newCandle, compact ? 2600 : 5200);
      raf = window.requestAnimationFrame(frame);
      if (opts.onStats) opts.onStats({ sps: 1284, latency: 14 });
    } else { render(); }
    if (window.ResizeObserver) { ro = new ResizeObserver(function () { resize(); render(); }); ro.observe(canvas); }
    else window.addEventListener("resize", function () { resize(); render(); });

    return { stop: function () { clearInterval(t1); clearInterval(t2); if (raf) window.cancelAnimationFrame(raf); if (ro) ro.disconnect(); }, render: render, reseed: function (startPrice, dec) { if (dec !== undefined) decimals = dec; build(startPrice); render(); } };
  };
})();
