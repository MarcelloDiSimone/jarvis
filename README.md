# Jarvis Nx Workspace

This workspace has been reset from the generated Angular demo into a minimal starting point.

Projects:

- `jarvis-client` - Angular client shell
- `jarvis-client-e2e` - Playwright smoke test for the client
- `api` - Minimal Express API with a health endpoint

Reserved folders:

- `libs/api` - Empty placeholder for future API libraries
- `libs/shared` - Empty placeholder for future shared libraries

Common commands:

```bash
npm exec nx show projects
npm exec nx serve jarvis-client
npm exec nx serve api
npm exec nx e2e jarvis-client-e2e
npm exec nx run-many -t build
```
