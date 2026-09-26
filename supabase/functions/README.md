# Web Push functions

Deploy `push-subscribe` and `push-order` after running `supabase-schema.sql`.

Required Supabase function secrets:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (for example `mailto:partsdepott@gmail.com`)

The public VAPID key must also be exposed to the Vite app as `VITE_VAPID_PUBLIC_KEY`.
