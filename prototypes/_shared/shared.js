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

// Vehicle slug/ID for the sticky-bar copy-to-clipboard icon (2026-09-11, backlog item 10)
// — no real per-vehicle slug/ID field exists in the data model yet, so this is derived
// from PRODUCT_FITMENT the same way a URL slug would be, same demo-data caveat as
// DEMO_VEHICLES below.
const VEHICLE_SLUG = `${PRODUCT_FITMENT.vehicle_make}-${PRODUCT_FITMENT.vehicle_model}-${PRODUCT_FITMENT.vehicle_generation}`.toLowerCase().replace(/\s+/g, '-');

// body_style/roof_type (2026-09-10, Graham Sowerby meeting) — added so the "doesn't fit"
// message can name the customer's saved vehicle's full spec, not just its name (two
// vehicles can share a make/model/generation but differ by roof/rail type). No real
// per-customer vehicle data source exists at prototype stage, so these are demo values,
// same caution as the rest of this file's fabricated data.
const DEMO_VEHICLES = {
  none: null,
  match: { make: "Toyota", model: "Hilux", generation: "N80", year: 2022, body_style: "4dr Ute", roof_type: "Bare Roof" },
  mismatch: { make: "Ford", model: "Ranger", generation: "P703", year: 2023, body_style: "4dr Ute", roof_type: "Bare Roof" }
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
    detail: `This product suits ${PRODUCT_FITMENT.vehicle_make} ${PRODUCT_FITMENT.vehicle_model} ${PRODUCT_FITMENT.vehicle_generation} (${PRODUCT_FITMENT.vehicle_years}). Set your vehicle to confirm an exact fit before ordering.`,
    cta: "Select Your Vehicle",
    actions: ["Select your vehicle"]
  },
  no_fit: {
    label: "Doesn't fit your vehicle",
    // A function, not a static string (2026-09-10, Graham Sowerby meeting) — needs the
    // customer's full saved vehicle spec (body style, roof type, year), not just its name,
    // since two vehicles can share a make/model/generation but differ by roof/rail type.
    detail: (vehicle) => `This product is built for ${PRODUCT_FITMENT.vehicle_make} ${PRODUCT_FITMENT.vehicle_model} ${PRODUCT_FITMENT.vehicle_generation} — not your ${vehicle.make} ${vehicle.model} ${vehicle.generation} (${vehicle.body_style}, ${vehicle.roof_type}, ${vehicle.year}).`,
    cta: "Find The Right Fit",
    actions: ["Change vehicle", "Find the right fit"]
  }
};

function renderFitmentHTML(state, vehicle, mode) {
  const c = FITMENT_COPY[state];
  const icon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h1zm2.1-4l-1.2 4h12.2l-1.2-4a1 1 0 0 0-.9-.5H8a1 1 0 0 0-.9.5zM7 15.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>`;
  // Compact + copy-to-clipboard variants (2026-09-11, backlog item 10) — the two condensed
  // sticky bars get no detail sentence/actions (there's no room at that width, and the
  // full explanation already showed once in the main decision-panel card above). The
  // desktop persistent bar has room for icon + short label ("compact"); the mobile sticky
  // bar is tighter still (competing with the new product-name block) so it's icon-only
  // there, same "icon only, tooltip carries the caption" convention already used for the
  // Rack Fit Guarantee badge. Icon doubles as a click-to-copy button for the vehicle
  // slug/ID in both; the main card keeps a plain, non-interactive icon plus its full copy.
  // See applyFitmentState() below for which slots opt into which mode via
  // [data-fitment-copyable]'s value.
  if (mode === 'icon-only') {
    return `<span class="dot dot-copy" data-vehicle-copy="${VEHICLE_SLUG}" role="button" tabindex="0" title="${c.label} — click to copy vehicle ID">${icon}</span>`;
  }
  if (mode === 'compact') {
    return `
      <span class="dot dot-copy" data-vehicle-copy="${VEHICLE_SLUG}" role="button" tabindex="0" title="Click to copy vehicle ID">${icon}</span>
      <strong>${c.label}</strong>
    `;
  }
  const detail = typeof c.detail === 'function' ? c.detail(vehicle) : c.detail;
  const actions = c.actions.length
    ? `<div class="actions">${c.actions.map(a => `<button type="button">${a}</button>`).join("")}</div>`
    : "";
  return `
    <span class="dot">${icon}</span>
    <div>
      <strong>${c.label}</strong>
      ${detail}
      ${actions}
    </div>
  `;
}

function applyFitmentState(state, vehicle) {
  const c = FITMENT_COPY[state];
  document.querySelectorAll('[data-fitment-slot]').forEach(el => {
    el.className = el.className.replace(/\b(fits|unknown|no_fit)\b/g, '').trim();
    el.classList.add(state);
    el.innerHTML = renderFitmentHTML(state, vehicle, el.dataset.fitmentCopyable);
    // Rack Fit Guarantee badge (2026-09-10) only makes sense when the vehicle is
    // actually confirmed to fit — hide it for "confirm your vehicle"/"doesn't fit".
    const badge = el.nextElementSibling;
    if (badge && (badge.classList.contains('rack-fit-badge') || badge.classList.contains('rack-fit-badge-icon'))) {
      badge.hidden = state !== 'fits';
    }
  });
  document.querySelectorAll('[data-cta-label]').forEach(btn => {
    btn.textContent = c.cta;
    btn.classList.toggle('btn-outline', state !== 'fits');
    btn.classList.toggle('btn-primary', state === 'fits');
  });
  initVehicleIdCopy();
}

// Vehicle ID copy-to-clipboard (2026-09-11, backlog item 10) — bound fresh every time
// applyFitmentState() re-renders a [data-fitment-copyable] slot's innerHTML (re-binding
// is cheap and dataset.copyBound guards against double-binding on unaffected slots).
// A dedicated handler rather than the generic .sku-copy convention in initCopyButtons()
// above: that one replaces the clicked element's own textContent with "✓ Copied", which
// would blank out this element's <svg> icon instead of giving visible feedback.
function initVehicleIdCopy() {
  document.querySelectorAll('[data-vehicle-copy]').forEach(el => {
    if (el.dataset.copyBound) return;
    el.dataset.copyBound = 'true';
    const activate = () => {
      const text = el.dataset.vehicleCopy || '';
      if (!text) return;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
      el.classList.add('copied');
      clearTimeout(el._copyTimer);
      el._copyTimer = setTimeout(() => el.classList.remove('copied'), 1400);
    };
    el.addEventListener('click', activate);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
}

function initFitmentDemo(defaultKey = 'match') {
  const buttons = document.querySelectorAll('[data-demo-vehicle]');
  function set(key) {
    const vehicle = DEMO_VEHICLES[key];
    const state = getFitmentStatus(PRODUCT_FITMENT, vehicle);
    applyFitmentState(state, vehicle);
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

// Delivery / Click & Collect widget — the single postcode field shared across both tabs
// (2026-09-10 rework: was two separate, unsynced inputs), starts empty (2026-09-10 follow-up
// — a prefilled demo postcode read as real customer data it isn't). The "Update" button is a
// light demo re-trigger against the same static data (no real geocoding), which swaps the
// copy on the Click & Collect view-all line between the two states below, AND — since
// showing named stores or delivery rates with no postcode entered implied a real match that
// wasn't real — hides BOTH panels' results entirely until a postcode is actually typed in
// (corrected 2026-09-10, second follow-up: Delivery was originally left showing regardless,
// same bug the Collect tab had already been fixed for). The "In stock and on display in N
// stores — View all stores" line stays visible either way; only the named store rows are
// gated. Delivery's `.dc-postcode-prompt` swaps places with its results the same way.
//
// Backlog item 13 (2026-09-11): a second `.dc-widget` now also lives at the top of the
// Shipping Info tab on every template, so this function runs once per widget on the page
// (root.querySelectorAll below). Committing a postcode in either one calls syncDcPostcode()
// below, which mirrors the value into every other `.dc-widget` and re-runs their own
// update() — "pre-filled if a postcode was entered anywhere else in the session" applies
// live, in both directions, not just once at load. The postcode input is found via
// `[data-dc-postcode]` (not an id) since a page can now carry more than one.
function initDcPostcode(root = document) {
  root.querySelectorAll('.dc-widget').forEach(widget => {
    const input = widget.querySelector('[data-dc-postcode]');
    const btn = widget.querySelector('[data-dc-update]');
    const line = widget.querySelector('.dc-viewall-line');
    const collectResults = widget.querySelector('[data-dc-panel="collect"] .dc-results');
    const deliveryResults = widget.querySelector('[data-dc-panel="delivery"] .dc-results');
    const deliveryPrompt = widget.querySelector('[data-dc-panel="delivery"] .dc-postcode-prompt');
    if (!input || !btn) return;
    // Region Selector (2026-09-11, backlog item 21): NZ/UK are single-store demo regions
    // with no real postcode-matched store data (the named `.dc-store` rows and 100km-radius
    // copy are all real AU network content) — while either is selected, the line always
    // shows the fixed single-store copy and named results stay hidden regardless of what's
    // typed, rather than searching AU postcodes against a region that isn't AU.
    const update = () => {
      const val = input.value.trim();
      if (line) {
        if (currentRegion !== 'AU') {
          // No trailing " — " here (unlike the AU branch below) since the "View all
          // stores" link that dash used to lead into is hidden for single-store regions.
          const singleStore = REGION_SINGLE_STORES[currentRegion];
          line.firstChild.textContent = singleStore.onDisplay
            ? `On display at the ${singleStore.name} Store`
            : `In stock at the ${singleStore.name} Store`;
        } else {
          line.firstChild.textContent = val
            ? `Showing stores within 100km of ${val} — `
            : `In stock and on display in ${rrgStoreCount()} stores — `;
        }
      }
      const regionOk = currentRegion === 'AU';
      if (collectResults) collectResults.hidden = !val || !regionOk;
      if (deliveryResults) deliveryResults.hidden = !val || !regionOk;
      if (deliveryPrompt) deliveryPrompt.hidden = !!val && regionOk;
    };
    input._dcUpdate = update;
    const commit = () => syncDcPostcode(input.value.trim());
    btn.addEventListener('click', commit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
    update();
  });
}

// Mirrors a postcode typed into any one `.dc-widget` into every other one on the page (see
// initDcPostcode() above) and, AU-only, re-renders the Store Slide-out's "Within 100km"
// grouping (backlog item 14 — see renderStoreSlideoutBody()/postcodeToState() below) so it
// reflects whatever postcode is currently live, without needing separate wiring.
function syncDcPostcode(value) {
  document.querySelectorAll('.dc-widget [data-dc-postcode]').forEach(input => {
    input.value = value;
    if (input._dcUpdate) input._dcUpdate();
  });
  renderStoreSlideoutBody(currentRegion === 'AU' ? postcodeToState(value) : null);
}

// Real AU postcode-digit ranges (Australia Post's own zoning, not a fabricated guess) — used
// only to work out which state's stores to promote into the Store Slide-out's "Within 100km"
// group (backlog item 14). This is genuine postal-district logic, not literal distance/
// geocoding, which this prototype has never had (same flagged gap as the Showroom map's own
// postcode search) — same "demo precision, real underlying relationship" convention as the
// rest of this project's store data.
function postcodeToState(postcode) {
  const trimmed = String(postcode || '').trim();
  if (!/^\d{4}$/.test(trimmed)) return null;
  const n = parseInt(trimmed, 10);
  if (n >= 2600 && n <= 2618) return 'Australian Capital Territory';
  if (n >= 2900 && n <= 2920) return 'Australian Capital Territory';
  if (n >= 1000 && n <= 2999) return 'New South Wales';
  if ((n >= 3000 && n <= 3999) || (n >= 8000 && n <= 8999)) return 'Victoria';
  if ((n >= 4000 && n <= 4999) || (n >= 9000 && n <= 9999)) return 'Queensland';
  if (n >= 5000 && n <= 5999) return 'South Australia';
  if (n >= 6000 && n <= 6999) return 'Western Australia';
  if (n >= 7000 && n <= 7999) return 'Tasmania';
  if (n >= 800 && n <= 999) return 'Northern Territory';
  return null;
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
  initDcPostcode();
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

const adminState = { video: true, sale: true, stock: true, shipping: true, collect: true, exdemo: false, fittedOption: false, fittedMode: 'card', fitGalleryPlacement: 'full', fitGalleryRed: false, fitGallery: true, vehicleFitNotes: false };

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

// Showroom Finder is now standard on every template (client ask, 2026-09-10) — the
// Demo State Panel toggle previews the case where a given SKU isn't on display anywhere,
// rather than gating whether the section exists at all.
function applyShowroomFlag(on) {
  adminState.showroom = on;
  const section = document.getElementById('showroom');
  if (section) section.hidden = !on;
}

function detectInitialFitGalleryState() {
  return !!document.getElementById('fitGallerySection');
}

// Fitment Gallery on/off (2026-09-10, Graham Sowerby meeting; count thresholds added
// 2026-09-11, backlog item 17) — toggle previews a vehicle with no real Fitment Gallery:
// hides the section itself and swaps the Get It Installed CTA back to the generic fallback
// copy, so the two stay in sync rather than showing a changed CTA next to a gallery that's
// still there. Count itself branches three ways: a real 5+ count is worth naming ("We've
// fitted this N times"), 1-4 is technically real but too small to read as an impressive
// number so it's dropped ("See real fitments"), and a gallery that exists but has zero
// fitments has nothing to show at all — same literal "Get It Installed" copy and external
// fallback link as the no-gallery-at-all state below, just kept as its own branch since it's
// a genuinely different scenario (gallery present vs. gallery absent).
function applyFitGalleryFlag(on) {
  adminState.fitGallery = on;
  const section = document.getElementById('fitGallerySection');
  if (section) section.hidden = !on;
  const cta = document.querySelector('.install-cta-panel .btn');
  if (!cta) return;
  const count = section ? parseInt(section.dataset.count, 10) || 0 : 0;
  const fallbackLink = () => {
    cta.href = '/roof-rack-installation-and-fitting-costs';
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
  };
  if (on && count >= 5) {
    cta.textContent = `We've fitted this ${count} times — view the gallery`;
    cta.href = '#fitGallerySection';
    cta.removeAttribute('target');
    cta.removeAttribute('rel');
  } else if (on && count > 0) {
    cta.textContent = 'See real fitments';
    cta.href = '#fitGallerySection';
    cta.removeAttribute('target');
    cta.removeAttribute('rel');
  } else if (on) {
    cta.textContent = 'Get It Installed';
    fallbackLink();
  } else {
    cta.textContent = 'See Fitting Options';
    fallbackLink();
  }
}

