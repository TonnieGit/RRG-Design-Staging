# Product Page Requirements — Master Doc

Consolidated from planning session. Purpose: reference document to guide the multi-variant product page build in Claude Code (VS Code integration), using scraped real-world data from Roof Racks Galore as source content.

---

## 1. Product Types

**Critical context confirmed by the client:** The current live site has **no variant-selector UI anywhere**, for any product type. Every variation — color, assembled/unassembled, or any other option — is published as its own completely separate product listing with its own URL, SKU, and page. There is no existing pattern to reference or partially reuse for on-page variant selection; this is being built from scratch across the board, not just for color. Confirmed concretely via the MaxTrax color example and the Pioneer 6 Platform assembled/unassembled example above — both are pairs (or larger sets) of fully independent listings today.

This means: when Claude Code scrapes reference URLs for a product family with variants, it must scrape **each separate listing** for that family individually, then merge them into one page model client-side/in the template — the source data will never arrive as a single page with variant options built in.

The page templates need to support (at minimum) four distinct product types. These are **not mutually exclusive** — open question below on whether they combine.

### 1.1 Simple Products
- Single SKU, no variants
- Universal fit, not vehicle-specific
- Example: recovery bag
- No variant/color selector needed

**Confirmed reference example (live site):** Front Runner Pro Water Tank With Strap 42L (SKU `FRWTAN063`)
- No variant selector of any kind — single SKU, single price
- Minimal Specifications tab: just SKU and Brand (far shorter than the platform examples, confirming this tab's length is genuinely variable by product complexity)
- "Consists of" / "Materials used" sub-sections inside Details — a bullet-style kit-contents breakdown not seen on the other product types; worth supporting as an optional Details sub-block
- "This item is limited — Whilst stocks last" — a stock-scarcity message appearing above Add to Cart on this SKU; worth including as an optional/conditional element
- Fitting Instructions tab present here too (a simple accessory, not just platforms) — reinforces that this tab is genuinely available across product types, not tied to any one category
- Full tab set again: Details, Specifications, Gold Guarantee, Shipping Info, Fitting Instructions
- Related Products carousel populated with accessory/spare-part cross-sells (tank cap, mounting brackets, other tank sizes) — good real example of cross-sell logic for accessory-type simple products

### 1.2 Configuration-Variant Products
- Non-appearance variants (not color-based)
- Example: roof platform sold without fitting kit — comes as Assembled / Unassembled
- Needs a variant selector (dropdown or toggle, not swatches)

**Confirmed reference example (live site) — this is the exact gap the new build needs to fix:**
Currently, Assembled and Unassembled (Flat Pack) versions of the Rhino Rack 6 Series Pioneer Platform (900×1430mm) are two entirely separate products with no variant selector connecting them:

| | Flat Pack (Unassembled) | Assembled |
|---|---|---|
| SKU | RH62112F | RH62112 |
| Price | $979.00 → $780.00 (20% off) | $1,059.00 → $900.15 (15% off) |
| Planks | 5 | 4 |
| Product video | None | Yes — YouTube embed in Details tab |
| Fitting instructions PDF | Yes (separate asset) | Yes (separate asset) |
| Platform size / weight / material | 900×1430mm, 12.5kg, Aluminium — identical | 900×1430mm, 12.5kg, Aluminium — identical |

Implications for the build:
- Variant selection must swap **price** (assembled costs more — labor is priced in), not just description/SKU
- Variant selection should be able to swap **product video presence** (one variant has a video, the other doesn't) — video needs to be variant-aware, not just product-level
- Variant selection should swap the **Fitting Instructions** PDF link
- The plank-count difference (5 vs 4) needs a quick sanity check with the team — confirm whether that's a genuine spec difference between build states or a data inconsistency on the current site, since it affects whether "Specifications" content is fully shared across variants or partially variant-specific

### 1.3 Sibling / Color Products
- Same product, many color options (~12+)
- Example: MaxTrax recovery boards
- Needs a color swatch picker, likely with imagery that updates per swatch

### 1.4 Vehicle-Specific Kits/Packages
- Bundles of multiple products whose combined fitment applies to a specific vehicle
- **Fitment messaging is critical** — three states to design for:
  1. **Fits** — vehicle already set in user session, confirmed compatible
  2. **Unknown** — no vehicle set, prompt user to confirm/select one
  3. **Doesn't fit** — vehicle set but incompatible (e.g., Hilux selected, product is Ranger-specific)

**Open questions to resolve before/during design phase:**
- Can a vehicle-specific kit *also* carry a config-variant (e.g., assembled/unassembled) on top of fitment logic?
- Is fitment exact-vehicle, or does it span model years/trims/ranges?
- Do color/sibling products ever also need vehicle-fitment logic, or are "variant type" and "fitment type" fully independent, freely-combinable dimensions?

**Decision (confirmed):** On the current live site, each MaxTrax color is its own separate product URL (e.g., MTX02BK = Black), with color shown as a static spec rather than a picker. **For the new build, this will change** — sibling/color products will be consolidated onto a single page with an on-page color swatch picker. This is a deliberate departure from the current site's structure and needs to be reflected in the scraping/build approach (all sibling SKUs for a given product family need to be identified and merged into one page model, with per-color images, price, stock, and SKU swapped by the swatch selection).

---

## 2. Core Page Widgets & Features

### 2.1 Delivery / Click & Collect Widget
- Two-tab component: **Delivery** | **Click & Collect** (Delivery selected by default)
- Delivery tab: Standard vs. Express shipping, pricing shown, likely postcode-driven
- Click & Collect tab: postcode/location entry, shows store stock/availability
- Placement: near add-to-cart (final placement TBD in design phase)

### 2.2 Ex-Demo / Factory Seconds Availability
- Applies to **any** product type — not category-specific
- Surfaces when an ex-demo/factory-seconds unit exists, showing discounted price (e.g., $100 → $50)
- If multiple ex-demo units exist across stores: click opens a modal to select one, which routes to that specific ex-demo product page

### 2.3 Showroom Finder
- Shows which physical stores have the product on display in-showroom
- User enters postcode → results ordered nearest-to-furthest
- Must be extremely simple/low-friction — high-ticket item, confidence-building tool

### 2.4 Fitment Gallery
- Sits below main product images (per current Figma draft)
- Shows the exact product fitted to the user's exact vehicle — real installation photos taken by store teams across all 35 locations
- User can select their vehicle (and vehicle color) to filter gallery results
- If a vehicle is already set in the user's session, gallery auto-filters to match
- Major authority/trust driver — potentially hundreds/thousands of images per fitment combination (e.g., Rhino Rack Pioneer 6 Platform × Toyota Hilux N80)

### 2.5 Product Media
- Master product image
- Secondary image carousel
- Product video (optional/dynamic — not all products have one; plan for both states)

### 2.6 Get It Installed CTA
- Drives users toward in-store professional installation
- Significant revenue driver — should have clear visual prominence

### 2.7 Merchandising / Discovery
- Recently viewed products
- Related products
- Upsell products
- Cross-sell products

### 2.8 Info Tabs (dynamic — hide if content doesn't exist, but design for all-present state)
- **Details** — long description
- **Specifications**
- **Gold Guarantee** — fitment guarantee messaging
- **Shipping Info**
- **Fitting Instructions**

### 2.9 Trust & Support Elements
- Trust icons/stats: trained professionals, 200,000+ roof racks fitted, Australia's largest nationwide roof rack specialist, trusted since 1989, 35 locations nationwide (with more opening)
- Support prompt: "Need help?" + 1300 number

### 2.10 Product Metadata & Content
- Short description (pulled from Magento 2 backend field)
- Brand logo display
- Reviews / star ratings
- Part number / SKU — with **quick-copy icon** (store staff use this to paste directly into inventory system)
- Breadcrumbs
- Add to Cart

---

## 2.11 Confirmed from Live Site Reference Pages

Two reference URLs were pulled from Roof Racks Galore (roofracksgalore.com.au) to validate the plan against real content:

- **Vehicle-specific product:** Rhino Rack JC-01773 Pioneer 6 Platform for Toyota Hilux N80 (SKU `GP01M1TZZ`)
- **Simple/sibling product:** Maxtrax MKII Black (SKU `MTX02BK`)

**Confirmed and validated:**
- Delivery / Click & Collect widget exists live, structured as "How to get it" with Delivery and Click & Collect sections
- Info tabs confirmed as: **Details, Specifications, Gold Guarantee, Shipping Info** (Fitting Instructions and product video are absent on SKUs that don't have them — confirms tabs are conditionally rendered)
- Gold Guarantee tab content is substantial: Standard Rack Guarantee vs. Gold Rack Guarantee tiers, annual rack health checks, 3-year key cover, free basic accessory fitting, 90-day exchange — real copy exists to reuse/reference
- Trust icon copy confirmed verbatim: "Trusted Since 1989" (30+ locations), "Trained Professionals" (200,000+ roof racks fitted), "Australia's Largest" (only nationwide specialist), "Need Help" + phone number
- Specifications tab is a simple key-value list (SKU, Sport/Activity, Colour, Brand, etc.)
- Related Products carousel exists and is populated
- Pricing pattern: strikethrough original + sale price (e.g., $319.00 → $299.00) and "$X off RRP" framing for vehicle-specific/high-ticket items
- **In-Store Fitment Gallery is live and confirmed** — the Pioneer 6 Platform × Hilux N80 combination alone has **283 fitment photos**, each deep-linking to a per-install detail view. This is powered by an existing "Rackit" fitment module (URLs follow `/rackit/fitment/display/item/rackit/product_id/component?parent_sku=X&product_id=Y`) — worth investigating further if any of that data/logic can inform the rebuild.

**Build/scraping implication:** The vehicle-specific product page's HTML is dominated by the large fitment gallery block, to the point that a naive full-page text scrape truncates before reaching price, description, and tab content. Claude Code's scraping approach should target specific sections/selectors (price, description, specs, tabs, related products) separately from the fitment gallery, rather than relying on one flat full-page extraction.

**Confirmed decision — sibling/color products:** Unlike the current live site (where each MaxTrax color is a separate product URL with color as a static spec), the **new build will consolidate sibling/color products onto a single page with an on-page color swatch picker**. This is an intentional structural change from the current site and needs to be accounted for when scraping — all color siblings within a product family should be identified and merged into one page model (swapping image, price, stock, and SKU based on swatch selection) rather than scraped as independent standalone pages.

---

## 3. Build Plan Notes

- **Tooling:** Claude Code (VS Code integration)
- **Approach:** Build multiple template variations covering each product type (simple, config-variant, sibling/color, vehicle-specific kit)
- **Source data:** Real product URLs from Roof Racks Galore will be provided per product type
- **Scraping requirement:** Pull accurate pricing, descriptions, images, header, footer, and other page content directly from live pages to keep prototypes accurate and realistic — not placeholder content
- **Next step:** Once URLs are provided, scrape reference pages, then move into design/prototyping of page structure per product type

---

## 4. Status

This is the full feature list as of this planning session. Treat as living doc — update as new requirements surface before locking the build plan.
