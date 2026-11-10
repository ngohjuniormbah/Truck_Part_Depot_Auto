# SEO implementation guide

## Current storefront architecture
Truck Parts Depot Auto uses Vite + React as a client-rendered single-page application. Product data is loaded from Supabase in the browser. The initial HTML response therefore does not contain the complete product catalogue or product detail content.

This implementation adds durable product-specific URLs, crawlable product anchors on the catalog page, browser-updated route metadata, Product JSON-LD, and a build-time sitemap based on the public product catalogue.

## Important remaining architectural limitation
Client-side metadata and JSON-LD are not a substitute for server-rendered or pre-rendered product HTML. The next major engineering milestone is to render public product pages at build time or on the server, include product data in the initial HTML, and return correct HTTP status codes (200 for valid products, 404 for missing products). Evaluate migration of the public storefront to an SSR-capable framework if needed. Do not treat this current change as full server-side SEO.

## Sitemap generation
The production build runs `scripts/generate-sitemap.mjs`. Configure these Vercel build environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Use the Supabase anon/public key, never a service-role key. The products table must allow public SELECT of the product fields used on the storefront. If credentials are configured but the product query fails, the build fails rather than silently publishing an incomplete product sitemap. Without credentials, the script emits a static-only sitemap and warns.

## Google Search Console
1. Add and verify the Domain property `truckpartsdepotauto.com` with the DNS TXT record issued by Google.
2. Submit `https://truckpartsdepotauto.com/sitemap.xml`.
3. Use URL Inspection on the homepage, products catalogue and representative product URL. Inspect rendered HTML, selected canonical, crawl allowance and indexability.
4. Review Page Indexing for discovered-but-not-indexed, crawled-but-not-indexed, duplicate canonical, soft 404 and 404 patterns.
5. Review Core Web Vitals and HTTPS/security reports.
6. Request indexing for a small number of important changed URLs; repeated requests do not guarantee indexing.

## GA4 and ecommerce measurement
Create a GA4 web stream and configure the real Measurement ID through an approved tag implementation after confirming the correct production property. Track:
- `view_item_list` and `select_item` for catalogue browsing.
- `view_item` on product detail pages.
- `add_to_cart` and `begin_checkout` for purchase intent.
- `purchase` only after payment/order completion is confirmed by the business.
- A qualified lead/contact event when a genuine enquiry is submitted.

Do not fabricate purchase revenue from pending or unverified orders. Exclude internal/test traffic and test transactions. Link Search Console to GA4 and review organic landing pages, queries, engagement and qualified conversions weekly.

## Backlink acquisition
Prioritise relevant editorial mentions, genuine supplier/distributor profiles, repair-shop and fleet-maintenance partnerships, trade associations, and useful industry resources. Publish link-worthy OEM cross-reference guides, fitment explainers and diagnostic resources based on accurate product knowledge.

Do not automate link creation, buy ranking links, mass-submit low-quality directories, post keyword-rich forum signatures or use reciprocal link networks. Google classifies manipulative link schemes as link spam. Paid sponsorships and advertisements should qualify links with `rel="sponsored"` (or `nofollow` where appropriate).

## Two-week delivery sequence
- Days 1–2: stable product URL routing, crawlable links, sitemap and metadata.
- Days 3–4: server rendering/pre-rendering, 404 handling, product/category taxonomy.
- Days 5–6: content and internal linking based on inventory and actual customer search intent.
- Days 7–8: image optimisation, Core Web Vitals and accessibility.
- Days 9–10: backlink prospecting and personalised outreach.
- Days 11–12: GA4, Search Console and conversion events.
- Days 13–14: full crawl, structured-data validation, URL inspection and baseline report.
