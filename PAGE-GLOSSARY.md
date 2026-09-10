# PDP Page Glossary

Reference for naming the parts of the product page (PDP) templates, so "gallery," "widget," "panel," etc. all mean one specific thing in conversation. Split into **Sections** (structural blocks that lay out the page) and **Widgets** (interactive components that live inside sections). Where a name has caused confusion before, that's called out explicitly.

Applies across the 5 templates in `prototypes/`: **Simple**, **Sibling-Color**, **Config-Variant**, **Vehicle-Specific**, **Grouped-Bundle**.

---

## ⚠️ Naming clash to know about: "Gallery"

There are **three different things** that have all been called "gallery" at some point. Use the specific name:

| Specific name | What it is | Where it lives |
|---|---|---|
| **Main Product Gallery** | The primary product photos — big image + thumbnail strip at the top of the page, beside the Decision Panel. Always stays put beside the Decision Panel; nothing moves it. | `.gallery-main`, `.gallery-thumbs`, `.gallery-col` — all templates |
| **Fitted Photos Gallery Placement toggle** | A Demo State Panel control that moves the *Fitted Photos Gallery* (not the Main Product Gallery — an earlier build had this wrong) between full width above the tabs and nested under the Main Product Gallery in the left column | `applyFitGalleryPlacement()` — **Vehicle-Specific only** |
| **Fitted Photos Gallery** | Real customer installation photos, presented as the "Gallery" panel widget (icon badge, "View All In-store Fitments (N)" link, "Explore Fitting Costs" button, photo carousel with nav arrows + page dots) — separate from the Main Product Gallery entirely | `.fit-gallery-section` / `.fit-gallery-panel` — **Vehicle-Specific only** |

When you say "the gallery" going forward, say which of the three you mean, or use the bold name above.

---

## Sections

Top-to-bottom structural blocks. Not every section appears on every template — noted where limited.

| Section name | Description |
|---|---|
| **Utility Bar** | Thin top strip above the main header (nearest store, vehicle, call us, region, account) — `.rrg-utility-bar` |
| **Main Header** | Logo, nav links, search bar, cart icon — `.rrg-main-header` |
| **Breadcrumbs** | Trail above the hero — `.rrg-crumbs`. 3 levels (Home → Category → Product) on Simple/Config-variant/Sibling-color/Grouped-bundle; 4 levels on Vehicle-specific (Home → Vehicle → Category → Product, e.g. Home → Toyota Hilux N80 → Platforms & Trays → product) per Graham's requested structure. Note: this class name doesn't contain the word "breadcrumb" — a session grepped for that literal word 2026-09-10 and wrongly concluded breadcrumbs didn't exist. Search for `.rrg-crumbs` instead. |
| **Hero** | The main above-the-fold row: Main Product Gallery on the left, Decision Panel on the right — `section.hero` |
| **Decision Panel** | The right-hand sidebar column in the Hero: brand logo, SKU, price, fitment status, variant/colour picker, Add to Cart, payment badges, Delivery/Click & Collect widget — `.decision-panel` |
| **Trust Row** | 4-column strip of trust points (Trusted Since 1989, Trained Professionals, etc.) below the hero — `.trust-row` |
| **Showroom Finder section** | Full-width black CTA block ("See It In Person — On Display At N Stores") — its own section below the hero, not inside the Decision Panel. **Now on all 5 templates** (client ask, 2026-09-10; previously Vehicle-Specific only), toggleable per-SKU via the Demo State Panel. See Widgets below. |
| **Fitted Photos Gallery section** | "See it fitted to a [vehicle] just like yours" — grid of real installation photos. **Vehicle-Specific only.** See naming clash above. |
| **Short Description** | One paragraph of product copy, sits between the Hero/Trust Row and the Tabs. Used on lower-complexity templates (Simple, Sibling-Color). |
| **Body Tabs section** | Full-width area containing the Tabs widget (Details/Specifications/Gold Guarantee/Shipping/Fitting Instructions) — `.body-cols` |
| **Related Products section** | "Related Products" heading + grid of cross-sell product cards — `.related-heading` / `.related-grid` |
| **Design Rationale section** | Bottom-of-page internal/reviewer section explaining build decisions and trade-offs — not part of the shipped design — `.rationale` |
| **Sticky Mobile Bar** | Condensed price + Add to Cart bar fixed to the bottom of the screen, mobile only — `.sticky-cta-mobile` |
| **Persistent Bar** | Condensed fitment/price + Add to Cart bar fixed to the top of the screen on desktop, fades in once the Decision Panel scrolls out of view — `.persistent-bar` |

