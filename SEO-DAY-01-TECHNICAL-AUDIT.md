# Day 1 — Technical SEO Audit & Baseline

**Project:** Truck Parts Depot Auto  
**Audit date:** 2026-11-10  
**Branch reviewed:** `seo/production-foundation`  
**Scope:** Repository-level technical audit, deployment configuration, crawl/indexing signals, product routing, sitemap generation, structured data and measurement readiness.

## Executive result

The first implementation tranche passes GitHub Actions validation (sitemap script syntax, frontend TypeScript and Vite production build), and the Vercel preview was reported as Ready by the Vercel GitHub integration.

This is a **code/configuration audit**, not a verified live crawl or Search Console baseline. The external browser fetch used during this audit could not retrieve the production domain, robots.txt, sitemap.xml or Vercel preview. Search Console and GA4 account data were not connected. Therefore no claims are made about current indexed-page counts, organic clicks, impressions, rankings, backlink counts, Core Web Vitals or real production HTTP responses.

## Baseline scorecard

| Area | Baseline | Evidence / status |
|---|---|---|
| Build health | PASS | Latest branch-head GitHub Actions run completed successfully: sitemap syntax, TypeScript and Vite build. |
| Preview deployment | PASS | Vercel GitHub bot reported the preview deployment as Ready. |
| Product URL model | PARTIAL | Stable product-specific path helper exists; client-side route resolution depends on loading the Supabase catalogue. |
| Crawlable catalogue links | PARTIAL/PASS | Product names now render as anchor elements, but click handling prevents normal navigation and delegates to SPA state. Verify no-JS and browser behavior. |
| Initial HTML product content | FAIL | `index.html` contains only the shared React root. Product details and product metadata are injected after JavaScript executes. |
| HTTP 404 for invalid product URL | FAIL / UNVERIFIED | `vercel.json` rewrites every path to `/index.html`; invalid product routes can return the SPA shell with HTTP 200 (soft 404 risk). |
| Product sitemap | PARTIAL | Build-time generator fetches product identifiers from Supabase; real production product count and generated sitemap were not verified. |
| Sitemap slug parity | FAIL — code defect identified | Sitemap generator's Unicode combining-mark regex is double-escaped compared with the frontend slug helper. Accented product names can produce different slugs between sitemap URLs and frontend routes. |
| robots.txt | CONFIGURED | Allows public crawling, disallows admin paths, and declares the sitemap URL. Live response not verified. |
| Canonical/meta tags | PARTIAL | Route metadata is changed client-side. Initial HTML contains homepage metadata only; crawlers and social scrapers may not see product metadata in the first response. |
| Structured data | PARTIAL | Organization JSON-LD in initial HTML; Product JSON-LD is injected by the product React view. Server-rendered product markup is not present. |
| Analytics | NOT CONFIGURED / UNVERIFIED | GA4 code is optional and requires a real `VITE_GA4_MEASUREMENT_ID`; property and event receipt were not verified. |
| Search Console | NOT CONNECTED / UNVERIFIED | DNS ownership, sitemap submission, indexing and performance data require account access. |
| Backlinks | NO VERIFIED BASELINE | No backlink index or Search Console Links report was available. No links are claimed as acquired. |

## Findings and priority

### P0 — Product page content is not present in initial HTML

**Evidence:** `index.html` contains an empty `#root` and loads `/src/main.tsx`. `App.tsx` fetches product data in browser effects. Product detail title, description, canonical and Product JSON-LD are applied after React has loaded.

**Impact:** Product pages depend on JavaScript rendering for their substantive content and SEO metadata. This is a material weakness for product discovery, indexing reliability, and social previews.

**Required remediation:** Render product pages on the server or pre-render them so the first HTML response includes the correct product name, description, canonical, image, visible content and Product JSON-LD.

### P0 — Catch-all rewrite prevents reliable HTTP 404 behavior

**Evidence:** `vercel.json` rewrites every path to `/index.html`. The React application displays a not-found state for an unknown product, but client-side `noindex` does not change the HTTP response status.

**Impact:** Nonexistent product URLs may be served as HTTP 200 soft 404s.

**Required remediation:** Implement route-aware server responses: valid product URL returns 200; unknown product URL returns actual 404; redirect obsolete product slugs only when a verified replacement exists.

### P1 — Sitemap/frontend slug generation can diverge for accented names

**Evidence:** `src/utils/seo.ts` removes Unicode combining marks using the regex `/[\u0300-\u036f]/g`. `scripts/generate-sitemap.mjs` currently contains a double-escaped equivalent, which does not remove the same characters. A local Node check with the value `café` confirmed that the two expressions produce different normalized slugs.

**Impact:** Sitemap product URLs for accented names may not match URLs generated by the frontend. This can create product sitemap URLs that resolve to the not-found view.

