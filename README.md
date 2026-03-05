# Psicopatici Partners — Frontend (Partner Dashboard)

This repository contains the Partner Dashboard frontend application for Psicopatici Partners. It's built with Next.js (App Router), React, TypeScript and Material UI.

> IMPORTANT: This project does not accept external contributions. All rights reserved — no external contributions or pull requests will be accepted.

---

## Quick Overview

- Purpose: Partner dashboard to manage media assets, affiliates, coupons, orders, reports and wallet.
- Main stack: Next.js, React, TypeScript, Material UI, Axios, SWR.
- API: The frontend communicates with the partner API (see `lib/api/client.ts`).

## Features

- Dashboard with charts and KPIs
- Media library with preview and downloads
- Agent & contact management
- Coupon generation and wallet operations
- Reports: earnings, sales and affiliates

## Prerequisites

- Node.js 16 or newer
- npm (or yarn/pnpm)

## Local Development

Install dependencies:

```bash
cd dani0421_1200_frontend
npm install
```

Start dev server:

```bash
npm run dev
```

Open http://localhost:3000 (or the port printed by the dev server).

## Build / Production

```bash
npm run build
npm start
```

## Notable Files

- `app/` — Next.js App Router pages
- `components/` — UI components (dashboard, common, data, headers)
- `lib/api/` — API wrappers and axios client
- `public/` — static assets, fonts and icon styles

## No Contributions — All Rights Reserved

This repository is closed to external contributions. No outside pull requests, forks or patches will be accepted. All rights reserved by the project owner. For access, collaboration requests or questions, contact an authorized maintainer.

© Psicopatici Partners — All rights reserved.
