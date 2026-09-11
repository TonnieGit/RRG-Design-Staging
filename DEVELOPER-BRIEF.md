# Developer Brief — PDP Rebuild Handover

**Audience:** the internal developer building the real Magento 2 product page templates.
**Source design:** the static HTML/CSS/JS prototypes in `prototypes/` (this repo). This brief is the bridge between "what the prototype does" and "what to build in Magento" — it explains *why* each piece works the way it does, not just what it looks like, so implementation decisions in Magento can stay consistent with the intent even where the exact code can't be lifted verbatim.

## 0. How to use this document

- This is a **living document**, not a one-time export. It gets a new section (or an update to an existing one) whenever a feature is finalized in the prototype and ready to hand over — not necessarily every prototype change, only ones relevant to the real build.
- Every time this file changes, that change is also noted in `spec.md` (see its "Developer Brief" section) so anyone reading the project history knows this document moved.
- Where a feature is a **plain copy-paste external integration** (a vendor script tag, a widget embed), this brief gives you the exact, current, working code block used in the prototype — drop it into the Magento template as-is, then adjust only the values called out as per-product (typically the SKU).
- Where a feature is **custom-built** (no vendor code, hand-rolled against the prototype's own CSS/JS conventions), this brief explains the logic and gives you the source so you can port it into Magento's own JS/template structure rather than copy-pasting verbatim (the prototype's `shared.js`/`shared.css` aren't part of the Magento build).
- Screenshots show **where** something sits on the page and **what it looks like in its real, current state** — not mockups. Where a feature currently shows an empty/placeholder-like state because of real data gaps (e.g. no reviews exist yet against a SKU), that's called out explicitly so it isn't mistaken for a bug.
- For the full page-by-page component reference (every section/widget by name), see `PAGE-GLOSSARY.md`. For the project's business requirements and build history, see `spec.md`. This brief only covers pieces that are finalized enough to hand over — check `spec.md` Section 10 for what's still in progress.

### 0.1 Rules for every section in this document

These rules apply to every widget/section written up in this brief from now on:

1. **Write it simply.** Plain English, short sentences. No jargon, no assumed technical background — a junior developer or a non-technical stakeholder should be able to follow it.
2. **Screenshots are mandatory, for every state.** Every widget/section needs a screenshot for each visual state/variant it can appear in (e.g. empty vs. populated, in stock vs. special order, hidden vs. shown). At least one of those screenshots must show the **whole page** with a **red arrow** pointing at the widget, so its location is obvious at a glance — not just a cropped close-up.
3. **Every section covers at minimum three things, each its own labeled line:**
   - **Name** — what it's called (match `PAGE-GLOSSARY.md` naming where possible).
   - **Location** — where on the page it sits, in plain terms (e.g. "under the title, above the price").
   - **Purpose** — why it's there / what problem it solves, in one or two plain sentences.

Use this as the section template going forward:

```
### N. [Widget/Section Name]

**Location:** [where it sits on the page, plain English]

**Purpose:** [why it exists, one or two plain sentences]

**States:**
- [State 1 name] — [screenshot with red arrow showing location]
- [State 2 name] — [screenshot]
...

[Code / implementation notes, if any]
```

## 1. Project context

RRG's current live PDP is being rebuilt from scratch for conversion (not a re-skin) across four product-type templates: Simple, Config-Variant, Sibling/Color, Vehicle-Specific, plus a fifth Grouped/Bundle variant. Full rationale is in `spec.md` Section 0. The prototypes are plain HTML/CSS/JS specifically so they're fast to iterate on visually before committing to the real Magento 2 template work — they are **not** the production codebase, but every visual/behavioral decision in them is final unless `spec.md` flags it as still open.

Live prototype files (open directly, or via `prototypes/index.html` as a menu):
- `prototypes/simple/index.html`
- `prototypes/config-variant/index.html`
- `prototypes/sibling-color/index.html`
- `prototypes/vehicle-specific/index.html`
- `prototypes/grouped-bundle/index.html`
- `prototypes/_shared/shared.css` + `shared.js` — the component library all five import

---

## 2. REVIEWS.io Integration

Two separate pieces, built 2026-09-11, both driven by RRG's real REVIEWS.io account (`store: 'roof-racks-galore'`) — no mock/fake review data anywhere in either piece. Both pull from the **same underlying data** (this specific product's reviews) but are visually and technically independent — the badge does not embed or depend on the tab widget.

