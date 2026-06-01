# Changelog

All notable changes to `create-agency-app` will be documented in this file.

## [v1.0.5] - 2026-06-02
### Fixed
- Fixed script path resolution errors (e.g., `Module not found "./lib/styles/scripts/setup-styles.ts"`) inside the `template/src/lib/scripts` folder caused by moving files to `src/`.
- Prevented premature Next.js process termination (`SIGTERM`) when style scripts crash.

## [v1.0.4] - 2026-06-01
### Fixed
- Fixed a compilation error regarding undefined `cmd` variable after refactoring the templating engine.

## [v1.0.2] - 2026-06-01
### Added
- **`go:embed` Support:** The entire Next.js template is now embedded directly into the Go CLI binary! This means instant, zero-network scaffolding (no `git clone` required).

## [v1.0.1] - 2026-06-01
### Fixed
- Fixed a race condition in GitHub Actions release workflow caused by using a `matrix` strategy. The workflow now sequentially builds all binaries in a single runner to avoid duplicate release creation errors.

## [v1.0.0] - 2026-06-01
### Added
- Initial stable release.
- Interactive terminal UI using Bubble Tea.
- Selectable Next.js integrations (Sanity, Shopify, Marketing, Tailwind CSS).
- Dynamic file removal and `package.json` rewriting to cleanly strip unselected features.
- Cross-compiled binaries for Windows, macOS (Intel & ARM), and Linux.
- Web deployment via install script for custom domain distribution.
