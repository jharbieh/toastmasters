# Security Policy

## Supported Versions
This project is a static web application + simple scripts. Latest `main` is supported. No formal version matrix.

## Reporting a Vulnerability
Please open an issue with the `security` label describing:
- Affected area (webapp, service worker, data file, script)
- Steps to reproduce (if applicable)
- Potential impact (e.g., XSS, sensitive data exposure, broken access control)

Do **not** include exploit code that could harm users directly. Provide a minimal proof of concept.

## Best Practices Followed
- No external third-party analytics scripts (privacy focus)
- Content Security (implicit) by avoiding inline event handlers; minimal inline script (SW registration only)
- Escape dynamic strings going into HTML (e.g., `escapeHtml` helper in clubs table)
- Service worker scoped to `webapp/` directory; cache versioning to manage invalidation

## Non-Scope Items
- Extension-related console warnings not originating from code
- Issues caused by user-modified localStorage state

## Future Hardening Ideas
- Add explicit Content-Security-Policy meta (when hosting environment allows headers)
- Input validation / sanitization library if user-generated content added
- Integrity attributes for core scripts if CDN usage introduced
