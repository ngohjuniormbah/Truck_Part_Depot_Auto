# Truck Parts Depot Auto — 3-step update

## STEP 1 — Replace the project and verify locally

```bash
cd ~/Downloads
unzip -o truck-parts-depot-auto-fixed.zip
cd truck-parts-depot-auto
npm install
npm run build
npm run dev
```

Open `http://localhost:3000/admin`.

Test:
- Product: upload several photos → enter name/price → click **Save Product** once. The button locks while saving, so repeated clicks cannot create duplicates.
- Gallery: upload several photos in one post → save → verify all photos appear in the public Gallery slideshow/grid.
- Review: add and delete a review.
- Orders: open an order, change status, refresh, and delete.

## IMPORTANT — Fix Supabase before testing saves

If Product or Gallery shows a save error, run `supabase-fix-now.sql` in **Supabase Dashboard → SQL Editor** and click **Run**. This repairs/creates the required tables, columns, permissions, and RLS policies used by the admin CRUD. Then redeploy the Vercel site.

## STEP 2 — Enable real browser push notifications

Run the updated `supabase-schema.sql` in the Supabase SQL Editor first.

Then, from the project directory:

```bash
supabase login
supabase link --project-ref YOUR_SUPABASE_PROJECT_REF

npx --yes web-push@3.6.7 generate-vapid-keys
```

Copy the generated public/private keys, then:

```bash
supabase secrets set \
  VAPID_PUBLIC_KEY="YOUR_PUBLIC_KEY" \
  VAPID_PRIVATE_KEY="YOUR_PRIVATE_KEY" \
  VAPID_SUBJECT="mailto:partsdepott@gmail.com"

supabase functions deploy push-subscribe
supabase functions deploy push-order
```

In Vercel/project environment variables, add:

```text
VITE_VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY
```

Keep the private key out of Vercel/browser code. It belongs only in Supabase function secrets.

## STEP 3 — Deploy and test the complete workflow

```bash
git add .
git commit -m "Fix admin CRUD, gallery uploads, browser push, contact info and favicon"
git push origin main
```

After deployment:

1. Open `/admin` on the browser that should receive orders.
2. Click **Enable Push Notifications** and allow browser notifications.
3. The browser will register the service worker and save its push subscription.
4. Place a real test order from another browser/device.
5. The admin browser should receive a browser push notification containing the order ID/customer/total.
6. Open the notification to go to `/admin/orders`.

The supplied logo image is used as the favicon only. The existing text-based site branding/design is unchanged.
