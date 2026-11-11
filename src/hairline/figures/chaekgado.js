/**
 * Chaekgado: a bookcase (책가) of nine unequal compartments before a still 일월오봉도 screen, filled afresh at each
 * mount with book stacks and three or four of ten 책가도 objects. The pointer picks a compartment on the front plane at
 * rest: its books fan out from the one under the pointer, or its object slides forward; the rest follow by distance.
 */
const { Cam, clamp, facing, fillet, fit, hull, open, poly, proj, prism, rad, rings, tween, tset, tval, tdone, disposer, mk, place, pointer, put, register, solid } = HL;
const T = 3, D = 28, FLOOR = 8, STEP = 45, SW = 48, SH = 150, PI = Math.PI;
const COLS = [{ w: 50, rows: [36, 30, 34] }, { w: 60, rows: [28, 44, 28] }, { w: 46, rows: [40, 26, 34] }]; // rows bottom up
const X = COLS.reduce((xs, c) => [...xs, xs.at(-1) + T + c.w], [0]);
const W = X[3] + T, TOP = FLOOR + 106;
const hs = (k) => { const s = Math.sin(k * 91.3458) * 47453.5453; return s - Math.floor(s); };
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
const turn = (ring, a, x, y, c = Math.cos(a), s = Math.sin(a)) => ring.map((q) => ({ ...q, u: x + q.u * c - q.v * s, v: y + q.u * s + q.v * c, nu: q.nu * c - q.nv * s, nv: q.nu * s + q.nv * c }));
// The objects, in their own frame (x along the case, y forward, z up). A circle about axis ax (2 is upright); a lathe is
// rings [z, r, dx, dy], eased between its stations (Catmull-Rom) so a few read as a curve; arc is a ring's front half.
const ci = (c, r, ax = 2, n = 32, a0 = 0, a1 = 2 * PI) => Array.from({ length: n + 1 }, (_, k, p = c.slice(), a = a0 + ((a1 - a0) * k) / n) => {
  p[(ax + 1) % 3] += r * Math.cos(a); p[(ax + 2) % 3] += r * Math.sin(a); return p; });
