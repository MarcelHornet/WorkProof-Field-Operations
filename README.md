# WorkProof

WorkProof is a mobile-first field operations platform for assigning tasks, collecting photographic proof and approving completed work across multiple organisations, sites and teams.

## Local setup

1. Copy `.env.example` to `.env` and add the Supabase project URL and publishable key.
2. Run `npm install`.
3. Run `npm run dev`.

## Production deployment

The included `netlify.toml` builds the Vite app and publishes `dist`. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Netlify. Never place a Supabase secret or service-role key in a `VITE_` variable.

The production database migration is in `supabase/migrations` and includes multi-tenant tables, row-level security, private task evidence storage and controlled task status functions.
