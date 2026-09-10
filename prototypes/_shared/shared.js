// Roof Racks Galore — shared fitment logic for vehicle-specific PDP prototypes
// Implements spec Section 2.1: getFitmentStatus is a pure function of (productFitment, sessionVehicle).

const PRODUCT_FITMENT = {
  vehicle_make: "Toyota",
  vehicle_model: "Hilux",
  vehicle_generation: "N80",
  vehicle_years: "2015-2026",
  body_style: "4dr Ute",
  roof_type: "Bare Roof"
};

const DEMO_VEHICLES = {
  none: null,
  match: { make: "Toyota", model: "Hilux", generation: "N80", year: 2022 },
  mismatch: { make: "Ford", model: "Ranger", generation: "P703", year: 2023 }
};

function getFitmentStatus(productFitment, sessionVehicle) {
  if (!sessionVehicle) return "unknown";
  const [startYear, endYear] = productFitment.vehicle_years.split("-").map(Number);
  const makeMatch = sessionVehicle.make === productFitment.vehicle_make;
  const modelMatch = sessionVehicle.model === productFitment.vehicle_model;
  const genMatch = sessionVehicle.generation === productFitment.vehicle_generation;
  const yearMatch = sessionVehicle.year >= startYear && sessionVehicle.year <= endYear;
  if (makeMatch && modelMatch && genMatch && yearMatch) return "fits";
  return "no_fit";
}

const FITMENT_COPY = {
  fits: {
    label: "Fits your vehicle",
    detail: `Confirmed for your ${PRODUCT_FITMENT.vehicle_make} ${PRODUCT_FITMENT.vehicle_model} ${PRODUCT_FITMENT.vehicle_generation} (${PRODUCT_FITMENT.body_style}, ${PRODUCT_FITMENT.roof_type}).`,
    cta: "Add To Cart",
    actions: []
  },
  unknown: {
    label: "Confirm your vehicle",
    detail: `This kit suits ${PRODUCT_FITMENT.vehicle_make} ${PRODUCT_FITMENT.vehicle_model} ${PRODUCT_FITMENT.vehicle_generation} (${PRODUCT_FITMENT.vehicle_years}). Set your vehicle to confirm an exact fit before ordering.`,
    cta: "Select Your Vehicle",
    actions: ["Select your vehicle"]
  },
  no_fit: {
    label: "Doesn't fit your vehicle",
    detail: `This kit is built for ${PRODUCT_FITMENT.vehicle_make} ${PRODUCT_FITMENT.vehicle_model} ${PRODUCT_FITMENT.vehicle_generation} — not your selected vehicle.`,
    cta: "Find The Right Kit",
    actions: ["Change vehicle", "Find the right kit"]
  }
};

function renderFitmentHTML(state) {
  const c = FITMENT_COPY[state];
  const actions = c.actions.length
    ? `<div class="actions">${c.actions.map(a => `<button type="button">${a}</button>`).join("")}</div>`
    : "";
  return `
    <span class="dot"></span>
    <div>
      <strong>${c.label}</strong>
      ${c.detail}
      ${actions}
    </div>
  `;
}

function applyFitmentState(state) {
  const c = FITMENT_COPY[state];
  document.querySelectorAll('[data-fitment-slot]').forEach(el => {
    el.className = el.className.replace(/\b(fits|unknown|no_fit)\b/g, '').trim();
    el.classList.add(state);
    el.innerHTML = renderFitmentHTML(state);
  });
  document.querySelectorAll('[data-cta-label]').forEach(btn => {
    btn.textContent = c.cta;
    btn.disabled = state === 'no_fit';
    btn.classList.toggle('btn-outline', state !== 'fits');
    btn.classList.toggle('btn-primary', state === 'fits');
  });
}

function initFitmentDemo(defaultKey = 'match') {
  const buttons = document.querySelectorAll('[data-demo-vehicle]');
  function set(key) {
    const vehicle = DEMO_VEHICLES[key];
    const state = getFitmentStatus(PRODUCT_FITMENT, vehicle);
    applyFitmentState(state);
    buttons.forEach(b => b.classList.toggle('active', b.dataset.demoVehicle === key));
  }
  buttons.forEach(b => b.addEventListener('click', () => set(b.dataset.demoVehicle)));
  set(defaultKey);
}

