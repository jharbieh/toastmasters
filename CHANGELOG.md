# Changelog
All notable changes to this project will be documented here (reverse chronological).

## Unreleased
- (placeholder for next changes)

## 2025-08-10
### Added
- Why Toastmasters in-app section summarizing benefits.
- Clubs Data Explorer with filtering (day, frequency, members, goals, search) from `d106_fy26.csv`.
- Floating mobile back button and per-section back buttons.
- Collapsible Resources section with persistence.
- Global error & unhandled rejection logging (analytics opt-in).
- README overhaul (structure, run instructions, feature list).
- LICENSE (MIT), CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CHANGELOG docs.

### Changed
- Resources list expanded from full CSV.
- Lazy rendering for roles and resources; lazy loading for clubs data.
- Auto-navigation to feature sections after first generation action.

### Fixed
- Toast timeout variable temporal dead zone (moved declaration earlier) preventing some button actions.

## 2025-08-09
### Added
- Service worker v2 with stale-while-revalidate & offline fallback page.
- Manifest enhancements (maskable icon, shortcuts, multi-size icons).
- Local analytics (opt-in) with export/reset UI.
- Offline detection toasts.

### Changed
- Theme toggle and hash-based deep linking across sections.

### Fixed
- Initial Lighthouse performance/accessibility optimizations.

## 2025-08-08
### Added
- Initial SPA scaffold (dashboard, roles, topics, word, themes, timer, resources, about).
- Styling system, dark/light theme support, basic data arrays.
- Word of the Day speech synthesis.
- Basic toast notification system.

### Fixed
- Cleaned and modernized standalone `public/why-toastmasters.html` page (semantic structure, accessibility).
