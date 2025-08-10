# Contributing Guide

Thank you for your interest in improving this Toastmasters Tools & Companion Web App project.

## Table of Contents
- [Project Philosophy](#project-philosophy)
- [Code of Conduct](#code-of-conduct)
- [Issues & Feature Requests](#issues--feature-requests)
- [Branch & Commit Conventions](#branch--commit-conventions)
- [Development Setup](#development-setup)
- [Adding or Modifying Features](#adding-or-modifying-features)
- [Testing & Quality](#testing--quality)
- [Performance & Accessibility](#performance--accessibility)
- [Security & Privacy](#security--privacy)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [License](#license)

## Project Philosophy
- **Zero build complexity**: The web app uses plain HTML/CSS/ES modules. Avoid adding bundlers unless strictly necessary.
- **Fast first paint**: Lazy load or render heavy sections only when needed (e.g., roles, resources, clubs CSV).
- **Accessibility first**: ARIA where helpful, semantic HTML, keyboard operability, reduced motion support.
- **Privacy by default**: Analytics are opt-in, local only, no external tracking.
- **Progressive enhancement**: Core content remains accessible even if JS fails early.

## Code of Conduct
Be respectful, inclusive, and constructive. Assume good intentions. Report harassment or inappropriate behavior by opening a confidential issue if a private contact channel isn't established.

## Issues & Feature Requests
1. Search existing issues first.
2. Provide clear problem statements, reproduction steps, expected vs actual behavior.
3. Label appropriately (feature, bug, accessibility, performance, docs, data).

## Branch & Commit Conventions
- Create feature branches: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- Commit messages: start with a concise imperative verb (e.g., `feat: add clubs data explorer sorting`).
- Keep commits focused; avoid unrelated formatting changes.

## Development Setup
No build step required.
```bash
# Serve locally (example using Python)
python -m http.server 5173
# Visit http://localhost:5173/webapp/
```
Use any static server you prefer. Service worker requires http/https origin (file:// limits PWA features).

## Adding or Modifying Features
- Add new screen: create `<section data-screen="name">` + sidebar button with `data-view="name"`.
- Update navigation logic only if a new persistence requirement arises.
- For new data fetches: wrap in `try/catch`, provide status text, and consider offline fallback.
- Keep CSS scoped (use component classes). Avoid large utility frameworks.

## Testing & Quality
- Manual test on at least one Chromium and one Gecko-based browser when possible.
- Run Lighthouse (Chrome DevTools) to verify performance/accessibility regressions.
- Ensure no console errors (unless clearly from external extensions) on key flows: generate topics, generate word, timer start/stop, clubs data filtering.

## Performance & Accessibility
- Minimize DOM size on initial load; prefer lazy rendering for non-critical sections.
- Provide `aria-live` for dynamic content where user feedback matters (e.g., analytics data, topics list changes).
- Maintain contrast and focus states. Never remove outline without replacement.

## Security & Privacy
- Do not add third-party analytics scripts.
- Avoid embedding user-submitted HTML without sanitization (escape dynamic strings via helper like `escapeHtml`).
- Keep service worker scope limited and version bump cache when altering core asset list.

## Submitting a Pull Request
1. Fork & branch.
2. Implement changes with minimal, focused diffs.
3. Update README / docs if feature or behavior changes.
4. Describe: what & why, testing steps, any limitations.
5. Link related issue(s). Request review.

## License
By contributing you agree your contributions are licensed under the MIT License (see `LICENSE`).