### 2.1 Reviews tab (Polaris widget)

**Name:** Reviews tab (REVIEWS.io Polaris widget)

**Location:** the last tab in the row of tabs near the bottom of the page (Details / Specifications / Gold Guarantee / Shipping Info / Fitting Instructions / **Reviews**), on all 5 templates. Click it to open the panel shown below.

**Purpose:** shows this product's customer reviews (star rating, written reviews, photos) so shoppers can see what other buyers thought before purchasing. Reviews with 5+ ratings are shown to lift conversion significantly on higher-priced items (see `spec.md` Section 0.1.3), so this needs to stay easy to find, not buried.

**States:**
- **Location on the page, tab opened** (red arrow shows where to click):
  ![Reviews tab — location on page](dev-brief-assets/reviews-tab-location.png)
- **Current real state** — Front Runner Water Tank, `FRWTAN063`, no reviews against this SKU yet on the live account:
  ![Reviews tab — real current empty state](dev-brief-assets/reviews-tab-live-widget.png)
- **Once a product has real reviews** (genuine screenshot of the same widget pulling RRG's actual company reviews, shown to illustrate the populated layout — not this SKU's real content):
  ![Reviews tab — populated example, real RRG review data](dev-brief-assets/reviews-tab-populated-example.png)

#### Code snippet (copy-paste)

This is the exact, current, working block from `prototypes/simple/index.html`. Drop the `<script src>` tag, the `<div id="ReviewsWidget">`, and the config `<script>` into the Reviews tab panel's markup. **Only `product_review.sku` and `questions.grouping` need to change per product** — everything else is shared config and brand styling, identical across all 5 templates.

