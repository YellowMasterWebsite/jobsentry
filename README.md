# JobSentry

A compliant‑by‑default job scout with optional LinkedIn browser companion.

## Quickstart
1. Copy `.env.example` → `.env.local` and fill values.
2. `npm i && npx prisma db push && npm run dev`
3. Open `http://localhost:3000` and create a requirement set.
4. Ingest sources:
   - Greenhouse: `GET /api/ingest/greenhouse?org=<org>`
   - Lever:     `GET /api/ingest/lever?org=<org>`
   - LinkedIn:  use the extension to push current search results.
5. Import your LinkedIn **Connections** CSV at `/import` page to POST to `/api/import/connections`.
6. Run the digest locally: `GET /api/digest`, then deploy to Vercel and enable the included **every‑3‑hours** cron.

## Important
- LinkedIn restricts automated access. The included extension is optional and runs locally in your browser session; review LinkedIn’s ToS and use at your discretion.
- Out‑of‑the‑box sources: Greenhouse, Lever. You can add more JSON/RSS feeds.
- Connection matching is fuzzy; verify before outreach.

## Scripts
- `npm run dev` — start Next.js dev
- `npm run build` — build for production
- `npm start` — start production server

## License
MIT — provided as‑is, for educational use. You are responsible for compliance with relevant Terms of Service and laws.