**Required remediation:** Use identical slug logic in one shared implementation or add parity tests covering accented names, punctuation, empty identifiers and duplicate product names.

### P1 — Sitemap contents have not been verified in the deployment

**Evidence:** The generator requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Without them it emits a static-only sitemap and a warning. The committed static sitemap contains only eight static URLs. The generated production file was not fetched during this audit.

**Impact:** Product URLs may be absent from the deployed sitemap if Vercel environment variables are missing or the public Supabase query does not return the intended rows.

**Required remediation:** Confirm Vercel Production environment variables, confirm public RLS only exposes intended catalogue fields, inspect deployed sitemap URL count and sample URLs, and fail production validation if product inventory is expected but the sitemap contains zero product URLs.

### P1 — Client-side route metadata is not a server-rendered SEO solution

**Evidence:** `updatePageMetadata()` mutates document title, description, robots, Open Graph, Twitter and canonical after the app loads.

**Impact:** The initial HTML response has generic homepage metadata for every route. Social scrapers that do not execute JavaScript can show generic previews. Product-specific canonical and metadata are not guaranteed in the initial response.

**Required remediation:** Generate route-specific metadata in server-rendered/pre-rendered HTML. Keep client-side updates only for SPA transitions, not as the primary indexing mechanism.

### P2 — Analytics and search performance baseline is missing

**Evidence:** GA4 integration requires a real measurement ID; Search Console setup requires DNS and Google account access. No analytics or Search Console exports were available.

**Impact:** We cannot yet quantify organic clicks, impressions, CTR, landing-page conversion, indexing coverage or query demand.

**Required remediation:** Verify Search Console Domain property, submit sitemap, connect GA4, exclude internal/test traffic and record a baseline after data collection begins.

## Verified repository facts

- Framework: Vite + React 19 + TypeScript.
- Hosting configuration: Vercel static output directory `dist`.
- Data source: Supabase client-side catalogue.
- Product detail route: `/products/{slug}`.
- Static sitemap paths: homepage, products, services, about, reviews, gallery, contact and refund policy.
- robots.txt excludes admin paths and points to `https://truckpartsdepotauto.com/sitemap.xml`.
- Product schema currently includes product name, description, images, SKU/MPN, brand, category and conditional offer/availability.
- GA4 events implemented in code: page_view, view_item_list, select_item, view_item, add_to_cart and begin_checkout. A purchase event is intentionally omitted while payment remains pending verification.
- Public Supabase anon key is a browser key by design; database access must be constrained by Row Level Security. Never expose a service-role key.

## Metrics that must be captured after account access

Do not fill these with estimates. Record the actual values and the date range in the Day 13/14 report.

| Metric | Source | Baseline |
|---|---|---|
| Indexed URLs | Search Console → Pages | Pending access |
| Submitted sitemap URLs | Search Console → Sitemaps | Pending access |
| Organic clicks (last 28 days) | Search Console → Performance | Pending access |
| Organic impressions (last 28 days) | Search Console → Performance | Pending access |
| Average CTR | Search Console → Performance | Pending access |
| Average position | Search Console → Performance | Pending access |
| Referring domains | Search Console Links / third-party index | Pending access |
| Organic sessions | GA4 | Pending configuration |
| Organic enquiries/orders | GA4 + confirmed business outcomes | Pending configuration |
| LCP / INP / CLS | Search Console Core Web Vitals / field data | Pending data |
| Product count in production sitemap | Deployed `/sitemap.xml` | Pending live verification |

## Day 1 completion criteria

- [x] Inspect framework, build scripts and deployment rewrites.
- [x] Inspect robots.txt, static sitemap and homepage HTML.
- [x] Inspect product routing, metadata and structured data implementation.
- [x] Inspect Supabase data loading and sitemap dependencies.
- [x] Confirm CI build and preview deployment status from GitHub/Vercel integration.
- [x] Identify and reproduce the sitemap/frontend Unicode slug mismatch locally.
- [x] Record evidence, risks, unknowns and required next actions.
- [ ] Live production crawl and HTTP header verification — blocked because the external fetch could not retrieve the site.
- [ ] Search Console and GA4 baseline capture — requires owner account access and verified property setup.

## Day 2 handoff

1. Fix and test sitemap/frontend slug parity.
2. Decide SSR/pre-render architecture and implement server-rendered product pages.
3. Implement genuine HTTP 404 behavior for missing products.
4. Confirm Vercel production environment variables and validate the generated product sitemap.
5. Test representative direct product URLs, refresh, back/forward navigation and canonical metadata.

**Day 1 conclusion:** The build pipeline is healthy, but the SEO foundation is not yet production-grade for product indexing. The two highest-impact blockers are JavaScript-only product rendering and the catch-all rewrite's lack of genuine 404 responses. The sitemap slug mismatch is a concrete implementation defect to correct next.