```html
<script src="https://widget.reviews.io/polaris/build.js"></script>
<div id="ReviewsWidget"></div>
<script>
new ReviewsWidget('#ReviewsWidget', {
  store: 'roof-racks-galore',
  widget: 'polaris',
  options: {
    types: 'product_review,store_review',
    enable_sentiment_analysis: true,
    lang: 'en',
    layout: '',
    per_page: 15,
    store_review: { hide_if_no_results: false },
    third_party_review: { hide_if_no_results: false },
    product_review: { sku: 'FRWTAN063', hide_if_no_results: false },
    questions: {
      hide_if_no_results: true,
      enable_ask_question: true,
      enable_ask_question_button_style: false,
      show_dates: true,
      include_qna_structured_data: true,
      grouping: 'FRWTAN063'
    },
    header: {
      enable_summary: true,
      enable_ratings: true,
      enable_attributes: true,
      enable_image_gallery: true,
      enable_percent_recommended: false,
      enable_write_review: true,
      enable_ask_question: true,
      enable_sub_header: true,
      rating_decimal_places: 2,
      use_write_review_button: false,
      enable_if_no_results: false,
      show_review_title_field: false
    },
    sentiment: { badge_text: 'Our Customers Say', enable_rating_breakdown: false },
    filtering: {
      enable: true,
      enable_text_search: true,
      enable_sorting: true,
      enable_product_filter: false,
      enable_media_filter: true,
      enable_overall_rating_filter: true,
      enable_language_filter: false,
      enable_language_filter_language_change: false,
      enable_ratings_filters: true,
      enable_attributes_filters: true,
      enable_expanded_filters: false
    },
    reviews: {
      enable_avatar: true,
      enable_reviewer_name: true,
      enable_reviewer_address: true,
      reviewer_address_format: 'city, country',
      enable_verified_badge: true,
      verified_badge_position: '',
      enable_subscriber_badge: true,
      review_content_filter: 'all',
      enable_reviewer_recommends: true,
      enable_attributes: true,
      enable_product_name: true,
      enable_link_product: true,
      enable_review_title: true,
      enable_replies: true,
      enable_images: true,
      enable_ratings: true,
      enable_share: true,
      enable_helpful_vote: true,
      enable_helpful_display: true,
      enable_report: true,
      enable_date: true,
      date_format: undefined,
      date_location: undefined,
      enable_third_party_source: true,
      enable_duplicate_reviews: undefined,
      combine_title_stars: true,
      show_untranslated: false
    }
  },
  translations: { 'Verified Customer': 'Verified Customer' },
  styles: {
    '--base-font-size': '16px',
    '--common-button-font-family': 'inherit',
    '--common-button-font-size': '16px',
    '--common-button-font-weight': '700',
    '--common-button-letter-spacing': '0',
    '--common-button-text-transform': 'none',
    '--common-button-vertical-padding': '10px',
    '--common-button-horizontal-padding': '20px',
    '--common-button-border-width': '2px',
    '--common-button-border-radius': '4px',
    '--primary-button-bg-color': '#BB0220',
    '--primary-button-border-color': '#BB0220',
    '--primary-button-text-color': '#ffffff',
    '--secondary-button-bg-color': 'transparent',
    '--secondary-button-border-color': '#0E1311',
    '--secondary-button-text-color': '#0E1311',
    '--common-star-color': '#E8A83C',
    '--common-star-disabled-color': 'rgba(0,0,0,0.2)',
    '--medium-star-size': '22px',
    '--small-star-size': '19px',
    '--heading-text-color': '#0E1311',
    '--heading-text-font-weight': '700',
    '--heading-text-font-family': "'Barlow Condensed', sans-serif",
    '--heading-text-line-height': '1.3',
    '--heading-text-letter-spacing': '0',
    '--heading-text-transform': 'none',
    '--body-text-color': '#0E1311',
    '--body-text-font-weight': '400',
    '--body-text-font-family': 'inherit',
    '--body-text-line-height': '1.4',
    '--body-text-letter-spacing': '0',
    '--body-text-transform': 'none',
    '--pagination-tab-active-border-color': '#BB0220',
    '--pagination-tab-active-text-color': '#BB0220',
    '--sentiment-pagination-tab-active-border-color': '#BB0220',
    '--sentiment-pagination-tab-active-text-color': '#BB0220',
    '--sentiment-common-star-color': '#E8A83C'
  }
});
</script>
```

#### Per-template SKU values

The `sku` field takes a semicolon-separated list. Where a product has variants/colours that are each their own SKU on the live site, **all of them are listed together** so the widget shows reviews regardless of which variant a shopper has selected — the widget is not re-initialized when a variant/colour selector changes, it's set once on page load with the full family.

| Template | `product_review.sku` value |
|---|---|
| Simple (Water Tank) | `FRWTAN063` |
| Config-Variant (Pioneer 6 Platform) | `RH62112;RH62112F` |
| Sibling-Color (MaxTrax MKII, 13 colours) | `MTX02BK;MTX02MA;MTX02GG;MTX02FJB;MTX02LG;MTX02BY;MTX02PK;MTX02FJR;MTX02TG;MTX02DT;MTX02TQ;MTX02OD;MTX02SO` |
| Vehicle-Specific (Hilux N80 kit) | `GP01M1TZZ;GP01M1TZZF` |
| Grouped-Bundle (Yakima RoadShower) | `8004109PROMO` |

For a real Magento product page, generate this list dynamically from the product's configurable/sibling SKUs rather than hardcoding it — the semicolon-joined string is all the widget needs.

#### Config decisions worth knowing

- **`types: 'product_review,store_review'`** — this single line is what makes the widget render its own native Product/Company reviews tabs internally. An earlier prototype build hand-rolled a custom pill toggle for this before this real widget config was supplied; that custom code no longer exists, don't recreate it.
- **`hide_if_no_results: false`** on `product_review` and `store_review` — deliberately **not** the REVIEWS.io default (which is `true`). With `true`, a SKU with zero reviews renders nothing at all, which looks like the integration is broken. With `false`, the widget shows its real "No reviews collected for this product yet — Be the first to write a review" state instead — honest, correctly branded, and exactly what's in the first screenshot above. Keep this `false` in production too, for the same reason.
- **`styles` colour variables** were retinted from REVIEWS.io's neutral black/grey defaults to RRG's actual brand colours: `#BB0220` (brand red) for primary buttons and active pagination state, `#E8A83C` (amber/gold) for stars, `'Barlow Condensed'` for headings, matching the rest of the page.
- No API key is required — this widget is a public client-side embed tied to the `store` slug only.

