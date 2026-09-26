<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Truck Parts Depot Auto

Commercial heavy-duty truck parts platform for Powerstroke, Duramax, and Cummins engines.

## 🚀 Deploying to Vercel

This repository is pre-configured for one-click deployment on **Vercel** with:
- `vercel.json` SPA URL rewrites (preventing 404s on page refresh)
- Automatic environment variable detection for both `VITE_*` and `NEXT_PUBLIC_*` prefixes
- Real-time order push notifications & chime alerts

### Step 1: Deploy to Vercel
1. Import this repository in [Vercel](https://vercel.com/new).
2. Framework Preset: **Vite** (detected automatically).
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Step 2: Connect Your Database
If you added Supabase / PostgreSQL in Vercel or created a Supabase project:
1. In Vercel Project Settings → **Environment Variables**, ensure you have:
   - `VITE_SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`) = `your-anon-public-key`
2. Open your Supabase Dashboard → **SQL Editor** (or Vercel Postgres console).
3. Copy the contents of [`supabase-schema.sql`](./supabase-schema.sql) and click **Run**.
   - This creates the `products`, `orders`, `reviews`, and `gallery` tables with Row Level Security (RLS) policies.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Start local development server:
   ```bash
   npm run dev
   ```


## Browser order push notifications

The admin dashboard now uses real Web Push subscriptions. Run `supabase-schema.sql`, then deploy the two Supabase Edge Functions under `supabase/functions/`:

```bash
supabase functions deploy push-subscribe
supabase functions deploy push-order
```

Generate VAPID keys once:

```bash
npx web-push generate-vapid-keys
```

Set these Supabase function secrets:

```bash
supabase secrets set \
  VAPID_PUBLIC_KEY="YOUR_PUBLIC_KEY" \
  VAPID_PRIVATE_KEY="YOUR_PRIVATE_KEY" \
  VAPID_SUBJECT="mailto:partsdepott@gmail.com"
```

Set the same public key in the Vite/Vercel environment as `VITE_VAPID_PUBLIC_KEY`.

Then open `/admin`, click **Enable Push Notifications**, and allow notifications in the browser. A checkout order will be sent to all subscribed admin browsers, including when the admin tab is not focused.
