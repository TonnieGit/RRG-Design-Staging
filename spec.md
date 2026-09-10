# Product Page Rebuild — Engineering Spec

Project: modern e-commerce product page templates for Roof Racks Galore.
Source of truth for business requirements: `product-page-requirements.md` (same project folder). This spec translates that into a build plan.

## 0. Goal & Design Mandate

This is **not a re-skin of the existing site.** The current product pages are the feature/content baseline (what needs to be covered), not the layout or UX baseline (how it's presented). The mandate is a ground-up rebuild focused on conversion, benchmarked against 2026 ecommerce UX best practice — even if that means the four product types end up with meaningfully different layouts from each other and from the current site, so long as each is the best-converting approach for that product type. Brand colors/voice stay consistent; layout, structure, and interaction patterns do not need to.

This is a **prototyping/scaffolding phase**, not a production Magento theme build. Output should be static or lightly-templated pages (framework TBD — plain HTML/CSS/JS, or a component framework, whichever is fastest to iterate on visually) that can be reviewed, iterated on, and eventually used as the reference for the real Magento 2 template work.

**Direction validated by client, 2026-09-10 (Scott Childs & Jake/RRG Web Products):** the client's separate in-house Figma redesign was independently reviewed by external UI/UX contacts and informal usability testing (non-industry spouse test) and found to be *worse* than the current live site on usability grounds — "too busy," no single clear primary action. In the same meeting, this project's config-variant prototype (built from this spec) was shown instead and explicitly endorsed by both stakeholders as the direction to build toward going forward ("100%", "I definitely think we should be going with what you've done"), superseding the client's Figma work. The operating principle going forward: **above the fold = hero image + title + price + one unmistakable primary CTA (Add to Cart) + fitment status where applicable, nothing else competing for attention; every other feature (trust icons, on-display/showroom info, gallery, video, tabs, related products) gets pushed below the fold or into the accordion tabs.** This doesn't remove any required feature from Section 5 — it's a placement/prominence principle, not a scope cut. See Section 9 for the full list of confirmed follow-up changes from this meeting.

### 0.1 Conversion research findings to design against

Grounded in 2026 ecommerce UX research (Baymard Institute benchmarks, Nielsen Norman Group, Spiegel Research Center, and fitment-vertical CRO case studies). Use these as design constraints, not just inspiration:

1. **The bar is genuinely low industry-wide.** Baymard's 2026 benchmark found 52% of desktop sites, 62% of mobile sites, and 64% of apps deliver "mediocre or worse" product page UX. Getting the fundamentals right is itself a competitive advantage.

2. **Imagery and video are the highest-leverage investment, not copy.** 93% of consumers cite visual appearance as the key purchase-decision factor (Nielsen Norman Group). High-quality photography across multiple angles plus video is the single highest-impact conversion lever for most categories. This validates and elevates the priority of the Fitment Gallery and product video requirements — they are core conversion infrastructure, not supplementary content.

3. **Reviews carry outsized weight on higher-ticket items.** Products with 5+ reviews convert 270% better than products with zero reviews (Spiegel Research Center); for items over $100, five reviews increases purchase likelihood by 380%. Reviews/star rating need real visual prominence near the top of the page, not a link buried below the fold.

4. **Total cost and return-policy transparency are widely neglected — an easy structural win.** 67% of ecommerce sites fail to show total cost (incl. shipping/tax) on the product page; 44% fail to surface return policy. Both are named top abandonment causes. RRG already has strong underlying content here (Delivery/Click & Collect widget, Gold Guarantee) — the design task is surfacing it early and clearly, not tabbing it away.

5. **Fitment uncertainty is the single biggest conversion killer in this specific vertical — this is the most important finding for this project.** CRO case studies in fitment-driven verticals (ignition parts, auto parts generally) consistently identify "fitment uncertainty close to purchase" as the top structural conversion blocker, and identify precise vehicle compatibility + clear specs + fast confirmation as what actually converts browsers into buyers. **Implication: the fitment status message (Fits / Confirm your vehicle / Doesn't fit) must sit directly beside price and Add to Cart — not as a badge elsewhere on the page, not tabbed, not below the fold.** This is the single highest-priority placement decision in the whole spec for vehicle-specific templates.

6. **Mobile-first is mandatory, not a checkbox.** Mobile is ~73% of ecommerce traffic. 2026 best practice specifically calls for sticky Add-to-Cart CTAs, thumb-friendly variant selectors (not tiny dropdowns), and compressed/collapsible content sections on mobile — design mobile layout first, not as a responsive afterthought of desktop.

7. **Replace "above the fold" thinking with the "3-second confidence rule."** A visitor should get an instant, clear answer to "should I even consider this product?" near the title — a short value-prop/differentiator line, not just a title and price. Relevant especially for vehicle-specific and config-variant templates where the product name alone is dense/technical.

8. **Structured data and AI-assisted shopping discovery are now a live design input, not just SEO.** 2026 guidance includes Product/variant schema markup and natural-language-friendly content so AI shopping assistants can accurately compare and recommend. Worth a lightweight pass (schema.org Product/Offer markup) even at prototype stage so the pattern is established.

Full source list is in Section 8.

## 1. Product Type Taxonomy

Four page templates are required. A given real product may combine more than one dimension (see Section 4, open question). **Per the design mandate above, each template's layout should be optimized independently for its own conversion challenge rather than forced into one shared skeleton** — Section 5 gives a components list, not a fixed layout order, for this reason.

| Type | Variant mechanism | Reference example(s) | Primary conversion challenge |
|---|---|---|---|
| **Simple** | None | Front Runner Pro Water Tank 42L (`FRWTAN063`) | Fast, low-friction path to cart — minimal hesitation expected, don't over-build the page |
| **Config-variant** | Dropdown/toggle (non-visual options, e.g. Assembled/Unassembled) | Rhino Rack 6 Series Pioneer Platform 900×1430 — `RH62112` (assembled) vs `RH62112F` (flat pack) | Making the trade-off (price vs. convenience/labor) clear and easy to compare |
| **Sibling/color** | Swatch picker | MaxTrax MKII — full family of **13 colors** scraped (`data/raw/MAXTRAX_MKII_family.json`), each currently its own listing on the live site | Visual browsing/selection — swatches need to be fast and satisfying to click through |
| **Vehicle-specific kit** | Config-variant (assembled/unassembled etc.), layered on top of fitment logic — confirmed combinable, not either/or (see Section 4, item 1) | Rhino Rack JC-01773 Pioneer 6 Platform for Toyota Hilux N80 — `GP01M1TZZ` | **Fitment confidence** — this is the highest-stakes conversion problem of the four (see 0.1.5) |
| **Grouped/bundle kit (non-vehicle)** ✅ *confirmed 2026-09-10, built 2026-09-10* | None (fixed bundle) | Yakima RoadShower 15L Complete Shower & Hose Bundle — `8004109PROMO` (real, live; client's own promised example SKU never arrived, so this stands in — flagged for confirmation) | Same challenge as Simple (fast, low-friction) — the only difference from Simple is a "What's Included" component-breakdown box (de-emphasized styling, same as vehicle-specific's) since the bundle has multiple physical parts. Layout is otherwise Simple's, not a distinct template. Built at `prototypes/grouped-bundle/index.html`. |

### 1.1 Critical constraint: no variant UI exists on the live site, anywhere

Every variant (color, assembled/unassembled, etc.) is currently a fully separate product listing — its own URL, SKU, page. There is nothing to lift or adapt for on-page variant selection; it's being built from scratch. Practically, this means:

- **Scraping is per-listing, not per-product-family.** To build one config-variant or sibling/color page, scrape each separate live listing that belongs to the family, then merge.
- **A merge step is required** before a variant template can render. See Section 3.

## 2. Data Model

Suggested shape for a merged product record (JSON), used to drive all four templates:

```json
{
  "product_family_id": "rhino-pioneer-6-900x1430",
  "product_type": "config-variant",
  "shared": {
    "brand": "Rhino Rack",
    "brand_logo_url": "...",
    "title_base": "Rhino Rack 6 Series Pioneer Platform 900 x 1430mm",
    "description_long": "...",
    "trust_icons": [
      {"label": "Trusted Since 1989", "sub": "Now with over 30 locations Australia wide"},
      {"label": "Trained Professionals", "sub": "Over 200,000 roof racks fitted"},
      {"label": "Australia's Largest", "sub": "We're the only nationwide roof rack specialists"},
      {"label": "Need Help", "sub": "Contact us on: 1300 071 264"}
    ],
    "gold_guarantee_content": "...",
    "shipping_info_content": "...",
    "breadcrumbs": ["Home", "Platforms & Trays", "..."],
    "related_products": [ { "sku": "...", "name": "...", "price": "...", "image": "...", "url": "..." } ]
  },
  "variants": [
    {
      "variant_label": "Assembled",
      "sku": "RH62112",
      "price_was": 1059.00,
      "price_now": 900.15,
      "discount_pct": 15,
      "images": ["..."],
      "video_url": "https://www.youtube.com/embed/cWOku7VJcjM",
      "fitting_instructions_pdf": "https://rackit.s3.amazonaws.com/manuals/...",
      "specifications": { "Platform Style": "Flat", "Platform Size (L x W x H)": "900 x 1430mm", "Number of Platform Planks": 4, "Platform Weight": "12.5kg", "..." : "..." },
      "stock_status": "in_stock"
    },
    {
      "variant_label": "Flat Pack (Unassembled)",
      "sku": "RH62112F",
      "price_was": 979.00,
      "price_now": 780.00,
      "discount_pct": 20,
      "images": ["..."],
      "video_url": null,
      "fitting_instructions_pdf": "https://assets.rhinorack.com/Instructions/...",
      "specifications": { "Number of Platform Planks": 5, "...": "..." },
      "stock_status": "in_stock"
    }
  ]
}
```

Notes:
- `shared` holds anything identical across variants (Details prose, Gold Guarantee, Shipping Info, trust icons, breadcrumbs, related products, brand).
- `variants[]` holds anything that differs (price, SKU, images, video, fitting instructions PDF, and any specification key that differs — see plank-count discrepancy below).
- For **simple** products, `variants` has exactly one entry and the variant picker UI is omitted.
- For **vehicle-specific kits**, add a `fitment` object (see Section 2.1) instead of a variants array, or alongside it if a kit can also carry a config-variant (open question, Section 4).
- Specification fields that differ between variants (e.g. plank count 4 vs 5 on the assembled/flat-pack pair) should live in each variant's `specifications`, not `shared` — even if most spec fields are identical, don't assume the whole spec table is shared without checking field-by-field during scraping.

### 2.1 Fitment object (vehicle-specific kits only)

```json
{
  "fitment": {
    "vehicle_make": "Toyota",
    "vehicle_model": "Hilux",
    "vehicle_generation": "N80",
    "vehicle_years": "2015-2026",
    "body_style": "4dr Ute",
    "roof_type": "Bare Roof",
    "fitment_gallery": {
      "count": 283,
      "images": [ { "thumb_url": "...", "detail_url": "https://www.roofracksgalore.com.au/rackit/fitment/display/item/rackit/product_id/component?parent_sku=GP01M1TZZ&product_id=166874" } ]
    }
  }
}
```

The three fitment-messaging states (Fits / Unknown / Doesn't fit) are a **runtime/session concern**, not scraped data — they depend on comparing this product's fitment data against whatever vehicle is set in the user's session at view time. Build this as a small pure function: `getFitmentStatus(productFitment, sessionVehicle) -> "fits" | "unknown" | "no_fit"`, with the three states driving which message/CTA renders near the top of the page.

## 3. Variant Merge Strategy (scraping → page model)

For config-variant and sibling/color templates:

1. Identify all separate live listings belonging to one product family (manual list for now — provided per-family by the client; no automated "family detection" exists on the live site).
2. Scrape each listing individually. Use targeted extraction, not a single full-page dump — see Section 3.1 for why.
3. Diff the scraped records field-by-field. Anything identical across all variants → `shared`. Anything that differs → stays in that variant's object.
4. Flag any field that differs unexpectedly (e.g., plank count 4 vs 5) for a human sanity check rather than silently treating it as either shared or correct — some differences may be genuine spec differences, others may be data inconsistencies on the live site.
5. Assemble into the JSON shape in Section 2 and hand to the template.

### 3.1 Scraping notes

- Vehicle-specific product pages can have enormous fitment galleries (283+ images seen on one SKU) that dominate the page's HTML. A naive full-page text scrape will truncate before reaching price/description/tabs content. Scrape targeted sections separately:
  - Price + discount badge
  - Title + breadcrumbs
  - Description (short + long)
  - Specifications table
  - Tab contents (Gold Guarantee, Shipping Info, Fitting Instructions link)
  - Related products carousel
  - Fitment gallery (paginate or cap; don't pull all images inline into the same extraction pass as everything else)
- Info tabs are **conditionally present** — not every product has Fitting Instructions or a video. Scrape what's there; don't assume a fixed tab count.
- Pricing pattern to expect: `$was $now` strikethrough pair, plus a discount badge (e.g. "Save 20%" or "$243 off RRP" depending on product type).

## 4. Open Questions (flag to client before finalizing templates, don't block scaffolding on these)

1. ✅ **Resolved (client meeting, 2026-09-10 — Scott Childs & Jake/RRG Web Products):** Yes — a vehicle-specific kit *can and should* also carry a config-variant (e.g. assembled/unassembled) simultaneously. Confirmed via the Pioneer 6 Platform × Hilux N80 example: a customer searching their Hilux still needs to pick between flat-pack and assembled. The data model needs both `fitment` and `variants[]` on the same record, and the page needs both a variant picker and fitment messaging, adjacent to each other near price/Add to Cart. **Action: add a variant picker to the vehicle-specific template** (see Section 9).
2. Is vehicle fitment matched exactly (this exact model/year), or does it span a range/generation? Affects how `getFitmentStatus` compares session vehicle to product fitment. Still open.
3. Do sibling/color products (e.g. MaxTrax) ever also need vehicle-fitment logic, or are "variant type" and "fitment type" independent, freely-combinable dimensions? Still open.

Scaffold assuming these are all independent/combinable (most flexible), and note in code comments where a decision on the above would simplify the model.

## 5. Page Composition

**This is a components list, not a mandated layout order.** Per the design mandate (Section 0), each template should sequence and weight these differently based on its own conversion challenge. The one hard placement rule, driven directly by the research in 0.1.5: **for the vehicle-specific template, fitment status must be adjacent to price/Add to Cart — treat this as non-negotiable, not a design preference.**

Components to build (all templates draw from this pool, not all use all of them). **Status key:** ✅ built and live on the relevant template(s) · ⬜ not started.

- ⬜ **Breadcrumbs — status corrected 2026-09-10, was wrongly marked done.** The data model (Section 2) has always included a `breadcrumbs` field and this line previously said ✅, but a grep across every `prototypes/**/index.html` confirms no breadcrumb markup exists on any template — verified during the Graham Sowerby review meeting the hard way (landing on a PDP is a dead end, no path back to the category/vehicle-landing page). See Section 9's Graham meeting write-up for the required structure (Vehicle Landing Page → Category → Product).
- ✅ **Brand logo — now a hard requirement on every template, not just Vehicle-specific** (client instruction, 2026-09-10). Real logo files for all three brands in the current catalogue (Rhino Rack, Front Runner, MAXTRAX) are on hand — see Section 9.
- ✅ Title + micro value-prop line (the "3-second confidence rule" answer — a short differentiator, not just the product name)
- ✅ SKU (with copy-icon) + reviews/star rating — reviews need real visual weight, not a small link, given the 270–380% conversion lift they carry on higher-ticket items. The copy-icon actually copies the SKU to the clipboard now (was decorative at first build) — instore-staff-facing utility, confirmed working.
- ✅ **Done 2026-09-10 (Graham Sowerby meeting):** Ex-demo/factory-seconds — the modal itself (2–3 condition/price options, each with its own price/fulfillment note/image) stays, but the entry point changed from a separate `.exdemo-cta` button to inline text appended to the stock-status line itself — `In Stock — Ex-Demo/Factory Seconds from $1,495`, with the price portion a clickable blue link (`.exdemo-inline-link`) that opens the existing modal (`renderStockLine()` in shared.js). Supersedes the earlier "try 2–3 button-weight variations" idea from the same meeting. Still demo-panel-toggled, still needs a real inventory data source before production (unchanged gap).
- ✅ Price (was/now, discount badge) + total-cost/shipping indicator nearby (don't make the visitor go find shipping cost separately — this is a named top abandonment cause)
- ✅ **New:** Sale tag graphic (corner ribbon on the decision panel) — shown/hidden by the same on-sale state as the price, not a separate toggle. Client-supplied asset (`sale-tag.png`, a "Spring Sale" design specifically — a generic/seasonless version is worth getting for when the promotion changes).
- ✅ **New:** Special order messaging — a banner near Add to Cart ("Special order: contact us and we'll order this in for you, approx. 5–7 business days") for products that aren't on-hand but are orderable. Add to Cart stays enabled (client's explicit call — informational, not a purchase blocker). Demo-panel-toggled preview only; **flag to client: needs a real "is this a special-order SKU" data field before production.**
- **Vehicle-specific template: fitment status message (Fits / Confirm your vehicle / Doesn't fit) — placed directly beside price/Add to Cart, not elsewhere** ✅ — ✅ **lightened 2026-09-10** per client feedback: `.fitment` changed from a full solid-tinted box to a white/near-white card with a 3px colored left accent, label+dot keeping the state color, body copy neutral gray. Applies automatically to both the decision panel and the persistent/sticky decision bar's fitment indicator (same shared class), which keeps its structure/behavior as-is per client confirmation.
- ⚠️ **Vehicle-specific only, new:** Package contents list ("What's Included") for multi-part kits — each component (platform, backbone, tracks, etc.) as its own row with its own SKU + working copy button, so instore staff can copy individual part numbers without digging through the spec table. **Two changes owed per the Graham Sowerby meeting 2026-09-10:** (1) each row needs a visible quantity (×1, ×2), currently absent — risk flagged is a customer adding one product to cart and being confused when a 3-item bundle arrives with no visible reason why; (2) drop the separate copy-icon button, make the SKU text itself the click-to-copy target (same change applies to the main SKU row above the product title).
- **Config-variant / sibling-color templates:** variant picker (dropdown/toggle or swatches) — thumb-friendly sizing on mobile, not a cramped native dropdown ✅
- ✅ Image carousel (master + secondary images; embed video where present) — highest-leverage visual investment per research, don't undersize this on mobile. Thumbnails now scroll as a single-row carousel (prev/next nav) rather than wrapping to a second row once there are 5+ images.
- ✅ Add to Cart — sticky on mobile scroll. **Colour locked in 2026-09-10 (Graham Sowerby meeting):** gold is now the real shipped default, not a preview toggle — Graham saw it live on the gold state and said to lock it in ("I think I'm happy to actually just lock in the gold"). The red-vs-gold Demo State Panel checkbox was removed (no longer an open question); `[data-cta-label].btn-primary` in shared.css is gold (`#FFCA48`/black text) by default across all 5 templates, while other `.btn-primary` buttons (e.g. Find Nearest Showroom) stay red.
- ✅ **New (client meeting, 2026-09-10), done:** Payment-plan badges (Afterpay/Zip/PayPal Pay in 4) directly under Add to Cart, on all five templates (including the new grouped/bundle one) — new `.payment-badges` component in shared.css, CSS-drawn wordmarks since no logo assets exist for these providers. **Confirmed 2026-09-10 (Graham meeting) this isn't just nice-to-have — it's a contractual display requirement under RRG's Afterpay agreement**, on top of the conversion benefit.
- ✅ **Done 2026-09-10 (Graham Sowerby meeting rework):** Delivery / Click & Collect widget (tabbed: Delivery | Click & Collect) — single postcode field shared across both tabs (was one input per tab), results visible by default (no click required), default tab flipped to **Click & Collect** (was Delivery), small icons on the tab labels, and a "View all stores" link (not button) under the Click & Collect results opening a new store slide-out drawer (`.store-slideout`, `buildStoreSlideout()` in shared.js — no such slide-out previously existed anywhere in the prototype, despite earlier docs implying one did; confirmed by full-repo search before building it). The existing "both unavailable" message state (`.dc-unavailable-note`) needed no changes — still correct with the new default tab.
- ✅ **Done 2026-09-10 (Graham Sowerby meeting rework):** Showroom Finder widget — on all 5 templates, with a Demo State Panel toggle to preview a SKU that isn't on display anywhere. Two changes: (1) a small **"On Display" pill** (`.stock-chip.display`, own gold/bronze colour, distinct from the green "In Stock" pill) next to the stock-status line near price/CTA, visible on load without needing to interact with anything, wired to the same toggle as the full block; (2) an **experimental interactive map** (Leaflet + OpenStreetMap, free, no API key) piloted on **Vehicle-Specific only**, toggled from its own Demo State Panel section, swapping in place of the block's default content — real map tiles, pins for the demo store network. Explicitly a "test and scrap if it doesn't work" pilot per the meeting, not yet rolled out to the other 4 templates or made a committed feature.
- ⚠️ Get It Installed CTA — built as an image+text panel (installer photo, REVIEWS.io badge, "More Information + Bookings" button), paired side-by-side with the product video under the gallery where both exist, or with a video placeholder where no real video was scraped. **Placement rule confirmed 2026-09-10: this component must sit directly under the secondary image thumbnails, constrained to the width of the image column — never full page-width.** ✅ **Fixed 2026-09-10:** vehicle-specific's `.install-media-row` moved inside the gallery column div (was a separate full-width `<section>` after `.hero` closed) — now matches config-variant's placement exactly. **Rolled out to Simple and Sibling-Color 2026-09-10 (client ask)** — previously they only had a bare, admin-toggleable video-thumbnail placeholder with no Get It Installed panel; now all 5 templates carry the full `.install-media-row` pairing and respond to the same Demo State Panel "Has video" toggle. **New requirement, Graham Sowerby meeting 2026-09-10:** button copy needs two states — when a Fitment Gallery exists, copy should reference the real count and clicking should scroll/link to the Fitment Gallery (e.g. "See 283 real fitments"); when no Fitment Gallery exists for that product, it falls back to the current generic "More Information + Bookings." Needs its own Demo State Panel toggle ("Fitment Gallery: on/off") to preview both states — doesn't exist yet.
- ✅ **New (client meeting, 2026-09-10), demo-preview only, done:** Paid "Fitted" option as a purchasable upsell preview — generic `reapplyFittedOption()`/`setFittedOptionFlag()`/`setFittedOptionMode()` in shared.js, gated on `.variant-picker` presence (config-variant + vehicle-specific). Master on/off switch, plus a sub-toggle between **Mode 1** ("Fitted" as a full-width third card appended to the variant picker, gold-tinted, "Preview only" label, survives real variant-switch re-renders) and **Mode 2** ("Fitted" as a separate upsell checkbox injected directly above Add to Cart). Purely visual — no real price/cart wiring. Real feature still needs store-ops/state-manager sign-off before going live (fitting costs aren't standardized across stores).
- ✅ Trust icon row (4 icons, same content site-wide)
- ⚠️ Short description. **New requirement, Graham Sowerby meeting 2026-09-10:** clamp to 2 lines with a "Read more" link that jumps to the Details/Description tab — not built yet, current value-prop line has no clamp/read-more logic.
- ⚠️ Info tabs: Details, Specifications, Gold Guarantee, Shipping Info, Fitting Instructions (render only tabs with content) — Gold Guarantee/return-policy content should also be glanceable near price, not only tabbed, since return-policy visibility is another named abandonment cause. **Two changes from the Graham Sowerby meeting 2026-09-10:** (1) Specifications must render as a real 2-column table (attribute name | value) — confirmed the underlying data is always attribute/value pairs, never free text or a pre-formatted table, so dot-points were a display choice worth fixing, not a data constraint; (2) Gold Guarantee tab content should condense to the 2 most relevant USP-style lines (90-day hassle-free exchange/return, nationwide support) plus a "Learn more" link out to the dedicated guarantee page, rather than the full guarantee copy inline.
- ⬜ **New, Graham Sowerby meeting 2026-09-10:** Important Vehicle Fit Notes ("Important Vehicle Footnotes" on the live site) — vehicle-specific only, warns about model-specific fitment caveats (e.g. panoramic/glass roof restrictions). Sits below the vehicle-confirmation/fitment status area. Variable length, not present on every vehicle — needs a Demo State Panel toggle (with/without) to preview both states.
- ⬜ **New, Graham Sowerby meeting 2026-09-10:** Rack Fit Guarantee icon — small grayscale/outline badge in the top-right corner of the "Fits Your Vehicle" widget, fitment-relevant products only (not shown on non-fitment Simple-type products like the water tank). Explicitly must **not** sit above the fold as a standalone colorful icon — this is the compromise location agreed after ruling that out.
- **Vehicle-specific only:** Fitment Gallery ("Fitment Gallery" panel: icon badge + heading, right-aligned "View All In-store Fitments (N)" link, landscape-photo carousel with nav arrows + page dots) — high priority given research on imagery's conversion weight ✅. Redesigned 2026-09-10 to match a live-site/Figma reference — see Section 9's "Fitted Photos Gallery" follow-up entry for full detail, including a Red/non-red background admin toggle (default non-red).
- ⚠️ **Superseded 2026-09-10 (corrected same day):** the "Gallery Placement" toggle originally built here moved the *Main Product Gallery* on both vehicle-specific and config-variant — this was a misunderstanding. It's been corrected to `applyFitGalleryPlacement()`, which moves the **Fitment Gallery** (not the Main Product Gallery, which no longer moves at all) between full-width-above-the-tabs and nested-under-the-main-gallery. Vehicle-specific only now — config-variant's copy was removed since it has no Fitment Gallery to place. See Section 9.
- ✅ Related / recently viewed / upsell / cross-sell carousels
- ⬜ Lightweight schema.org Product/Offer structured data — only wired up on Simple so far (see Section 9); still owed on the other three templates.

## 6. Suggested Build Order in Claude Code

**Status key used below:** ✅ done · ⚠️ done but deviated from the suggestion · ⬜ not started. See Section 9 for the full current-status log.

1. ✅ **Design exploration first, per template — produce 2–3 distinct layout directions, not one, and justify every one of them.** Done in full for **vehicle-specific only** (the highest-stakes template — see Section 9). ⚠️ For Simple/Config-variant/Sibling-color, built directly as one design each rather than 2–3 options — an explicit, deliberate choice the client made at build time given these are the lower-stakes templates per the Section 1 table and the strong shared-component direction already validated on vehicle-specific. Original suggestion: For each of the four templates, before committing to a single build, generate 2–3 meaningfully different layout options (not just color/spacing tweaks — different structural approaches to sequencing and weighting the components in Section 5). Each option should be a standalone, reviewable page (real scraped data, not lorem ipsum) so it can be judged on how it actually reads, not just described.

   Every option needs a written justification alongside it, not just a label. For each option, document:
   - **What specific design decisions were made** (e.g. "fitment status placed above the fold beside price, reviews moved into a compact strip under the title rather than a separate tab").
   - **What finding or principle each decision is grounded in**, citing the specific research point from Section 0.1 (or additional research pulled in during the exploration step) — not a vague "best practice" reference. If a decision isn't backed by a specific finding, say so plainly rather than dressing it up as evidence-based.
   - **What it trades off against.** No layout decision is free — leading with fitment status may compress visual/gallery space above the fold; leading with imagery may push fitment confirmation further down. Name the trade-off honestly for every option so the choice between options is a real comparison of costs and benefits, not just a comparison of upsides.

   This turns option review into "which set of trade-offs fits us best," not "which one looks nicest" — the goal is finding the right balance visually and usability-wise for this business specifically, not picking a winner by instinct.
   - Vehicle-specific template: all options must still satisfy the non-negotiable fitment-placement rule (Section 5) — the options should differ in everything else (gallery prominence, tab structure, review placement, etc.), not in whether that rule is respected.
   - Simple/config-variant/sibling-color templates: freer to explore, since their conversion challenges are lower-stakes per the Section 1 table.
2. ✅ **Review checkpoint:** done for vehicle-specific (Option A selected; B and C were later deleted outright rather than kept archived — see Section 9). ⬜ Not yet done for Simple/Config-variant/Sibling-color — these were built directly and the client has not yet given a feedback pass on them the way vehicle-specific got. **Pick this up next.**
3. ✅ Scaffold the shared component library — done, and went well beyond "mock/placeholder data" over several build rounds: lives at `prototypes/_shared/shared.css` + `shared.js`, used by all four templates with real content. As of 2026-09-10 it includes:
   - Trust icons, breadcrumbs, a tabs container (horizontal tab bar on desktop ≥901px, vertical accordion on mobile — both built on radio-button inputs so exactly one panel is ever open).
   - A full tabbed Delivery/Click & Collect widget (postcode entry, live Standard/Express or nearest-store results) and a Showroom Finder CTA block.
   - An image gallery: main image (3:2, was 4:3) + thumbnails as a single-row scroll carousel with prev/next nav (was a wrapping 4-column grid — changed because 5+ images pushed page content down and created height mismatches against the shorter sidebar column).
   - Product video + Get It Installed CTA, paired side-by-side under the gallery (`.install-media-row`/`.install-cta-panel`) with a full-width fallback layout when there's no video to pair with.
   - Brand logo, sale-tag graphic, and working copy-to-clipboard SKU buttons (see Section 5) on every template.
   - Ex-demo/factory-seconds CTA + modal, and a special-order banner (see Section 5).
   - A product-card grid for related products.
   - A sticky mobile Add-to-Cart bar, and (vehicle-specific only) a persistent desktop decision bar that appears once the initial price/CTA panel scrolls out of view.
   - **The Demo State Panel** — a floating reviewer tool (not a production component) for previewing how any template looks in different product states (has video / on sale / in stock / shipping available / click & collect available / special order / has ex-demo stock), plus the vehicle-fitment simulator on Vehicle-specific. Full detail in Section 9 — this is the main thing to understand before doing further work on these prototypes, since most "does this look right if X" questions should be answered by toggling the panel rather than editing markup.

   Real site header (utility bar + main nav + search + cart) and real logo (`headerlogo.png`) are wired in across all pages, matching the client's "Navbar - Logged In - Final.png" reference.
4. ⚠️ Build the data model + merge script — **not** built as the standalone, independently-testable utility this step suggests. Each template instead embeds its own merged product data as an inline JS object in its page (see `MERGED_PRODUCT` in `config-variant/index.html` and `MAXTRAX_FAMILY` in `sibling-color/index.html`), driving live variant/swatch switching (price, gallery, video, specs, fitting-instructions link all update correctly). Fine for the prototyping phase; **a real standalone merge utility is still owed** before this becomes reference material for the Magento build.
5. ✅ Simple template wired — `prototypes/simple/index.html`, real Water Tank data, deliberately the leanest template (no fitment, no variant picker, no persistent bar, no Showroom Finder).
6. ✅ Config-variant template wired — `prototypes/config-variant/index.html`. Comparison-card toggle (not a dropdown) for Assembled vs Flat Pack; confirmed the real plank-count discrepancy (4 vs 5) live.
7. ✅ Vehicle-specific template wired and iterated — `prototypes/vehicle-specific/`. See Section 9 for the full history (3 options explored, Option A selected, several rounds of client feedback applied).
8. ✅ Sibling/color template wired — `prototypes/sibling-color/index.html`. The "fresh scraping" this step flagged as a prerequisite is done: all 13 MaxTrax MKII colors scraped (`data/raw/MAXTRAX_MKII_family.json`), swatch picker live-swaps gallery/price/stock/SKU/Colour spec per color.

## 7. Known Data Gaps

- ✅ **Resolved:** Sibling/color family fully scraped — all 13 MaxTrax MKII colors, not just Black (`data/raw/MAXTRAX_MKII_family.json`).
- Plank-count discrepancy (4 vs 5) on the Pioneer 6 Platform pair is unconfirmed — treat as variant-specific data until the client confirms which is correct/intentional. Still open.
- **New:** Titanium Grey (MaxTrax) has no scraped discount ($319 flat vs. $319→$299 on all 12 other colors) — needs a client check: genuine pricing difference or a missed sale flag on that one listing.
- ✅ **Resolved (2026-09-09):** Config-variant (RH62112) and Vehicle-specific (GP01M1TZZ) cross-sell carousels are now populated. Neither live PDP carries an on-page "related products" module (confirmed live), so these four-item grids were curated by searching the live catalogue for accessories that explicitly list Rhino Rack Pioneer Platform / this kit's compatibility (accessory bar, tie-down kits, light-bar bracket, awning brackets, MAXTRAX recovery boards) — real products, real prices/images, but sourced by curation rather than lifted from an existing on-page module. Flag to the client: this is a different data-provenance than the Simple/Sibling-color related-products grids, which were scraped directly from a real on-page carousel.
- **New:** The MaxTrax Black listing's extra thumbnail images are real scraped URLs (filenamed per-SKU) but show generic lifestyle/action photography of an orange board — the live site appears to reuse the same action shots across color listings regardless of filename. Worth flagging to the client.
- ✅ **Resolved (2026-09-10):** Brand logo assets — client supplied real logo files for all three brands currently in the reference catalogue: `prototypes/_shared/brand-rhino-rack.webp`, `brand-front-runner.webp`, `brand-maxtrax.webp`. No gap remains for these three; a new brand entering the catalogue would need its logo added the same way.
- **New:** Vehicle-specific package-item SKUs (Platform `RH62100`, Backbone `RTHB1`, Tracks `RTS556`, shown in the new "What's Included" list) were reconstructed from the free-text long description in `GP01M1TZZ.json`, not independently scraped/confirmed against their own listings — worth a client sanity check before this is treated as authoritative, same caution as the plank-count discrepancy above.
- **New:** Ex-demo/factory-seconds pricing and special-order messaging are currently **demo-preview-only** — toggled from the admin panel with placeholder prices/stores, not backed by any real data source. Before either leaves prototype stage, the client needs to define: which SKUs currently carry ex-demo/factory-second stock, at what price/condition/store, and which SKUs should show as special-order vs. simply out-of-stock.
- **New (2026-09-10):** Vehicle-specific's new Flat Pack variant (`GP01M1TZZF`, $1,552.00) is fabricated demo data — no real Flat Pack listing exists yet for this exact Hilux kit. Modelled on the real RH62112/RH62112F price ratio. Needs a real SKU and price from the client before the config-variant picker leaves prototype stage.
- **New (2026-09-10):** The new grouped/bundle template uses a real live product (Yakima RoadShower 15L Complete Shower & Hose Bundle, `8004109PROMO`) found via the site's own search, since the client's promised example SKU never arrived before this was built. Needs client confirmation that this stand-in is acceptable, or their intended example to rebuild against. It also has no real Yakima brand-logo file (the other three brands were client-supplied) — currently a text wordmark placeholder.
- **New (2026-09-10, Graham Sowerby meeting):** MAXTRAX's brand logo asset is unusually thin/wide compared to the other three brand logos, so `.brand-logo`'s current sizing renders it noticeably smaller on Sibling-Color — an asset/CSS fix, not a missing-data gap, but flagged here alongside the other brand-logo notes.

## 8. Research Sources (Section 0.1)

- Baymard Institute — Product Page UX 2026 benchmark (52%/62%/64% desktop/mobile/app "mediocre or worse" finding)
- Nielsen Norman Group — visual appearance as primary purchase-decision factor (93%)
- Spiegel Research Center — review-count impact on conversion (270% / 380% lift figures)
- Baymard Institute — total-cost and return-policy visibility gaps (67% / 44%)
- Blend Commerce — PerTronix CRO case study (fitment uncertainty as top structural conversion blocker in a fitment-driven vertical)
- PC Fitment / Standard Parts Toolkit — browsing-vs-buying analysis in automotive aftermarket ecommerce
- Various 2026 CRO/PDP guides (VWO, VNTANA, DigitalApplied, ConvertPolo) — mobile traffic share, sticky CTA and thumb-friendly variant selector guidance, "3-second confidence rule" framing

## 9. Build Status Log — read this first if picking up in a new session

**Last updated: 2026-09-10.** Framework decision made: plain HTML/CSS/JS (not a component framework) — fastest to iterate on visually, no build step.

### Version control
This project is a git repo pushed to **https://github.com/TonnieGit/RRG-Design-Staging.git** (`main` branch). Commits to this repo are authored as `brenton.cooley@gmail.com` (set as this repo's local `user.email`/`user.name`, not the machine's global git identity — don't change the global config to match).

**Workflow: push once a round of changes has been reviewed and approved, not after every individual edit.** Batch a session's changes into one commit (or a few logically-grouped commits) covering everything just signed off, with a message describing what changed and why, then push to `origin main`. Don't push mid-task or speculatively — only once the user is happy with the current state.

### Folder structure
```
PAGE-GLOSSARY.md                   — naming reference: every page section + widget by name
                                      (built 2026-09-10 after a "gallery" naming mix-up — see Section 9)
data/raw/                          — real scraped JSON per SKU/family (see below)
prototypes/index.html              — master index, links all four templates
prototypes/_shared/
  shared.css, shared.js            — the component library every template imports
  headerlogo.png                   — real site logo, used in the header
  installer.png                    — Get It Installed CTA photo
  sale-tag.png                     — "Spring Sale" corner-ribbon graphic
  brand-rhino-rack.webp            — brand logos, used on every template's decision panel
  brand-front-runner.webp
  brand-maxtrax.webp
prototypes/vehicle-specific/       — index.html (single template — see below, options B/C removed)
prototypes/config-variant/         — index.html
prototypes/sibling-color/          — index.html
prototypes/simple/                 — index.html
prototypes/grouped-bundle/         — index.html (new 2026-09-10 — Yakima RoadShower bundle)
```

### Scraped data on hand (`data/raw/`)
`FRWTAN063.json` (Water Tank), `RH62112.json` + `RH62112F.json` (Pioneer 6 Platform pair), `MAXTRAX_MKII_family.json` (all 13 colors), `GP01M1TZZ.json` (Hilux N80 kit, fitment gallery stubbed to 16 of 283 real images).

### Vehicle-specific — now a single template, not an options comparison
Three layout options were originally built and screenshotted for client review: **A — Fitment Confidence Command Center** (sidebar decision panel beside gallery), **B — Imagery-Led + Persistent Decision Bar** (full-width hero image), **C — Compact Confidence Bar**. Client feedback: **Option A selected**; B and C were kept archived for a while, then on 2026-09-10 the client asked to remove them entirely rather than keep them on disk — `option-b.html`, `option-c.html`, and the old options-comparison `index.html` were deleted, and `option-a.html` was renamed straight to `index.html` (same folder-per-template pattern as the other three). "Option A" framing/labels were scrubbed from the page since there's nothing left to disambiguate from. **This is now simply *the* vehicle-specific template — don't recreate an options-comparison structure unless the client explicitly asks to explore alternatives again.**

Feedback rounds applied directly to it (chronological):
- Delivery/Click & Collect rebuilt as a real tabbed widget (was a small button), placed in the sidebar directly under Add to Cart.
- Showroom Finder rebuilt as its own high-contrast "on display at N stores near you" CTA block, not a passive link — and its previous redundant sidebar link ("🏬 On display at 14 stores — find yours") was later removed since it duplicated the full-width block directly below it.
- Gallery thumbnails changed to flex/fill the full width of the main image, then later became the shared single-row scroll carousel (see below).
- Real site header + logo swapped in.
- Info tabs converted to a horizontal tab bar on desktop, vertical accordion kept on mobile.
- Get It Installed CTA added, initially as its own full-width banner (no real video existed for this SKU to pair it with) — client didn't like that as the *default* look, so it was changed to always show side-by-side with a video placeholder by default, matching Config-variant's layout. The full-width banner look is still available by toggling video off in the Demo State Panel.
- Package contents list ("What's Included") added — each kit component with its own SKU + copy button.

### Simple / Config-variant / Sibling-color — built directly, still not through a dedicated review round
These three were each built as a single design (not 2–3 options) — the client's explicit call, since the spec already treats them as lower-stakes than vehicle-specific. **They have not been through a template-specific feedback round the way vehicle-specific was**, though they've received every cross-cutting fix below (gallery carousel, brand logo, sale tag, copy buttons, demo panel, etc.). Each has its own "Design Rationale" section at the bottom of its page documenting decisions, spec grounding, and honest trade-offs — read those first.

### The Demo State Panel — the main new capability this session, understand this before further work
A floating "Demo State" button (bottom-right, every template) expands into a panel for **previewing how a page looks in different product states**, instead of hand-editing markup to check. Built entirely in `shared.js`/`shared.css` (`buildAdminPanel()`, `.admin-fab`/`.admin-panel`), driven generically off existing markup/classes so it works the same way on all four templates without per-page wiring. Toggles, all in one "Product State" section:
- **Has video** — pairs the product video with the Get It Installed CTA (`.install-media-row`); off collapses to a full-width panel. Shows a generic `.video-placeholder` on templates/variants with no real scraped `video_url`.
- **On sale** — swaps the displayed price between sale and regular, hides the discount badge, and shows/hides the sale-tag corner graphic in sync.
- **In stock** — disables Add to Cart with an "Out of stock" banner; restores correctly (respecting the active fitment-demo vehicle on Vehicle-specific, else defaulting to "Add To Cart").
- **Shipping available** / **Click & Collect available** — hide tabs/panels in the Delivery/Click & Collect widget, fall back to whichever stays on, show a note if both are off.
- **Special order item** — banner above Add to Cart; Add to Cart itself stays enabled (client's explicit call).
- **B-Stock / Ex-Demo available** — shows a CTA ("🏷 Ex Demo / Factory Seconds — from $X") that opens a modal with 3 placeholder options (Ex-Demo/Sellable Return/Factory Second, each with the product's main image, its own price, and a "View Item" button — currently inert, no link), priced live off whatever the page's current price is.

On **Vehicle-specific only**, the panel also has a "Session Vehicle" section — this absorbed the old standalone "REVIEWER DEMO" top bar that used to simulate the fitment-matching session vehicle (`initFitmentDemo`, now called from inside `buildAdminPanel` instead of auto-running on load).

Every "Product State" toggle **defaults to whatever the page's real data shows** (auto-detected at load via `detectInitial*State()` helpers) — e.g. "Has video" starts unchecked on the three templates with no real scraped video, checked on Config-variant's Assembled variant. Special order and B-Stock always default off, since no template has real data representing either state.

**A real bug was caught and fixed while building this**, worth knowing about since it's a pattern that could recur: Config-variant's `renderPrice()` didn't reset the was-price/badge's `hidden` state on every render, so toggling "on sale" off then switching variants left the wrong price showing. Fixed by having `renderPrice()` explicitly reset `hidden = false` on both before the panel's own `reapplySaleFlag()` (called at the end of `renderAll()`) can correctly re-hide them if the toggle is off. **Any future per-page render function must reset visibility of its real-data-driven elements on every call, not assume they start unhidden.**

### Cross-cutting fixes/additions (now affect all four templates via the shared library)
- Real header (utility bar: nearest store / vehicle / call us / country / logged-in user; main nav: logo, Products/Store Finder/Fit My Vehicle/Catalogue/Services, search, cart) matching the client-provided "Navbar - Logged In - Final.png", plus the real `headerlogo.png` in place of the text wordmark.
- Gallery: main image now 3:2 (was 4:3); thumbnails now a single-row horizontal-scroll carousel with prev/next nav (`initGalleryCarousels()`) instead of wrapping to a second row once there are 5+ images — this was causing a visible height mismatch against the shorter sidebar column.
- Related-product cards use real scraped images (Simple and Sibling-color only — Config-variant and Vehicle-specific still need this, see Section 7).
- Info tabs: fixed a real bug where the original CSS accordion could show multiple tab panels open simultaneously (a general sibling selector over-matched); now radio-button-driven so exactly one panel is ever open, on both the desktop tab bar and the mobile accordion.
- Brand logo (now mandatory, client instruction) on every decision panel.
- Sale-tag corner graphic, wired to the same on-sale state as price.
- Working copy-to-clipboard on every SKU copy button (`initCopyButtons()` — was decorative before).
- Get It Installed CTA image+text panel (see Section 5), Special order banner, and Ex-Demo/Factory Seconds CTA + modal — all Demo State Panel-toggled previews.

### Client review meeting, 2026-09-10 (Scott Childs & Jake/RRG Web Products) — outcome and confirmed action items
Brenton demoed this project's config-variant prototype live; both stakeholders endorsed this direction over the client's separate in-house Figma redesign (see Section 0 note — that Figma work is now superseded, not a design target anymore). Confirmed action items from this meeting, in build-priority order:

**All 7 items below were completed 2026-09-10, same day as the meeting.**

1. ✅ **Fix Get It Installed/video placement on vehicle-specific** — moved `.install-media-row` inside the gallery column div (was a separate full-width `<section>` after `.hero` closed), so it now sits directly under the secondary image thumbnails, constrained to the image-column width, matching config-variant exactly.
2. ✅ **Add payment-plan badges** (Afterpay/Zip/PayPal Pay in 4) under Add to Cart — new `.payment-badges` component in shared.css (CSS-drawn wordmarks, no logo assets on hand), on all five templates including the new grouped/bundle one.
3. ✅ **Lighten the fitment status badge styling** — `.fitment` in shared.css changed from a full tinted-fill + full-strength-border box to a white/near-white card with a 3px colored left accent only; label+dot keep the state color, body copy is neutral gray. Applies automatically to both the decision-panel fitment box and the persistent buying bar (same shared class). Persistent buying bar's structure/behavior otherwise unchanged.
4. ✅ **Add a config-variant picker to the vehicle-specific template** (Assembled/Flat Pack) — resolves Section 4 item 1. New `VEHICLE_PRODUCT` data object combines the existing `PRODUCT_FITMENT` with a `variants[]` array; picker drives SKU, price (decision panel + persistent bar), specifications list and the Fitting Instructions link live. **Flat Pack SKU (`GP01M1TZZF`) and pricing ($1,552/$1,753) are fabricated demo data**, modelled on the real RH62112/RH62112F price ratio — flagged in the page's own Design Rationale, needs a real SKU/price from the client before this leaves prototype stage.
5. ✅ **Build the paid "Fitted" option as a demo-panel-toggled preview** on config-variant and vehicle-specific — generic `reapplyFittedOption()`/`setFittedOptionFlag()`/`setFittedOptionMode()` in shared.js, gated on `.variant-picker` presence. Master on/off + **Mode 1** (full-width gold "Get It Fitted" card appended to the variant picker, survives real variant-switch re-renders) / **Mode 2** (upsell checkbox above Add to Cart) sub-toggle, defaulting to Mode 1. Demo-only, not wired to real checkout/booking — store-ops/state-manager sign-off is still pending.
6. ⚠️ **Prototype gallery placement A/B** — generic `applyGalleryPlacement()` in shared.js moved the real gallery DOM node (`#galleryColumn`) between its normal spot and a slot further down the page (`#galleryPushedSlot`), toggled via a new Demo State Panel "Gallery Placement" radio. Built on vehicle-specific (pushed slot = below Showroom Finder, as named) and config-variant (pushed slot = below trust icons, since it has no Showroom Finder section). Hero collapses to a single centered decision-panel column (max-width 560px) in the pushed state; fitment status stays correctly adjacent to price/Add to Cart in both layouts. **⚠️ Corrected 2026-09-10 (same day, later session):** this was built on a misreading — the client meant the *Fitment Gallery* ("See it fitted to a [vehicle]" installation photos), not the Main Product Gallery. See the "Fitted Photos Gallery" follow-up entry below for the fix; the Main Product Gallery no longer moves at all, and the (now-inapplicable) toggle was removed from config-variant entirely.
7. ✅ **New grouped/bundle template** — built at `prototypes/grouped-bundle/index.html`: Simple's layout + vehicle-specific's de-emphasized "What's Included" box. The client's promised example SKU never arrived, so rather than block on it, used a real live product matching their own "Roadshower bundle" example — **Yakima RoadShower 15L Complete Shower & Hose Bundle (`8004109PROMO`)**, found via the site's own search: real price ($846→$449), real 4-component breakdown with real SKUs (prices sum exactly to $449), real description/specs, curated related products. **Flagged in the page's Design Rationale:** confirm this SKU is acceptable or supply the intended one; no real Yakima logo file exists yet (text wordmark fallback, new `.brand-logo-text` class). Added as a 5th card on `prototypes/index.html`.
8. Open, not yet scoped by the client: whether Get It Installed should roll out to Simple/Sibling-color as brand advertising even where literal fitting doesn't strictly apply (water tank, MaxTrax) — no firm answer reached, revisit later.

**Explicitly confirmed as already correct, no change needed:** current on-fold decluttering (already well ahead of the old Figma baseline — no further stripping needed), the What's Included box's current de-emphasized styling, the Ex-Demo/B-Stock CTA's current subtle-button styling (the client's original complaint was about the old Figma's overbearing red button, not this build), and the Assembled/Flat Pack wording (client is aware of the "does this mean fitted?" ambiguity risk but doesn't want it touched yet).

**Out of this project's scope, but flagged as next up:** the PLP (category grid/list view) needs the same simplification pass — the client's own in-house PLP attempt was called out as cluttered next to the new PDP direction. Client plans to pick this up "early next week" with the same external UX reviewers who validated this PDP direction. No action here until that project starts.

**Staging deployment:** client wants this pushed to a Vercel staging environment once items 1–7 above are done, and has asked for help with the deployment itself — flagged for later the same day (2026-09-10), not yet done.

### Client review meeting, 2026-09-10 (Graham Sowerby) — reopened decisions + new action items

Same day as the Scott Childs/Jake meeting above, separate call. Brenton walked Graham through the same live prototype. Outcome was broadly a strong endorsement of the direction ("it's very much the right direction," "well done, mate"), but this meeting **reopened a few of the Scott/Jake meeting's "confirmed correct" items** and surfaced a genuine gap (breadcrumbs) that hadn't been caught yet. Where the two meetings' guidance conflicts, **build to this meeting's resolution — it came later the same day.**

**Reversed from the Scott/Jake meeting:**
1. ✅ **Done 2026-09-10 (same day, follow-up session). Add to Cart colour: gold, not red.** Scott/Jake's meeting said "red stays for now, revisit later." Graham asked to see the existing red/gold demo toggle live, then said to lock in gold. Gold is now the shipped default, not a preview state — the demo toggle was removed entirely. See Section 5.
2. ✅ **Done 2026-09-10 (same day, follow-up session). B-stock/Ex-demo CTA: inline text on the stock-status line, not a button at all.** Scott/Jake's meeting called the current subtle-button treatment "fine, no change needed." Graham's meeting reopened it (Tim's likely reaction: "people are going to miss that and I want to sell my B-stock") and landed on a different pattern after iterating past a "3 button-weight variations" idea: appended to the existing in-stock line — `In Stock — Ex-Demo/Factory Seconds from $1,495` — with the price portion a clickable blue link opening the existing modal, no separate button element. See Section 5.
3. ✅ **Done 2026-09-10 (follow-up session). Showroom Finder: the full-width black block is not settled.** Scott/Jake confirmed the "See It In Person" full-width black CTA as correct. Graham pushed back live — "it doesn't scream to me that this is a showroom... doesn't shout local location, come and visit, get in a car." Landed on two changes, both built: a small "On Display" pill next to the stock-status line (always visible, no interaction required) as the primary fix, plus an experimental interactive map (Leaflet + OpenStreetMap, postcode-area pins) piloted on Vehicle-Specific only, toggled in place of the block. See Section 5 and the Click & Collect rework below.

**New build items from this meeting:**

4. **Breadcrumbs — confirmed missing, not previously caught.** Landing on any prototype PDP is a dead end with no path back to the category or vehicle-landing page. Graham's proposed structure, walking the real live site's pattern: **Vehicle Landing Page (e.g. "Ford Ranger, Bare Roof") → Category for that vehicle (e.g. Roof Racks) → current product.** Section 5's status corrected from ✅ to ⬜ above — it was never actually built despite the data model always having a `breadcrumbs` field. A related but explicitly **not-committed** idea from the same discussion: if a shopper without a saved vehicle arrives at a rack-set PDP having just browsed/searched a specific vehicle, ideally the session should recognize that implied vehicle context and offer to confirm it — Graham's response was "that's kind of fine... we can always implement that at any point," i.e. noted, not scheduled.
5. ✅ **Done 2026-09-10 (follow-up session). Click & Collect widget, fuller rework than the Scott/Jake meeting's "add a View All Stock button" ask** (that ask is still in here, just expanded):
   - ✅ Single postcode field synced across the Delivery and Click & Collect tabs (was two separate inputs).
   - ✅ **Results show by default, no click required.** (Note: "pre-filled from the customer's known postcode" is simulated with a static demo postcode, since there's no real customer session to read from at prototype stage — same caution as the rest of this widget's data.) Top stores shown, capped ~100km radius per the copy line under the results (demo distances already fall well under that cap, so no filtering logic was needed to enforce it).
   - ✅ Each store row (both the inline view and the new full slide-out) has a status pill: In Stock / Order In — Xd. (On Display is used by the Showroom Finder's own rows, not Click & Collect's — the two widgets style similarly but list different things.)
   - ✅ "View all stores" is link text under the results, opening a **newly built** slide-out drawer — turned out no such component existed anywhere in the prototype despite earlier docs referencing an "existing" one (that description was of the real live site, confirmed by full-repo search before building).
   - ✅ Default active tab flips to **Click & Collect** (reasoning, both meetings: stores benefit more from foot traffic/GP than 3rd-party shipping, and web-to-store conversion is harder to track but not a bad trade).
   - Explicit "both currently unavailable for this item" message state — already existed (`.dc-unavailable-note`) and needed no changes; verified it still reads correctly with the new default tab.
   - ✅ Small subtle icons next to the "Delivery" / "Click & Collect" tab labels (same restraint as the in-stock checkmark — "shouldn't stand out too much on the product page, more on the cart").
6. **Get It Installed CTA needs a Fitment Gallery on/off Demo State Panel toggle**, independent of the existing "Has video" toggle, so the fallback copy state (item 4 in Section 5's updated bullet) can actually be previewed — not built yet.
7. **Important Vehicle Fit Notes** — see Section 5. New content block, vehicle-specific only.
8. **Rack Fit Guarantee icon** — see Section 5. Fitment-relevant products only.
9. **Specifications tab as a real table, Gold Guarantee tab condensed** — see Section 5.
10. **SKU copy UX simplified** — drop separate copy-icon buttons, make the SKU text itself clickable-to-copy, on the main SKU row and every What's Included row. Reasoning: the icon adds a second interactive element next to a static-looking value, and store staff are already trained that RRG SKUs use a "soft copy" pattern (click the text).
11. **Short description 2-line clamp + "Read more" link** to the Description tab — see Section 5.
12. **Fitment status microcopy**: drop "kit" terminology entirely — landed on "**this product**" (e.g. "This product suits your selected vehicle" / "This product is not built for your selected vehicle") over "rack set" or "kit" for being short and universal across product types. The "doesn't fit" state's message needs the customer's full saved vehicle spec (body style, roof type, year range), not just the vehicle name — two vehicles can share a name but differ by roof/rail type, and the current copy doesn't have room to disambiguate that.
13. **MAXTRAX logo renders too small on Sibling-Color** — `.brand-logo`'s current fixed-height/auto-width sizing makes MAXTRAX's unusually thin/wide logo read as tiny relative to the other brand logos. Fix by sizing off height with a wider `max-width`, or requesting a correctly-proportioned source asset.
14. **Mobile layout**: decision panel (price/CTA) should render above the video/Get It Installed row on mobile, not below it — confirmed both agreed live when Brenton pulled up the responsive view. Also flagged: needs a touch more spacing between the hero image/gallery block and the video/Get It Installed row on mobile (~10px).
15. **Prototype-tooling only, not a template change:** the hamburger menu in the prototype's own header should drop down to jump directly between the 5 product templates, for review convenience — currently the only way to switch templates is back to the index page.

**Process/naming notes, not build items:**
- This bundle product type (the grouped/bundle template) is internally called a **"Vehicle Product Set,"** not "rack set" — naming correction for docs/glossary going forward.
- Tim's standing rule, reconfirmed: flag any region-specific copy claims (e.g. "Australia's Largest," already in the trust-icon content in Section 2) in scope docs so they don't silently ship if the build is ever reused for NZ/UK — a documentation habit, not a template change.
- Cart-level display must clearly group bundle components under the parent product name/SKU at checkout — flagged risk is a customer adding what looks like one product and being confused when 2–3 items arrive. This is a cart/checkout requirement outside this project's page-level scope, but worth carrying forward to whoever owns that build.
- Magento sibling-group data model needs a new field for per-product-in-group explainer text (e.g. "Assembled"/"Flat Pack"), **as a dropdown of standardized values, not a free-text field** — Jake's ask, to avoid the same concept being worded differently across different sibling groups. Graham/Jake to action on the Magento/Rackit side, not a prototype change.
- Confirmed feasible but not committed: deep-linking the "change vehicle" CTA to the equivalent product for the customer's actual saved vehicle where one exists (via the bar-range data), rather than a generic fit-my-vehicle results page. Graham: "we could definitely do it... whether we do it at this point is another question."
- Recently Viewed reconfirmed **not** to belong in the decision panel — if built at all, it's the very last section at the bottom of the page, separate from Related Products/cross-sell.
- Brenton's target: get all of the above done by lunch 2026-09-11 before handing off to "Mark" for further build/review.

### Follow-up session, 2026-09-10 (same day, after the meeting write-up above) — naming glossary, Fitted Photos Gallery fixes & redesign, Body Tabs cleanup

**Naming glossary (`PAGE-GLOSSARY.md`, project root):** Built after a real mix-up — when the client said "gallery" they meant the Fitment Gallery (real installation photos), not the Main Product Gallery, and the two had gotten confused mid-conversation. The glossary now names every section and widget across all 5 templates so future sessions/conversations can disambiguate on first ask. It documents a specific naming clash worth remembering: **"gallery" can mean the Main Product Gallery, the Fitted Photos Gallery Placement toggle, or the Fitment Gallery itself** — always use the specific name. Keep this file updated whenever a section/widget is added or renamed.

**Fitted Photos Gallery Placement toggle — fixed:** Confirmed the bug described in item 6's correction above. `applyFitGalleryPlacement()` in shared.js now moves `#fitGallerySection` (the Fitment Gallery) between `#fitGalleryHomeSlot` (default, full width above the tabs) and `#fitGalleryNestedSlot` (inside the gallery column, under the main gallery/thumbs/install row) — new `.fit-gallery-section.nested` CSS gives it a compact layout when nested. The Main Product Gallery itself no longer moves under any toggle. Vehicle-specific only (config-variant's copy of the old toggle was removed, since it has no Fitment Gallery).

**Fitment Gallery redesigned as a "Fitment Gallery" panel widget:** Client supplied a live-site/Figma reference (icon badge + heading, "View All In-store Fitments (N)" link, "Explore Fitting Costs" button, photo carousel with nav arrows, page-dot pagination, red background). Rebuilt to match, then iterated per client feedback across several rounds the same day:
- New `.fit-gallery-panel` component in shared.css — all colours driven by `--fg-*` custom properties so the red/non-red toggle (`.red` modifier) and both placements share one rule set.
- New `initFitGalleryCarousel()` in shared.js — real scroll-snap carousel, working prev/next nav (mirrors `initGalleryCarousels()`'s overflow-detection convention), and click-to-jump/scroll-synced page dots.
- **Red background toggle**, new Demo State Panel checkbox under "Fitted Photos Gallery" (`applyFitGalleryRedFlag()`) — **defaults to non-red** (client's new preferred direction); flip it on to preview the live-site red for stakeholder-pushback conversations.
- **Photos per view:** 7 in the full-width placement, 4 when nested (client's choice, favoring showing more photos over just stretching proportions; bumped up from an initial 2 when nested per follow-up feedback).
- Heading copy: "Gallery" → **"Fitment Gallery"** (plain "Gallery" read as ambiguous against the Main Product Gallery).
- Removed the "Explore Fitting Costs" CTA button entirely (duplicated the Get It Installed CTA directly above it); "View All In-store Fitments (283)" is now right-aligned in its place.
- Photo tiles changed from portrait-leaning `aspect-ratio:4/3` to landscape `16/9` (matches the site's product-video aspect-ratio convention) — also usefully shortens the widget's overall height, most noticeable in the nested placement.
- **Section heading typography standardized:** client asked that "Fitment Gallery," "Related Products," and "See It In Person" (Showroom Finder) all share one heading style. Added a shared rule in shared.css (`.related-heading, .showroom-widget h3, .fit-gallery-title h2`) — Barlow Condensed Bold Italic, uppercase — and added the italic font weight to the Google Fonts `@import` (previously only regular weights were loaded, so italic would have silently fallen back to a browser-synthesized oblique). Size was tuned twice: first pass at 22px, then bumped to **37px** after the client clarified they wanted the heading's actual rendered glyph height (cap-height, not the CSS line-box) to visually match the 26px gold icon badge — confirmed via canvas `measureText().actualBoundingBoxAscent` (Barlow Condensed Bold Italic's cap-height is only ~73% of its font-size, so 22px was reading far smaller than the badge). Client confirmed all three headings should scale together rather than sizing Fitment Gallery on its own.

**Body Tabs section (`.body-cols`) widened to full width:** All 5 templates had a small `<aside>` sidebar (one-line cross-sell blurb, wording varied per template — "Related Kits for [Vehicle]" / "Related Products" / "Also Fits Your Setup" / etc.) taking the right third of a 2fr/1fr grid next to the Tabs widget. Client felt it added little and made the tabs look oddly narrow. Removed the `<aside>` entirely on all 5 templates and changed `.body-cols` to a plain block — the Tabs widget (and the Related Products grid below it, unaffected either way) now runs the full page width.

All of the above verified visually/functionally with Playwright (placement × red-toggle combinations, nav-arrow paging, dot sync, heading sizing) on vehicle-specific, plus the Body Tabs fix spot-checked on Simple.

**Bug caught same day, worth knowing about:** the heading-size fix above only visibly took effect in the full-width placement at first — a leftover `.fit-gallery-section.nested h2{font-size:16px}` rule from the pre-redesign version of this widget (never cleaned up when the panel was rebuilt) had higher CSS specificity than the new shared heading rule, so it silently won when nested. Removed that whole dead block (it also referenced `.sub`/`.fit-gallery-grid`/`.fit-gallery-more`, none of which exist in the current markup). **Lesson: when a component gets rebuilt, grep for the old class names afterward** — a stale rule with higher specificity can override new shared styling invisibly rather than erroring.

### Showroom Finder rolled out to all 5 templates (client ask, 2026-09-10)
Previously Vehicle-Specific only. Added the same `#showroom` / `.showroom-widget` section (postcode entry, demo results for "Moorebank, NSW" / "Castle Hill, NSW") to Simple, Config-Variant, Sibling-Color, and Grouped-Bundle, placed directly below the Trust Row and above the Short Description on each — same relative position as Vehicle-Specific's (below the hero, its own section, not inside the Decision Panel). Copy/store-count per template is placeholder demo content, same fabricated-data caveat as Vehicle-Specific's original.

**Corrected same day:** Vehicle-Specific's own Showroom Finder section was left in its pre-existing spot (between Package Contents and the Fitment Gallery, i.e. *above* the Trust Row) instead of being moved to match the other four templates. Client caught this — moved to sit directly below the Trust Row on Vehicle-Specific too, so all 5 templates now share the same relative order: Fitment Gallery (Vehicle-Specific only) → Trust Row → Showroom Finder → Short Description (where present) / Body Tabs.

### Add to Cart colour preview toggle (2026-09-10)
New Demo State Panel checkbox, "Gold Add to Cart button (colour preview)," under Product State on all 5 templates — `applyCtaColorFlag()` in shared.js adds/removes a `.cta-gold` class on every `[data-cta-label]` button on the page (decision panel, sticky mobile bar, and vehicle-specific's persistent bar all update together), swapping the Add to Cart button to `#FFCA48` with black text. Off by default (current red stays the shipped default); demo-preview only, same status as the other colour/placement toggles.

### Get It Installed CTA + video widget rolled out to all 5 templates (client ask, 2026-09-10)
Previously Config-Variant, Vehicle-Specific, and Grouped-Bundle only (Section 6, step 7's build note). Simple and Sibling-Color had only a bare `<img class="video-placeholder" ... data-admin-video hidden>` with no Get It Installed panel next to it — replaced on both with the full `.install-media-row` pairing (video placeholder + `.install-cta-panel` installer photo/REVIEWS.io badge/"More Information + Bookings" button), identical markup to Grouped-Bundle's. No shared.js/CSS changes were needed — `detectInitialVideoState()`/`applyVideoFlag()` and the `.install-media-row`/`.install-media-row.no-video` CSS already worked generically off the `.install-media-row` class, so the Demo State Panel's "Has video" toggle now drives Simple and Sibling-Color the same way it already drove the other three. `PAGE-GLOSSARY.md` updated accordingly.

Added a new Demo State Panel toggle, "On display in-store (Showroom Finder)," under Product State — defaults checked (on) since the section is now standard, unlike the other Product State toggles which default off. `applyShowroomFlag()` in shared.js hides/shows `#showroom`; the panel only renders the toggle when `#showroom` exists (`hasShowroom` check, same conditional-rendering convention as the other feature toggles), so this stays safe if a future template omits it. Stale "no Showroom Finder" claims in Simple's and Grouped-Bundle's Design Rationale sections were corrected to match. `PAGE-GLOSSARY.md` updated accordingly.

### Add to Cart gold lock-in + B-stock inline text (2026-09-10, follow-up session)
Picked up the two quick reversals from the Graham Sowerby meeting's list (Next steps items 1 above superseded by this entry for these two specifically):
- **Add to Cart gold, locked in as the real default.** Removed the "Gold Add to Cart button (colour preview)" Demo State Panel checkbox and `applyCtaColorFlag()`/`.cta-gold` entirely — no longer an open question, so no toggle needed. `shared.css` now styles `[data-cta-label].btn-primary` gold (`#FFCA48` background, black text) by default; other `.btn-primary` buttons that aren't Add to Cart (e.g. vehicle-specific's "Find Nearest Showroom") were unaffected since the rule is scoped to the `[data-cta-label]` attribute, not `.btn-primary` generally.
- **B-stock/Ex-demo moved into the stock-status line.** Replaced the standalone `.exdemo-cta` button (previously inserted after `.price-block`) with inline text appended directly to `.stock-status-line` — e.g. `In Stock — Ex-Demo/Factory Seconds from $1,495` — where the price is an underlined blue `.exdemo-inline-link` that opens the existing ex-demo modal, no separate button element. New `renderStockLine()` in shared.js is now the single source of truth for that line's content (base stock-status text + the exdemo suffix when the flag is on); both `applyStockStatus()` and `applyExdemoFlag()` call it so the two states compose correctly regardless of toggle order. The modal itself, its 3 condition/price options, and its "still needs real inventory data" caveat are all unchanged. **Follow-up same day:** fixed a copy typo ("X-Demo" → "Ex-Demo") and changed `.exdemo-inline-link`'s colour from red to blue (`#1A56DB`), per client feedback.

Not yet verified live in-browser this session (Playwright was mid-use elsewhere and the profile was locked) — verify visually before considering this fully closed out, though `node --check` confirmed shared.js parses cleanly and a full-file review of the touched sections found no leftover references to the removed classes/toggle.

### Showroom Finder + Click & Collect rework (2026-09-10, planned then built in one session)

Backlog item #3 (Graham Sowerby meeting). Planned via EnterPlanMode with Brenton first — three open design calls were resolved before building: (1) build a real store slide-out drawer rather than stub the "View all stores" link, since exploration confirmed no such component existed anywhere in the prototype despite spec.md previously describing one as "existing" (that description was of the real live site); (2) give the "On Display" pill its own colour rather than reusing the green "In Stock" pill; (3) pilot the interactive map on Vehicle-Specific only rather than all 5 templates immediately.

**Click & Collect / Delivery widget** (`shared.css`/`shared.js`, all 5 templates):
- Merged the two separate postcode inputs (`#deliveryPostcode`, `#collectPostcode`) into one `#dcPostcode` field sitting in a new `.dc-postcode-row` above both tab panels, plus a "Update" button and `.dc-postcode-note` that mirrors back whatever postcode is typed (`initDcPostcode()`) — a light demo re-trigger, not real geocoding, consistent with the rest of this widget's data.
- Removed the `hidden` attribute that previously gated both panels' results behind a click — both now show their demo results on load.
- Flipped the default active tab from Delivery to Click & Collect across all 5 templates' markup (no JS logic changes needed — `applyAvailabilityFlags()`'s existing fallback already handled either tab being active).
- Added small inline-SVG icons (truck / pin) to the `.dc-tab` buttons.
- Added a "Showing stores within 100km — View all stores" line under the Click & Collect results (`.dc-viewall-row`, blue `.dc-viewall` link, same blue as the Ex-Demo inline link for visual consistency).
- The existing "both unavailable" message state (`.dc-unavailable-note`) needed no changes.

**Store slide-out** (new component): `buildStoreSlideout()` in shared.js builds a right-edge drawer (`.store-slideout`/`.store-slideout-backdrop`, same modal-backdrop-once-per-page convention as the Ex-Demo modal but sliding rather than centered) listing each template's `window.STORE_NETWORK` array (6 stores per template, reusing store names already seen elsewhere in the project's demo data rather than inventing new ones) — more than the 2 shown inline. Opened by the new "View all stores" link.

**"On Display" pill** (all 5 templates): new `.stock-line-row` wraps `.stock-status-line` plus a new `<span class="stock-chip display" data-display-pill>` sibling — always visible next to price/stock status, not only inside the black Showroom block. New `.stock-chip.display` CSS variant (gold/bronze, `--rrg-display`/`--rrg-display-bg` tokens) distinct from the green "In Stock" pill; the Showroom widget's own internal pill was changed from reusing `.stock-chip.in` to the same `.display` variant (bright gold on its black background) for one consistent colour language. Both pills are wired to the existing `applyShowroomFlag()` toggle, so the Demo State Panel's "On display in-store" checkbox updates both at once.

**Experimental interactive map** (Vehicle-Specific only, pilot): Leaflet 1.9.4 + OpenStreetMap tiles loaded via CDN (`<link>`/`<script>` in `<head>`, free, no API key). New `#showroomMap` container inside the Showroom widget, hidden by default; existing content wrapped in `#showroomDefaultView` so the two can swap. New `applyShowroomMapFlag()` in shared.js initializes the Leaflet map and drops pins from a new `SHOWROOM_MAP_STORES` array (hardcoded approximate lat/lng for the demo store names already in use) on first toggle, then just calls `invalidateSize()` on subsequent toggles (a known Leaflet gotcha — a map initialized inside a `hidden` container renders broken until told to remeasure). New conditional Demo State Panel section ("Showroom Finder (experimental)"), same `hasX`-conditional-rendering convention as the existing Fitted Photos Gallery Placement toggle, so it only appears where `#showroomMap` exists.

**Verified this session** (Playwright, browser lock from the previous session had cleared): gold Add to Cart + On Display pill render correctly on Vehicle-Specific and Simple; Click & Collect defaults to that tab with results visible and the postcode pre-filled; typing a postcode and switching tabs preserves the value; "View all stores" opens the slide-out with the full 6-store list; the interactive map toggle loads real OpenStreetMap tiles with correctly placed pins; toggling "On display in-store" off correctly hides the new pill (`[data-display-pill].hidden === true`); toggling Shipping + Click & Collect both off correctly shows the "both unavailable" note and hides the whole widget (postcode row included). No console errors besides an unrelated missing favicon.

**Not yet done:** map rollout beyond Vehicle-Specific (explicitly Brenton's call once reviewed), and this hasn't been through a client review pass yet — built and self-verified only.

### Showroom Finder + Click & Collect — follow-up correction round (2026-09-10, same day)

First client feedback pass on the rework above surfaced four real corrections, all built:

1. **"On Display" pill moved off the price line, onto individual store rows.** The pill beside `.stock-status-line` was the wrong concept — a store either has this product on display or it doesn't, it's a per-store fact, not a blanket product-level one. Removed `.stock-line-row`/`[data-display-pill]` and the price-line pill entirely (all 5 templates, plus its wiring out of `applyShowroomFlag()`). Store rows in the Click & Collect widget and the slide-out now show it alongside the existing In Stock/Order In pill where it applies (`rrgStorePillsHTML()` in shared.js) — e.g. Moorebank shows both `In Stock` and `On Display`.
2. **Postcode field starts empty**, not pre-filled — a prefilled value read as real customer data it wasn't. The "View all stores" line under Click & Collect's results now carries the message instead, and changes copy depending on state: `In stock and on display in {N} stores — View all stores` by default, `Showing stores within 100km of {postcode} — View all stores` once a postcode is entered and Update is clicked (`initDcPostcode()`, `.dc-viewall-line`). The old separate `.dc-postcode-note` line was dropped as redundant now that this line carries the message.
3. **Store slide-out rebuilt on real data.** The first version's 6 stores per template were fabricated placeholders. Navigated to a real product on the live site (a Yakima roof rack for a Mercedes C-Class), opened its Click & Collect card, clicked "View all Stock," and scraped its real Store Inventory slide-out via Playwright — 35 real stores across NSW/VIC/SA/TAS/QLD/ACT/WA with real names, addresses, phone numbers (`tel:` links) and Google Maps links. This is now `RRG_STORE_NETWORK` in shared.js — one canonical list (store identity doesn't vary by product), grouped by state to match the live site's own presentation, used by both the slide-out and the Click & Collect widget's inline rows on every template. Per-store In Stock/Order In status and which stores are "On Display" (`ON_DISPLAY_STORES`, currently Moorebank + Castle Hill) are still demo/placeholder — no real per-SKU per-store stock feed exists — flagged same as the rest of this widget's data. Each template's old fabricated `window.STORE_NETWORK` block was deleted.
4. **Interactive map: two fixes.**
   - **Z-index bug** — the map was rendering on top of the Demo State Panel. Cause: Leaflet's internal panes/controls default to z-index up to 1000, and neither Leaflet's container nor `.showroom-map` established a stacking context of their own, so those values competed directly against the page's own z-index scale (admin panel is 60/61) instead of being contained locally. Fixed with `.showroom-map{position:relative;z-index:0}`, which gives Leaflet's internals their own local stacking context — they can no longer escape above fixed page chrome regardless of their internal numbers.
   - **Layout corrected from a full swap to a split view.** The first version replaced the black block entirely when the map toggled on, losing the postcode entry and "Find Nearest Showroom" CTA. `applyShowroomMapFlag()` now toggles a `.split-view` class on `.showroom-widget` instead (`display:grid;grid-template-columns:1fr 1fr`, stacks on mobile) — `#showroomDefaultView` and `#showroomMap` render side by side, both visible. Also added a "View all stores" link under Vehicle-Specific's block content, wired to the same slide-out. Real postcode-driven radius search (typing a postcode and having the map itself re-center/filter to stores within it) is **not implemented** — no geocoding service is wired up, so the map shows a fixed demo view of the store cluster regardless of postcode input. Flagged here as the gap to close before this leaves pilot stage; `buildStoreSlideout()`'s trigger-handling was also generalized from a single `document.querySelector` to `document.querySelectorAll`, since there are now two "View all stores" triggers per page on Vehicle-Specific (Click & Collect's and the Showroom widget's).

**Verified this session** (Playwright): pill correctly absent from the price line and present on store rows (both In Stock + On Display shown together on Moorebank); postcode field empty on load; view-all line reads the default copy and correctly switches to the postcode-entered copy after Update; slide-out renders all real stores grouped by state with working `tel:`/map links; Demo State Panel now renders visually on top of the map (previously the reverse); split-view shows the black block and the map together with the "View all stores" link present. Spot-checked Simple in addition to Vehicle-Specific — consistent. No console errors.

### Showroom Finder + Click & Collect — second correction round (2026-09-10, same day)

Two more fixes from the next client review pass:

1. **Click & Collect no longer shows named stores by default.** Showing "Moorebank" / "Smeaton Grange" with no postcode entered implied a real nearest-store match that wasn't real — the store data was static regardless of what (if anything) was typed. `initDcPostcode()`'s `update()` now hides `#collectResults` (the named-store rows) whenever the postcode field is empty, and only reveals them once a postcode is entered and Update/Enter is triggered. The "In stock and on display in {N} stores — View all stores" line stays visible either way — that summary line was always meant to be true regardless of postcode, only the specific named rows implied a match that needed gating. Delivery's results (flat freight rates, not location-matched) are unaffected.
2. **Interactive map: full-bleed, 1:2 ratio.** The map previously sat inside the black block's own padding, reading as a smaller tile with black bars around it. `.showroom-widget.split-view` now sets `padding:0` + `overflow:hidden` on the widget itself, moves padding onto `#showroomDefaultView` only, and lets `.showroom-map` fill its grid cell edge to edge (`margin:0;height:auto`, corners squared off since the widget's own `overflow:hidden` clips to its rounded corners). Grid columns changed from `1fr 1fr` (50/50) to `1fr 2fr` — text column now roughly a third of the width, map two-thirds, per client ask ("show more of the actual map").

**Verified this session** (Playwright): typing nothing into the postcode field and loading the page shows no store rows, only the "In stock and on display in 35 stores — View all stores" line; entering a postcode and clicking Update correctly reveals the two named store rows; the map now renders flush to the widget's edges with no visible padding/border, at roughly a 1:2 text-to-map ratio. No console errors.

### Interactive map — locked in as default and rolled out to all 5 templates (2026-09-10, same day)

Client reviewed the map on Vehicle-Specific and liked it — two changes followed:

1. **Map locked in as the default, no longer a Demo State Panel toggle.** Removed the "Interactive map (instead of block)" checkbox entirely (markup, `adminState` field, switch case). `applyShowroomMapFlag(true)` is now called unconditionally from `buildAdminPanel()` — safe everywhere since the function no-ops if a page has no `#showroomMap` container. Vehicle-Specific's markup was also updated to start in `.split-view` state directly (was toggled in via JS only), so there's no layout jump before JS runs.
2. **Rolled out to all 5 templates** (previously Vehicle-Specific only, per the original pilot decision — extended after client sign-off in review, not silently). Each of Simple, Sibling-Color, Config-Variant, and Grouped-Bundle got the same treatment Vehicle-Specific has: Leaflet CDN tags in `<head>`, the Showroom Finder widget's existing content wrapped in `#showroomDefaultView` inside a `.showroom-widget.split-view`, a `#showroomMap` container, a `window.SHOWROOM_MAP_STORES` pin array (same 4 NSW stores — Moorebank/Castle Hill/Smeaton Grange/Silverwater — reused across all 5 templates, since the Showroom Finder's own static "On Display" demo copy was already identical across all 5), and the "View all stores" link into the store slide-out. `buildStoreSlideout()` already handled multiple triggers per page (from the earlier Click & Collect work), so no shared.js change was needed for the extra trigger.
3. **"View all stores" link coloured white, Showroom Finder widget only** (`.showroom-widget .dc-viewall{color:#fff}`) — the existing blue (`#1A56DB`) read poorly against the widget's black background; the same link in the Click & Collect card (white background) stays blue. Scoped via a descendant selector so it doesn't affect the Click & Collect widget's link.

**Verified this session** (Playwright, all 5 templates): map renders with real OpenStreetMap tiles and pins on Simple and Grouped-Bundle (spot-checked visually), config-variant and sibling-color confirmed via console (zero errors on all 5); "View all stores" now has two working triggers per page (Click & Collect card + Showroom Finder widget) both opening the same slide-out — confirmed by clicking the Showroom Finder's trigger specifically on Simple; computed link colour confirmed white inside `.showroom-widget` and unchanged blue inside the Click & Collect card on the same page.

### Next steps (in order)

**Superseded:** the old "7 confirmed build items, all done 2026-09-10" list above was from the Scott Childs/Jake meeting only. The same-day Graham Sowerby meeting reopened three of those items and added a longer list of its own — see that meeting's write-up above for full detail. The list below is the current combined backlog, in priority order, picking up where that write-up left off.

1. **Breadcrumbs — build from scratch on every template.** Confirmed via grep that none exist anywhere in the prototype despite Section 5 previously (wrongly) marking this done. Structure: Vehicle Landing Page → Category → Product. Highest priority of the new items — this was the biggest surprise gap in the Graham meeting.
2. ✅ **Done 2026-09-10.** Reversed the two Scott/Jake calls the Graham meeting overturned: Add to Cart is now locked to gold as the real default (preview toggle removed), and the B-stock/Ex-demo button was replaced with the inline `In Stock — Ex-Demo/Factory Seconds from $X` text treatment (blue link).
3. ✅ **Done 2026-09-10.** Reworked Showroom Finder + Click & Collect together — "On Display" pill next to stock status, Click & Collect showing top stores by default with status pills, synced postcode field, default tab flipped to Click & Collect, "View all stores" opening a new store slide-out drawer, "both unavailable" message state (unchanged, already worked), small tab icons, and the experimental interactive map piloted on Vehicle-Specific (Leaflet + OpenStreetMap). Not yet verified against a live client review — built and self-tested (Playwright) only. Map not yet rolled out beyond the pilot template; that's Brenton's call once reviewed.
4. **Remaining Graham-meeting build items:** Get It Installed fitment-count copy + fallback state + its new Demo State Panel toggle; Important Vehicle Fit Notes block; Rack Fit Guarantee icon; Specifications-as-table + condensed Gold Guarantee tab; SKU click-to-copy (drop the icon buttons); What's Included quantity column; short-description 2-line clamp + Read More; fitment microcopy ("this product," full vehicle spec in the no-fit state); MAXTRAX logo sizing fix; mobile decision-panel-above-video reorder. Full detail in that meeting's write-up.
5. **Get client sign-off on the redesigned Fitment Gallery panel** (red/non-red default, heading size, landscape photos, removed CTA button) — built off a client-supplied reference but not yet through a dedicated confirmation round of its own. "View All In-store Fitments (283)" is currently a dead `href="#"` link — needs a real destination (a lightbox? a full gallery page?) before this leaves prototype stage.
6. **Get client feedback on Simple and Sibling-color specifically** — these still haven't had a dedicated review pass the way vehicle-specific and config-variant have now effectively had. Also get feedback on the grouped/bundle template ("Vehicle Product Set" per the Graham meeting's naming correction), including sign-off on the stand-in Yakima RoadShower SKU used in place of the client's promised example.
7. Resolve the open data flags in Section 7 with the client (plank-count discrepancy, Titanium Grey pricing, MaxTrax Black lifestyle photos, vehicle-specific package-item SKUs, vehicle-specific's fabricated Flat Pack SKU/pricing, and defining a real data source for ex-demo/special-order state before those leave prototype stage). Also source a real Yakima logo file for the grouped/bundle template (text wordmark stands in for now).
8. Once all templates are signed off, build the real standalone data-model/merge-script utility (Section 6, step 4) — currently each template just embeds its own merged JS object inline, which was fine for prototyping but isn't reference-grade for the Magento build.
9. Resolve the remaining Section 4 open questions (items 2 and 3) with the client before finalizing the data model.
10. Extend schema.org Product/Offer structured data to Config-variant, Sibling-color, and Vehicle-specific (only Simple and the new grouped/bundle template have it today).
11. Deploy to Vercel staging once the above is through another client review pass (client to request this explicitly).
12. **Not scheduled, just noted:** paid "Get It Fitted" needs a dedicated alignment call with Chris Roach, Jake Martin, and Tim before any further work past the current demo-toggle state; session-vehicle inference (recognizing an implied vehicle from browsing context even when unsaved) is a flagged idea, not committed.
