PROJECT PLAN: CLI Branding & Integrations Refactor
TOTAL STEPS: 5

PERFORMANCE FLAGS
None. Terminal UI rendering has negligible cost.

STEP 1 OF 5: Add Ultra Code ASCII Animation
DO: Update `main.go` `initialModel` and `View` to include an animated ASCII header (using `harmonica` or a frame array) for "SAR.GA" when starting.
PROMPT: Implement an ASCII art header in `main.go`. Use a sequence of frames or a spring animation on the text layout to simulate a glowing/loading "ultra code" effect. Do not use heavy external libraries; rely on `lipgloss` and `tea.Cmd`.
CHECK: Run `./create-agency-app` and visually verify the animated header.

STEP 2 OF 5: Refine CLI Brand Colors
DO: Update `main.go` `subtle`, `highlight`, and `accent` lipgloss variables.
PROMPT: Redefine the `lipgloss` colors to match a premium agency brand (e.g., stark white, deep black, and a vivid accent like neon green or electric blue). Keep the layout inline and streaming.
CHECK: Run `./create-agency-app` and verify color changes.

STEP 3 OF 5: Add Integration Prompts
DO: Add Sentry, Posthog, and Shopify Analytics to the `features` multi-select in `main.go`.
PROMPT: Insert the three new analytics/observability options into the `huh.NewMultiSelect` prompt. Ensure they pass their selected state down to the scaffolding engine.
CHECK: Run `go run main.go` and verify the options exist.

STEP 4 OF 5: Implement AST Codemods for Integrations
DO: Update `template/src/lib/scripts/integration-bundles.ts` and `setup-project.ts` to process the new integrations.
PROMPT: Use `ts-morph` to conditionally remove `<PostHogProvider>` and `<ShopifyAnalytics>` from `layout.tsx` if unselected. Also, conditionally remove the `withSentryConfig` wrapper in `next.config.ts`.
CHECK: Run `bun run setup:project` with mock feature lists and verify AST modifications.

STEP 5 OF 5: Cleanup Integration Files
DO: Add cleanup paths to `integration-bundles.ts` for unselected tools.
PROMPT: Map `posthog` to `src/providers/posthog-provider.tsx`, `shopify-analytics` to `src/providers/shopify-analytics.tsx`, and `sentry` to the root `sentry.*.config.ts` files. Delete them if unselected.
CHECK: Run `bun run test:setup` (or manually verify) to ensure files are deleted when unselected.