// Delivery / Click & Collect widget — tab switching (reusable across templates)
function initDeliveryCollectTabs(root = document) {
  root.querySelectorAll('.dc-widget').forEach(widget => {
    const tabs = widget.querySelectorAll('.dc-tab');
    const panels = widget.querySelectorAll('.dc-panel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        panels.forEach(p => p.hidden = p.dataset.dcPanel !== tab.dataset.dcTab);
      });
    });
  });
}

// Reveals a results block below a postcode input — mock lookup for prototype purposes.
function revealResults(resultsId) {
  const el = document.getElementById(resultsId);
  if (el) el.hidden = false;
}

// Persistent decision bar — shows once the given sentinel element scrolls above the viewport.
function initPersistentBar(sentinelSelector, barSelector) {
  const sentinel = document.querySelector(sentinelSelector);
  const bar = document.querySelector(barSelector);
  if (!sentinel || !bar) return;
  const observer = new IntersectionObserver(([entry]) => {
    const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    bar.classList.toggle('visible', scrolledPast);
  }, { threshold: 0 });
  observer.observe(sentinel);
}

document.addEventListener('DOMContentLoaded', () => {
  initDeliveryCollectTabs();
});

// Gallery thumbnail carousel — wraps every .gallery-thumbs row (however its images got
// there: static markup or a page's own renderGallery()) in a scroll container with
// prev/next nav, so 5+ images scroll in one row instead of wrapping to a second row.
// Runs once at load; a MutationObserver keeps nav state in sync with later re-renders
// (variant/colour swaps that replace .gallery-thumbs' innerHTML).
function initGalleryCarousels() {
  document.querySelectorAll('.gallery-thumbs').forEach(el => {
    if (el.parentElement.classList.contains('gallery-thumbs-wrap')) return;

    const wrap = document.createElement('div');
    wrap.className = 'gallery-thumbs-wrap';
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'thumb-nav prev';
    prev.setAttribute('aria-label', 'Scroll thumbnails left');
    prev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'thumb-nav next';
    next.setAttribute('aria-label', 'Scroll thumbnails right');
    next.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';

    wrap.appendChild(prev);
    wrap.appendChild(next);

    prev.addEventListener('click', () => el.scrollBy({ left: -el.clientWidth * 0.8, behavior: 'smooth' }));
    next.addEventListener('click', () => el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' }));

    const updateNav = () => {
      const scrollable = el.scrollWidth > el.clientWidth + 2;
      wrap.classList.toggle('has-overflow', scrollable);
      prev.disabled = el.scrollLeft <= 2;
      next.disabled = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
    };
    el.addEventListener('scroll', updateNav);
    window.addEventListener('resize', updateNav);
    new MutationObserver(updateNav).observe(el, { childList: true });
    updateNav();
  });
}

document.addEventListener('DOMContentLoaded', initGalleryCarousels);

// ---- Demo state panel ----
// Floating button + panel letting a reviewer toggle simulated product states (video, sale,
// stock, shipping/click&collect availability) and, on vehicle-specific, the session vehicle
// used for fitment — so any template can be previewed in whichever state is relevant to it.
// Everything is driven generically off existing markup (.install-media-row, .price-block,
// .dc-widget, [data-cta-label], [data-fitment-slot]) — no page-specific wiring required,
// beyond one optional reapplySaleFlag() call pages with their own re-render loop should
// make at the end of it (see config-variant / sibling-color).

const adminState = { video: true, sale: true, stock: true, shipping: true, collect: true, specialOrder: false, exdemo: false, fittedOption: false, fittedMode: 'card', fitGalleryPlacement: 'full', fitGalleryRed: false };

function detectInitialVideoState() {
  const pairedRow = document.querySelector('.install-media-row');
  if (pairedRow) return !pairedRow.classList.contains('no-video');
  const standalone = document.querySelector('[data-admin-video]');
  if (standalone) return !standalone.hidden;
  return false;
}

function detectInitialSaleState() {
  const wasEl = document.querySelector('.price-block .price-was');
  return !!wasEl && !wasEl.hidden;
}

function detectInitialShippingState() {
  const tab = document.querySelector('.dc-widget [data-dc-tab="delivery"]');
  return !tab || !tab.hidden;
}

function detectInitialCollectState() {
  const tab = document.querySelector('.dc-widget [data-dc-tab="collect"]');
  return !tab || !tab.hidden;
}

function applyVideoFlag(on) {
  adminState.video = on;
  document.querySelectorAll('.install-media-row').forEach(row => row.classList.toggle('no-video', !on));
  document.querySelectorAll('[data-admin-video]').forEach(el => { el.hidden = !on; });
}

// Mirrors the .sale-tag corner graphic (if this page has one) to the price block's real
// discount-visible state — kept separate from the admin-flag override below so it stays
// correct even when a variant/colour with no real discount (e.g. Titanium Grey) is showing.
function syncSaleTag(block) {
  const wasEl = block.querySelector('.price-was');
  const panel = block.closest('.decision-panel');
  const tag = panel && panel.querySelector('.sale-tag');
  if (tag && wasEl) tag.hidden = wasEl.hidden;
}

// Keeps the Afterpay/PayPal/Zip amount text under the current price — Afterpay and
// PayPal's "Pay in 4" split the price evenly across 4 instalments; Zip's badge advertises
// a weekly rate (its real widget quotes "as low as $X/week" over a longer term than 4
// payments), approximated here as price/10 rounded up to the dollar, floored at $10.
function syncPaymentBadges(block) {
  const panel = block.closest('.decision-panel');
  const badges = panel && panel.querySelector('.payment-badges');
  if (!badges) return;
  const price = currentPagePrice(block);
  const quarter = fmtAud(price / 4);
  const weekly = Math.max(10, Math.ceil(price / 10));
  const afterpayText = badges.querySelector('[data-pb-amount="afterpay"]');
  const paypalText = badges.querySelector('[data-pb-amount="paypal"]');
  const zipText = badges.querySelector('[data-pb-amount="zip"]');
  if (afterpayText) afterpayText.textContent = `4 payments of ${quarter}`;
  if (paypalText) paypalText.textContent = `4 payments of ${quarter}`;
  if (zipText) zipText.textContent = `From $${weekly} a week`;
}

// Hides the real sale price/badge if the panel currently has "on sale" switched off, and
// keeps the sale tag graphic in sync either way. Safe to call after any re-render (the
// price-override half is a no-op once adminState.sale is true again) — pages with their
// own renderAll()/renderPrice() loop should call this at the end of it, since that's the
// only state a re-render can clobber (video/stock/availability use class or attribute
// toggles that a re-render never touches).
function reapplySaleFlag() {
  document.querySelectorAll('.price-block').forEach(block => {
    const nowEl = block.querySelector('.price-now');
    const wasEl = block.querySelector('.price-was');
    const badgeEl = block.querySelector('.badge-save');
    if (nowEl && wasEl && !adminState.sale && !wasEl.hidden) {
      nowEl.dataset.saleText = nowEl.textContent;
      nowEl.textContent = wasEl.textContent;
      wasEl.hidden = true;
      if (badgeEl) badgeEl.hidden = true;
    }
    syncSaleTag(block);
    syncPaymentBadges(block);
  });
}

function setSaleFlag(on) {
  adminState.sale = on;
  if (on) {
    if (typeof renderAll === 'function') { renderAll(); return; }
    document.querySelectorAll('.price-block .price-was').forEach(el => { el.hidden = false; });
    document.querySelectorAll('.price-block .badge-save').forEach(el => { el.hidden = false; });
    document.querySelectorAll('.price-block .price-now[data-sale-text]').forEach(el => {
      el.textContent = el.dataset.saleText;
      delete el.dataset.saleText;
    });
    return;
  }
  reapplySaleFlag();
}

// Three real stock states (was a plain in-stock/out-of-stock boolean) — the decision
// panel's .stock-status-line reflects whichever is selected in the demo admin panel's
// "Stock status" radio group. Low Stock reads as a warning but doesn't block purchase;
// Not in Stock blocks it the same way the old "out of stock" toggle did.
const STOCK_STATUS = {
  in_stock: { text: '✓ In Stock', cls: 'in-stock', blocksCta: false },
  low_stock: { text: '⚠ Low Stock — order soon', cls: 'low-stock', blocksCta: false },
  not_in_stock: { text: '✕ Not in Stock — Contact our team', cls: 'not-in-stock', blocksCta: true }
};

function applyStockStatus(status) {
  adminState.stockStatus = status;
  const cfg = STOCK_STATUS[status] || STOCK_STATUS.in_stock;
  document.querySelectorAll('.stock-status-line').forEach(line => {
    line.textContent = cfg.text;
    line.className = 'stock-status-line ' + cfg.cls;
  });
  document.querySelectorAll('.cta-col').forEach(col => {
    const parent = col.parentNode;
    const banner = parent.querySelector(':scope > .stock-banner');
    if (cfg.blocksCta && !banner) {
      const el = document.createElement('div');
      el.className = 'stock-banner';
      el.textContent = '✕ Currently out of stock';
      parent.insertBefore(el, col);
    } else if (!cfg.blocksCta && banner) {
      banner.remove();
    }
  });
  if (cfg.blocksCta) {
    document.querySelectorAll('[data-cta-label]').forEach(btn => {
      btn.disabled = true;
      btn.textContent = 'Out Of Stock';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-outline');
    });
  } else {
    const activeVehicleBtn = document.querySelector('[data-demo-vehicle].active');
    if (activeVehicleBtn) {
      applyFitmentState(getFitmentStatus(PRODUCT_FITMENT, DEMO_VEHICLES[activeVehicleBtn.dataset.demoVehicle]));
    } else {
      document.querySelectorAll('[data-cta-label]').forEach(btn => {
        btn.disabled = false;
        btn.textContent = 'Add To Cart';
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
      });
    }
  }
}

function applyAvailabilityFlags(shipping, collect) {
  adminState.shipping = shipping;
  adminState.collect = collect;
  document.querySelectorAll('.dc-widget').forEach(widget => {
    const deliveryTab = widget.querySelector('[data-dc-tab="delivery"]');
    const collectTab = widget.querySelector('[data-dc-tab="collect"]');
    const deliveryPanel = widget.querySelector('[data-dc-panel="delivery"]');
    const collectPanel = widget.querySelector('[data-dc-panel="collect"]');
    if (deliveryTab) deliveryTab.hidden = !shipping;
    if (collectTab) collectTab.hidden = !collect;

    let note = widget.parentNode.querySelector(':scope > .dc-unavailable-note');
    if (!shipping && !collect) {
      widget.hidden = true;
      if (!note) {
        note = document.createElement('div');
        note.className = 'dc-unavailable-note';
        note.textContent = 'Delivery and Click & Collect are both currently unavailable for this item.';
        widget.parentNode.insertBefore(note, widget.nextSibling);
      }
      note.hidden = false;
      return;
    }
    widget.hidden = false;
    if (note) note.hidden = true;

    const activeTab = widget.querySelector('.dc-tab.active');
    if (!activeTab || activeTab.hidden) {
      const fallback = shipping ? deliveryTab : collectTab;
      if (fallback) {
        widget.querySelectorAll('.dc-tab').forEach(t => t.classList.remove('active'));
        fallback.classList.add('active');
        widget.querySelectorAll('.dc-panel').forEach(p => { p.hidden = p.dataset.dcPanel !== fallback.dataset.dcTab; });
      }
    } else if (deliveryPanel && collectPanel) {
      const activeKey = activeTab.dataset.dcTab;
      deliveryPanel.hidden = activeKey !== 'delivery';
      collectPanel.hidden = activeKey !== 'collect';
    }
  });
}

function applySpecialOrderFlag(on) {
  adminState.specialOrder = on;
  document.querySelectorAll('.cta-col').forEach(col => {
    const parent = col.parentNode;
    const banner = parent.querySelector(':scope > .special-order-banner');
    if (on && !banner) {
      const el = document.createElement('div');
      el.className = 'special-order-banner';
      el.innerHTML = '⏱ <strong>Note:</strong> This item is ordered in as required, please allow 5-7 business days before item is ready';
      parent.insertBefore(el, col);
    } else if (!on && banner) {
      banner.remove();
    }
  });
}

// ---- Ex-Demo / Factory Seconds (B-Stock) ----
// A CTA next to price that opens a modal with 2-3 placeholder ex-demo/factory-second/
// sellable-return options, priced as a discount off whatever the page's real current price
// is (read live from .price-now, so it tracks variant/colour switches automatically).
const EXDEMO_STORES = ['Moorebank, NSW', 'Castle Hill, NSW', 'North Lakes, QLD', 'Smeaton Grange, NSW'];
const EXDEMO_OPTION_SPECS = [
  { tag: 'Ex-Demo', cut: 0.30 },
  { tag: 'Sellable Return', cut: 0.22 },
  { tag: 'Factory Second', cut: 0.15 }
];

function fmtAud(n) { return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function buildExdemoOptions(basePrice) {
  return EXDEMO_OPTION_SPECS.map((spec, i) => {
    const price = Math.max(5, Math.round((basePrice * (1 - spec.cut)) / 5) * 5);
    const collectOnly = basePrice > 500 && i === 0;
    const store = EXDEMO_STORES[i % EXDEMO_STORES.length];
    return {
      tag: spec.tag,
      price,
      was: basePrice,
      note: collectOnly ? `Collect only — on display at ${store}` : `Shipping available · currently at ${store}`
    };
  });
}

function buildExdemoModal() {
  if (document.getElementById('exdemoBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'exdemoBackdrop';
  backdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-head">
        <div><h3>Ex-Demo &amp; Factory Seconds</h3><p id="exdemoModalSub"></p></div>
        <button type="button" class="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body" id="exdemoModalBody"></div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeExdemoModal(); });
  backdrop.querySelector('.modal-close').addEventListener('click', closeExdemoModal);
}

function closeExdemoModal() {
  const backdrop = document.getElementById('exdemoBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

function openExdemoModal(basePrice, productTitle, imageSrc) {
  const backdrop = document.getElementById('exdemoBackdrop');
  if (!backdrop) return;
  document.getElementById('exdemoModalSub').textContent = `${productTitle} — sold as-is, inspected and covered by our standard guarantee.`;
  document.getElementById('exdemoModalBody').innerHTML = buildExdemoOptions(basePrice).map(o => `
    <div class="exdemo-option">
      ${imageSrc ? `<img class="eo-img" src="${imageSrc}" alt="${productTitle}">` : ''}
      <div class="eo-info">
        <span class="eo-tag">${o.tag}</span>
        <div><span class="eo-price">${fmtAud(o.price)}</span><span class="eo-was">${fmtAud(o.was)}</span></div>
        <div class="eo-note">${o.note}</div>
      </div>
      <button type="button" class="btn btn-outline">View Item</button>
    </div>
  `).join('');
  backdrop.classList.add('open');
}

function currentPagePrice(block) {
  const nowEl = block.querySelector('.price-now');
  if (!nowEl) return 0;
  return parseFloat(nowEl.textContent.replace(/[^0-9.]/g, '')) || 0;
}

function applyExdemoFlag(on) {
  adminState.exdemo = on;
  document.querySelectorAll('.price-block').forEach(block => {
    const parent = block.parentNode;
    let cta = parent.querySelector(':scope > .exdemo-cta');
    if (!on) {
      if (cta) cta.remove();
      return;
    }
    const basePrice = currentPagePrice(block);
    const from = buildExdemoOptions(basePrice).reduce((min, o) => Math.min(min, o.price), Infinity);
    if (!cta) {
      cta = document.createElement('button');
      cta.type = 'button';
      cta.className = 'exdemo-cta';
      cta.addEventListener('click', () => {
        const titleEl = document.querySelector('h1');
        const imgEl = document.querySelector('#mainImg, .gallery-main img');
        openExdemoModal(currentPagePrice(block), titleEl ? titleEl.textContent : 'This product', imgEl ? imgEl.src : '');
      });
      block.insertAdjacentElement('afterend', cta);
    }
    cta.innerHTML = `<span class="ex-label">🏷 Ex Demo / Factory Seconds — from ${fmtAud(from)}</span><span class="ex-arrow">›</span>`;
  });
}

// ---- Paid "Fitted" option (demo-preview only, 2026-09-10 client meeting) ----
// Client is enthusiastic about a paid professional-fitting upsell as a future real
// feature, but fitting costs aren't standardized store-to-store yet, so this previews
// the *concept* only — neither mode is wired to real cart/checkout totals. Applies only
// on templates with a .variant-picker (config-variant, vehicle-specific).
const FITTED_PRICE_ADD = 199;

function buildFittedCard() {
  const el = document.createElement('div');
  el.className = 'variant-option fitted-option';
  el.dataset.fittedCard = 'true';
  el.innerHTML = `
    <div class="radio"></div>
    <div class="v-label">Get It Fitted</div>
    <div class="v-price">+ ${fmtAud(FITTED_PRICE_ADD)}</div>
    <div class="v-note">Professionally installed by our nationwide fit network — booked after checkout.</div>
  `;
  el.addEventListener('click', () => {
    const picker = el.parentElement;
    const wasSelected = el.classList.contains('selected');
    picker.querySelectorAll(':scope > .variant-option').forEach(o => o.classList.remove('selected'));
    if (!wasSelected) el.classList.add('selected');
    else picker.querySelector(':scope > .variant-option:not([data-fitted-card])')?.classList.add('selected');
  });
  return el;
}

// Re-injects whichever Fitted-option UI is currently toggled on. Safe to call after any
// page re-render (variant switch clears .variant-picker's innerHTML, wiping the injected
// card) — pages with a .variant-picker should call this at the end of their own
// renderAll(), same convention as reapplySaleFlag().
function reapplyFittedOption() {
  document.querySelectorAll('.variant-picker [data-fitted-card]').forEach(el => el.remove());
  document.querySelectorAll('.cta-col .fitted-upsell-checkbox').forEach(el => el.remove());
  if (!adminState.fittedOption) return;
  if (adminState.fittedMode === 'checkbox') {
    document.querySelectorAll('.cta-col').forEach(col => {
      const btn = col.querySelector('[data-cta-label]');
      if (!btn) return;
      const label = document.createElement('label');
      label.className = 'fitted-upsell-checkbox';
      label.innerHTML = `<input type="checkbox"><span><strong>Get It Fitted</strong> — add professional installation for <strong>+${fmtAud(FITTED_PRICE_ADD)}</strong><span class="fitted-sub">Booked after checkout.</span></span>`;
      btn.insertAdjacentElement('beforebegin', label);
    });
  } else {
    document.querySelectorAll('.variant-picker').forEach(picker => picker.appendChild(buildFittedCard()));
  }
}

function setFittedOptionFlag(on) {
  adminState.fittedOption = on;
  reapplyFittedOption();
}

function setFittedOptionMode(mode) {
  adminState.fittedMode = mode;
  reapplyFittedOption();
}

// ---- Fitted Photos Gallery placement A/B preview (2026-09-10 client ask, corrected 2026-09-10) ----
// Moves the real installation-photos section (#fitGallerySection — "See it fitted to a
// [vehicle] just like yours", vehicle-specific only) between its full-width home spot
// (#fitGalleryHomeSlot, above the tabs) and a slot nested in the gallery column, under the
// main product gallery/thumbs/install row (#fitGalleryNestedSlot). This does NOT move the
// Main Product Gallery itself — an earlier version of this toggle did that by mistake.
function applyFitGalleryPlacement(mode) {
  const section = document.getElementById('fitGallerySection');
  const homeSlot = document.getElementById('fitGalleryHomeSlot');
  const nestedSlot = document.getElementById('fitGalleryNestedSlot');
  if (!section || !homeSlot || !nestedSlot) return;
  adminState.fitGalleryPlacement = mode;
  section.classList.toggle('nested', mode === 'nested');
  if (mode === 'nested') {
    nestedSlot.appendChild(section);
  } else {
    homeSlot.appendChild(section);
  }
}

// Red background toggle for the Fitted Photos Gallery panel (2026-09-10 client ask) —
// the live site currently ships this panel on a red background; the new design defaults
// to a neutral panel instead, with this toggle available to preview the red version for
// stakeholder comparison. Independent of the placement toggle above.
function applyFitGalleryRedFlag(on) {
  const panel = document.getElementById('fitGalleryPanel');
  if (!panel) return;
  adminState.fitGalleryRed = on;
  panel.classList.toggle('red', on);
}

// Fitted Photos Gallery carousel — horizontal scroll-snap track with prev/next nav and
// page dots (click a dot to jump to that page; scrolling updates the active dot). Mirrors
// initGalleryCarousels()'s overflow-detection convention but adds dot pagination, since
// this widget's reference design calls for it and the main product gallery's doesn't.
function initFitGalleryCarousel() {
  const track = document.getElementById('fitGalleryTrack');
  const dotsWrap = document.getElementById('fitGalleryDots');
  const carousel = track ? track.closest('.fit-gallery-carousel') : null;
  const prev = document.querySelector('.fit-gallery-nav.prev');
  const next = document.querySelector('.fit-gallery-nav.next');
  if (!track || !dotsWrap || !carousel) return;

  let pageCount = 1;

  function renderDots() {
    const width = track.clientWidth || 1;
    pageCount = Math.max(1, Math.round(track.scrollWidth / width));
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pageCount; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'fit-gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to photo set ${i + 1} of ${pageCount}`);
      dot.addEventListener('click', () => track.scrollTo({ left: i * width, behavior: 'smooth' }));
      dotsWrap.appendChild(dot);
    }
    dotsWrap.hidden = pageCount <= 1;
    updateNav();
  }

  function updateNav() {
    const width = track.clientWidth || 1;
    const scrollable = track.scrollWidth > width + 2;
    carousel.classList.toggle('has-overflow', scrollable);
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= track.scrollWidth - width - 2;
    const active = Math.min(pageCount - 1, Math.round(track.scrollLeft / width));
    dotsWrap.querySelectorAll('.fit-gallery-dot').forEach((d, i) => d.classList.toggle('active', i === active));
  }

  prev?.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }));
  track.addEventListener('scroll', () => { clearTimeout(track._dotTimer); track._dotTimer = setTimeout(updateNav, 60); });
  window.addEventListener('resize', renderDots);
  new ResizeObserver(renderDots).observe(track);
  renderDots();
}