---

### 2.2 Decision Panel star-rating badge (custom-built)

**Name:** Decision Panel star-rating badge

**Location:** directly under the title/value-prop line, above the price, in the box on the right-hand side of the page (the "Decision Panel") — on all 5 templates.

**Purpose:** gives shoppers a quick, at-a-glance star rating right next to the price, without having to scroll down and open the Reviews tab. Same reasoning as the Reviews tab above — reviews visible near the top of the page lift conversion.

**States:**
- **Location on the page** (red arrow shows where it sits, shown here with example review data so the badge is visible):
  ![Star rating badge — location on page](dev-brief-assets/star-rating-location.png)
- **Current default state** — hidden, because none of this prototype's demo SKUs have real reviews yet (same underlying data gap as the Reviews tab above):
  ![Star rating badge — hidden, no reviews yet for this SKU](dev-brief-assets/star-rating-hidden-default.png)
- **Once a product has real reviews** (illustrative — real markup and styling, mocked numbers to show the populated layout):
  ![Star rating badge — example once populated](dev-brief-assets/star-rating-populated-example.png)

#### Why this is custom-built, not a REVIEWS.io widget

REVIEWS.io's product library doesn't include a small standalone "rating badge" widget for this compact above-the-fold placement — their smallest widget is still the full Polaris review-list widget used in the tab above. So this badge is hand-built, but it pulls from the **same real REVIEWS.io data** the Polaris widget itself uses: the identical `api.reviews.io/timeline/data` endpoint, confirmed via network inspection to be the actual call the Polaris widget makes internally, and confirmed CORS-open (safe to call directly from any origin — it's designed to be embedded on arbitrary merchant storefronts).

#### HTML markup

Add `data-review-sku` (same semicolon-separated SKU list as the tab widget above) to the existing star-rating strip, and wrap the two dynamic pieces (stars, text) so the script below can target them:

```html
<div class="reviews-strip" data-review-sku="FRWTAN063">
  <span class="stars" data-stars>★★★★★</span>
  <span data-review-text>4.5+</span>
  <a href="#reviewsTab" data-jump-tab="reviewsTab">See reviews</a>
</div>
```

(`data-jump-tab` is this prototype's own mechanism for making the "See reviews" link switch to the Reviews tab and scroll to it — port the *intent*, not necessarily this exact attribute, into whatever tab-switching approach the Magento template uses.)

#### CSS

```css
.stars{color:#E8A83C;letter-spacing:1px;font-size:15px;}
.stars .stars-empty{opacity:.35;}
```

#### JavaScript

```js
// Calls the same api.reviews.io/timeline/data endpoint the REVIEWS.io Polaris widget uses
// internally (per_page=1 since only the review-count/average summary is needed, not the
// review list itself). Deliberately does NOT fall back to the store's company-wide rating
// when a product has zero reviews — on an individual product page, showing a company-wide
// figure next to one specific product would read as that product's own rating and mislead
// the customer, even though the number itself is real. No product reviews yet = hide the
// whole badge, same as a fetch failure or the account having no data at all.
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

// Call once on page load, e.g.:
document.addEventListener('DOMContentLoaded', () => initReviewSummary());
```

Same SKU-list table as Section 2.1 applies here — use the identical `data-review-sku` value as that template's `product_review.sku`.

#### Behavior summary

| Condition | Result |
|---|---|
| SKU has ≥1 real product review | Shows real rounded star rating + `"{avg} ({count} reviews)"`, links to Reviews tab |
| SKU has 0 real product reviews | Badge is hidden entirely (no fallback to company-wide rating — see rationale above) |
| API call fails (network error, etc.) | Badge is hidden entirely |

---

### 2.3 Before this leaves prototype stage

- None of this prototype's demo SKUs have real REVIEWS.io reviews yet, so both pieces currently show their "no data" states on every template. This is expected and will resolve itself once real reviews exist against real SKUs — nothing to fix.
- Confirm with REVIEWS.io / Tim whether the `roof-racks-galore` store slug and API usage shown here (direct `fetch` calls to `api.reviews.io` from custom code, not just the vendor's own widget script) fall within their terms of service for this kind of lightweight custom integration — it's a public, unauthenticated, CORS-open endpoint, but it's not an officially documented/supported API surface the way the Polaris widget itself is.
- Generate the SKU list dynamically from the real product/configurable-child data in Magento rather than hardcoding it, unlike this static prototype.

---

## 3. Showroom Finder interactive map

**Name:** Showroom Finder map (`#showroomMap`)

**Location:** inside the black "Showroom Finder" block, below the hero and Trust Row, on all 5 templates. The block splits into two columns on desktop (postcode search on the left, map on the right, roughly a third/two-thirds split) and stacks on mobile.

**Purpose:** shows shoppers the real size of RRG's store network at a glance and, more importantly, which of those stores currently have this exact product set up on display so they can check fit/finish in person before buying. A map with all 35 real stores (not just the 2 nearest) is deliberate — it communicates "we're a large nationwide network," not a small chain, even for stores that don't have this specific item on display.

**States:**
- **Location on the page, default zoomed-out view** (red arrow shows where it sits):
  ![Showroom Finder map — location on page](dev-brief-assets/showroom-map-location.png)
- **Zoomed in — pins split apart, popup open on a red (on-display) pin**:
  ![Showroom Finder map — split pins with popup](dev-brief-assets/showroom-map-pins-split.png)

Built 2026-09-10 (Leaflet + OpenStreetMap, piloted then rolled out to all 5 templates), reworked 2026-09-11 (backlog item 22) to add clustering, colour-coded pins, and a zoomed-out default view.

#### Why this is custom-built, not a vendor widget

There's no off-the-shelf "store locator" SaaS widget in use here — this is plain Leaflet (a free, open-source mapping library, no API key) plus OpenStreetMap tiles (free) plus one plugin, Leaflet.markercluster, for the pin-grouping behaviour. All three are loaded via CDN `<script>`/`<link>` tags; the logic that plots pins, colours them, and sets the default view is hand-written in `shared.js` and needs to be ported into the Magento template's own JS, not copy-pasted verbatim (it depends on this prototype's shared store-data array).

#### CDN tags (copy-paste, goes in `<head>`)

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" defer></script>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css">
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css">
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js" defer></script>
```

#### Store data needed

Every store needs a `lat`/`lng` in addition to the name/address/phone already used elsewhere on the page (Click & Collect widget, store slide-out). In this prototype that's `RRG_STORE_NETWORK` in `shared.js` — in Magento, whatever the real store/location data source is (a CMS store-locator table, a custom attribute set, etc.) needs to carry real geocoded coordinates for this to work. **This prototype's coordinates are demo-precision only** — approximate suburb-centre points, not geocoded from the real street addresses — so don't carry them over as-is; geocode the real addresses when this is built for real.

Separately, whatever marks a store as having this specific product **on display** (a boolean per store, per product — in this prototype, `ON_DISPLAY_STORES`, a flat placeholder list, not per-product) needs a real data source before this leaves prototype stage. See `spec.md` Section 10's scope note: the actual backend trigger for a genuine on-display flag is being handled separately (Rackety bin-location work), out of this project's scope — this page only needs to *read* that flag once it exists.

#### JavaScript — plotting the pins

```js
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

const map = L.map(mapEl);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 18
}).addTo(map);

const clusterGroup = L.markerClusterGroup({ iconCreateFunction: rrgClusterIcon, maxClusterRadius: 60 });
const latLngs = [];
allStores.forEach(s => {
  const onDisplay = storeIsOnDisplay(s); // real per-store/per-product check goes here
  L.marker([s.lat, s.lng], { icon: rrgPinIcon(onDisplay), rrgOnDisplay: onDisplay })
    .bindPopup(`<strong>${s.name}</strong><br>${s.street}, ${s.city}<br>${onDisplay ? 'On Display' : 'In-store stock varies'}`)
    .addTo(clusterGroup);
  latLngs.push([s.lat, s.lng]);
});
clusterGroup.addTo(map);
map.fitBounds(L.latLngBounds(latLngs), { padding: [24, 24] });
```

`fitBounds()` is what gives the zoomed-out, whole-country default view — it calculates the right zoom level and centre point to fit every pin on screen, rather than a hardcoded zoom/centre.

#### CSS — pin and cluster colours

```css
.rrg-map-pin span{display:block;width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#8a8a8a;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);}
.rrg-map-pin.on-display span{background:#BB0220;}
.rrg-map-cluster{display:flex;align-items:center;justify-content:center;}
.rrg-map-cluster span{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#8a8a8a;color:#fff;font-weight:800;font-size:13px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);}
.rrg-map-cluster.on-display span{background:#BB0220;}
```

Pins and cluster bubbles use hand-drawn CSS shapes (`L.divIcon`), not image files — no marker-icon assets to manage. Grey (`#8a8a8a`) is the default for a store without this product on display; `#BB0220` (brand red) marks a store that has it, for both individual pins and clusters. A cluster renders red the moment **any** store inside it is on display, so that signal is visible before a viewer zooms in — confirmed as the preferred approach over a single flat cluster colour or Leaflet.markercluster's default green/yellow/orange scheme.

#### Behavior summary

| Situation | Behaviour |
|---|---|
| Page loads, widget scrolls near viewport | Map initializes lazily (not on page load) for mobile data/performance reasons — see `spec.md` Section 10's mobile-audit note |
| Default view | Zoomed out to fit all stores in view (`fitBounds`), not centred on any one region |
| Many stores close together at low zoom | Grouped into one numbered cluster bubble; red if any store inside has the product on display, grey otherwise |
| User zooms in | Clusters split apart automatically (click a cluster to zoom into it directly) until individual pins show |
| Clicking a pin | Opens a popup with the store's real name, street address, and On Display / not status |

#### Region-specific heading copy

The black block's own heading (`<h3>` above the map, e.g. "See It In Person — On Display At 26 Stores Nationwide") is currently a static string per template, written for **AU only** — this prototype doesn't yet have the region selector from `spec.md` Section 10 item 21, so there's only one copy variant live today. When that region selector is built, this heading needs to change wording per region, not just re-run the same "N Stores Nationwide" phrasing everywhere — a single-store region reads oddly as "On Display At 1 Store Nationwide":

| Region | Store count | Heading copy |
|---|---|---|
| AU (multi-store network) | 26+ stores | "See It In Person — On Display At N Stores Nationwide" |
| NZ (single store) | 1 store | "See It In Person — On Display At the Auckland Store" |
| UK (single store) | 1 store | "See It In Person — On Display At the [X] Store" (real UK store name TBD) |

Build this as a small per-region copy lookup (same pattern as the rest of the region-selector cascade in `spec.md` item 21 — Click & Collect default tab, store count/map view, etc.), not a hardcoded string, so it stays in sync with whichever region the shopper has selected.

#### Before this leaves prototype stage

- Pin coordinates are demo-precision (approximate suburb centres) — geocode the real store addresses for production.
- The on-display flag per store is still a flat placeholder list, not driven by real per-product/per-store data — this is explicitly out of this project's scope (Brenton's own follow-up on the Rackety bin-location side); this widget just needs to read whatever boolean that work produces.
- Real postcode-driven search (typing a postcode and having the map re-centre/filter to nearby stores) isn't implemented — the postcode field in the black block still just informs the "View all stores" copy, not the map itself.
- Heading copy is AU-only today (see "Region-specific heading copy" above) — needs the NZ/UK variants once the region selector exists.

---

*Sections are added here as more of the prototype gets finalized and handed over — this is not the full site brief yet. Check `spec.md`'s own "Developer Brief" note for the date of the last addition.*