const cr = (a, b, c, d, t) => b + ((c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t ** 3) / 2;
const lathe = (prof, q = prof.map(([z, r, dx = 0, dy = 0]) => [z, r, dx, dy]), m = q.length - 1) => q.flatMap((p, i) => (i ? [0.25, 0.5, 0.75, 1] : [0])
  .map((t) => (i ? p.map((_, j) => cr(q[Math.max(i - 2, 0)][j], q[i - 1][j], p[j], q[Math.min(i + 1, m)][j], t)) : p))).flatMap(([z, r, dx, dy]) => ci([dx, dy, z], r));
const stone = (x, y, z, R, H) => [[0, 0.6], [0.3, 0.95], [0.65, 1], [1, 0.55]].flatMap(([f, g]) => ci([x, y, z + H * f], R * g, 2, 9, z + f * 3, z + f * 3 + 2 * PI)); // a lump, faceted
const arc = (z, r) => [ci([0, 0, z], r, 2, 16, -PI / 4, (3 * PI) / 4)];
const blob = (x, y, z, R, H) => [...Array(5)].map((_, n) => [z + (H * (1 - Math.cos((PI * n) / 4))) / 2, R * Math.sin((PI * n) / 4) + 0.3, x, y]);
const leaf = ([a, L, H]) => [...Array(9)].map((_, n) => [Math.cos(rad(a)) * L * n / 8, Math.sin(rad(a)) * L * n * 0.7 / 8, 7 + H * (2.2 * n / 8 - 2 * (n / 8) ** 2)]);
const at = (a, r, z) => [r * Math.cos(rad(a)), r * Math.sin(rad(a)), z];
// name: [height, width, half depth, parts]; a part is [class, kind, points]: hull, polys, lines, dots, or a block's sil or crease.
const ITEMS = {
  jar: [35, 28, 14, [["sil", "hull", lathe([[0, 5.2], [1.8, 5.5]])], ["sil", "hull", lathe([...Array(17)].map((_, n) => [1.8 + n * 1.95, 5.8 + 8 * Math.sin((PI * n) / 16) ** 0.7, 0.8 * (n / 16) ** 2]))],
    ["sil", "hull", lathe([[32.8, 6.1, 0.8], [34.8, 6.7, 0.8]])], ["nf", "polys", [ci([0.8, 0, 34.8], 5)]], ["nf lo", "lines", arc(17.5, 13.8)]]],
  bottle: [33, 20, 10, [["sil", "hull", lathe([[0, 4.2], [1.2, 4.4]])], ["sil", "hull", lathe([[1.2, 5], [4, 8.4], [8, 10], [11.5, 9.6], [15, 7.4], [18, 5], [20, 3.6]])],
    ["sil", "hull", lathe([[18.5, 3.6], [21, 2.6], [25, 2.2], [29.5, 2.3]])], ["sil", "hull", lathe([[29, 2.3], [31, 2.9], [32.5, 3.8], [33.2, 4.3]])], ["nf", "polys", [ci([0, 0, 33.2], 3.3)]]]],
  brushes: [30, 18, 9, [["sil", "hull", lathe([[0, 7], [15, 7]])], ["nf lo", "lines", arc(2.5, 7)], ["nf", "polys", [ci([0, 0, 15], 6.2)]],
    ...[[-2.4, -1.5, -4, -1, 30], [1.5, -2.5, 3, -1.5, 27], [-1, 2, -2.5, 1, 25], [2.4, 1.4, 5, 2.2, 28]].flatMap(([x, y, a, b, t]) => [
      ["nf sil", "lines", [[[x, y, 15], [x + a, y + b, t - 6]]]], ["sil", "hull", lathe([[t - 6, 0.9, 1], [t - 4.5, 1.5, 1.05], [t - 2, 1.1, 1.1], [t, 0.15, 1.15]].map(([z, r, f]) => [z, r, x + a * f, y + b * f]))]])]], // a handle, its hair
  box: [13, 36, 10, [["sil", "block", [-17, -9, 17, 9, 0, 8]], ["sil", "block", [-17.8, -9.8, 17.8, 9.8, 8, 12.5]], ["nf lo", "crease", [-17.8, -9.8, 17.8, 9.8, 8, 12.5]],
    ["nf", "polys", [[0, 0], ...[0, 1, 2, 3, 4, 5].map((j) => [3.7 * Math.cos(j * PI / 3 + PI / 6), 3.7 * Math.sin(j * PI / 3 + PI / 6)])].map(([x, y]) => ci([x, y, 12.5], 1.9, 2, 6))]]],
  scrolls: [15, 44, 8.5, [[-4.5, 4], [4.5, 4], [0, 10.7]].flatMap(([y, z]) => [["sil", "hull", [...ci([-19, y, z], 4, 0), ...ci([19, y, z], 4, 0)]],
    ["nf", "polys", [ci([19, y, z], 4, 0)]], ["sil", "hull", [...ci([19, y, z], 1.5, 0, 12), ...ci([21.2, y, z], 1.5, 0, 12)]]])],
  rock: [30, 20, 10, [["sil", "hull", lathe([[0, 8.6], [1.2, 9.2], [3, 8.6]])], ["nf lo", "lines", arc(3, 7.6)],
    ...[[0, 0, 2.5, 4.2, 11], [2, -0.8, 7.5, 5.8, 12], [-1.8, 0.6, 14, 5.4, 11], [1.4, 0.2, 20, 4.4, 9]].map((b) => ["sil", "hull", stone(...b)]),
    ["nf", "polys", [ci([5.6, 2.6, 12], 1.3, 1, 12), ci([1.6, 3.6, 18.5], 1.1, 1, 12)]]]], // a scholar's stone, its holes, on a low stand
  orchid: [22, 36, 9, [["sil", "hull", lathe([[0, 4.6], [1, 5], [5.5, 7.4], [6.5, 7.8]])], ["nf", "polys", [ci([0, 0, 6.5], 6.8)]],
    ["nf sil", "lines", [[140, 20, 15], [165, 16, 20], [120, 14, 12], [-40, 20, 15], [-10, 17, 19], [40, 12, 11]].map(leaf)],
    ["nf", "lines", [[[0.5, 0, 7], [2, -0.5, 14], [3.6, -1, 21]]]], ["dot m", "dots", [[3.6, -1, 21], [4.9, -1.2, 19.3], [2.5, -0.8, 18.9]]]]],
  clock: [29, 16, 6, [["sil", "block", [-7, -6, 7, 6, 0, 3]], ["sil", "block", [-6, -5, 6, 5, 3, 21]], ["nf lo", "crease", [-6, -5, 6, 5, 3, 21]],
    ["nf", "polys", [ci([0, 5, 13], 4.3, 1)]], ["dot off", "dots", ci([0, 5, 13], 3.4, 1, 12).slice(1)], ["nf", "lines", [[[0, 5, 16], [0, 5, 13], [2.2, 5, 12]]]],
    ["sil", "hull", lathe([[21, 3.8], [22.5, 3.6], [24, 2.6], [25.2, 0.8]])], ["nf", "lines", [[[0, 0, 25.2], [0, 0, 28.5]]]]]],
  burner: [19, 22, 8.5, [["nf sil", "lines", [90, 210, 330].map((a) => [at(a, 5, 4), at(a, 7, 0)])], ["nf sil", "lines", [[[-8, 0, 9.5], [-10, 0, 11.5], [-9.6, 0, 13.5], [-7.8, 0, 11.2]]]],
    ["sil", "hull", lathe([[3, 5.5], [5, 7.5], [8, 8.4], [10, 8.2], [11, 7.4]])], ["nf sil", "lines", [[[8, 0, 9.5], [10, 0, 11.5], [9.6, 0, 13.5], [7.8, 0, 11.2]]]],
    ["sil", "hull", lathe([[10.8, 7.6], [12.5, 7], [14.5, 5], [16, 2.2]])], ["sil", "hull", lathe([[15.6, 1.2], [17.2, 2], [19, 0.5]])]]],
  peaches: [19, 24, 10.6, [["sil", "hull", lathe([[0, 4], [1, 6], [3, 10.6]])], ["nf", "polys", [ci([0, 0, 3], 9.6)]],
    ...[[-3.6, -2.8, 3], [3.6, -2.2, 3], [0, 3.4, 3], [0.2, -0.6, 9.2]].flatMap(([x, y, z]) => [["sil", "hull", lathe([...blob(x, y, z, 4.2, 8.4), [z + 9.6, 0.15, x + 0.8, y]])],
      ["nf lo", "lines", [[1, 2, 3, 4, 5].map((n) => [x + 2.97 * Math.sin((PI * n) / 6), y + 2.97 * Math.sin((PI * n) / 6), z + 4.2 * (1 - Math.cos((PI * n) / 6))])]]])]],
};
// The screen's painting, after byeongpung: s runs 0 to 180 across the five panels; peaks, foothills, waves.
const gs = (s, [c, h, w]) => h * Math.exp(-(((s - c) / w) ** 2));
const WAVES = (s) => 12 + 4 * Math.abs(Math.sin((PI * s) / 9));
const HILLS = (s) => 21 + Math.max(...[[0, 9, 13], [36, 15, 11], [72, 11, 11], [108, 11, 11], [144, 15, 11], [180, 9, 13]].map((b) => gs(s, b)));
const PARTS = [[18, 44, -1], [54, 62, -1], [90, 80, 0], [126, 62, 1], [162, 44, 1]]
  .flatMap(([c, h, d]) => [[c, 0.6 * h, 6.5], [c, 0.4 * h, 13], ...(d ? [d] : [-1, 1]).map((e) => [c + e * 9, 0.2 * h, 3.6])]).concat([[36, 18, 8], [72, 24, 8], [108, 24, 8], [144, 18, 8]]);
const PEAKS = (s) => PARTS.reduce((m, b) => m + gs(s, b), 20);
const LAYERS = [[PEAKS, "nf", HILLS, WAVES], [HILLS, "nf lo", WAVES], [WAVES, "nf lo"]];
// Its five panels at fixed folds, well behind the case (y < -44), with a gap: origin, direction, and depth for painting.
const FR = [0, 1, 2, 3, 4].map((i, _, __, o = [W / 2 + (i - 2.5) * SW * Math.cos(rad(12)), -44 - (i % 2) * SW * Math.sin(rad(12))], d = [Math.cos(rad(12)), (i % 2 ? 1 : -1) * Math.sin(rad(12))]) =>
  ({ i, o, d, depth: o[0] + o[1] + ((d[0] + d[1]) * SW) / 2 }));
/** The still screen, painted first, farthest panel first, in the medium and dim strokes only; moon left, sun right. */
function screen(P, g) {
  const V = (v) => 58 + v * 0.82, k = SW / 36;
  for (const f of FR.slice().sort((a, b) => a.depth - b.depth)) {
    const on = (u, v) => P(f.o[0] + f.d[0] * u, f.o[1] + f.d[1] * u, v);
    mk("path", { d: poly(fillet([[0.5, 0], [SW - 0.5, 0], [SW - 0.5, SH], [0.5, SH]], [1.6, 1.6, 1.6, 1.6]).map((q) => on(q[0], q[1]))) }, g);
    mk("path", { d: open([on(1.5, 9), on(SW - 1.5, 9)]) + open([on(1.5, SH - 5), on(SW - 1.5, SH - 5)]), class: "nf lo" }, g);
    for (const [own, cls, ...front] of LAYERS) {
      const runs = [[]]; // each line only where it rises above the ones in front of it
      for (let n = 0, s = f.i * 36; n <= 48; n++, s += 0.75) if (front.every((h) => own(s) > h(s) + 0.5)) runs.at(-1).push(on((s - f.i * 36) * k, V(own(s)))); else if (runs.at(-1).length) runs.push([]);
      mk("path", { d: runs.filter((r) => r.length > 1).map(open).join(""), class: cls }, g);
    }
    const sc = [11, 0, 0, 0, 169][f.i];
    if (sc) mk("path", { d: poly(ci([(sc - f.i * 36) * k, 0, V(95)], 6, 1, 24).map(([u, , v]) => on(u, v))), class: "nf lo" }, g);
  }
}
function mount({ stage, svg, read }, value) {
  const bag = disposer(); let pull = value;
  const C = Cam(45, 0.5, 1.3), box = [[-3, -3, TOP + 4], [W + 3, D + 3, 0], [-3, D + 3, 0], [-8, D + 26, FLOOR], [0, D + 34, FLOOR], [W - 20, D + 34, FLOOR]];
  for (const f of FR) for (const u of [0, SW]) for (const v of [0, SH]) box.push([f.o[0] + f.d[0] * u, f.o[1] + f.d[1] * u, v]);
  fit(C, box, 200, 162);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);
  screen(P, g);
  const board = (x0, y0, x1, y1, z0, z1, r = 1.5, b = 0.7) => { const [ring, inner] = rings(x0, y0, x1, y1, r, b); put(solid(g), prism(P, front, ring, inner, z0, z1)); };
  /** One part of an object o, slid forward by dy, as a path. */
  function shape(o, dy, kind, pts) {
    const Q = ([x, y, z]) => P(o.cx + o.s * x, o.cy + dy + o.s * y, o.z + o.s * z);
    if (kind === "hull") return poly(hull(pts.map(Q)));
    if (kind === "polys" || kind === "lines") return pts.map((p) => (kind === "lines" ? open : poly)(p.map(Q))).join("");
    if (kind === "dots") return pts.map(Q).map(([x, y]) => poly([0, 1, 2, 3, 4, 5].map((j) => [x + 0.8 * Math.cos(j * 1.05), y + 0.8 * Math.sin(j * 1.05)]))).join("");
    const [x0, y0, x1, y1, z0, z1] = pts, [r, i] = rings(o.cx + o.s * x0, o.cy + dy + o.s * y0, o.cx + o.s * x1, o.cy + dy + o.s * y1, 1.6, 0.8);
    const q = prism(P, front, r, i, o.z + o.s * z0, o.z + o.s * z1);
    return kind === "block" ? q.sil : q.crease;
  }
  // The shuffle: three or four objects, the tallest placed first, each once, in a random compartment it fits
  // without shrinking below .8; books fill the rest, so at least five of the nine hold books.
  const fits = (name, n) => Math.min(1, (COLS[Math.floor(n / 3)].rows[n % 3] - 9) / ITEMS[name][0], (COLS[Math.floor(n / 3)].w - 8) / ITEMS[name][1]);
  const fill = []; for (const name of shuffle(Object.keys(ITEMS)).slice(0, 3 + (Math.random() < 0.5)).sort((a, b) => ITEMS[b][0] - ITEMS[a][0])) {
    const n = shuffle([...Array(9).keys()]).find((n) => !fill[n] && fits(name, n) >= 0.8); if (n !== undefined) fill[n] = name;
  }
  board(4, 4, W - 4, D - 4, 0, 5, 3, 1.2); board(0, 0, W, D, 5, FLOOR, 2.5, 1.2); board(0, 0, T, D, FLOOR, TOP); board(T, 0, W - T, T, FLOOR, TOP); // stand, floor, left side, back
  const comps = [], books = []; let k = 0;
  COLS.forEach((col, c) => {
    let x0 = X[c] + T, x1 = X[c + 1], z = FLOOR;
    col.rows.forEach((h, r) => {
      const cmp = { c, r: 3 - r, x0, x1, z0: z, z1: z + h, books: [], obj: null }, name = fill[c * 3 + r]; comps.push(cmp);
      if (name) {
        const grp = mk("g", {}, g), s = fits(name, c * 3 + r);
        cmp.obj = { o: tween(0), drawn: NaN, s, z, cy: D - 1.5 - s * ITEMS[name][2], cx: (x0 + x1) / 2 - clamp((col.w - s * ITEMS[name][1]) / 2 - 1, 0, 8) };
        cmp.obj.parts = ITEMS[name][3].map(([cls, kind, pts]) => [mk("path", { class: cls }, grp), kind, pts]);
      } else {
        const th = 6 + hs(k + 300) * 1.5, most = clamp(Math.floor((h - 7) / th), 2, 5), n = Math.max(2, most - (Math.random() < 0.4));
        for (let i = 0; i < n; i++, k++) {
          const hw = (x1 - x0) / 2 - 7 + (hs(k) - 0.5) * 4, hd = 10 + (hs(k + 50) - 0.5) * 2.4, yaw0 = (hs(k + 200) - 0.5) * 6;
          const [ring, inner] = rings(-hw, -hd, hw, hd, 1.6, 0.8), el = solid(g), dots = [];
          for (let j = 0; j < 5; j++) dots.push(mk("circle", { r: 0.8, class: "dot off" }, el.g));
          const b = { cmp, i, hw, hd, ring, inner, el, dots, th, z: z + i * th, yaw0, rest: [0, yaw0], drawn: "",
            cx: (x0 + x1) / 2 - 2.5 + (hs(k + 100) - 0.5) * 3, cy: D - hd - 1.5 - hs(k + 150) * 2.5, o: tween(0), a: tween(yaw0) };
          books.push(b); cmp.books.push(b);
        }
      }
      z += h; if (r < 2) { board(x0, T, x1, D, z, z + T, 1.5, 0.7); z += T; }
    });
    board(X[c + 1], c < 2 ? T : 0, X[c + 1] + T, D, FLOOR, TOP);
  });
  board(-3, -3, W + 3, D + 3, TOP, TOP + 4, 4, 1.6);
  // The rest's mark: the top book of one stack, chosen at random, drawn out and askew.
  const stacks = comps.filter((m) => m.books.length), mb = stacks[Math.floor(Math.random() * stacks.length)].books.at(-1);
  mb.rest = [7, mb.yaw0 - 10]; mb.o = tween(7); mb.a = tween(mb.rest[1]);
  function drawBook(b, dy, yaw, a = rad(yaw), cy = b.cy + dy, c = Math.cos(a), s = Math.sin(a)) {
    if (dy + "," + yaw === b.drawn) return;
    b.drawn = dy + "," + yaw;
    put(b.el, prism(P, front, turn(b.ring, a, b.cx, cy), turn(b.inner, a, b.cx, cy), b.z, b.z + b.th));
    b.dots.forEach((el, j) => { const u = -b.hw + ((j + 1) * 2 * b.hw) / 6; place(el, P(b.cx + u * c - b.hd * s, cy + u * s + b.hd * c, b.z + b.th / 2)); });
  }
  const B = register(stage, (_dt, now) => {
    let moving = false; for (const b of books) { drawBook(b, tval(b.o, now), tval(b.a, now)); if (!tdone(b.o, now) || !tdone(b.a, now)) moving = true; }
    for (const { obj } of comps) if (obj) {
      const dy = tval(obj.o, now); if (dy !== obj.drawn) { obj.drawn = dy; obj.parts.forEach(([el, kind, pts]) => el.setAttribute("d", shape(obj, dy, kind, pts))); }
      if (!tdone(obj.o, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);
  // The hit test reads the pointer on the cabinet's front plane, y = D, which never moves.
  const O = P(0, D, 0), ex = P(1, D, 0), ez = P(0, D, 1);
  const e1 = [ex[0] - O[0], ex[1] - O[1]], e2 = [ez[0] - O[0], ez[1] - O[1]], det = e1[0] * e2[1] - e1[1] * e2[0];
  function hit([px, py]) {
    const qx = px - O[0], qy = py - O[1], x = (qx * e2[1] - qy * e2[0]) / det, z = (e1[0] * qy - e1[1] * qx) / det;
    if (x < 0 || x > W || z < FLOOR || z > TOP) return [-1, -1];
    const c = clamp(X.findIndex((xb, n) => n > 0 && x < xb + T / 2) - 1, 0, 2), n = comps.findIndex((m) => m.c === c && z < m.z1 + T / 2);
    const cmp = comps[n < 0 ? comps.findLastIndex((m) => m.c === c) : n], nb = cmp.books.length;
    return [comps.indexOf(cmp), nb ? clamp(Math.floor((z - cmp.z0) / cmp.books[0].th), 0, nb - 1) : 0];
  }
  let act = -2, aa = -1; /** How far a compartment follows the one drawn out: 1 there, .45 → 0 over 130 units of the front, between centres. */
  const near = (m, o) => (m === o ? 1 : clamp(0.45 * (1 - Math.hypot(m.x0 + m.x1 - o.x0 - o.x1, m.z0 + m.z1 - o.z0 - o.z1) / 260), 0, 0.45));
  /** Draws out compartment n from book a (-1 puts all back); the stagger spreads from that book, or the one let go. */
  function setActive(n, a) {
    if (n === act && a === aa) return;
    const now = performance.now(), m = comps[n], src = m || comps[act], from = m ? a : aa;
    act = n; aa = a;
    const delay = (cmp, i) => (src ? (1 - near(cmp, src)) * 220 + Math.abs(i - (cmp === src ? from : 0)) * STEP : 0);
    for (const b of books) {
      const on = m === b.cmp, f = m ? (on ? Math.max(0.3, 1 - 0.28 * Math.abs(b.i - a)) : near(b.cmp, m)) : 0, lit = m ? on && b.i === a : b === mb;
      tset(b.o, m ? pull * f : b.rest[0], now, delay(b.cmp, b.i));
      tset(b.a, on ? b.yaw0 + (b.i - a) * 8 : m ? b.yaw0 : b.rest[1], now, delay(b.cmp, b.i));
      b.el.sil.classList.toggle("hi", lit);
      b.dots.forEach((el) => el.classList.toggle("off", !lit));
    }
    for (const cmp of comps) if (cmp.obj) {
      tset(cmp.obj.o, m ? pull * 0.7 * near(cmp, m) : 0, now, delay(cmp, 0));
      cmp.obj.parts.forEach(([el]) => el.classList.contains("sil") && el.classList.toggle("hi", m === cmp));
    }
    read.textContent = m ? `shelf ${m.c + 1}·${m.r}` : "rest";
    B.wake();
  }
  setActive(-1, -1); bag.add(pointer(stage, { move: (p) => setActive(...hit(p)), leave: () => setActive(-1, -1) }));
  bag.add(() => svg.replaceChildren()); return { set: (v) => { pull = v; if (act >= 0) { const n = act, a = aa; act = -2; setActive(n, a); } }, destroy: bag.dispose };
}

hairline({
  name: "chaekgado",
  means: "A bookcase before a folding screen, filled anew each visit: the shelf under the pointer slides out, its books fanning one by one.",
  rules: [1, 2, 5, 6],
  range: [12, 20, 28],
  tour: [[140, 149], [202, 173], [260, 248], null],
  mount,
});
