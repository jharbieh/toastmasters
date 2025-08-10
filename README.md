# Toastmasters Tools & Companion Web App

This repository combines lightweight utilities (banner generation, CSV data) and a modern, installable, offline‑capable web application that supports running or preparing Toastmasters meetings.

![Lighthouse](badges/lighthouse.json)

## Table of Contents
- [Repository Structure](#repository-structure)
- [Companion Web App](#companion-web-app)
	- [Feature Summary](#feature-summary)
	- [Why Toastmasters Content](#why-toastmasters-content)
	- [Clubs Data Explorer](#clubs-data-explorer)
	- [Resources Directory](#resources-directory)
	- [Privacy & Local Analytics](#privacy--local-analytics)
	- [Error Monitoring](#error-monitoring)
	- [Offline & PWA Details](#offline--pwa-details)
	- [Keyboard & Accessibility](#keyboard--accessibility)
	- [Running Locally](#running-locally)
	- [Development Notes](#development-notes)
- [Data Files](#data-files)
- [Extending](#extending)
- [Contributing](#contributing)

## Repository Structure

```
webapp/              # SPA (index.html, app.js, app.css, manifest, service worker, icons)
data/                # CSV data (resources.csv, d106_fy26.csv, etc.)
public/              # Stand‑alone informational page (why-toastmasters.html)
banner.py            # Banner generation / image related script (legacy utility)
banner_csv.py        # CSV helper for banners
csv_reader.py        # CSV tooling
wod.py               # Word of the Day helper (legacy script version)
README.md            # This file
...other assets (pptx, quotes.csv, etc.)
```

> Note: Some earlier Python tooling may not require extra packages; no build step is needed for the web app.

## Companion Web App
A single‑page, vanilla JS progressive web app: `webapp/index.html`.

### Feature Summary
Current implemented features (all mobile friendly, dark/light aware):
- Dashboard quick actions
- Meeting Roles reference (expandable details)
- Table Topics generator (randomized, reveal one at a time)
- Word of the Day picker + optional speech synthesis
- Theme suggester
- Speech Timer with presets (Ice Breaker, Standard, Evaluation, Table Topic) + custom times
- Persisted state (topics progress, word, theme, timer values, theme preference, resources collapsed state)
- Collapsible Resources list (full set auto‑imported from `data/resources.csv`)
- Auto‑open target section when user first uses a generator action
- Floating mobile back button + per‑section back buttons
- Local toast notifications for feedback & offline/online changes
- Privacy‑respecting local analytics (opt‑in) tracking only screen/event counts & (now) error counts
- Global error & unhandled promise rejection monitoring (counts only when analytics is enabled)
- Clubs Data Explorer (filter/search dataset from `data/d106_fy26.csv`)
- Integrated “Why Toastmasters” benefits section (adapted from standalone HTML page)
- Deep linking via hash (#topics, #timer, #clubs, #why, etc.)
- Reduced motion support

### Why Toastmasters Content
The original rich informational page (`public/why-toastmasters.html`) has been summarized into an in‑app section ("Why Toastmasters") providing benefit cards + CTA link to official club finder.

### Clubs Data Explorer
Purpose: Explore District 106 club dataset provided by `data/d106_fy26.csv`.

Capabilities:
- Lazy CSV load on first visit (network only once; may be cached by the SW if added to core assets later)
- Client‑side parsing (handles quoted commas)
- Multi‑criteria filtering: free text (matches name, city, area, day, frequency), meeting day, meeting frequency, min members, minimum goals
- Debounced input (200 ms) for responsiveness
- Sorts by Area then Club name
- Displays match count and caps display to 500 rows (adjust easily if needed)

### Resources Directory
All entries from `data/resources.csv` are surfaced in the Resources section (collapsible). The list is lazy‑rendered on first open.

### Privacy & Local Analytics
- Fully opt‑in toggle (default disabled)
- Data stored only in `localStorage` under `tm-analytics`
- Captures screen view counts, feature events (e.g., generate-topics), and error keys
- Export & reset buttons (exports JSON blob, resets while preserving opt‑in flag)

### Error Monitoring
Global `error` & `unhandledrejection` listeners record aggregated counts (message fingerprint) when analytics is enabled—useful for catching regressions without external tracking.

### Offline & PWA Details
- `manifest.webmanifest` with multi‑size PNG + maskable SVG icons and shortcuts
- `sw.js` (v2) caches core shell assets; strategy:
	- Navigation: network‑first, fallback to cache then offline page
	- Static assets (css/js/svg/png/webmanifest): stale‑while‑revalidate
	- Others: cache‑first with network fill
- `offline.html` provides graceful messaging when offline navigation misses
- `window.__tmAppReady` flag can help differentiate real offline fallback vs loading delay

### Keyboard & Accessibility
- Focus visible outlines respecting reduced motion
- ARIA live regions for dynamic lists (topics, analytics data)
- Hash navigation updates location for deep linkable sections
- Button accessible names & `aria-expanded` states (collapsible resources)
- Table headers sticky for data explorer; search form labelled role=search

### Running Locally
The app is static—just serve the `webapp/` directory (recommended) or open `webapp/index.html` directly (service worker requires http/https for full PWA behavior).

Using Python (already in prior attempts):
```powershell
# From repository root
python -m http.server 5173
# Visit http://localhost:5173/webapp/
```

Alternative quick servers:
```powershell
npx serve webapp
# or
pwsh -NoProfile -Command "php -S localhost:5173 -t webapp"
```

No build or dependency install is required for the web app (vanilla ES modules). Just ensure files are served from a consistent origin so the service worker can register.

### Development Notes
- Avoid adding heavy frameworks to keep Lighthouse scores high
- Lazy rendering (roles/resources) & lazy data loading (clubs) minimize initial payload
- Add new sections by appending a `<section data-screen="newname">` and linking with a `[data-view="newname"]` button in the sidebar
- Analytics storage key: `tm-analytics`; state key: `tm-state`

## Data Files
- `data/resources.csv` – curated list of links rendered in Resources section
- `data/d106_fy26.csv` – District 106 club dataset powering the Clubs Data Explorer
- `quotes.csv`, `wod.csv`, etc. – additional datasets (not all currently surfaced in UI)

## Extending
Ideas / low‑risk enhancements:
- Add column sorting (by members, goals) in the Clubs Data Explorer (delegate click on `<th>`)
- Provide CSV / JSON export of current filtered club subset
- Integrate a Table Topics pack selector (themes / difficulty)
- Add a roles agenda PDF export using client‑side print CSS
- Add optional caching of the clubs CSV in `CORE_ASSETS` if offline browsing is important
- Toggle to expand/collapse all benefit cards (Why section)

## Contributing
1. Keep the web app zero‑build (plain ES modules) unless absolutely necessary.
2. Optimize for accessibility, performance, and privacy.
3. When adding data fetches, wrap in try/catch + offline handling.
4. Document new features here and update PWA cache version if core asset set changes.

---

## Resources
Here are useful links for Toastmasters, as listed in `data/resources.csv`:

| Resource | Link |
|---|---|
| Table Topics Jeopardy | [https://jeopardylabs.com/play/table-topics-jeopardy-5](https://jeopardylabs.com/play/table-topics-jeopardy-5) |
| Let the World Know Handbook | [https://www.toastmasters.org/~/media/4961f7be4b244a12a39426d0c9193cd1.ashx](https://www.toastmasters.org/~/media/4961f7be4b244a12a39426d0c9193cd1.ashx) |
| Brand Manual | [https://toastmasterscdn.azureedge.net/medias/files/brand-materials/brand-items/brand-manual.pdf](https://toastmasterscdn.azureedge.net/medias/files/brand-materials/brand-items/brand-manual.pdf) |
| Public Relations Resources | [https://www.toastmasters.org/Leadership-Central/Club-Officer-Tools/Club-Officer-Roles/Public-Relations](https://www.toastmasters.org/Leadership-Central/Club-Officer-Tools/Club-Officer-Roles/Public-Relations) |
| Brand Portal | [https://www.toastmasters.org/resources/brand-portal](https://www.toastmasters.org/resources/brand-portal) |
| Logo, Images, and Templates | [https://www.toastmasters.org/resources/brand-portal/design-elements](https://www.toastmasters.org/resources/brand-portal/design-elements) |
| Sample News Releases | [https://www.toastmasters.org/leadership-central/club-officer-tools/club-officer-roles/public-relations/sample-news-releases](https://www.toastmasters.org/leadership-central/club-officer-tools/club-officer-roles/public-relations/sample-news-releases) |
| Video Release Form | [https://toastmasterscdn.azureedge.net/medias/files/misc/sample-news-releases/video-release-pr.pdf](https://toastmasterscdn.azureedge.net/medias/files/misc/sample-news-releases/video-release-pr.pdf) |
| Photo Release Form | [https://toastmasterscdn.azureedge.net/medias/files/misc/sample-news-releases/photo-release-pr.pdf](https://toastmasterscdn.azureedge.net/medias/files/misc/sample-news-releases/photo-release-pr.pdf) |
| Toastmasters Media Center | [https://mediacenter.toastmasters.org/](https://mediacenter.toastmasters.org/) |
| Toastmasters Media Kit | [https://mediacenter.toastmasters.org/media-kit](https://mediacenter.toastmasters.org/media-kit) |
| D106 TM PR Kits | [https://d106tm.org/public-relations/pr-kits-press-releases/](https://d106tm.org/public-relations/pr-kits-press-releases/) |
| Video Library | [https://www.toastmasters.org/resources/video-library](https://www.toastmasters.org/resources/video-library) |
| Background Images | [https://www.toastmasters.org/resources/resource-library?t=background](https://www.toastmasters.org/resources/resource-library?t=background) |
| Open House | [https://www.toastmasters.org/resources/resource-library?t=open%20house](https://www.toastmasters.org/resources/resource-library?t=open%20house) |
| Social Media Management Tools | [https://www.wordstream.com/blog/ws/2018/01/17/best-free-social-media-management-tools](https://www.wordstream.com/blog/ws/2018/01/17/best-free-social-media-management-tools) |
| PowerPoint Templates | [https://www.toastmasters.org/resources/resource-library?rt=87f582b2-f714-4fa7-ac5b-9f36d8cf2a40&t=powerpoint](https://www.toastmasters.org/resources/resource-library?rt=87f582b2-f714-4fa7-ac5b-9f36d8cf2a40&t=powerpoint) |
| Press Release Kit | [https://blog.hubspot.com/marketing/press-release-template-ht](https://blog.hubspot.com/marketing/press-release-template-ht) |
| Trademark Use Request | [https://www.toastmasters.org/resources/brand-portal/trademark-use-request](https://www.toastmasters.org/resources/brand-portal/trademark-use-request) |
| District Leadership Handbook | [https://www.toastmasters.org/Resources/District-Leadership-Handbook](https://www.toastmasters.org/Resources/District-Leadership-Handbook) |
| Facebook Ad Campaign | [https://toastmasterscdn.azureedge.net/medias/files/digital-ad-campaigns/2021-march-ads/477f-facebook-ad-guide/477f-facebook-ad-guide.pdf](https://toastmasterscdn.azureedge.net/medias/files/digital-ad-campaigns/2021-march-ads/477f-facebook-ad-guide/477f-facebook-ad-guide.pdf) |
| Find Media Outlets | [https://mondotimes.com/](https://mondotimes.com/) |
| Shorten your URLs | [https://bitly.com/](https://bitly.com/) |
| Find what's happening  in social media | [https://www.socialmediatoday.com/](https://www.socialmediatoday.com/) |
| Find what's best hashtag to use | [https://best-hashtags.com/](https://best-hashtags.com/) |
| Stock Photography | [https://toastmasters.photoshelter.com/galleries](https://toastmasters.photoshelter.com/galleries) |
| Lumen 5 | [https://lumen5.com/](https://lumen5.com/) |
| Buffer | [https://buffer.com/](https://buffer.com/) |
| Kahoots | [https://kahoot.it/](https://kahoot.it/) |
| Procreate | [https://procreate.art/](https://procreate.art/) |
| Giphy | [https://giphy.com/](https://giphy.com/) |
| Recognition | [https://www.toastmasters.org/shop/recognition](https://www.toastmasters.org/shop/recognition) |
| Canva | [https://www.canva.com/](https://www.canva.com/) |
| Social Pilot | [https://www.socialpilot.co/](https://www.socialpilot.co/) |
| Pic Monkey | [https://www.picmonkey.com/](https://www.picmonkey.com/) |
| Agora Pulse | [https://www.agorapulse.com/](https://www.agorapulse.com/) |
| FreeToastHost | [https://www.toastmasters.org/resources/brand-portal/club-and-district-websites](https://www.toastmasters.org/resources/brand-portal/club-and-district-websites) |
| Request a FTH website | [https://www.toastmastersclubs.org/welcome/?Yor2](https://www.toastmastersclubs.org/welcome/?Yor2) |
| Mobile App | [https://www.toastmasters.org/Membership/Club-Meeting-Roles/Mobile-App](https://www.toastmasters.org/Membership/Club-Meeting-Roles/Mobile-App) |
| Whova | [https://whova.com/virtual-conference-platform/](https://whova.com/virtual-conference-platform/) |
| Cision PR Newswire | [https://www.prnewswire.com/](https://www.prnewswire.com/) |
| Prowly | [https://prowly.com/](https://prowly.com/) |
| PicMonkey | [https://www.picmonkey.com/](https://www.picmonkey.com/) |
| Animoto | [https://animoto.com/](https://animoto.com/) |
| Descript | [https://www.descript.com/tools](https://www.descript.com/tools) |
| Riverside FM | [https://riverside.fm/](https://riverside.fm/) |
| StreamYard | [https://streamyard.com/](https://streamyard.com/) |
| Davinci Resolve | [https://www.blackmagicdesign.com/products/davinciresolve](https://www.blackmagicdesign.com/products/davinciresolve) |
| Marshalls TM Tools | [http://marshalls.org/tmtools/](http://marshalls.org/tmtools/) |

