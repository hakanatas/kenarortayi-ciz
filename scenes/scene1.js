/* SAHNE 1 — ÜÇGEN (0–10 s)  A’dan BC’ye kenarortay.
   The whole film's drawing lives in LI.world(t); each scene only sets the camera. */
(function (LI) {
  'use strict';
  const { seg, lerp, inOut } = LI.E;
  const KD = LI.KD, F = () => LI.Film, A = LI.Ang, Ink = LI.Ink;
  const END = (t) => 1 - seg(t, 90.4, 91.4);

  function win(t, a, b, fi = 0.4, fo = 0.4) { return seg(t, a, a + fi) * (1 - seg(t, b - fo, b)); }
  function exprs(ctx, t, P, list, sz) {
    const f = F();
    list.forEach(([a, b, items, hot]) => {
      const al = win(t, a, b); if (al <= 0) return;
      f.expr(ctx, typeof items === 'string' ? [items] : items, P.x, P.y, sz ?? P.s, { alpha: al, w: P.w, halo: true, color: hot ? A.amber : undefined });
    });
  }
  const at = (P, k, y) => ({ x: P.x, y: y ?? P.y[k], s: P.s, w: P.w });
  const amber = (a) => `rgba(${LI.AMBER_RGB},${a})`;
  const fr = (n, d, h) => F().fr(n, d, h);
  const neg = (s) => s.replace('-', '−');
  const label = (v) => (v < 0 ? neg(String(v)) : String(v));

  const D2R = Math.PI / 180;
  /** local → world */
  const W_ = (G, p) => [G.x + p[0] * G.k, G.y + p[1] * G.k];
  function circX(c1, r1, c2, r2) {
    const dx = c2[0] - c1[0], dy = c2[1] - c1[1], d = Math.hypot(dx, dy), a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
    const mx = c1[0] + a * dx / d, my = c1[1] + a * dy / d;
    return [[mx + h * dy / d, my - h * dx / d], [mx - h * dy / d, my + h * dx / d]];
  }
  function seg2(ctx, p, q, a, k, seed, color, w = 4) { if (a > 0 && k > 0) Ink.path(ctx, [p, [lerp(p[0], q[0], k), lerp(p[1], q[1], k)]], { w, alpha: a, seed, taper: [0, 0], color }); }
  function dash(ctx, p, q, a, k, seed, color) {
    if (a <= 0 || k <= 0) return; const n = 16;
    for (let j = 0; j < n; j += 2) { const u0 = j / n, u1 = Math.min(k, (j + 1) / n); if (u0 >= k) break; Ink.path(ctx, [[lerp(p[0], q[0], u0), lerp(p[1], q[1], u0)], [lerp(p[0], q[0], u1), lerp(p[1], q[1], u1)]], { w: 2.5, alpha: a, seed: seed + j, taper: [0, 0], color }); }
  }
  /** a compass arc around c with radius r from angle a0 to a1 (radians, canvas); the radius shows while drawing */
  function arc(ctx, c, r, a0, a1, k, a, seed) {
    if (a <= 0 || k <= 0) return;
    const P = []; for (let i = 0; i <= 30; i++) { const u = lerp(a0, a1, i / 30 * k); P.push([c[0] + r * Math.cos(u), c[1] + r * Math.sin(u)]); }
    Ink.path(ctx, P, { w: 2.5, alpha: a * 0.9, seed, taper: [0, 0], color: LI.AMBER_RGB });
    if (k < 1) Ink.path(ctx, [c, P[P.length - 1]], { w: 1.5, alpha: a * 0.5, seed: seed + 1, taper: [0, 0] });
  }
  /** the short arc from angle u0 to u1, extended a little at both ends */
  function arcS(ctx, c, r, u0, u1, k, a, seed) {
    let d = u1 - u0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const e = 0.25 * Math.sign(d || 1);
    arc(ctx, c, r, u0 - e, u0 + d + e, k, a, seed);
  }
  function pt(ctx, p, a, lab, s, dx = 0, dy = -26, color) {
    if (a <= 0) return;
    ctx.fillStyle = color ? `rgba(${color},${a})` : `rgba(${LI.INK_RGB},${a})`; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, 7); ctx.fill();
    if (lab) F().T(ctx, lab, p[0] + dx, p[1] + dy, { size: s * 0.66, alpha: a, halo: true, color: color ? A.amber : undefined });
  }
  function rightMark(ctx, M, dir, a, seed) {
    if (a <= 0) return; const r = 14, u = [Math.cos(dir), Math.sin(dir)], v = [-u[1], u[0]];
    Ink.path(ctx, [[M[0] + u[0] * r, M[1] + u[1] * r], [M[0] + u[0] * r + v[0] * r, M[1] + u[1] * r + v[1] * r], [M[0] + v[0] * r, M[1] + v[1] * r]], { w: 2.5, alpha: a, seed, taper: [0, 0] });
  }
  /** the perpendicular bisector of AB (world points), built from t0 */
  function perpBis(ctx, A_, B_, rr, t, t0, a, s, seed, names = ['A', 'B', 'C', 'D', 'M']) {
    if (a <= 0) return;
    const ang = Math.atan2(B_[1] - A_[1], B_[0] - A_[0]), [C, D] = circX(A_, rr, B_, rr), M = [(A_[0] + B_[0]) / 2, (A_[1] + B_[1]) / 2];
    seg2(ctx, A_, B_, a, seg(t, t0, t0 + 0.6), seed);
    pt(ctx, A_, a * seg(t, t0, t0 + 0.3), names[0], s, -10, -26); pt(ctx, B_, a * seg(t, t0 + 0.4, t0 + 0.7), names[1], s, 10, -26);
    const aC = Math.atan2(C[1] - A_[1], C[0] - A_[0]), aD = Math.atan2(D[1] - A_[1], D[0] - A_[0]);
    arcS(ctx, A_, rr, aC, aD, seg(t, t0 + 0.8, t0 + 2.0), a, seed + 10);
    const bC = Math.atan2(C[1] - B_[1], C[0] - B_[0]), bD = Math.atan2(D[1] - B_[1], D[0] - B_[0]);
    arcS(ctx, B_, rr, bC, bD, seg(t, t0 + 2.2, t0 + 3.4), a, seed + 20);
    pt(ctx, C, a * seg(t, t0 + 3.5, t0 + 3.8), names[2], s, 22, -10); pt(ctx, D, a * seg(t, t0 + 3.5, t0 + 3.8), names[3], s, 22, 12);
    const e = [(C[0] - D[0]) * 0.18, (C[1] - D[1]) * 0.18];
    seg2(ctx, [D[0] - e[0], D[1] - e[1]], [C[0] + e[0], C[1] + e[1]], a, seg(t, t0 + 4.0, t0 + 4.8), seed + 30, LI.AMBER_RGB, 4.5);
    pt(ctx, M, a * seg(t, t0 + 5.0, t0 + 5.3), names[4], s, -20, 24, LI.AMBER_RGB);
    rightMark(ctx, M, ang, a * seg(t, t0 + 5.2, t0 + 5.5), seed + 40);
    return { C, D, M };
  }
  /** the angle bisector at O between directions th1 and th2 (degrees, anticlockwise from the right) */
  function angBis(ctx, O, th1, th2, len, r1, r2, t, t0, a, s, seed) {
    if (a <= 0) return;
    const dir = (th) => [Math.cos(th * D2R), -Math.sin(th * D2R)], at = (th, r) => [O[0] + dir(th)[0] * r, O[1] + dir(th)[1] * r];
    seg2(ctx, O, at(th1, len), a, seg(t, t0, t0 + 0.6), seed); seg2(ctx, O, at(th2, len), a, seg(t, t0 + 0.3, t0 + 0.9), seed + 1);
    pt(ctx, O, a * seg(t, t0, t0 + 0.3), 'O', s, -22, 10);
    arc(ctx, O, r1, -th1 * D2R + 0.15, -th2 * D2R - 0.15, seg(t, t0 + 1.1, t0 + 2.2), a, seed + 10);
    const P = at(th1, r1), Q = at(th2, r1);
    pt(ctx, P, a * seg(t, t0 + 2.3, t0 + 2.6), 'P', s, 10, 26); pt(ctx, Q, a * seg(t, t0 + 2.3, t0 + 2.6), 'Q', s, -24, -6);
    const X = circX(P, r2, Q, r2), R = Math.hypot(X[0][0] - O[0], X[0][1] - O[1]) > Math.hypot(X[1][0] - O[0], X[1][1] - O[1]) ? X[0] : X[1];
    const aP = Math.atan2(R[1] - P[1], R[0] - P[0]), aQ = Math.atan2(R[1] - Q[1], R[0] - Q[0]);
    arc(ctx, P, r2, aP - 0.3, aP + 0.3, seg(t, t0 + 2.8, t0 + 3.6), a, seed + 20);
    arc(ctx, Q, r2, aQ - 0.3, aQ + 0.3, seg(t, t0 + 3.8, t0 + 4.6), a, seed + 30);
    pt(ctx, R, a * seg(t, t0 + 4.7, t0 + 5.0), 'R', s, 18, -18);
    const mid = (th1 + th2) / 2;
    seg2(ctx, O, at(mid, len), a, seg(t, t0 + 5.2, t0 + 6.0), seed + 40, LI.AMBER_RGB, 4.5);
    const h = (th2 - th1) / 2, k = a * seg(t, t0 + 6.2, t0 + 6.6);
    if (k > 0) { const L1 = at((th1 + mid) / 2, r1 * 0.6), L2 = at((mid + th2) / 2, r1 * 0.6); F().T(ctx, `${h}°`, L1[0], L1[1], { size: s * 0.55, alpha: k, color: A.amber, halo: true }); F().T(ctx, `${h}°`, L2[0], L2[1], { size: s * 0.55, alpha: k, color: A.amber, halo: true }); }
  }

  function tick(ctx, p, q, a, seed) {
    if (a <= 0) return; const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], d = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2, r = 12;
    Ink.path(ctx, [[m[0] - r * Math.cos(d) - 4, m[1] - r * Math.sin(d)], [m[0] + r * Math.cos(d) + 4, m[1] + r * Math.sin(d)]], { w: 3, alpha: a, seed, taper: [0, 0], color: LI.AMBER_RGB });
  }
  function triangle(ctx, P, a, seed, names, s) {
    if (a <= 0) return;
    Ink.path(ctx, [P[0], P[1], P[2], P[0]], { w: 4, alpha: a, seed, taper: [0, 0] });
    const o = [[0, -30], [-22, 26], [22, 26]];
    P.forEach((q, i) => F().T(ctx, names[i], q[0] + o[i][0], q[1] + o[i][1], { size: s * 0.72, alpha: a, halo: true }));
  }
  const rr = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.56;
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];

  function context(ctx, env, t) {
    exprs(ctx, t, KD.L(env).CX, [
      [4.4, 10.2, 'A’dan BC’ye kenarortay nasıl çizilir?'],
      [10.6, 27.8, 'Orta dikme inşasını hatırlayalım'],
      [28.4, 45.8, 'Orta dikmeyle BC’nin orta noktasını bulalım'],
      [46.4, 63.8, 'Diğer kenarlara da uygulayalım'],
      [64.4, 79.8, 'Başka bir üçgende deneyelim'],
    ]);
  }

  function figure(ctx, env, t) {
    const L = KD.L(env), a = END(t), s = L.G.s, G = L.GE, k = G.k;
    const A_ = W_(G, [-90, -175]), B_ = W_(G, [-270, 160]), C_ = W_(G, [270, 160]);
    // S1, S3, S4: the triangle
    const aT = (win(t, 4.6, 10.2) + win(t, 28.8, 63.8)) * a;
    triangle(ctx, [A_, B_, C_], aT * seg(t, t < 20 ? 4.8 : 29.0, (t < 20 ? 4.8 : 29.0) + 0.6), 11000, ['A', 'B', 'C'], s);
    if (t < 10.2) { const q = a * win(t, 6.8, 10.2); if (q > 0) { F().T(ctx, '?', mid(B_, C_)[0], B_[1] + 34, { size: s * 1.1, alpha: q, color: A.amber }); } }
    // S2: recall on a segment
    perpBis(ctx, W_(G, [-230, 40]), W_(G, [230, 40]), 300 * k, t, 11.4, win(t, 11.0, 27.8) * a, s, 12000, ['P', 'Q', '', '', 'M']);
    if (t > 18 && t < 27.8) { const P = W_(G, [-230, 40]), Q = W_(G, [230, 40]), M = W_(G, [0, 40]), q = a * win(t, 18.4, 27.8); tick(ctx, P, M, q, 12100); tick(ctx, M, Q, q, 12110); }
    // S3: on BC → K, then AK
    const K = mid(B_, C_);
    perpBis(ctx, B_, C_, rr(B_, C_), t, 30.0, win(t, 29.8, 37.2) * a, s, 13000, ['', '', '', '', '']);
    const aK = win(t, 35.2, 63.8) * a;
    if (aK > 0) {
      pt(ctx, K, aK, 'K', s, 0, 30, LI.AMBER_RGB);
      Ink.path(ctx, [A_, [lerp(A_[0], K[0], seg(t, 36.4, 37.4)), lerp(A_[1], K[1], seg(t, 36.4, 37.4))]], { w: 4.5, alpha: aK * seg(t, 36.4, 36.6), seed: 13100, taper: [0, 0], color: LI.AMBER_RGB });
      tick(ctx, B_, K, aK * seg(t, 38.0, 38.4), 13110); tick(ctx, K, C_, aK * seg(t, 38.0, 38.4), 13120);
    }
    // S4: the other two sides
    const Lm = mid(A_, C_), Nm = mid(A_, B_);
    perpBis(ctx, A_, C_, rr(A_, C_), t, 47.2, win(t, 47.0, 53.4) * a, s, 14000, ['', '', '', '', '']);
    perpBis(ctx, A_, B_, rr(A_, B_), t, 53.8, win(t, 53.6, 60.0) * a, s, 14500, ['', '', '', '', '']);
    const l1 = win(t, 52.4, 63.8) * a, l2 = win(t, 59.0, 63.8) * a;
    if (l1 > 0) { pt(ctx, Lm, l1, 'L', s, 22, -14, LI.AMBER_RGB); Ink.path(ctx, [B_, [lerp(B_[0], Lm[0], seg(t, 53.0, 53.8)), lerp(B_[1], Lm[1], seg(t, 53.0, 53.8))]], { w: 4.5, alpha: l1, seed: 14100, taper: [0, 0], color: LI.AMBER_RGB }); }
    if (l2 > 0) { pt(ctx, Nm, l2, 'N', s, -24, -12, LI.AMBER_RGB); Ink.path(ctx, [C_, [lerp(C_[0], Nm[0], seg(t, 59.6, 60.4)), lerp(C_[1], Nm[1], seg(t, 59.6, 60.4))]], { w: 4.5, alpha: l2, seed: 14600, taper: [0, 0], color: LI.AMBER_RGB }); }
    const gA = a * win(t, 60.8, 63.8);
    if (gA > 0) { const Gc = [(A_[0] + B_[0] + C_[0]) / 3, (A_[1] + B_[1] + C_[1]) / 3]; ctx.beginPath(); ctx.arc(Gc[0], Gc[1], 11, 0, 7); ctx.fillStyle = `rgba(${LI.INK_RGB},${gA})`; ctx.fill(); F().T(ctx, 'G', Gc[0] + 26, Gc[1] + 20, { size: s * 0.72, alpha: gA, halo: true }); }
    // S5: an obtuse triangle
    const a5 = win(t, 64.8, 79.8) * a;
    if (a5 > 0) {
      const A2 = W_(G, [-330, -150]), B2 = W_(G, [-200, 150]), C2 = W_(G, [280, 150]), K2 = mid(B2, C2);
      triangle(ctx, [A2, B2, C2], a5 * seg(t, 65.0, 65.6), 15000, ['A', 'B', 'C'], s);
      perpBis(ctx, B2, C2, rr(B2, C2), t, 66.0, win(t, 65.8, 73.2) * a, s, 15100, ['', '', '', '', '']);
      const q = a5 * seg(t, 71.2, 71.6);
      if (q > 0) { pt(ctx, K2, q, 'K', s, 0, 30, LI.AMBER_RGB); Ink.path(ctx, [A2, [lerp(A2[0], K2[0], seg(t, 72.0, 73.0)), lerp(A2[1], K2[1], seg(t, 72.0, 73.0))]], { w: 4.5, alpha: q, seed: 15200, taper: [0, 0], color: LI.AMBER_RGB }); tick(ctx, B2, K2, a5 * seg(t, 73.6, 74.0), 15210); tick(ctx, K2, C2, a5 * seg(t, 73.6, 74.0), 15220); }
    }
  }

  function words(ctx, env, t) {
    const W = KD.L(env).W;
    exprs(ctx, t, at(W, 0), [[6.0, 10.2, 'Kenarortay, BC’nin orta noktasına gider'],
      [11.4, 18.0, 'P ve Q’dan aynı açıklıkla iki yay; yaylar iki noktada kesişir'], [18.2, 27.8, 'Orta dikme PQ’yu M’de ikiye böler: PM = MQ'],
      [29.4, 35.0, 'BC’nin orta dikmesini çizelim'], [35.2, 45.8, 'Orta dikme BC’yi K’de keser: BK = KC'],
      [47.4, 63.8, 'AC’nin ortası L, AB’nin ortası N: BL ve CN de kenarortay'],
      [65.4, 79.8, 'Geniş açılı bir üçgen: yine BC’nin orta dikmesi']]);
    exprs(ctx, t, at(W, 1), [[8.4, 10.2, 'Orta noktayı ölçmeden bulabilir miyiz?'], [22.0, 27.8, 'Orta dikme, orta noktayı ölçmeden bulur'],
      [37.4, 45.8, 'A ile K’yi birleştir: AK kenarortay'],
      [61.0, 63.8, 'Üç kenarortay bir noktada kesişti: G'],
      [74.2, 79.8, 'Kontrol: BK = KC ✓ · AK kenarortay']]);
    exprs(ctx, t, at(W, 2), [[24.4, 27.8, 'Orta nokta bulunursa kenarortay hazır', true], [40.4, 45.8, 'Kenarortay inşası: orta dikme + köşeyi birleştir', true],
      [62.2, 63.8, 'Yöntem her kenarda işler', true], [76.4, 79.8, 'Yöntem her üçgende işler', true]]);
  }

  function summary(ctx, env, t) {
    if (t < 80.4) return;
    const S = KD.L(env).SUM, f = F(), a = END(t);
    [['Kenarın orta dikmesini çiz', 80.6], ['Kenarı kestiği nokta: orta nokta', 81.6], ['Karşı köşeyle birleştir', 82.6], ['Kenarortay hazır!', 83.6, true]].forEach(([s, t0, hot], i) => {
      const al = seg(t, t0, t0 + 0.4) * a; if (al <= 0) return;
      f.expr(ctx, [s], S.x, S.y[i], S.s * (i === 3 ? 1.1 : 1), { alpha: al, w: S.w, halo: true, color: hot ? A.amber : undefined });
    });
  }

  LI.fireworks = function (ctx, env, t) {
    const k = seg(t, 84.4, 86.4);
    if (k <= 0 || t >= 91) return;
    const n = F().nokta(t, env), C = [n.x, n.y - 170];
    [30, 60, 90, 120, 150].forEach((d, i) => {
      const r = 150 + 30 * Math.sin(t * 2 + i);
      A.arc(ctx, C, r, d - 12, d + 12, { p: seg(k, i * 0.12, i * 0.12 + 0.4), alpha: 0.8 * (1 - seg(t, 90.2, 91)), w: 6, seed: 80 + i });
    });
  };

  LI.world = function (ctx, env, t) { context(ctx, env, t); figure(ctx, env, t); words(ctx, env, t); summary(ctx, env, t); };

  function camera(t, env) {
    const L = KD.L(env);
    return LI.Camera.breathe(LI.Camera.track([
      [0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [3.0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [4.8, KD.cam(env, { zoom: 1 })],
    ], t), t, 0.5);
  }
  function render(ctx, lt, env, t) { F().base(ctx, env, t, camera(t, env), () => LI.world(ctx, env, t)); }
  LI.registerScene({ id: 1, start: 0, end: 10, name: 'A triangle', nameTr: 'Üçgen', concept: 'Where is the midpoint?', conceptTr: 'Orta nokta nerede?', render });
})(window.LI = window.LI || {});
