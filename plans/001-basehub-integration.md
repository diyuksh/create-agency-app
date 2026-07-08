# Plan 001: Implement BaseHub CMS Integration

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat HEAD -- template/src/lib/integrations/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: <today>

## Why this matters

Basehub was added as a dependency in `template/package.json` and is documented in `template/docs/ai-context.md` as mutually exclusive with Sanity. However, the template currently lacks the structured client and query wrappers for Basehub (similar to what exists in `template/src/lib/integrations/sanity/`). Building this ensures users selecting Basehub during CLI initialization have a functional boilerplate.

## Current state

- `template/package.json` contains `"basehub": "latest"`.
- `template/src/lib/integrations/sanity/client.ts` exists as a reference pattern for CMS integration.
- There is no `template/src/lib/integrations/basehub/` folder.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `bun run typecheck`      | exit 0, no errors   |
| Build     | `bun run build`          | exit 0              |

## Scope

**In scope**:
- `template/src/lib/integrations/basehub/client.ts` (create)
- `template/src/lib/integrations/basehub/index.ts` (create)
- `template/src/lib/integrations/basehub/queries.ts` (create)

**Out of scope**:
- Modifications to `main.go` or CLI selection logic.
- Modifications to the Sanity integration.

## Git workflow

- Branch: `advisor/001-basehub-integration`
- Commit per step or per logical unit.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create Basehub Client Wrapper
Create `template/src/lib/integrations/basehub/client.ts`. Implement a `basehubFetch` wrapper function similar to `sanityFetch`, ensuring it utilizes Next.js fetch caching (`force-cache` or `next: { tags }`).

**Verify**: `bun run typecheck` → exit 0

### Step 2: Create Dummy Queries
Create `template/src/lib/integrations/basehub/queries.ts`. Add a dummy exported GraphQL query string, e.g., `export const HOMEPAGE_QUERY = \`query { homepage { title } }\`;`.

**Verify**: `bun run typecheck` → exit 0

### Step 3: Export Module
Create `template/src/lib/integrations/basehub/index.ts` and export the client and queries.

**Verify**: `bun run build` → exit 0

## Test plan

- Create a dummy test file `template/src/lib/integrations/basehub/client.test.ts` (if a testing framework is configured) to ensure the `basehubFetch` function is correctly typed and handles dummy data.

## Done criteria

- [ ] `bun run typecheck` exits 0.
- [ ] `template/src/lib/integrations/basehub/client.ts` exists and exposes a fetch wrapper.
- [ ] No files outside the in-scope list are modified (`git status`).
- [ ] `plans/README.md` status row updated.

## STOP conditions

- If `basehub` is removed from `package.json`.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- Reviewers should ensure the Basehub client respects Next.js 15 caching conventions.