// Important Vehicle Fit Notes (2026-09-10, Graham Sowerby meeting) — variable-length,
// not present on every vehicle, so it's demo-toggled off by default (no real per-vehicle
// notes data source exists yet).
function applyVehicleFitNotesFlag(on) {
  adminState.vehicleFitNotes = on;
  const block = document.getElementById('vehicleFitNotes');
  if (block) block.hidden = !on;
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

// Payment-plan badge provider set, per region (backlog items 31/31a, 2026-09-11): AU keeps
// Afterpay + PayPal ("Pay in 4" each) + Zip (weekly rate); NZ drops Zip entirely (not offered
// there — array just has 2 entries, syncPaymentBadges() below hides whatever slot is left
// over generically); UK swaps to a different 3-provider set — Clearpay (Afterpay's UK/EU
// brand, same "Pay in 4" structure) + PayPal (same provider, but "Pay in 3" — ÷3 not ÷4) +
// Klarna (a separate "Pay in 3" provider from PayPal's own, kept as its own badge rather than
// merged/deduped, confirmed with Brenton). Zip's weekly-rate formula is unchanged from before
// this rework: approximates its real "as low as $X/week" widget as price/10 rounded up to the
// dollar, floored at $10.
function paymentBadgeSet(region) {
  const payIn4 = price => `4 payments of ${fmtAud(price / 4)}`;
  const payIn3 = price => `3 payments of ${fmtAud(price / 3)}`;
  const zipWeekly = price => `From ${regionCurrencySymbol()}${Math.max(10, Math.ceil(price / 10))} a week`;

  if (region === 'UK') {
    return [
      { src: 'clearpay.svg', alt: 'Clearpay', text: payIn4 },
      { src: 'paypal.svg', alt: 'PayPal', text: payIn3 },
      { src: 'klarna.svg', alt: 'Klarna', text: payIn3 }
    ];
  }
  if (region === 'NZ') {
    return [
      { src: 'afterpay.svg', alt: 'Afterpay', text: payIn4 },
      { src: 'paypal.svg', alt: 'PayPal', text: payIn4 }
    ];
  }
  return [
    { src: 'afterpay.svg', alt: 'Afterpay', text: payIn4 },
    { src: 'paypal.svg', alt: 'PayPal', text: payIn4 },
    { src: 'zip.svg', alt: 'Zip', text: zipWeekly, height: '13px' }
  ];
}

// Fills each of the 3 generic .payment-badge slots (logo + instalment text) from the current
// region's provider set — runs on load and after every price-changing render (via
// reapplySaleFlag()) and on every region switch (via applyRegion()), so it always reflects
// both the current price and the current region's provider set. A region with fewer than 3
// providers (NZ) just hides the leftover slot(s); the flex row re-centers on its own since
// .payment-badge{flex:1} + a hidden 3rd child collapses out of the layout with no gap.
function syncPaymentBadges(block) {
  const panel = block.closest('.decision-panel');
  const badges = panel && panel.querySelector('.payment-badges');
  if (!badges) return;
  const price = currentPagePrice(block);
  const set = paymentBadgeSet(currentRegion);
  badges.querySelectorAll('.payment-badge').forEach((el, i) => {
    const entry = set[i];
    el.hidden = !entry;
    if (!entry) return;
    const img = el.querySelector('.pb-logo');
    const text = el.querySelector('.pb-text');
    if (img) { img.src = `../_shared/payment-logos/${entry.src}`; img.alt = entry.alt; img.style.height = entry.height || ''; }
    if (text) text.textContent = entry.text(price);
  });
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

// Five real stock states (was a plain in-stock/out-of-stock boolean) — the decision
// panel's .stock-status-line reflects whichever is selected in the demo admin panel's
// "Stock status" radio group. Low Stock reads as a warning but doesn't block purchase;
// Not in Stock blocks it the same way the old "out of stock" toggle did. Special Order
// used to be a separate checkbox layered on top of whichever status was showing (backlog
// item 25 flagged this as contradictory, e.g. "✓ In Stock" plus an ordered-in banner at
// the same time) — folded in as a 4th mutually-exclusive value instead, so it fully
// replaces the label rather than sitting alongside it. Discontinued (backlog item 23,
// 2026-09-11) is a 5th value on the same principle — a discontinued item can't also be
// "In Stock," so it belongs in this same mutually-exclusive set rather than a separate
// toggle layered on top. ctaLabel drives the generic [data-cta-label] disabled-button
// text in applyStockStatus() below, so every blocksCta state can have its own wording
// without a special-cased branch.
const STOCK_STATUS = {
  in_stock: { text: '✓ In Stock', cls: 'in-stock', blocksCta: false, specialOrder: false },
  low_stock: { text: '⚠ Low Stock — order soon', cls: 'low-stock', blocksCta: false, specialOrder: false },
  not_in_stock: { text: '✕ Not in Stock — Contact our team', cls: 'not-in-stock', blocksCta: true, specialOrder: false, ctaLabel: 'Out Of Stock' },
  special_order: { text: '⏱ Special Order — Ships in 5-7 Days', cls: 'special-order', blocksCta: false, specialOrder: true },
  discontinued: { text: '⛔ Discontinued — No Longer Available', cls: 'discontinued', blocksCta: true, specialOrder: false, discontinued: true, ctaLabel: 'Discontinued' }
};

// Renders a .stock-status-line's base text/class from the current stock state, then
// appends the B-Stock/Ex-Demo suffix inline when that admin flag is on — e.g.
// "In Stock — Ex-Demo/Factory Seconds from $1,495" (UK: "In Stock — Graded from £1,495" —
// see exdemoCopy() below) with the price as a clickable link into the ex-demo slide-in
// drawer. Replaces the old standalone .exdemo-cta button (Graham Sowerby meeting,
// 2026-09-10: this needed to read as part of the stock line, not its own button-weight
// element). Re-run by applyRegion() too, so this text/wording flips live if the region
// switches while the drawer's trigger is already visible.
function renderStockLine(line) {
  const cfg = STOCK_STATUS[adminState.stockStatus] || STOCK_STATUS.in_stock;
  // Discontinued (2026-09-12, spec.md §12 item 35): the .discontinued-banner already
  // states the product is discontinued, so this line is hidden entirely instead of
  // duplicating that message — every other state clears `hidden` so it doesn't stay
  // stuck hidden after toggling back off Discontinued.
  line.hidden = !!cfg.discontinued;
  if (cfg.discontinued) return;
  line.className = 'stock-status-line ' + cfg.cls;
  line.textContent = cfg.text;
  if (!adminState.exdemo) return;
  const block = line.closest('.price-block');
  const basePrice = block ? currentPagePrice(block) : 0;
  const from = buildExdemoOptions(basePrice).reduce((min, o) => Math.min(min, o.price), Infinity);
  const link = document.createElement('a');
  link.href = '#';
  link.className = 'exdemo-inline-link';
  link.textContent = `${exdemoCopy().inline} from ${fmtAud(from)}`;
  link.addEventListener('click', e => {
    e.preventDefault();
    const titleEl = document.querySelector('h1');
    const imgEl = document.querySelector('#mainImg, .gallery-main img');
    openExdemoSlideout(basePrice, titleEl ? titleEl.textContent : 'This product', imgEl ? imgEl.src : '');
  });
  line.append(' — ', link);
}

function applyStockStatus(status) {
  adminState.stockStatus = status;
  const cfg = STOCK_STATUS[status] || STOCK_STATUS.in_stock;
  document.querySelectorAll('.stock-status-line').forEach(renderStockLine);
  document.querySelectorAll('.price-block').forEach(block => {
    block.classList.toggle('discontinued', !!cfg.discontinued);
  });
  document.querySelectorAll('.discontinued-alternates').forEach(el => {
    el.hidden = !cfg.discontinued;
  });
  document.querySelectorAll('.cta-col').forEach(col => {
    const parent = col.parentNode;
    const banner = parent.querySelector(':scope > .stock-banner');
    if (cfg.blocksCta && !cfg.discontinued && !banner) {
      const el = document.createElement('div');
      el.className = 'stock-banner';
      el.textContent = '✕ Currently out of stock';
      parent.insertBefore(el, col);
    } else if ((!cfg.blocksCta || cfg.discontinued) && banner) {
      banner.remove();
    }
    const specialBanner = parent.querySelector(':scope > .special-order-banner');
    if (cfg.specialOrder && !specialBanner) {
      const el = document.createElement('div');
      el.className = 'special-order-banner';
      el.innerHTML = '⏱ <strong>Note:</strong> This item is ordered in as required, please allow 5-7 business days before item is ready';
      parent.insertBefore(el, col);
    } else if (!cfg.specialOrder && specialBanner) {
      specialBanner.remove();
    }
    const discBanner = parent.querySelector(':scope > .discontinued-banner');
    if (cfg.discontinued && !discBanner) {
      const el = document.createElement('div');
      el.className = 'discontinued-banner';
      el.innerHTML = '⛔ This product has been discontinued and is no longer available for purchase — see similar alternatives below.';
      parent.insertBefore(el, col);
    } else if (!cfg.discontinued && discBanner) {
      discBanner.remove();
    }
    col.hidden = !!cfg.discontinued;
  });
  if (cfg.blocksCta) {
    document.querySelectorAll('[data-cta-label]').forEach(btn => {
      btn.disabled = true;
      btn.textContent = cfg.ctaLabel || 'Out Of Stock';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-outline');
    });
  } else {
    const activeVehicleBtn = document.querySelector('[data-demo-vehicle].active');
    if (activeVehicleBtn) {
      const vehicle = DEMO_VEHICLES[activeVehicleBtn.dataset.demoVehicle];
      applyFitmentState(getFitmentStatus(PRODUCT_FITMENT, vehicle), vehicle);
    } else {
      document.querySelectorAll('[data-cta-label]').forEach(btn => {
        btn.disabled = false;
        btn.textContent = 'Add To Cart';
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
      });
    }
  }
  // col.hidden just changed above (discontinued toggling hides/shows .cta-col) — re-sync
  // the compatibility banner, which must never show alongside a hidden CTA.
  applyCartConflict(adminState.cartConflict);
}

// Compatibility feature (backlog item 24, 2026-09-11 backlog) — simulates cart contents
// against the current PDP product, since this prototype has no real cart/session. Three
// states: no item in cart (default), a compatible item in cart (shown as a selectable
// state but renders nothing — nothing to warn about), and an incompatible item in cart
// (renders a non-blocking warning banner above Add to Cart, same insertion pattern as
// applyStockStatus()'s banners). The conflicting item's name/reason are read off
// data-conflict-item/data-conflict-reason on each template's own .cta-col rather than
// hardcoded here, so this function stays generic across all 5 templates — in a real
// Magento build this pair would come from a per-product compatibility rule the team sets,
// not a hardcoded string. Never disables the CTA — informational only, per spec.
function applyCartConflict(state) {
  adminState.cartConflict = state;
  document.querySelectorAll('.cta-col').forEach(col => {
    const parent = col.parentNode;
    const banner = parent.querySelector(':scope > .cart-conflict-banner');
    const show = state === 'incompatible' && !col.hidden;
    if (show && !banner) {
      const el = document.createElement('div');
      el.className = 'cart-conflict-banner';
      const item = col.dataset.conflictItem || 'an item';
      const reason = col.dataset.conflictReason || 'may not be fully compatible with this product';
      el.innerHTML = `Heads up — you also have <strong>${item}</strong> in your cart, which may not be compatible with this product (${reason}). You can still add this to your cart, just double-check compatibility before checkout.`;
      parent.insertBefore(el, col);
    } else if (!show && banner) {
      banner.remove();
    }
  });
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

// ---- Ex-Demo / Factory Seconds (B-Stock) ----
// A CTA next to price that opens a slide-in drawer (buildExdemoSlideout() below, backlog
// item 4: converted 2026-09-11 from a centered modal to match the Store Slide-out pattern)
// with 3 placeholder ex-demo/factory-second/sellable-return options, priced as a discount
// off whatever the page's real current price is (read live from .price-now, so it tracks
// variant/colour switches automatically). Each option's store name is region-aware —
// exdemoStoreName() below — rather than the old standalone fabricated EXDEMO_STORES list.
const EXDEMO_OPTION_SPECS = [
  { tag: 'Ex-Demo', cut: 0.30 },
  { tag: 'Sellable Return', cut: 0.22 },
  { tag: 'Factory Second', cut: 0.15 }
];

// regionCurrencySymbol() lives here (not just in the Region Selector section further down)
// since fmtAud() below and the per-template fmtMoney() helpers all need it and this file is
// parsed top-to-bottom before any of them can actually be called — `currentRegion` itself
// (declared later in the Region Selector section) is safe to reference here too, for the
// same reason: this is a plain function declaration (hoisted), and nothing calls it until
// after the whole script has finished executing.
function regionCurrencySymbol() { return currentRegion === 'UK' ? '£' : '$'; }

function fmtAud(n) { return regionCurrencySymbol() + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// UK (The Roof Box Company) calls this umbrella term "Graded" instead of "Ex-Demo/Factory
// Seconds" — confirmed 2026-09-11, backlog item 4 follow-up. UK-only; AU/NZ keep the
// original wording. The 3 individual option tags above (Ex-Demo/Sellable Return/Factory
// Second) are specific conditions, not this umbrella term, so they're unaffected in every
// region. Same safe-to-reference-currentRegion-here reasoning as regionCurrencySymbol().
function exdemoCopy() {
  return currentRegion === 'UK'
    ? { heading: 'Graded Stock', inline: 'Graded' }
    : { heading: 'Ex-Demo & Factory Seconds', inline: 'Ex-Demo/Factory Seconds' };
}

// Real store name per option, region-aware (RRG_STORE_NETWORK/REGION_SINGLE_STORES are both
// declared further down this file — safe to reference here for the same hoisting reason as
// regionCurrencySymbol() above). AU cycles through every real store (flattened + cached on
// first use); NZ/UK only have one region store, so all 3 options show that same one.
const STATE_ABBR = {
  'New South Wales': 'NSW', 'Victoria': 'VIC', 'South Australia': 'SA', 'Tasmania': 'TAS',
  'Queensland': 'QLD', 'Australian Capital Territory': 'ACT', 'Western Australia': 'WA'
};
let _exdemoAuStoreNames = null;
function exdemoStoreName(i) {
  if (currentRegion !== 'AU') return `${REGION_SINGLE_STORES[currentRegion].name}, ${currentRegion}`;
  if (!_exdemoAuStoreNames) {
    _exdemoAuStoreNames = RRG_STORE_NETWORK.flatMap(group =>
      group.stores.map(s => `${s.name}, ${STATE_ABBR[group.state] || group.state}`)
    );
  }
  return _exdemoAuStoreNames[i % _exdemoAuStoreNames.length];
}

function buildExdemoOptions(basePrice) {
  return EXDEMO_OPTION_SPECS.map((spec, i) => {
    const price = Math.max(5, Math.round((basePrice * (1 - spec.cut)) / 5) * 5);
    const collectOnly = basePrice > 500 && i === 0;
    const store = exdemoStoreName(i);
    return {
      tag: spec.tag,
      price,
      was: basePrice,
      note: collectOnly ? `Collect only — on display at ${store}` : `Shipping available · currently at ${store}`
    };
  });
}

// Right-edge slide-in drawer — same convention as buildStoreSlideout() below (one shared
// backdrop/drawer built once per page, reused on every open).
function buildExdemoSlideout() {
  if (document.getElementById('exdemoSlideoutBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'exdemo-slideout-backdrop';
  backdrop.id = 'exdemoSlideoutBackdrop';
  backdrop.innerHTML = `
    <div class="exdemo-slideout">
      <div class="exdemo-slideout-head">
        <div><h3 id="exdemoSlideoutTitle">Ex-Demo &amp; Factory Seconds</h3><p id="exdemoSlideoutSub"></p></div>
        <button type="button" class="exdemo-slideout-close" aria-label="Close">&times;</button>
      </div>
      <div class="exdemo-slideout-body" id="exdemoSlideoutBody"></div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeExdemoSlideout(); });
  backdrop.querySelector('.exdemo-slideout-close').addEventListener('click', closeExdemoSlideout);
}

function closeExdemoSlideout() {
  const backdrop = document.getElementById('exdemoSlideoutBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

function openExdemoSlideout(basePrice, productTitle, imageSrc) {
  const backdrop = document.getElementById('exdemoSlideoutBackdrop');
  if (!backdrop) return;
  document.getElementById('exdemoSlideoutTitle').textContent = exdemoCopy().heading;
  document.getElementById('exdemoSlideoutSub').textContent = `${productTitle} — sold as-is, inspected and covered by our standard guarantee.`;
  document.getElementById('exdemoSlideoutBody').innerHTML = buildExdemoOptions(basePrice).map(o => `
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
  document.querySelectorAll('.stock-status-line').forEach(renderStockLine);
}

// ---- Real store network (scraped 2026-09-10 from the live site's own Store Inventory
// slide-out, roofracksgalore.com.au — a real product's Click & Collect card, "View all
// Stock") ----
// Real names, addresses, phone numbers and Google Maps links for every physical store —
// store identity doesn't vary by product, so this is one canonical list shared by every
// template's Click & Collect widget, the store slide-out, and the Showroom Finder map,
// grouped by state to match the live site's own presentation. Per-store IN-STOCK/ORDER-IN
// status and the ON_DISPLAY_STORES set below are still demo/placeholder (no real per-SKU
// per-store stock feed exists) — same caution as the rest of this widget's data. `lat`/`lng`
// are approximate suburb-centre coordinates (demo precision, same caution), added 2026-09-11
// for the Showroom Finder map rework so every store can be plotted without a separate
// per-template pin list.
const RRG_STORE_NETWORK = [
  { state: "New South Wales", stores: [
    { name: "Moorebank", street: "12 Centenary Ave", city: "Moorebank", postcode: "2170", phone: "(02) 9053 8621", mapLink: "https://maps.app.goo.gl/371QHZWa4pDU4qzA7", lat: -33.95, lng: 150.93 },
    { name: "Smeaton Grange", street: "3/18 Exchange Parade", city: "Smeaton Grange", postcode: "2567", phone: "(02) 8215 7092", mapLink: "https://maps.app.goo.gl/Khp5w9LoxReciEho7", lat: -34.02, lng: 150.75 },
    { name: "Matraville", street: "35 Raymond Avenue", city: "Matraville", postcode: "2036", phone: "(02) 9159 6777", mapLink: "https://maps.app.goo.gl/U7Cfof4Wkkk77KqM8", lat: -33.965, lng: 151.225 },
    { name: "Warriewood", street: "3 Vuko Place", city: "Warriewood", postcode: "2102", phone: "(02) 8007 6177", mapLink: "https://maps.app.goo.gl/paxnS1CPK26xbeC59", lat: -33.688, lng: 151.298 },
    { name: "Silverwater", street: "1/104 Wetherill St N", city: "Silverwater", postcode: "2128", phone: "(02) 8007 6155", mapLink: "https://maps.app.goo.gl/NCofTPDD28BDfZRv5", lat: -33.84, lng: 151.05 },
    { name: "Miranda", street: "132 Wyralla Rd", city: "Miranda", postcode: "2228", phone: "(02) 9526 2777", mapLink: "https://goo.gl/maps/f3wCEmtgtHEGBPcn8", lat: -34.031, lng: 151.103 },
    { name: "Castle Hill", street: "3/8 Anella Avenue", city: "Castle Hill", postcode: "2154", phone: "(02) 9899 3256", mapLink: "https://goo.gl/maps/QebgyjaDAjpKVDw96", lat: -33.73, lng: 150.98 }
  ]},
  { state: "Victoria", stores: [
    { name: "Hoppers Crossing", street: "352 Old Geelong Road", city: "Hoppers Crossing", postcode: "3029", phone: "(03) 9015 8615", mapLink: "https://maps.app.goo.gl/HPHsUyA4yfpUVp8V6", lat: -37.877, lng: 144.694 },
    { name: "Frankston", street: "43 New Street", city: "Frankston", postcode: "3199", phone: "(03) 9015 8656", mapLink: "https://maps.app.goo.gl/tjTwH36rzw1oQJso6", lat: -38.146, lng: 145.123 },
    { name: "Preston", street: "3/1 Bell St", city: "Preston", postcode: "3072", phone: "(03) 9484 3447", mapLink: "https://goo.gl/maps/6DDmf3KREjGmqn8z8", lat: -37.740, lng: 145.005 },
    { name: "Geelong", street: "34/8 Lewalan St", city: "Grovedale", postcode: "3216", phone: "(03) 5221 3433", mapLink: "https://maps.app.goo.gl/NGfvQ9yKvYPv3hwq9", lat: -38.204, lng: 144.335 },
    { name: "Moorabbin", street: "6/265 - 269 Wickham Rd", city: "Moorabbin", postcode: "3189", phone: "(03) 9553 2799", mapLink: "https://goo.gl/maps/3bj1XdzQqReSdaJz7", lat: -37.939, lng: 145.048 },
    { name: "Hallam", street: "1/237 Princes Hwy", city: "Hallam", postcode: "3803", phone: "(03) 9703 1295", mapLink: "https://goo.gl/maps/sX8KjK28XqjC5BVMA", lat: -38.005, lng: 145.267 },
    { name: "Mitcham", street: "3/660 Whitehorse Rd", city: "Mitcham", postcode: "3132", phone: "(03) 9874 6261", mapLink: "https://goo.gl/maps/eqRzmAGA7RDZ7Go79", lat: -37.814, lng: 145.192 },
    { name: "Maidstone", street: "3/72 - 80 Hampstead Rd", city: "Maidstone", postcode: "3012", phone: "(03) 9318 5846", mapLink: "https://goo.gl/maps/gocCgS8Jk5tNZfw48", lat: -37.780, lng: 144.870 },
    { name: "Epping", street: "8/168 Jersey Dr", city: "Epping", postcode: "3076", phone: "(03) 7006 5180", mapLink: "https://goo.gl/maps/HGZxbcKqbiZeDjTE6", lat: -37.650, lng: 145.019 }
  ]},
  { state: "South Australia", stores: [
    { name: "Pooraka", street: "222 Bridge Road", city: "Pooraka", postcode: "5095", phone: "(08) 7078 4574", mapLink: "https://maps.app.goo.gl/qKNoRaN4etFaXJhd9", lat: -34.831, lng: 138.628 },
    { name: "Adelaide City", street: "37 Gilbert St", city: "Adelaide", postcode: "5000", phone: "(08) 8211 7600", mapLink: "https://goo.gl/maps/9DA31eWAsSPAgcCe9", lat: -34.928, lng: 138.601 },
    { name: "Lonsdale", street: "8/4 Aldenhoven Rd", city: "Lonsdale", postcode: "5160", phone: "(08) 7081 5535", mapLink: "https://goo.gl/maps/a9PHVjoo3PzQbaHj6", lat: -35.117, lng: 138.501 },
    { name: "Edinburgh", street: "1/5b Peachey Rd", city: "Edinburgh North", postcode: "5113", phone: "(08) 7081 5550", mapLink: "https://maps.app.goo.gl/KJxUWzc6gj2B6U1aA", lat: -34.708, lng: 138.667 }
  ]},
  { state: "Tasmania", stores: [
    { name: "Hobart", street: "134-136 Main Rd", city: "Moonah", postcode: "7009", phone: "(03) 6273 7555", mapLink: "https://goo.gl/maps/Cyi2N7UE4qvE5ZFb6", lat: -42.833, lng: 147.302 }
  ]},
  { state: "Queensland", stores: [
    { name: "Kedron", street: "Unit 1/14 Boothby Street", city: "Kedron", postcode: "4031", phone: "(07) 3350 3711", mapLink: "https://goo.gl/maps/FGRrDi9CrZS2", lat: -27.408, lng: 153.038 },
    { name: "East Brisbane", street: "46 Caswell St", city: "East Brisbane", postcode: "4169", phone: "(07) 3256 3630", mapLink: "https://goo.gl/maps/JAqUCMi5rYmZhZ1T7", lat: -27.480, lng: 153.045 },
    { name: "Sunshine Coast", street: "1/224 Nicklin Way", city: "Warana", postcode: "4575", phone: "(07) 5408 5040", mapLink: "https://goo.gl/maps/twjqFgLGGMXotKtcA", lat: -26.760, lng: 153.117 },
    { name: "Gold Coast", street: "3/10 Kamholtz Court", city: "Molendinar", postcode: "4214", phone: "(07) 5619 5800", mapLink: "https://g.page/roof-racks-galore-gold-coast?share", lat: -28.002, lng: 153.379 },
    { name: "Springwood", street: "3/11 Judds Court", city: "Slacks Creek", postcode: "4127", phone: "(07) 3103 8422", mapLink: "https://goo.gl/maps/GShsfi9yfoK2", lat: -27.664, lng: 153.150 },
    { name: "North Lakes", street: "1/74 Flinders Parade", city: "North Lakes", postcode: "4509", phone: "(07) 3103 8414", mapLink: "https://goo.gl/maps/VaQxwqVsnXw", lat: -27.226, lng: 153.019 },
    { name: "Burleigh Heads", street: "1/11 Hutchinson Street", city: "Burleigh Heads", postcode: "4220", phone: "(07) 5619 5822", mapLink: "https://maps.app.goo.gl/m9cdKVoTojrfBC82A", lat: -28.093, lng: 153.450 },
    { name: "Rocklea", street: "Unit 2/1620 Ipswich Road", city: "Rocklea", postcode: "4106", phone: "(07) 3277 5722", mapLink: "https://goo.gl/maps/HxDPHYUJnYm", lat: -27.539, lng: 153.007 }
  ]},
  { state: "Australian Capital Territory", stores: [
    { name: "Canberra", street: "107 Wollongong Street", city: "Fyshwick", postcode: "2609", phone: "(02) 6176 1909", mapLink: "https://goo.gl/maps/6EP4rtQWnJu9hrRBA", lat: -35.339, lng: 149.166 }
  ]},
  { state: "Western Australia", stores: [
    { name: "Joondalup", street: "Tenancy 4, 27-29 Sundew Rise", city: "Joondalup", postcode: "6027", phone: "(08) 9513 7225", mapLink: "https://goo.gl/maps/2Tnnk6qAgDCxcSBA9", lat: -31.744, lng: 115.766 },
    { name: "Osborne Park", street: "51 Frobisher Street", city: "Osborne Park", postcode: "6017", phone: "(08) 9444 5061", mapLink: "https://maps.app.goo.gl/zEvXaoWceNKR7TgeA", lat: -31.891, lng: 115.816 },
    { name: "Welshpool", street: "74 Dowd St", city: "Welshpool", postcode: "6106", phone: "(08) 9258 7663", mapLink: "https://maps.app.goo.gl/y6btYejbz9eQ39vD8", lat: -31.988, lng: 115.940 },
    { name: "Malaga", street: "9 Rowe St", city: "Malaga", postcode: "6090", phone: "(08) 6102 6767", mapLink: "https://maps.app.goo.gl/ZFEKHyycGL8YhgoE8", lat: -31.861, lng: 115.895 },
    { name: "Rockingham", street: "6B Leach Crescent", city: "Rockingham", postcode: "6168", phone: "(08) 6102 6722", mapLink: "https://maps.app.goo.gl/fvpWNyA1HTyT2Rwf7", lat: -32.277, lng: 115.729 }
  ]}
];

// Which stores show the "On Display" pill (this specific product is set up in-showroom
// there) — demo/placeholder, same two stores the Showroom Finder widget's copy already
// named before this rework, kept for continuity across the page.
const ON_DISPLAY_STORES = new Set(["Moorebank", "Castle Hill"]);

function rrgStoreCount() {
  return RRG_STORE_NETWORK.reduce((n, group) => n + group.stores.length, 0);
}

function rrgStorePillsHTML(name, status) {
  const statusPill = status === 'order'
    ? `<span class="stock-chip order">Order In — 1-2 Days</span>`
    : `<span class="stock-chip in">In Stock</span>`;
  const displayPill = ON_DISPLAY_STORES.has(name) ? `<span class="stock-chip display">On Display</span>` : '';
  return statusPill + displayPill;
}

// ---- Store slide-out ("View all stores", Click & Collect + Showroom Finder widgets,
// 2026-09-10) ----
// Lists the full real store network (RRG_STORE_NETWORK above), grouped by state to match
// the live site's own Store Inventory slide-out. Same once-per-page drawer convention as
// buildExdemoSlideout() above (both are right-edge slide-ins, independent of each other).
// Multiple triggers on one page (Click & Collect's link and, where present, the Showroom
// Finder's) all open the same drawer.
function buildStoreSlideout() {
  const triggers = document.querySelectorAll('[data-store-slideout]');
  if (!triggers.length || document.getElementById('storeSlideoutBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'store-slideout-backdrop';
  backdrop.id = 'storeSlideoutBackdrop';
  backdrop.innerHTML = `
    <div class="store-slideout">
      <div class="store-slideout-head">
        <h3>All Stores</h3>
        <button type="button" class="store-slideout-close" aria-label="Close">&times;</button>
      </div>
      <div class="store-slideout-body" id="storeSlideoutBody"></div>
    </div>
  `;
  document.body.appendChild(backdrop);
  renderStoreSlideoutBody(null);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeStoreSlideout(); });
  backdrop.querySelector('.store-slideout-close').addEventListener('click', closeStoreSlideout);
  triggers.forEach(trigger => trigger.addEventListener('click', e => { e.preventDefault(); openStoreSlideout(); }));
}

// Store slide-out body — split out from buildStoreSlideout() (2026-09-11, backlog item 14)
// so it can be re-run any time the shared postcode changes (see syncDcPostcode() above), not
// just once at page load. When `nearState` resolves (via postcodeToState()), that state's
// real stores are promoted into a "Within 100km" group at the top, open by default, and left
// out of the state list below so it isn't shown twice; every other state remains reachable
// below as a closed accordion group. With no `nearState` (no postcode yet, or a non-AU
// region), every state group renders open, matching this widget's original always-visible
// flat order. Native `<details>/<summary>`, same no-JS accordion convention as the FAQ
// section (`.faq-item` in shared.css).
function renderStoreSlideoutBody(nearState) {
  const body = document.getElementById('storeSlideoutBody');
  if (!body) return;
  const storeRowHTML = s => `
    <div class="dc-store">
      <div>
        <strong>${s.name}</strong>${rrgStorePillsHTML(s.name, 'in')}<br>
        <span class="muted">${s.street}, ${s.city} ${s.postcode}</span><br>
        <a class="store-phone" href="tel:${s.phone.replace(/[^0-9+]/g, '')}">${s.phone}</a>
        <a class="store-map-link" href="${s.mapLink}" target="_blank" rel="noopener noreferrer">View on map</a>
      </div>
    </div>
  `;
  const groupHTML = (label, stores, open) => `
    <details class="store-slideout-group"${open ? ' open' : ''}>
      <summary class="store-slideout-state">${label}</summary>
      <div class="store-slideout-group-stores">${stores.map(storeRowHTML).join('')}</div>
    </details>
  `;
  const nearGroup = nearState ? RRG_STORE_NETWORK.find(g => g.state === nearState) : null;
  let html = nearGroup ? groupHTML('Within 100km', nearGroup.stores, true) : '';
  RRG_STORE_NETWORK.forEach(group => {
    if (nearGroup && group.state === nearGroup.state) return;
    html += groupHTML(group.state, group.stores, !nearGroup);
  });
  body.innerHTML = html;
}

function openStoreSlideout() {
  const backdrop = document.getElementById('storeSlideoutBackdrop');
  if (backdrop) backdrop.classList.add('open');
}

function closeStoreSlideout() {
  const backdrop = document.getElementById('storeSlideoutBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

// ---- Interactive map (Showroom Finder widget, 2026-09-10 Graham Sowerby meeting; reworked
// 2026-09-11 per backlog item 22) ----
// Piloted on Vehicle-Specific only at first; locked in as the default and rolled out to all
// 5 templates the same day after client review. No longer a Demo State Panel preview toggle
// — called unconditionally from buildAdminPanel() wherever #showroomMap exists. Leaflet +
// OpenStreetMap tiles (free, no API key). Runs the map ALONGSIDE the existing black block
// (split-view), not as a full swap — corrected 2026-09-10 after the first version replaced
// the block outright, which lost the postcode entry / "Find Nearest Showroom" CTA. Real
// postcode-driven radius search isn't implemented (no geocoding service wired up) — the map
// shows a fixed demo view of the store network; flagged here as the gap to close before this
// leaves prototype stage.
//
// 2026-09-11 rework: pins now come straight from RRG_STORE_NETWORK (all 35 real stores,
// every state) instead of a separate 4-store-NSW-only demo list duplicated per template —
// the old per-template `window.SHOWROOM_MAP_STORES` arrays are gone. Default view is
// `fitBounds()` over every store (zoomed out to the whole country) rather than a fixed
// Sydney zoom. Pins are colour-coded red (on display, per ON_DISPLAY_STORES) vs grey (not)
// via a custom `L.divIcon` — no image assets needed. Leaflet.markercluster groups pins when
// zoomed out and splits them apart on zoom in; cluster bubbles are grey by default and red
// if any store inside has the product on display (`rrgClusterIcon()` below), so the "on
// display nearby" signal is visible before a viewer even zooms in.
// 2026-09-11 (Region Selector, backlog item 21): the map is now region-aware. AU keeps the
// full 35-store clustered network from the rework above; NZ/UK are single-store demo
// regions (RRG has no real stores there — this previews a hypothetical future expansion,
// not a real network) so the map just zooms to one always-on-display pin instead. See
// REGION_SINGLE_STORES below and applyRegion()/renderShowroomMapPins() further down.
let showroomLeafletMap = null;
let showroomPinLayer = null;

function rrgPinIcon(onDisplay) {
  return L.divIcon({
    className: `rrg-map-pin${onDisplay ? ' on-display' : ''}`,
    html: '<span></span>',
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -20]
  });
}

function rrgClusterIcon(cluster) {
  const markers = cluster.getAllChildMarkers();
  const hasDisplay = markers.some(m => m.options.rrgOnDisplay);
  return L.divIcon({
    className: `rrg-map-cluster${hasDisplay ? ' on-display' : ''}`,
    html: `<span>${cluster.getChildCount()}</span>`,
    iconSize: [36, 36]
  });
}

// Rebuilds whatever pins/clusters are currently on the map for the given region — called
// once on first map init and again every time the header region dropdown changes. Removes
// the previous pin layer first (region switches, not just initial load, can call this).
function renderShowroomMapPins(region) {
  if (!showroomLeafletMap) return;
  if (showroomPinLayer) {
    showroomLeafletMap.removeLayer(showroomPinLayer);
    showroomPinLayer = null;
  }
  if (region === 'AU') {
    const clusterGroup = typeof L.markerClusterGroup === 'function'
      ? L.markerClusterGroup({ iconCreateFunction: rrgClusterIcon, maxClusterRadius: 60 })
      : L.layerGroup();
    const latLngs = [];
    RRG_STORE_NETWORK.forEach(group => group.stores.forEach(s => {
      const onDisplay = ON_DISPLAY_STORES.has(s.name);
      L.marker([s.lat, s.lng], { icon: rrgPinIcon(onDisplay), rrgOnDisplay: onDisplay })
        .bindPopup(`<strong>${s.name}</strong><br>${s.street}, ${s.city}<br>${onDisplay ? 'On Display' : 'In-store stock varies'}`)
        .addTo(clusterGroup);
      latLngs.push([s.lat, s.lng]);
    }));
    showroomPinLayer = clusterGroup.addTo(showroomLeafletMap);
    showroomLeafletMap.fitBounds(L.latLngBounds(latLngs), { padding: [24, 24] });
  } else {
    const s = REGION_SINGLE_STORES[region];
    if (!s) return;
    showroomPinLayer = L.marker([s.lat, s.lng], { icon: rrgPinIcon(s.onDisplay), rrgOnDisplay: s.onDisplay })
      .bindPopup(`<strong>${s.name} Store</strong><br>${s.address}<br>${s.onDisplay ? 'On Display' : 'In-store stock varies'}`)
      .addTo(showroomLeafletMap);
    showroomLeafletMap.setView([s.lat, s.lng], 12);
  }
}

function applyShowroomMapFlag(on) {
  const mapEl = document.getElementById('showroomMap');
  const widget = mapEl && mapEl.closest('.showroom-widget');
  if (!mapEl) return;
  mapEl.hidden = !on;
  if (widget) widget.classList.toggle('split-view', on);
  if (!on || typeof L === 'undefined') return;
  if (!showroomLeafletMap) {
    showroomLeafletMap = L.map(mapEl);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(showroomLeafletMap);
    renderShowroomMapPins(currentRegion);
  }
  setTimeout(() => showroomLeafletMap.invalidateSize(), 0);
}

// ---- Region Selector (header dropdown, 2026-09-11, backlog item 21) ----
// A header dropdown (the utility bar's existing "🇦🇺 Australia" item, previously
// decorative-only) that behaves like the Demo State Panel toggles elsewhere on this
// prototype: a live, client-side copy/widget swap across all 5 templates, no page reload,
// no separate per-region page files. Resets to AU on every fresh page load — same
// no-persistence convention as the rest of the demo-state toggles, not saved across visits.
//
// RRG's real store network (RRG_STORE_NETWORK, 35 stores) is AU-only — NZ/UK are entirely
// hypothetical single-store demo regions for previewing what an international expansion
// would look like on this page, not real business fact. Their address/copy below is
// explicitly placeholder (flagged in DEVELOPER-BRIEF.md's Region-specific heading copy
// note) — don't mistake it for real store data if this file is read out of context.
// Real data, sourced 2026-09-11 (backlog items 29/30) — replaces the earlier fabricated
// placeholders (NZ had no real address/phone, UK was wrongly labelled "London"; the real
// store's own town is Bolton, even though the listing itself is titled "Manchester North
// Store"). Changing UK's `name` here fixes both the Showroom Finder heading
// (applyRegionShowroomHeading()) and the Click & Collect "On display at the ___ Store" line
// (initDcPostcode()) at once, since both already read from this one field.
// onDisplay (2026-09-12, spec.md §12 item 22): same real/placeholder on-display concept
// as AU's ON_DISPLAY_STORES set — both single-store regions default to true here (demo
// state, same as the rest of this file's data), but the flag now actually gates the
// Click & Collect "On display" line and the Showroom map's single-pin popup instead of
// both being hardcoded to assert it unconditionally.
const REGION_SINGLE_STORES = {
  NZ: { name: 'Auckland', address: '195A Wairau Road, Wairau Valley, Auckland, 0627', phone: '09 481 1910', lat: -36.7747, lng: 174.7381, onDisplay: true, note: 'Roof Racks Galore, Auckland — roofracksgalore.co.nz/contact-us' },
  UK: { name: 'Bolton', address: 'Unit B9, Edge Fold Industrial Estate, Plodder Lane, Farnworth, Bolton, BL4 0LR', phone: '01204 899778', lat: 53.5503, lng: -2.3882, onDisplay: true, note: 'The Roof Box Company, Manchester North Store — roofbox.co.uk/locations/manchester-north.php' }
};

// Trust Row phone number (backlog item 28, 2026-09-11) — real numbers per region. Applied
// separately from REGION_TRUST_COPY below since this item's markup nests a <a href="tel:">
// inside its <p> (`<p>Contact us on: <a href="tel:...">...</a></p>`), which a plain
// `p.textContent = ...` swap (as used for the other two trust items) would silently destroy.
const REGION_PHONE = { AU: '1300 071 264', NZ: '09 481 1910', UK: '01204 899778' };

const REGION_LABELS = { AU: 'Australia', NZ: 'New Zealand', UK: 'United Kingdom' };
const REGION_FLAGS = { AU: '🇦🇺', NZ: '🇳🇿', UK: '🇬🇧' };

// AU/UK default to the Click & Collect tab, NZ defaults to Delivery — per spec.md item 21.
const REGION_DEFAULT_DC_TAB = { AU: 'collect', NZ: 'delivery', UK: 'delivery' };

// Trust row's founded/network claims are real facts about the current AU-only business —
// swapped to honest regional placeholders rather than a literal "Australia's Largest" claim
// showing while NZ/UK is selected. Placeholder copy, flagged for real client wording once
// this leaves prototype stage (same convention as the rest of this project's demo copy).
const REGION_TRUST_COPY = {
  AU: {
    founded: { h4: 'Trusted Since 1989', p: 'Now with over 30 locations Australia wide' },
    network: { h4: "Australia's Largest", p: "We're the only nationwide roof rack specialists" }
  },
  NZ: {
    founded: { h4: 'Trusted Since 1989', p: 'Now serving New Zealand' },
    network: { h4: 'Visit In Person', p: 'Check it out at our Auckland showroom' }
  },
  UK: {
    founded: { h4: 'Trusted Since 1989', p: 'Now serving the United Kingdom' },
    network: { h4: 'Visit In Person', p: 'Check it out at our Bolton showroom' }
  }
};

let currentRegion = 'AU';

// Showroom Finder heading text is per-template static markup (each product shows a
// different AU on-display store count) — cached the first time this runs so switching back
// to AU restores the real per-page count instead of a hardcoded generic string.
function applyRegionShowroomHeading(region, heading) {
  if (!heading) return;
  if (!heading.dataset.auHeading) heading.dataset.auHeading = heading.textContent;
  heading.textContent = region === 'AU'
    ? heading.dataset.auHeading
    : `See It In Person — On Display At the ${REGION_SINGLE_STORES[region].name} Store`;
}

// Utility bar "Your Nearest Store" (backlog item 32, 2026-09-11) — was hardcoded per-template
// AU text ("North Lakes"), not wired into the region cascade at all. Same restore-on-AU
// caching pattern as applyRegionShowroomHeading() above: cache the real per-page AU value the
// first time this runs, NZ/UK reuse the same REGION_SINGLE_STORES name already driving the
// Showroom heading and Click & Collect single-store copy (Auckland/Bolton for free).
function applyRegionNearestStore(region) {
  const link = document.querySelector('[data-region-nearest-store]');
  if (!link) return;
  if (!link.dataset.auStore) link.dataset.auStore = link.textContent;
  link.textContent = region === 'AU' ? link.dataset.auStore : REGION_SINGLE_STORES[region].name;
}

function applyRegion(region) {
  currentRegion = region;

  // Utility bar trigger label/flag
  const flagEl = document.querySelector('[data-region-flag]');
  const labelEl = document.querySelector('[data-region-label]');
  if (flagEl) flagEl.textContent = REGION_FLAGS[region];
  if (labelEl) labelEl.textContent = REGION_LABELS[region];
  document.querySelectorAll('.region-switcher-menu a').forEach(a => {
    a.classList.toggle('current', a.dataset.region === region);
  });

  // Click & Collect vs Delivery default tab — reuses the existing tab-click handler
  // (initDeliveryCollectTabs) via a real click, rather than duplicating its class/hidden
  // toggling logic here. Also hides the Click & Collect card's own "View all stores" link
  // for NZ/UK (its store slide-out lists the real 35-store AU network, which doesn't apply
  // to a single-store region) and re-triggers the existing postcode-widget's update() via
  // its real Update button, so `.dc-viewall-line`'s text picks up the region-aware copy
  // from initDcPostcode() below rather than staying stuck on whatever it last showed.
  document.querySelectorAll('.dc-widget').forEach(widget => {
    const tab = widget.querySelector(`[data-dc-tab="${REGION_DEFAULT_DC_TAB[region]}"]`);
    if (tab && !tab.hidden) tab.click();
    const viewAllLink = widget.querySelector('.dc-viewall-row .dc-viewall');
    if (viewAllLink) viewAllLink.hidden = region !== 'AU';
    widget.querySelector('[data-dc-update]')?.click();
  });

  // Showroom Finder heading + map pins + "View all stores" (real AU-only store list, so it
  // doesn't apply once a single-store region is showing)
  document.querySelectorAll('#showroomDefaultView').forEach(view => {
    applyRegionShowroomHeading(region, view.querySelector('h3'));
    const viewAllRow = view.querySelector('.dc-viewall-row');
    if (viewAllRow) viewAllRow.hidden = region !== 'AU';
  });
  renderShowroomMapPins(region);

  // Trust row founded/network claims
  const copy = REGION_TRUST_COPY[region];
  document.querySelectorAll('[data-trust]').forEach(item => {
    const c = copy[item.dataset.trust];
    if (!c) return;
    const h4 = item.querySelector('h4'), p = item.querySelector('p');
    if (h4) h4.textContent = c.h4;
    if (p) p.textContent = c.p;
  });

  // Trust row phone number (backlog item 28) — real number per region, see REGION_PHONE
  // above for why this is a separate pass from the founded/network copy loop.
  const phone = REGION_PHONE[region];
  document.querySelectorAll('[data-trust="phone"] a[href^="tel:"]').forEach(a => {
    a.textContent = phone;
    a.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  });

  // Utility bar "Your Nearest Store" (backlog item 32, 2026-09-11) — same simple text-swap
  // treatment as the phone number above.
  applyRegionNearestStore(region);

  // Ex-Demo/Factory Seconds inline link (backlog item 4 follow-up, 2026-09-11): re-render
  // any stock line already showing the B-Stock link so its wording ("Graded" for UK) and
  // store-derived price both flip live if the region switches while it's visible.
  document.querySelectorAll('.stock-status-line').forEach(renderStockLine);

  // Payment-plan badges (backlog items 31/31a, 2026-09-11) — provider set differs per region,
  // not just the instalment amount, so it needs a full re-sync on every region switch, not
  // just on price-changing renders. currentRegion is already updated above, so this is safe
  // regardless of ordering against the currency sweep below.
  document.querySelectorAll('.price-block').forEach(syncPaymentBadges);

  // Currency symbol (UK backlog ask, 2026-09-11) and UK brand skin — run last, after every
  // other region-driven re-render above, so both act on the final DOM state rather than
  // something about to be overwritten.
  applyRegionCurrency(region);
  applyRegionBrand(region);
}

// fmtAud()/fmtMoney() (this file + the per-template inline scripts) already pick up the
// right symbol on their NEXT call via regionCurrencySymbol() — this sweep instead fixes
// whatever's already sitting in the DOM at the moment the region changes: static per-SKU
// markup (Related Products' `.price` divs, Simple/Grouped-Bundle's non-variant price block)
// and anything rendered before this specific switch (payment badges, exdemo suffix, etc.).
// Same numeric values either way — this is a symbol swap, not a currency conversion; no FX
// math anywhere in this prototype. Scoped away from <script>/<style> (their text nodes are
// still part of the DOM text-node tree, so an unscoped walk would silently corrupt inline
// JS/CSS) and the Demo State Panel (a reviewer tool, not page content).
function applyRegionCurrency(region) {
  const symbol = region === 'UK' ? '£' : '$';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!/[$£]\d/.test(node.nodeValue)) return NodeFilter.FILTER_SKIP;
      return node.parentElement && node.parentElement.closest('script, style, .admin-panel')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(node => { node.nodeValue = node.nodeValue.replace(/[$£](?=\d)/g, symbol); });
}

// UK brand skin (backlog ask, 2026-09-11): RRG trades in the UK as "The Roof Box Company"
// (roofbox.co.uk) — a real sister brand, not a reskin RRG invented. Scope confirmed with
// Brenton: logo + the core brand colour (navy, replacing RRG red everywhere `--rrg-red` is
// already used, so every component built against that token picks it up for free) plus
// their real Add to Cart green — NOT a typography change, Barlow Condensed/Lato stay for
// build simplicity and consistency with the rest of the prototype. NZ is unaffected (real
// scraped tab copy already treats AU+NZ as one brand/network) — this only ever toggles for
// 'UK'. Logo swap is a straight `src`/`alt` swap on every `.rrg-logo img` on the page (main
// header + the sticky condensed mobile header both reuse the same markup pattern); colours
// are driven by toggling a `body.region-uk` class that overrides the `--rrg-red`/
// `--rrg-red-dark` custom properties in shared.css, plus a direct override for the Add to
// Cart button (which isn't on the `--rrg-red` token to begin with — it's RRG's separate
// locked-in gold default, see shared.css).
const RRG_LOGO = { src: '../_shared/headerlogo.png', alt: 'Roof Racks Galore' };
const UK_LOGO = { src: '../_shared/brand-roofbox-uk-logo.svg', alt: 'The Roof Box Company' };

function applyRegionBrand(region) {
  document.body.classList.toggle('region-uk', region === 'UK');
  const logo = region === 'UK' ? UK_LOGO : RRG_LOGO;
  document.querySelectorAll('.rrg-logo img').forEach(img => {
    img.src = logo.src;
    img.alt = logo.alt;
  });
}

function initRegionSwitcher() {
  const wrap = document.querySelector('.region-switcher');
  if (!wrap) return;
  const toggle = wrap.querySelector('.region-switcher-toggle');
  const menu = wrap.querySelector('.region-switcher-menu');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = wrap.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => {
    wrap.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
  menu.querySelectorAll('a[data-region]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      applyRegion(a.dataset.region);
      wrap.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
  applyRegion('AU');
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
// SKU click-to-copy (2026-09-10, Graham Sowerby meeting) — the clickable element is now
// the SKU text itself (e.g. .sku-copy), not a separate "⧉ Copy" button, so [data-copy]/
// [data-copy-source] can point at their own element (self-referencing) as well as another
// one. The "restore" value is captured fresh at click time rather than cached once at
// bind time — the old cached-at-bind-time approach broke on pages where the SKU re-renders
// after a variant/colour switch (a later copy click would revert the text back to
// whatever was showing on first page load, not the current value).
function initCopyButtons() {
  document.querySelectorAll('[data-copy], [data-copy-source]').forEach(el => {
    if (el.dataset.copyBound) return;
    el.dataset.copyBound = 'true';
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    const activate = () => {
      const source = el.dataset.copySource ? document.querySelector(el.dataset.copySource) : el;
      const text = ((source && source.textContent) || el.dataset.copy || '').trim();
      if (!text) return;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
      const original = el.textContent;
      el.textContent = '✓ Copied';
      el.classList.add('copied');
      clearTimeout(el._copyTimer);
      el._copyTimer = setTimeout(() => {
        el.textContent = original;
        el.classList.remove('copied');
      }, 1400);
    };
    el.addEventListener('click', activate);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
}

// Template Switcher — dropdown on the header's "Products" item, internal-only, for
// jumping between the 5 prototype templates without going back to prototypes/index.html.
function initTemplateSwitcher() {
  const wrap = document.querySelector('.template-switcher');
  if (!wrap) return;
  const toggle = wrap.querySelector('.template-switcher-toggle');
  const menu = wrap.querySelector('.template-switcher-menu');

  const currentFolder = location.pathname.split('/').filter(Boolean).slice(-2, -1)[0];
  menu.querySelectorAll('a[data-template]').forEach(a => {
    if (a.dataset.template === currentFolder) a.classList.add('current');
  });

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = wrap.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => {
    wrap.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
}

// "Read more" under the clamped short-desc line jumps to the Details tab
// (2026-09-10, Graham Sowerby meeting). The tabs accordion is pure CSS (a radio input +
// label + sibling-selector .content, no JS anywhere) — a plain anchor jump would scroll to
// the (hidden) radio without checking it, so the tab wouldn't actually switch. This checks
// the target radio directly, then scrolls its .tabs container into view.
// Decision Panel star-rating summary (2026-09-11) — same real data source as the Reviews
// tab's REVIEWS.io Polaris embed, just a compact custom-built badge since REVIEWS.io doesn't
// ship a standalone widget for this above-the-fold placement. Calls the same
// api.reviews.io/timeline/data endpoint the Polaris widget itself calls (confirmed via
// network inspection — it's CORS-open, since it's designed to be embedded on arbitrary
// merchant sites), but with per_page=1 since only the `stats` summary is needed, not the
// review list itself. Deliberately does NOT fall back to the store-wide rating when a SKU
// has zero product reviews (an earlier version did) — on an individual product page, a
// company-wide figure next to that specific product reads as a real per-product rating and
// is misleading, even if technically sourced from real data. So: no product reviews yet =
// hide the whole strip, same as a fetch failure or the account having no data at all.
function initReviewSummary(root = document) {
  root.querySelectorAll('.reviews-strip[data-review-sku]').forEach(async strip => {
    const sku = strip.dataset.reviewSku;
    const starsEl = strip.querySelector('[data-stars]');
    const textEl = strip.querySelector('[data-review-text]');
    if (!starsEl || !textEl) return;
    try {
      const url = `https://api.reviews.io/timeline/data?type=product_review&store=roof-racks-galore&per_page=1&sku=${encodeURIComponent(sku)}&lang=en`;
      const res = await fetch(url);
      const data = await res.json();
      const avg = parseFloat(data.stats?.average_rating || '0');
      const count = data.stats?.review_count || 0;
      if (!count) { strip.hidden = true; return; }
      const filled = Math.round(avg);
      starsEl.innerHTML = '★'.repeat(filled) + `<span class="stars-empty">${'★'.repeat(5 - filled)}</span>`;
      textEl.textContent = `${avg.toFixed(1)} (${count.toLocaleString()} reviews)`;
    } catch (e) {
      strip.hidden = true;
    }
  });
}

// Short description inline "Read more" (2026-09-11, follow-up to the value-prop/short-desc
// consolidation) — Brenton caught the link landing on its own row below the 2 lines of text
// instead of inline at the end of the visible text. CSS line-clamp can't guarantee that (it
// clips straight through an inline child that doesn't fit on the truncated line), so this
// measures the element's real rendered height with the full text + link both present, then
// trims the text word-by-word until "<text>… Read more" fits within exactly 2 lines. The
// link is expected to already be the last child inside .short-desc (see markup) so it's
// naturally inline with whatever text precedes it — this only ever shortens that text.
// Stores the untouched original text in a data attribute so repeat calls (resize) always
// trim from the real full text, not an already-trimmed one.
function layoutShortDesc(root = document) {
  root.querySelectorAll('.short-desc').forEach(el => {
    const link = el.querySelector('.short-desc-readmore');
    if (!link) return;
    if (!el.dataset.fullText) {
      // el.textContent at this point still includes the link's own "Read more" label (it's
      // markup-nested, not yet detached) — strip it out via a clone so the captured source
      // text is just the description, not "...description text. Read more".
      const clone = el.cloneNode(true);
      clone.querySelector('.short-desc-readmore')?.remove();
      el.dataset.fullText = clone.textContent.trim();
    }
    const fullText = el.dataset.fullText;
    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
    const maxHeight = lineHeight * 2 + 1;

    const words = fullText.split(' ');
    const render = n => {
      const truncated = n < words.length;
      el.textContent = words.slice(0, n).join(' ') + (truncated ? '… ' : ' ');
      el.appendChild(link);
    };

    let n = words.length;
    render(n);
    while (n > 0 && el.scrollHeight > maxHeight) {
      n--;
      render(n);
    }
  });
}

function initTabJumpLinks() {
  document.querySelectorAll('[data-jump-tab]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const radio = document.getElementById(link.dataset.jumpTab);
      if (!radio) return;
      radio.checked = true;
      radio.closest('.tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// Mobile nav drawer (2026-09-11, mobile audit) — .rrg-nav (Products / Store Finder /
// Fit My Vehicle / Catalogue / Services) previously just display:none'd below 900px
// with nothing replacing it, making the whole main nav unreachable on mobile/tablet.
// Two hamburger triggers now exist (the top-of-page header and the sticky condensed
// header, see .rrg-sticky-header below) — both open the same drawer, so this wires up
// every .mobile-nav-toggle found rather than just the first. The drawer is
// position:fixed (not absolute) since it needs to work correctly whichever header
// triggered it — top's natural position vs. the sticky header's fixed position — so its
// `top` offset is computed from whichever header the click came from, not fixed in CSS.
// Otherwise mirrors initTemplateSwitcher()'s toggle/click-outside-to-close pattern.
function initMobileNav() {
  const toggles = document.querySelectorAll('.mobile-nav-toggle');
  const nav = document.querySelector('.rrg-nav');
  if (!toggles.length || !nav) return;
  const setExpanded = (open) => toggles.forEach(t => t.setAttribute('aria-expanded', open));
  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const header = toggle.closest('.rrg-sticky-header') || toggle.closest('.rrg-main-header');
      if (header) nav.style.top = header.getBoundingClientRect().bottom + 'px';
      const open = nav.classList.toggle('mobile-open');
      setExpanded(open);
    });
  });
  nav.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => {
    nav.classList.remove('mobile-open');
    setExpanded(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && nav.classList.contains('mobile-open')) {
      nav.classList.remove('mobile-open');
      setExpanded(false);
    }
  });
}

// Search clear (x) button (2026-09-11, matched to client-supplied Figma export) — shown
// only once the input has a value, clears + refocuses + hides itself on click. Generic
// over every .rrg-search on the page (there's exactly one per template today, but this
// doesn't assume that).
function initSearchClear() {
  document.querySelectorAll('.rrg-search').forEach(wrap => {
    const input = wrap.querySelector('input');
    const clearBtn = wrap.querySelector('.rrg-search-clear');
    if (!input || !clearBtn) return;
    const sync = () => { clearBtn.hidden = !input.value; };
    input.addEventListener('input', sync);
    clearBtn.addEventListener('click', () => {
      input.value = '';
      sync();
      input.focus();
    });
    sync();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildExdemoSlideout();
  buildStoreSlideout();
  initCopyButtons();
  initFitGalleryCarousel();
  initTemplateSwitcher();
  initRegionSwitcher();
  layoutShortDesc();
  window.addEventListener('resize', () => {
    clearTimeout(window._shortDescResizeTimer);
    window._shortDescResizeTimer = setTimeout(() => layoutShortDesc(), 120);
  });
  initTabJumpLinks();
  initReviewSummary();
  initMobileNav();
  initSearchClear();
  // Sticky condensed mobile header (2026-09-11) — reuses the same sentinel/.visible
  // mechanism already built for the desktop persistent decision bar: shows
  // .rrg-sticky-header once .rrg-search (the top-of-page search row) scrolls out of
  // view. Generic across all pages since every template has both elements identically.
  initPersistentBar('.rrg-search', '.rrg-sticky-header');
  initStickyCta();
});

// Sticky mobile Add-to-Cart bar (2026-09-11, backlog item 26) — shows whenever the real
// Add to Cart button isn't currently on-screen, which covers both "starts below the fold
// on load" and "scrolled past it" with one rule (previously the bar was just always
// visible at mobile widths regardless of scroll position, so it showed even while the
// real button was already on-screen). The real button is present in the initial markup
// on every template (only its label/href update dynamically), so this doesn't need to
// wait on any page's own render cycle.
function initStickyCta() {
  const bar = document.querySelector('.sticky-cta-mobile');
  const target = document.querySelector('.decision-panel [data-cta-label]');
  if (!bar || !target) return;
  const observer = new IntersectionObserver(([entry]) => {
    const offscreen = !entry.isIntersecting;
    bar.classList.toggle('visible', offscreen);
    document.body.classList.toggle('has-sticky-cta', offscreen);
  }, { threshold: 0 });
  observer.observe(target);
}

function buildAdminPanel() {
  const needsVehicleDemo = !!document.querySelector('[data-fitment-slot]');
  const hasVariantPicker = !!document.querySelector('.variant-picker');
  const hasFitGalleryPlacementToggle = !!document.getElementById('fitGallerySection') && !!document.getElementById('fitGalleryNestedSlot');
  const hasFitGallery = !!document.getElementById('fitGallerySection');
  const hasVehicleFitNotes = !!document.getElementById('vehicleFitNotes');
  const hasShowroom = !!document.getElementById('showroom');
  const initialVideo = detectInitialVideoState();
  const initialSale = detectInitialSaleState();
  const initialShipping = detectInitialShippingState();
  const initialCollect = detectInitialCollectState();
  const initialFitGallery = detectInitialFitGalleryState();
  Object.assign(adminState, { video: initialVideo, sale: initialSale, stockStatus: 'in_stock', stockOverride: false, shipping: initialShipping, collect: initialCollect, exdemo: false, fittedOption: false, fittedMode: 'card', fitGalleryPlacement: 'full', fitGalleryRed: false, showroom: true, fitGallery: initialFitGallery, vehicleFitNotes: false, cartConflict: 'none' });
  // Interactive map is the locked default for the Showroom Finder widget, all 5
  // templates — no longer a Demo State Panel preview toggle. Layout (split-view,
  // revealing #showroomMap) still applies immediately so there's no shift once the map
  // loads, but the actual Leaflet init/tile fetch (2026-09-11, mobile audit — this used
  // to eagerly load map tiles on every page load even when the widget was off-screen,
  // a real mobile data/LCP cost) is deferred until the widget scrolls near the viewport.
  const showroomMapEl = document.getElementById('showroomMap');
  if (showroomMapEl) {
    const showroomMapWidget = showroomMapEl.closest('.showroom-widget');
    showroomMapEl.hidden = false;
    if (showroomMapWidget) showroomMapWidget.classList.add('split-view');
    if ('IntersectionObserver' in window) {
      const showroomMapObserver = new IntersectionObserver((entries, obs) => {
        if (entries.some(entry => entry.isIntersecting)) {
          applyShowroomMapFlag(true);
          obs.disconnect();
        }
      }, { rootMargin: '600px 0px' });
      showroomMapObserver.observe(showroomMapEl);
    } else {
      applyShowroomMapFlag(true);
    }
  }

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
          <label><input type="radio" name="stockStatus" value="special_order"> Special Order</label>
          <label><input type="radio" name="stockStatus" value="discontinued"> Discontinued</label>
        </div>
        <div class="admin-toggle-label"><span>Cart contents <span class="admin-note">(compatibility check)</span></span></div>
        <div class="admin-radio-row">
          <label><input type="radio" name="cartConflict" value="none" checked> Empty</label>
          <label><input type="radio" name="cartConflict" value="compatible"> Compatible item in cart</label>
          <label><input type="radio" name="cartConflict" value="incompatible"> Incompatible item in cart</label>
        </div>
        <label class="admin-toggle"><span>Shipping available</span><input type="checkbox" data-admin-flag="shipping" ${initialShipping ? 'checked' : ''}></label>
        <label class="admin-toggle"><span>Click &amp; Collect available</span><input type="checkbox" data-admin-flag="collect" ${initialCollect ? 'checked' : ''}></label>
        <label class="admin-toggle"><span>B-Stock / Ex-Demo available</span><input type="checkbox" data-admin-flag="exdemo"></label>
        ${hasShowroom ? `<label class="admin-toggle"><span>On display in-store (Showroom Finder)</span><input type="checkbox" data-admin-flag="showroom" checked></label>` : ''}
        ${hasFitGallery ? `<label class="admin-toggle"><span>Fitment Gallery exists for this product</span><input type="checkbox" data-admin-flag="fitGallery" ${initialFitGallery ? 'checked' : ''}></label>
        <label class="admin-toggle"><span>Fitment count <span class="admin-note">(preview CTA thresholds)</span></span><input type="number" min="0" data-admin-input="fitGalleryCount" value="${document.getElementById('fitGallerySection') ? (document.getElementById('fitGallerySection').dataset.count || 0) : 0}" style="width:64px"></label>` : ''}
        ${hasVehicleFitNotes ? `<label class="admin-toggle"><span>Product Notes</span><input type="checkbox" data-admin-flag="vehicleFitNotes"></label>` : ''}
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

  // Click-outside-to-close (2026-09-11, Brenton's ask — the panel is sizable on mobile,
  // so relying on the small X button alone was awkward) — same stopPropagation-on-the-
  // panel-itself pattern already used for the nav drawer and template switcher, so clicks
  // on toggles/buttons inside the panel never bubble out and trigger a close.
  fab.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.add('open'); });
  panel.querySelector('.admin-close').addEventListener('click', () => panel.classList.remove('open'));
  panel.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => panel.classList.remove('open'));

  // The FAB is hidden on mobile (see .admin-fab in shared.css) since it was crowding an
  // already tight viewport — the "North Lakes" nearest-store link in the utility bar
  // doubles as the mobile trigger instead (data-admin-trigger, added to that anchor in
  // every template's header). Still wired up on desktop too since there's no harm in it
  // working there as well, just redundant with the visible FAB.
  const adminTrigger = document.querySelector('[data-admin-trigger]');
  if (adminTrigger) {
    adminTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      panel.classList.add('open');
    });
  }

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
        case 'exdemo': applyExdemoFlag(on); break;
        case 'showroom': applyShowroomFlag(on); break;
        case 'fittedOption': setFittedOptionFlag(on); break;
        case 'fitGalleryRed': applyFitGalleryRedFlag(on); break;
        case 'fitGallery': applyFitGalleryFlag(on); break;
        case 'vehicleFitNotes': applyVehicleFitNotesFlag(on); break;
      }
    });
  });

  panel.querySelectorAll('[data-admin-input]').forEach(input => {
    input.addEventListener('input', () => {
      if (input.dataset.adminInput === 'fitGalleryCount') {
        const section = document.getElementById('fitGallerySection');
        if (section) section.dataset.count = input.value;
        applyFitGalleryFlag(adminState.fitGallery);
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

  panel.querySelectorAll('input[name="cartConflict"]').forEach(input => {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      applyCartConflict(input.value);
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