---

## Widgets

Interactive or reusable components that live inside the sections above.

| Widget name | Description |
|---|---|
| **Main Product Gallery** | Big image + horizontal-scroll thumbnail carousel. See naming clash above. |
| **Fitted Photos Gallery** | "Fitment Gallery" panel: icon badge + heading, right-aligned "View All In-store Fitments (N)" link, and a landscape-photo carousel (nav arrows + page dots) of real customer installation photos — 4 photos per view when nested, 7 when full-width. Has its own Red background toggle (Demo State Panel) independent of the placement toggle. **Vehicle-Specific only.** See naming clash above. |
| **Variant Picker** | Comparison-card selector for Assembled vs Flat Pack — **Config-Variant & Vehicle-Specific** — `.variant-picker` |
| **Colour/Swatch Grid** | Grid of colour swatches for sibling-colour products (e.g. MaxTrax) — **Sibling-Color only** — `.swatch-grid` |
| **Fitment Status widget** | The "fits your vehicle / doesn't fit / no vehicle set" box, white card with a coloured left accent — appears in the Decision Panel, the Sticky Mobile Bar, and the Persistent Bar — `.fitment` |
| **Payment-Plan Badges** | Afterpay / PayPal / Zip instalment amounts, shown under Add to Cart — `.payment-badges` |
| **Delivery / Click & Collect widget** | Tabbed widget (Delivery | Click & Collect) sitting directly under Add to Cart in the Decision Panel — `.dc-widget`. Reworked 2026-09-10: one shared postcode field (`.dc-postcode-row`, sits above both tab panels, not one input per tab, starts **empty** — a follow-up fix same day, an earlier version prefilled a demo postcode which read as real customer data), default active tab is now **Click & Collect** (was Delivery), small tab icons. **Both panels' results are hidden until a postcode is entered** (Delivery's Standard/Express rates and Collect's named store rows) — Delivery was initially missed in this fix (left showing regardless) and corrected in a later pass same day; while hidden, Delivery shows a `.dc-postcode-prompt` ("Enter your postcode above to see delivery options.") and Collect's results area is replaced by its `.dc-viewall-line` (store count + "View all stores", copy changes once a postcode is entered). See `initDcPostcode()`. |
| **Store Slide-out** | Right-edge drawer listing the full real store network — opened by "View all stores," present on the Click & Collect widget (all 5 templates) and the Showroom Finder widget (Vehicle-Specific only so far). Rebuilt 2026-09-10 (follow-up same day) on real data: scraped from the live site's own Store Inventory slide-out (a real product's Click & Collect card, "View all Stock") via Playwright — 35 real stores, real names/addresses/phone numbers/Google Maps links, grouped by state to match the live site's presentation. See `RRG_STORE_NETWORK` below. — `.store-slideout` / `.store-slideout-backdrop` / `buildStoreSlideout()` |
| **RRG_STORE_NETWORK** | The canonical real store dataset backing the Store Slide-out and the Click & Collect widget's inline rows on every template — one shared list in shared.js (store identity doesn't vary by product), not per-template fabricated data. Per-store In Stock/Order In status and which stores are flagged "On Display" (`ON_DISPLAY_STORES`) are still demo/placeholder — no real per-SKU per-store stock feed exists. New 2026-09-10. |
| **On Display pill** | Pill shown on individual store rows (Click & Collect's inline rows and the Store Slide-out) alongside the existing In Stock/Order In pill, wherever that specific store is flagged as carrying this product on display (`ON_DISPLAY_STORES`) — e.g. Moorebank shows both "In Stock" and "On Display." **Corrected 2026-09-10 (same day, client feedback):** an earlier version placed this pill next to the price/stock-status line instead — wrong, since "on display" is a per-store fact, not a blanket product-level one; that placement was removed entirely. Distinct gold/bronze colour from the green "In Stock" pill — `.stock-chip.display` / `rrgStorePillsHTML()` |
| **Showroom Finder widget** | High-contrast black CTA block, "on display at N stores," postcode search, paired with the Interactive Map (below) in a split view — sits in its own full-width section below the hero (not the Decision Panel). **All 5 templates**, with a Demo State Panel toggle ("On display in-store") to preview a SKU that isn't on display anywhere — `.showroom-widget` / `#showroom` / `applyShowroomFlag()`. Its own inline store-row pills use the same gold "On Display" colour as the On Display pill above. Its "View all stores" link is white (`.showroom-widget .dc-viewall`, scoped to this widget only — the same link in the Click & Collect card stays blue), since white reads better against the black background. |
| **Interactive Map** | Leaflet + OpenStreetMap tiles, real pins for the demo store network — runs alongside the Showroom Finder widget's black block in a **split view** (`.showroom-widget.split-view`, `#showroomDefaultView` : `#showroomMap` at a 1:2 width ratio, map flush to the widget's edges with no padding). **Piloted on Vehicle-Specific only, then locked in as the default and rolled out to all 5 templates same day (2026-09-10) after client review** — no longer a Demo State Panel toggle; `applyShowroomMapFlag(true)` runs unconditionally wherever `#showroomMap` exists. Fixed along the way: a z-index bug where the map rendered on top of the Demo State Panel (`.showroom-map{position:relative;z-index:0}` contains Leaflet's internal panes, which otherwise default up to z-index 1000) and a layout bug where the first version replaced the black block entirely instead of running alongside it. Real postcode-driven radius search still isn't implemented (no geocoding service) — flagged as the gap before this leaves prototype stage. — `#showroomMap` / `applyShowroomMapFlag()` |
| **Package Contents / "What's Included"** | List of individual kit components with their own SKUs and copy buttons — **Vehicle-Specific & Grouped-Bundle only** — `.package-items` |
| **Get It Installed CTA** | Installer photo + REVIEWS.io badge + "More Information + Bookings" button, paired with the product video under the gallery. **Now on all 5 templates** (client ask, 2026-09-10; previously Config-Variant & Vehicle-Specific only) — `.install-media-row` / `.install-cta-panel` |
| **Product Video** | Embedded product video or placeholder, appears under the Main Product Gallery — `.video-wrap` / `.video-placeholder` |
| **Sale Tag** | Corner ribbon graphic on the Decision Panel shown when a product is on sale — `.sale-tag` |
| **Brand Logo** | Manufacturer logo at the top of the Decision Panel — `.brand-logo` |
| **Special Order banner** | Informational banner above Add to Cart ("Special order: contact us...") — doesn't block purchase — `.special-order-banner` |
| **Ex-Demo / B-Stock CTA + modal** | Inline text appended to the stock-status line itself (`In Stock — Ex-Demo/Factory Seconds from $X`), price portion a clickable blue link, opening a modal listing Ex-Demo/Sellable Return/Factory Second discount options. Was a separate `.exdemo-cta` button — changed 2026-09-10 (Graham Sowerby meeting) since a standalone button risked being missed — `.exdemo-inline-link` / `renderStockLine()` / modal |
| **Paid "Fitted" Option** | Demo-preview-only upsell — either a third variant card or a checkbox above Add to Cart, offering paid fitting — **Config-Variant & Vehicle-Specific only** — `.fitted-upsell-checkbox` etc. |
| **Tabs widget** | Accordion/tab-bar of Details, Specifications, Gold Guarantee, Shipping Info, Fitting Instructions — `.tabs` |
| **Related Products carousel** | Grid of cross-sell product cards below the main content — `.product-card` |
| **Copy-to-clipboard buttons** | Small "⧉ Copy" buttons next to SKUs (main SKU row and each Package Contents item) — `.copy-btn` |
| **Demo State Panel** | Floating "Demo State" button (bottom-right) that expands into a reviewer-only control panel for previewing product states (video/sale/stock/shipping/collect/special order/ex-demo/showroom/fitted option/gallery placement/session vehicle, plus the Vehicle-Specific-only interactive map pilot). Not part of the shipped design. Add to Cart colour is no longer a toggle here — gold is now the locked real default. — `.admin-fab` / `.admin-panel` |

---

*Generated 2026-09-10. If a new section or widget gets added, add it here too so this stays the source of truth for naming.*
