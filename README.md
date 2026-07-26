# ⚙️ Rivet — Operations Control Room

> **Flagship "Boring Systems" Application** built first for **Janai Tours & Service Operations** (Nagpur, India) and adaptable for small service businesses.

![Rivet Dashboard](public/data/janai-ops-db.json)

Rivet replaces generic SaaS chaos and vanity marketing top KPI cards with a quiet, calm, grounded operations control room centered around **Today's Queue** (actionable operational tasks).

---

## 🌟 Key Features

- **Hero Operational Queue**: Priorities focus on Overdue Follow-ups, Today's Callbacks, and Today's Jobs.
- **Visually Secondary Summary Column**: Metric stats (New Leads, Pending Follow-ups, Active Jobs, Payment Due) stay visually lighter than active work.
- **7-Stage Pipeline Strip**: Track counts by stage (New → Contacted → Quote Sent → Confirmed → Completed → Closed → Lost).
- **Public Operational Database API**: Serves a public JSON database endpoint at `/data/janai-ops-db.json` suitable for GitHub Pages hosting.
- **State Simulation Controls**: Test Live, Loading Skeletons, Empty Queue, and Error banners via discrete dev header controls.

---

## 🚀 GitHub Pages Deployment & Public Database

This repository is pre-configured for GitHub Pages hosting:
- Built output is served from `./dist` with relative paths (`base: './'`).
- GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and publishes upon push to `main`.
- Serves public database at `https://<username>.github.io/Rivet/data/janai-ops-db.json`.

```bash
# Local Development
npm run dev

# Build Production Bundle
npm run build
```
