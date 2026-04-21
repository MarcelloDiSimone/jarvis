# Shared Project Instructions

These instructions apply to all AI agents working in this repository.

## Workspace

- Work from the repository root unless a task clearly targets another directory.
- Preserve user work in the current git tree. Inspect nearby changes before editing files that already have modifications.
- Prefer existing project patterns, Angular conventions, Nx project boundaries, and local helpers over new abstractions.
- Keep changes scoped to the requested behavior and the files naturally involved.

## Verification

- Match verification effort to change risk.
- For low-risk value-only changes such as constants, thresholds, timing, easing, colors, spacing, labels, or copy, make the edit and state that checks were skipped.
- For TypeScript behavior, Angular template structure, public APIs, configuration, dependencies, or cross-project changes, run focused Nx checks for the affected project.
- Use the workspace package manager prefix for Nx commands. This workspace uses `npm exec nx ...`.
- Prefer targeted tasks such as `npm exec nx run <project>:test`, `typecheck`, or `lint` before broader workspace runs.

## Domain Driven Design

- Follow the opinionated presets and recommendations from `@angular-architects/ddd`.
- Respect the workspace tag model: `domain:*` defines business domains, `scope:*` defines runtime scope, and `type:*` defines architectural layer.
- Keep dependencies aligned with the configured DDD rules in `eslint.config.mjs`.
- Place business and application behavior in domain-logic libraries, user workflows in feature libraries, reusable presentation in UI libraries, API-facing code in API libraries, and generic helpers in util libraries.
- Preserve public APIs through each library `src/index.ts` and import through configured package aliases such as `@jarvis/speech-domain`.
- Use Nx generators and existing project structure when adding apps, libraries, or architectural slices.

## TypeScript And Linting

- Treat lint and typecheck as strict gates.
- Provide explicit, narrow types for public APIs, Angular inputs/outputs, injected services, callbacks, and boundary data.
- Use `unknown`, discriminated unions, generics, or domain-specific interfaces for uncertain data.
- Keep `any` out of application code.
- Prefer type-only imports for types.
- Let TypeScript and Angular templates enforce correctness through strong types.

## Nx Usage

- Use the Nx skills and MCP tooling for workspace exploration, task discovery, generators, and CI monitoring.
- Use `nx-workspace` before workspace exploration and `nx-generate` before scaffolding.
- Use Nx project targets for build, lint, test, typecheck, serve, and affected checks.
- Check command help or Nx docs for unfamiliar flags.
