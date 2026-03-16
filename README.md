# Habit Builder

A minimal habit tracker with daily tracking, weighted scoring, and monthly overview.

## Sync Mode (No Login)

This app syncs data across devices using:
- Vercel KV / Upstash Redis
- A shared sync key you enter in the app

Use the same sync key on phone and laptop to access the same data.

## Local Development

1. Install dependencies:
```bash
npm install
```
2. Add `.env.local` with KV credentials:
```bash
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```
3. Run:
```bash
npm run dev
```

## Deploy (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add a Redis/KV integration in Vercel (this provides `KV_REST_API_URL` and `KV_REST_API_TOKEN`)
4. Deploy
