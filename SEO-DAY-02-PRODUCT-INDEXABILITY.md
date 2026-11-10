# Day 2 — Product Page Indexability and Static Prerendering

**Project:** Truck Parts Depot Auto  
**Date:** 2026-11-10  
**Branch:** `seo/production-foundation`  
**Scope:** Product HTML generation, metadata, structured data, sitemap consistency, static route handling and HTTP 404 behavior.

## Executive result

Implemented a Vite-compatible static prerender pipeline that creates one static HTML document per public Supabase product at build time. The generated document includes product-specific title, meta description, canonical URL, Open Graph/Twitter metadata, visible product content and Product JSON-LD before browser JavaScript executes.

Removed the Vercel catch-all rewrite so known application routes are emitted as static files and unknown paths can receive Vercel's native 404 response. Added a custom `404.html`, shared product URL generation across frontend and build scripts, and CI validation for generated SEO output.

The latest validation run for the preceding code tranche passed script syntax, TypeScript, Vite build and generated-output checks. A further CI run is executing for the final guard/noindex changes. Vercel's latest deployment notification reported an error; the Vercel deployment logs are not available through the connected GitHub tools. The preview must not be treated as verified until the Vercel build is successful and the deployed HTML is tested.

## Implementation completed

### 1. Static product prerender

New file: `scripts/prerender-products.mjs`

The build now runs:

```bash
npm run build
# vite build && node scripts/prerender-products.mjs
```

The prerender step:
- Reads the production Vite HTML template from `dist/index.html`.
- Fetches public product rows from Supabase using the anon key and paginated REST requests.
- Generates a static HTML document at `dist/products/{slug}/index.html` for each product.
- Injects product-specific title, description, canonical, Open Graph and Twitter metadata.
- Adds visible product content (name, brand, model, engine, OEM number, SKU, image, description, price when present and availability text).
- Adds Product JSON-LD with brand, SKU/MPN, image, category and Offer when a positive price exists.
- Generates a sitemap from the same product URL function.
- Fails a Vercel production build if Supabase credentials are absent or the public products query returns zero rows. Local/CI builds without production credentials can still validate the general build pipeline.

No Supabase service-role key is used or should be added to Vercel's public build environment.

### 2. Shared product URL generation

New files:
- `src/utils/seo-slugs.mjs`
- `src/utils/seo-slugs.d.ts`

The React route helper, prerender generator and sitemap generator now import the same slug/path implementation. This removes the previous independent Unicode normalization logic and prevents accented product names from producing different sitemap and frontend URLs.

### 3. Real static route files and 404 handling

Updated `vercel.json` to remove the catch-all rewrite to `/index.html`.

The build now materialises static files for known application routes, including products, services, about, reviews, gallery, contact and refund policy. It also creates static admin/checkout route documents with noindex metadata. Added `public/404.html` as the custom not-found document.

Expected production behavior after a successful deployment:
- Existing product URL: static product HTML, HTTP 200.
- Existing known application route: static route HTML, HTTP 200.
- Unknown product URL: Vercel native 404 response, not a generic React shell with HTTP 200.

These HTTP statuses have **not yet been verified against the deployed Vercel preview**.

### 4. Sitemap and CI validation

The generated sitemap contains the homepage, public static routes and product URLs. Admin and checkout are excluded. The previous sitemap script now uses the shared URL helper.

New file: `scripts/validate-seo-output.mjs`

CI checks:
- Syntax of SEO build scripts.
- Frontend TypeScript.
- Vite production build and post-build prerender step.
- Required static route files and sitemap presence.
- Product pages (when generated) contain a canonical URL, visible product heading, Product microdata and JSON-LD.
- Admin/checkout are absent from sitemap.

## Validation status and blockers

| Check | Status |
|---|---|
| Shared slug helper integrated | Implemented |
| Sitemap/frontend slug parity | Implemented through shared module |
| Static product prerender script | Implemented |
| Product title/description/canonical | Generated in prerendered HTML |
| Product JSON-LD | Generated in prerendered HTML |
| Visible product content in initial HTML | Generated |
| Vercel catch-all rewrite removed | Implemented |
| Custom 404 document | Added |
| Admin/checkout noindex | Generated |
| TypeScript and Vite build | Passed in latest completed CI run |
| SEO output validation | Passed in latest completed CI run |
| Final guard/noindex commit CI | Running at time of report |
| Vercel preview deployment | Error notification received; logs unavailable |
| Production product count and product HTML | Requires Vercel environment variables and live validation |
| HTTP 200/404 response verification | Pending deployed preview |
| Inventory-change regeneration | Not automated; a new deployment is currently required |

### Important deployment dependency

Configure these in Vercel **Production and Preview** build environments:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The build now intentionally fails on Vercel if they are missing or if the public product query returns zero rows. This prevents a seemingly successful production deploy that silently omits every product page from the sitemap.

The public products table must permit SELECT access for the intended public product fields under Supabase RLS. Do not use a service-role key.

## Operational limitation: inventory updates

This implementation is build-time static prerendering, not request-time SSR. Product pages reflect the product data at the most recent deployment. An admin edit to product name, price, image, description or stock does not automatically rewrite the deployed HTML or sitemap.

Before treating this as fully production-ready, establish a safe regeneration mechanism (for example, an authenticated deployment hook triggered by a trusted server-side product-change event) and test that it cannot be invoked by unauthorised users. Until then, redeploy after meaningful public catalogue changes.

## Day 2 acceptance tests for deployed preview

Run these only after Vercel preview is Ready:

1. Open a known product URL directly in a private/incognito browser window.
2. View Page Source (not only Elements) and confirm the product H1, description, canonical and Product JSON-LD are in the original response.
3. Refresh the product URL; it must continue to load.
4. Request a deliberately invalid product URL; confirm HTTP 404, not HTTP 200.
5. Fetch `/sitemap.xml`; confirm product URL count and that sampled URLs resolve.
6. Confirm admin and checkout are not in sitemap and have noindex metadata.
7. Test an accented product name if one exists and verify sitemap URL exactly matches the frontend helper.
8. Test a real product edit and document the current redeploy requirement.

## Day 2 conclusion

The repository now contains a concrete static prerendering and route-generation implementation. CI can validate the generated structure without production secrets. **The work is not yet deployment-verified**: Vercel has reported a deployment error, and the deployed HTTP responses and actual Supabase product output remain unverified. The next step is to inspect the Vercel build log, configure the required public Supabase build variables if absent, obtain a Ready preview, and run the acceptance tests above.

## Day 3 handoff

- Resolve the Vercel deployment failure.
- Verify real product pages are generated from the production catalogue.
- Verify page source and HTTP 200/404 behavior.
- Test product JSON-LD with Google's Rich Results Test and Schema Markup Validator.
- Implement a trusted product-change redeployment mechanism or select request-time rendering if the business requires immediate inventory freshness.
