# Demo Auto Workshop

A clickable mobile-first prototype of a workshop management app for a New Zealand car repair shop. Built to demonstrate the complete job flow — inspection, customer signature, branded report, quote, invoice and history.

> This is a demo. All customers, vehicles and business details are fictional, and all data stays in the browser.

## The demo flow

1. **Dashboard** — recent jobs, unpaid invoice count and a clear “New inspection” entry point.
2. **New inspection** — choose a customer and vehicle, pick a checklist, then record Pass / Needs attention / Fail, notes, measurements and camera photos for every item.
3. **Customer signature** — sign on the phone with a finger, then clear or save.
4. **Inspection report** — a branded preview with grouped results, photos and signature; download a multi-page PDF.
5. **Quote & invoice** — turn findings into editable line items, apply 15% GST, convert to an invoice (`INV-0001` style), download the invoice PDF or simulate sending it by email.
6. **Jobs & invoices** — search and filter every report and invoice.
7. **Settings** — reset the original demo data and see iPhone “Add to Home Screen” steps.

Two completed sample jobs are seeded, so the dashboard and history are populated on first load.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- jsPDF for browser-generated PDFs
- No backend, database, auth or external services
- localStorage for demo persistence
- Web app manifest + Apple touch icon for iPhone home-screen install

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production check:

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this folder to a GitHub, GitLab or Bitbucket repository.
2. Sign in at [vercel.com](https://vercel.com) and choose **Add New → Project**.
3. Import the repository. Vercel auto-detects **Next.js**; leave the build settings as-is.
4. No environment variables are needed.
5. Click **Deploy**. Every future push to the default branch redeploys automatically.

Or deploy from the terminal:

```bash
npm i -g vercel
vercel
```

Accept the detected Next.js defaults, then run `vercel --prod` for the production URL.

## Notes

- Data is stored per browser under the localStorage key `demo-auto-workshop:v1`. Reset it in **Settings → Reset demo data**.
- The “Send by email” action only shows a success toast; it does not send anything.
- PDFs are generated entirely in the browser.
- Photos are compressed before being stored to keep the demo within typical browser storage limits.

---

Demo by WebMint.
