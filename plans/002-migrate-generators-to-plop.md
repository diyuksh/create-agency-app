# Plan 002: Migrate Custom Component Generators to Plop/Hygen

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: <today>

## Why this matters

Currently, component and page scaffolding inside the template is handled by custom `.ts` scripts (`generate-component.ts`, `generate-page.ts`) using primitive string concatenation and brittle regular expressions to update barrel exports. This is highly error-prone, hard to maintain, and breaks if code formatting changes. Migrating these generators to an established AST/Handlebars-based tool like `plop` or `hygen` will significantly improve DX and robustness.

## Current state

- `template/src/lib/scripts/generate-component.ts` handles component generation.
- `template/src/lib/scripts/generate-page.ts` handles page generation.
- `template/package.json` contains a `"generate": "bun ./src/lib/scripts/generate.ts"` script.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `bun install`            | exit 0              |
| Typecheck | `bun run typecheck`      | exit 0, no errors   |

## Scope

**In scope**:
- `template/package.json`
- `template/plopfile.js` (or `.hygen.js`) (create)
- `template/templates/` (create)
- `template/src/lib/scripts/generate-component.ts` (delete)
- `template/src/lib/scripts/generate-page.ts` (delete)
- `template/src/lib/scripts/generate-shared.ts` (delete)
- `template/src/lib/scripts/generate.ts` (delete)

**Out of scope**:
- Modifications to `template/src/lib/scripts/setup-project.ts`.
- Changes to existing components or pages.

## Git workflow

- Branch: `advisor/002-migrate-generators`
- Commit per step or per logical unit.

## Steps

### Step 1: Install Generator Tool
Run `cd template && bun add -d plop` (or your chosen tool).

**Verify**: `bun install` → exit 0

### Step 2: Create Template Files
Create a `template/templates/component/component.tsx.hbs` and `template/templates/page/page.tsx.hbs` using standard Handlebars variables (`{{pascalCase name}}`).

**Verify**: Files exist on disk.

### Step 3: Configure Plopfile
Create `template/plopfile.js`. Define two generators (`component` and `page`). Use the `add` action for the file creation and `append` or a custom action for modifying `index.ts` barrel files safely.

**Verify**: `cd template && bunx plop --help` outputs the generator commands.

### Step 4: Delete Legacy Scripts
Delete `generate.ts`, `generate-component.ts`, `generate-page.ts`, and `generate-shared.ts` from `template/src/lib/scripts/`.

**Verify**: Files are removed.

### Step 5: Update Package Scripts
In `template/package.json`, update the `"generate"` script to `"plop"`.

**Verify**: `bun run generate` triggers the new tool.

## Test plan

- Run `bun run generate component TestButton` and verify that `src/components/TestButton.tsx` is created correctly and exported in `src/components/index.ts`.

## Done criteria

- [ ] `bun run typecheck` exits 0.
- [ ] `plop` (or equivalent) is installed as a devDependency.
- [ ] Legacy generation scripts are deleted.
- [ ] `plans/README.md` status row updated.

## STOP conditions

- If Plop is unable to safely update barrel files using Regex, STOP and consider `ts-morph` AST actions within the Plopfile.

## Maintenance notes

- Reviewers should test the generation of both a component and a page to ensure the templates match the project's styling conventions.