// Generic copy-to-clipboard for SKU buttons — [data-copy] holds a literal value; on pages
// where the SKU changes at runtime (variant/colour switch), [data-copy-source] instead
// names a selector to read the current value from at click time.
function initCopyButtons() {
  document.querySelectorAll('[data-copy], [data-copy-source]').forEach(btn => {
    if (btn.dataset.copyBound) return;
    btn.dataset.copyBound = 'true';
    btn.addEventListener('click', () => {
      const text = btn.dataset.copySource
        ? (document.querySelector(btn.dataset.copySource)?.textContent || '').trim()
        : btn.dataset.copy;
      if (!text) return;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
      const original = btn.dataset.originalLabel !== undefined ? btn.dataset.originalLabel : (btn.dataset.originalLabel = btn.innerHTML);
      btn.innerHTML = '✓ Copied';
      btn.classList.add('copied');
      clearTimeout(btn._copyTimer);
      btn._copyTimer = setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove('copied');
      }, 1400);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildExdemoModal();
  initCopyButtons();
  initFitGalleryCarousel();
});

function buildAdminPanel() {
  const needsVehicleDemo = !!document.querySelector('[data-fitment-slot]');
  const hasVariantPicker = !!document.querySelector('.variant-picker');
  const hasFitGalleryPlacementToggle = !!document.getElementById('fitGallerySection') && !!document.getElementById('fitGalleryNestedSlot');
  const initialVideo = detectInitialVideoState();
  const initialSale = detectInitialSaleState();
  const initialShipping = detectInitialShippingState();
  const initialCollect = detectInitialCollectState();
  Object.assign(adminState, { video: initialVideo, sale: initialSale, stockStatus: 'in_stock', stockOverride: false, shipping: initialShipping, collect: initialCollect, specialOrder: false, exdemo: false, fittedOption: false, fittedMode: 'card', fitGalleryPlacement: 'full', fitGalleryRed: false });

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'admin-fab';
  fab.setAttribute('aria-label', 'Open demo state panel');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Demo State';

  const panel = document.createElement('div');
  panel.className = 'admin-panel';
  panel.innerHTML = `
    <div class="admin-panel-head">
      <span>Demo State Panel</span>
      <button type="button" class="admin-close" aria-label="Close">&times;</button>
    </div>
    <div class="admin-panel-body">
      ${needsVehicleDemo ? `
      <div class="admin-section">
        <h5>Session Vehicle</h5>
        <div class="admin-vehicle-row">
          <button type="button" data-demo-vehicle="none">No vehicle set</button>
          <button type="button" data-demo-vehicle="match">Hilux N80 (matches)</button>
          <button type="button" data-demo-vehicle="mismatch">Ford Ranger (doesn't match)</button>
        </div>
      </div>` : ''}
      <div class="admin-section">
        <h5>Product State</h5>
        <label class="admin-toggle"><span>Product has video</span><input type="checkbox" data-admin-flag="video" ${initialVideo ? 'checked' : ''}></label>
        <label class="admin-toggle"><span>Product is on sale</span><input type="checkbox" data-admin-flag="sale" ${initialSale ? 'checked' : ''}></label>
        <div class="admin-toggle-label"><span>Stock status</span></div>
        <div class="admin-radio-row">
          <label><input type="radio" name="stockStatus" value="in_stock" checked> In Stock</label>
          <label><input type="radio" name="stockStatus" value="low_stock"> Low Stock</label>
          <label><input type="radio" name="stockStatus" value="not_in_stock"> Not in Stock — contact our team</label>
        </div>
        <label class="admin-toggle"><span>Shipping available</span><input type="checkbox" data-admin-flag="shipping" ${initialShipping ? 'checked' : ''}></label>
        <label class="admin-toggle"><span>Click &amp; Collect available</span><input type="checkbox" data-admin-flag="collect" ${initialCollect ? 'checked' : ''}></label>
        <label class="admin-toggle"><span>Special order item</span><input type="checkbox" data-admin-flag="specialOrder"></label>
        <label class="admin-toggle"><span>B-Stock / Ex-Demo available</span><input type="checkbox" data-admin-flag="exdemo"></label>
      </div>
      ${hasVariantPicker ? `
      <div class="admin-section">
        <h5>Paid "Fitted" Option <span class="admin-note">(demo preview only)</span></h5>
        <label class="admin-toggle"><span>Show paid Fitted option</span><input type="checkbox" data-admin-flag="fittedOption"></label>
        <div class="admin-radio-row">
          <label><input type="radio" name="fittedMode" value="card" checked> Mode 1 — third variant card</label>
          <label><input type="radio" name="fittedMode" value="checkbox"> Mode 2 — upsell checkbox</label>
        </div>
      </div>` : ''}
      ${hasFitGalleryPlacementToggle ? `
      <div class="admin-section">
        <h5>Fitted Photos Gallery <span class="admin-note">(layout preview)</span></h5>
        <label class="admin-toggle"><span>Red background (live-site style)</span><input type="checkbox" data-admin-flag="fitGalleryRed"></label>
        <div class="admin-radio-row">
          <label><input type="radio" name="fitGalleryPlacement" value="full" checked> Full width — above tabs</label>
          <label><input type="radio" name="fitGalleryPlacement" value="nested"> Nested — under main gallery</label>
        </div>
      </div>` : ''}
    </div>
  `;

  document.body.appendChild(panel);
  document.body.appendChild(fab);

  fab.addEventListener('click', () => panel.classList.add('open'));
  panel.querySelector('.admin-close').addEventListener('click', () => panel.classList.remove('open'));

  panel.querySelectorAll('[data-admin-flag]').forEach(input => {
    input.addEventListener('change', () => {
      const on = input.checked;
      switch (input.dataset.adminFlag) {
        case 'video': applyVideoFlag(on); break;
        case 'sale': setSaleFlag(on); break;
        case 'shipping':
        case 'collect':
          applyAvailabilityFlags(
            panel.querySelector('[data-admin-flag="shipping"]').checked,
            panel.querySelector('[data-admin-flag="collect"]').checked
          );
          break;
        case 'specialOrder': applySpecialOrderFlag(on); break;
        case 'exdemo': applyExdemoFlag(on); break;
        case 'fittedOption': setFittedOptionFlag(on); break;
        case 'fitGalleryRed': applyFitGalleryRedFlag(on); break;
      }
    });
  });

  panel.querySelectorAll('input[name="stockStatus"]').forEach(input => {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      adminState.stockOverride = true;
      applyStockStatus(input.value);
    });
  });

  panel.querySelectorAll('input[name="fittedMode"]').forEach(input => {
    input.addEventListener('change', () => { if (input.checked) setFittedOptionMode(input.value); });
  });

  panel.querySelectorAll('input[name="fitGalleryPlacement"]').forEach(input => {
    input.addEventListener('change', () => { if (input.checked) applyFitGalleryPlacement(input.value); });
  });

  if (needsVehicleDemo) initFitmentDemo('match');
  reapplySaleFlag();
  reapplyFittedOption();
}

document.addEventListener('DOMContentLoaded', buildAdminPanel);
