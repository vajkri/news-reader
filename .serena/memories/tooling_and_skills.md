# Tooling & Skills

## Available Skills (Vercel Plugin)

Skills are injected via the Vercel plugin bootstrap and provide domain expertise:

- **investigation-mode**: Orchestrated debugging for stuck/broken/hung states. Follow the triage order: runtime logs, workflow status, browser verification, deploy status. Always report evidence at every step.
- **cron-jobs**: Vercel Cron configuration in `vercel.json`. Cron handlers must verify `CRON_SECRET` via Authorization header. Hobby plan: max 2 jobs, min daily interval.

## Serena MCP

Serena provides semantic code intelligence (symbol search, reference finding, symbolic editing). Already configured:

- Config: `.serena/project.yml` (project_name: NewsReader, languages: typescript + bash)
- Start: `pnpm serena` (starts MCP server on port 56667)
- MCP endpoint: `http://localhost:56667/mcp` (configure in your MCP client to point here)
- Memories: `.serena/memories/` (onboarding completed, project structure indexed)
