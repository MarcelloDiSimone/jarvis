<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md` when that file exists.
- Check nx_docs or `--help` before using unfamiliar CLI flags

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), invoke the `nx-generate` skill before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- Prefer existing knowledge and generator discovery for basic generator syntax (`nx g @nx/react:app`) and standard commands
- Rely on the `nx-generate` skill for generator syntax because it handles generator discovery internally

<!-- nx configuration end-->

## Shared Project Instructions

- Use the shared repository instructions in [`.agents/instructions/project.md`](.agents/instructions/project.md).
