(() => {
  const P = window.RIACH_PRODUCTS, CATS = window.RIACH_CATS, MOODS = window.RIACH_MOODS;
  const WA = "50498781417";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => "L " + n.toLocaleString("es-HN");
  const from = p => Math.min(...p.sizes.map(x => x.p));
  const ink = hex => {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? "#2a241f" : "#f3ead9";
  };

  // Ilustración SVG para productos sin foto
  function art(p) {
    const t = ink(p.label);
    const jar = (x, w, h, name, small) => `
      <g transform="translate(${x},${200 - h})">
        <rect x="0" y="0" width="${w}" height="16" rx="5" fill="#24211d"/>
        <rect x="2" y="12" width="${w - 4}" height="${h - 12}" rx="${small ? 10 : 16}" fill="#1c1916"/>
        <rect x="6" y="18" width="${w - 12}" height="${h * 0.22}" rx="8" fill="${p.wax}" opacity=".18"/>
        <rect x="${w * 0.12}" y="${h * 0.34}" width="${w * 0.76}" height="${h * 0.48}" rx="3" fill="${p.label}"/>
        <text x="${w / 2}" y="${h * 0.34 + 16}" text-anchor="middle" font-family="Jost" font-size="${small ? 6 : 8}" letter-spacing="2" fill="${t}" opacity=".7">RI'ACH</text>
        <text x="${w / 2}" y="${h * 0.58}" text-anchor="middle" font-family="Cormorant Garamond" font-size="${small ? 11 : 16}" fill="${t}">${name}</text>
        <line x1="${w * 0.25}" x2="${w * 0.75}" y1="${h * 0.66}" y2="${h * 0.66}" stroke="${t}" stroke-opacity=".35"/>
        <text x="${w / 2}" y="${h * 0.74}" text-anchor="middle" font-family="Jost" font-size="${small ? 5 : 6.5}" letter-spacing="1" fill="${t}" opacity=".7">ARTESANAL</text>
      </g>`;
    let body;
    if (p.cat === "melts") {
      body = [0, 1, 2].map(i => [0, 1].map(j =>
        `<rect x="${78 + i * 50}" y="${92 + j * 50}" width="42" height="42" rx="8" fill="${p.wax}" stroke="#00000018"/>`).join("")).join("") +
        `<rect x="70" y="84" width="166" height="108" rx="14" fill="none" stroke="${p.label}" stroke-width="3"/>`;
    } else if (p.cat === "sets") {
      body = jar(52, 66, 110, "Calm", 1) + jar(122, 66, 110, "Ri'ach", 1) + jar(192, 66, 110, "Glow", 1);
    } else {
      const words = p.name.split(" ");
      body = jar(98, 110, 150, words[0], 0);
    }
    const vb = p.cat === "velas" ? "68 38 174 182" : "0 0 310 230";
    return `<svg viewBox="${vb}" role="img" aria-label="${p.name}">
      <ellipse cx="155" cy="203" rx="${p.cat === "sets" ? 120 : 80}" ry="9" fill="#00000014"/>${body}</svg>`;
  }

  const media = p => p.img
    ? `<img src="${p.img}" alt="${p.name}" loading="lazy">`
    : `<div class="art" style="--tint:${p.wax}">${art(p)}</div>`;

  function card(p) {
    return `<article class="card reveal" data-id="${p.id}">
      <button class="card-media" data-open="${p.id}" aria-label="Ver ${p.name}">
        ${media(p)}
        ${p.tag ? `<span class="badge">${p.tag}</span>` : ""}
        <span class="quick">Vista rápida</span>
      </button>
      <div class="card-body">
        <p class="eyebrow">${CATS[p.cat]}</p>
        <h3>${p.name}</h3>
        <p class="notes">${p.notes.join(" · ")}</p>
        <div class="card-foot">
          <span class="price">${p.sizes.length > 1 ? "<small>desde</small> " : ""}${money(from(p))}</span>
          <button class="add" data-add="${p.id}" aria-label="Agregar ${p.name} al carrito">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </article>`;
  }

  /* ---------- Carrito ---------- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("riach-cart")) || []; } catch (e) {}
  const save = () => { try { localStorage.setItem("riach-cart", JSON.stringify(cart)); } catch (e) {} renderCart(); };
  const add = (id, size, qty = 1) => {
    const p = P.find(x => x.id === id); size = size || p.sizes[0].s;
    const line = cart.find(l => l.id === id && l.size === size);
    line ? line.qty += qty : cart.push({ id, size, qty });
    save(); toast(`${p.name} (${size}) agregado`);
    const c = $(".cart-count"); c && (c.classList.remove("bump"), void c.offsetWidth, c.classList.add("bump"));
  };
  const lineInfo = l => { const p = P.find(x => x.id === l.id); return { p, price: p.sizes.find(s => s.s === l.size).p }; };

  function renderCart() {
    const count = cart.reduce((a, l) => a + l.qty, 0);
    $$(".cart-count").forEach(el => { el.textContent = count; el.hidden = !count; });
    const list = $("#cart-items"); if (!list) return;
    if (!cart.length) {
      list.innerHTML = `<div class="empty"><p>Tu carrito está vacío.</p><a href="catalogo.html" class="btn btn-ghost">Explorar aromas</a></div>`;
    } else {
      list.innerHTML = cart.map((l, i) => {
        const { p, price } = lineInfo(l);
        return `<li class="line">
          <div class="line-thumb">${media(p)}</div>
          <div class="line-info"><strong>${p.name}</strong><span>${CATS[p.cat]} · ${l.size}</span>
            <div class="stepper"><button data-dec="${i}" aria-label="Menos">−</button><span>${l.qty}</span><button data-inc="${i}" aria-label="Más">+</button></div>
          </div>
          <div class="line-end"><span>${money(price * l.qty)}</span><button class="link" data-del="${i}">Quitar</button></div>
        </li>`;
      }).join("");
    }
    const total = cart.reduce((a, l) => a + lineInfo(l).price * l.qty, 0);
    $("#cart-total").textContent = money(total);
    const free = 1200, bar = $("#ship-bar");
    if (bar) {
      bar.style.setProperty("--w", Math.min(100, total / free * 100) + "%");
      $("#ship-msg").textContent = total >= free ? "¡Tienes envío gratis!" : `Te faltan ${money(free - total)} para envío gratis`;
    }
    $("#checkout").disabled = !cart.length;
  }

  function checkout() {
    const lines = cart.map(l => { const { p, price } = lineInfo(l); return `• ${l.qty} × ${p.name} (${l.size}) — ${money(price * l.qty)}`; });
    const total = cart.reduce((a, l) => a + lineInfo(l).price * l.qty, 0);
    const msg = `¡Hola Ri'ach! Quiero hacer este pedido:\n${lines.join("\n")}\n\nTotal: ${money(total)}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  /* ---------- Vista rápida ---------- */
  function openModal(id) {
    const p = P.find(x => x.id === id), m = $("#modal");
    let size = p.sizes[0].s, qty = 1;
    m.querySelector(".modal-inner").innerHTML = `
      <div class="modal-media">${media(p)}</div>
      <div class="modal-info">
        <p class="eyebrow">${CATS[p.cat]}${p.tag ? " · " + p.tag : ""}</p>
        <h2>${p.name}</h2>
        <p class="m-price">${money(p.sizes[0].p)}</p>
        <p>${p.desc}</p>
        <div class="pyramid">${p.notes.map((n, i) => `<span><em>${["Salida", "Corazón", "Fondo"][i] || "Nota"}</em>${n}</span>`).join("")}</div>
        ${p.sizes.length > 1 ? `<div class="sizes" role="radiogroup" aria-label="Tamaño">${p.sizes.map((s, i) =>
          `<button role="radio" aria-checked="${!i}" data-size="${s.s}">${s.s}<small>${money(s.p)}</small></button>`).join("")}</div>` : ""}
        <ul class="facts"><li>${p.cat === "difusores" ? "4–6 semanas de aroma" : p.cat === "melts" ? "8–10 h por cubo" : "45–80 h de quemado"}</li><li>Cera de soya 100%</li><li>Hecho a mano en Honduras</li></ul>
        <div class="buy">
          <div class="stepper big"><button data-q="-1" aria-label="Menos">−</button><span id="mq">1</span><button data-q="1" aria-label="Más">+</button></div>
          <button class="btn btn-primary" id="madd">Agregar al carrito</button>
        </div>
      </div>`;
    $$(".sizes button", m).forEach(b => b.onclick = () => {
      size = b.dataset.size;
      $$(".sizes button", m).forEach(x => x.setAttribute("aria-checked", x === b));
      $(".m-price", m).textContent = money(p.sizes.find(s => s.s === size).p);
    });
    $$("[data-q]", m).forEach(b => b.onclick = () => { qty = Math.max(1, qty + +b.dataset.q); $("#mq").textContent = qty; });
    $("#madd").onclick = () => { add(p.id, size, qty); m.close(); };
    m.showModal();
  }

  /* ---------- Toast ---------- */
  let tt;
  function toast(text) {
    const t = $("#toast"); t.textContent = text; t.classList.add("show");
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------- Reveal ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 }) : null;
  const reveal = () => $$(".reveal:not(.in)").forEach(el => io ? io.observe(el) : el.classList.add("in"));

  /* ---------- Grids ---------- */
  function mountGrid(grid, opts = {}) {
    const state = { cat: "all", mood: "all", q: "", sort: "featured", ...opts.state };
    const draw = () => {
      let list = P.filter(p =>
        (state.cat === "all" || p.cat === state.cat) &&
        (state.mood === "all" || p.mood.includes(state.mood)) &&
        (!state.q || (p.name + p.notes.join(" ") + p.desc).toLowerCase().includes(state.q.toLowerCase())));
      if (state.sort === "asc") list = [...list].sort((a, b) => from(a) - from(b));
      if (state.sort === "desc") list = [...list].sort((a, b) => from(b) - from(a));
      if (state.sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      if (opts.limit) list = list.slice(0, opts.limit);
      grid.innerHTML = list.length ? list.map(card).join("") :
        `<div class="no-results"><p>No encontramos aromas con esos filtros.</p><button class="btn btn-ghost" data-reset>Limpiar filtros</button></div>`;
      const c = $("#result-count"); c && (c.textContent = `${list.length} ${list.length === 1 ? "producto" : "productos"}`);
      reveal();
    };
    draw();
    return { state, draw };
  }

  function chips(container, map, key, ctl, allLabel) {
    if (!container) return;
    container.innerHTML = `<button class="chip" aria-pressed="true" data-v="all">${allLabel}</button>` +
      Object.entries(map).map(([k, v]) => `<button class="chip" aria-pressed="false" data-v="${k}">${v}</button>`).join("");
    container.addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      ctl.state[key] = b.dataset.v;
      $$(".chip", container).forEach(x => x.setAttribute("aria-pressed", x === b));
      ctl.draw();
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    const featured = $("#featured-grid");
    if (featured) {
      const ctl = mountGrid(featured, { limit: 8 });
      chips($("#mood-chips"), MOODS, "mood", ctl, "Todos");
    }
    const catalog = $("#catalog-grid");
    if (catalog) {
      const params = new URLSearchParams(location.search);
      const ctl = mountGrid(catalog, { state: { cat: params.get("cat") || "all" } });
      chips($("#cat-chips"), CATS, "cat", ctl, "Todo");
      chips($("#mood-chips"), MOODS, "mood", ctl, "Cualquier momento");
      if (ctl.state.cat !== "all") $$("#cat-chips .chip").forEach(x => x.setAttribute("aria-pressed", x.dataset.v === ctl.state.cat));
      $("#search").addEventListener("input", e => { ctl.state.q = e.target.value; ctl.draw(); });
      $("#sort").addEventListener("change", e => { ctl.state.sort = e.target.value; ctl.draw(); });
      document.addEventListener("click", e => {
        if (!e.target.closest("[data-reset]")) return;
        Object.assign(ctl.state, { cat: "all", mood: "all", q: "" }); $("#search").value = "";
        $$(".chip").forEach(x => x.setAttribute("aria-pressed", x.dataset.v === "all")); ctl.draw();
      });
    }

    document.addEventListener("click", e => {
      const t = e.target.closest("[data-add],[data-open],[data-inc],[data-dec],[data-del],[data-cart],[data-close]");
      if (!t) return;
      const d = t.dataset;
      if (d.add) add(d.add);
      if (d.open) openModal(d.open);
      if (d.inc) { cart[d.inc].qty++; save(); }
      if (d.dec) { cart[d.dec].qty > 1 ? cart[d.dec].qty-- : cart.splice(d.dec, 1); save(); }
      if (d.del) { cart.splice(d.del, 1); save(); }
      if ("cart" in d) { document.body.classList.add("cart-open"); }
      if ("close" in d) { document.body.classList.remove("cart-open"); $("#modal").open && $("#modal").close(); }
    });
    $("#checkout").addEventListener("click", checkout);
    $("#modal").addEventListener("click", e => { if (e.target.id === "modal") e.target.close(); });
    document.addEventListener("keydown", e => e.key === "Escape" && document.body.classList.remove("cart-open"));

    const nav = $(".nav");
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 30);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    const burger = $(".burger");
    burger && burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open);
    });
    $$(".mobile-menu a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));

    $$(".faq details").forEach(d => d.addEventListener("toggle", () => {
      if (d.open) $$(".faq details").forEach(o => o !== d && (o.open = false));
    }));

    renderCart(); reveal();
  });
})();
