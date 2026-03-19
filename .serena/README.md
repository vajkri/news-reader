# Serena MCP Server

[Serena](https://github.com/oraios/serena) provides semantic code navigation
and refactoring capabilities (go-to-definition, find references, rename, etc.) via the MCP protocol.

## Prerequisites

- **Python 3.11+** installed
- **uv** (Python package manager) installed. If not, install it:

  ```powershell
  powershell -ExecutionPolicy Bypass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```

## Step 1 — Index the project (one-time, ~1 hour)

From the repository root, run:

```powershell
uvx --from git+https://github.com/oraios/serena serena project index
```

This builds a code index that Serena uses for symbol lookup. It only needs to be done once,
but can be re-run after major changes if you don't use Serena regularly.

See [official indexing docs](https://oraios.github.io/serena/02-usage/040_workflow.html#indexing) for more details.

## Step 2 — Add Serena as an MCP server to your client

### VS Code / GitHub Copilot CLI

A `.vscode/mcp.json` file is already committed. VS Code picks it up automatically when you open
this workspace.

Verify the server is connected in Copilot CLI by running `/mcp`.

### Claude Code

A `.mcp.json` file is already committed to the repository root. Claude Code picks it up automatically —
no manual configuration needed.

When you run `claude` from the repository root, Serena will be connected and this project
will be activated automatically.

## Step 3 — Start the server

### Option A: HTTP (you manage the server) — Recommended

Run the Serena MCP server once in a separate terminal so it stays alive independently of your client.
All clients (Claude Code, Copilot) share the same running instance.

```powershell
pnpm run serena
```

The committed `.mcp.json` and `.vscode/mcp.json` configs already point to `http://localhost:56667/mcp`,
so clients will connect automatically once the server is running.

Restart your client after starting the server and verify with `/mcp` (Copilot CLI) or by checking
the MCP panel in your IDE.

### Option B: stdio (client manages the server) - If option A fails

No action needed — the client starts and stops Serena automatically using the committed config files.
The downside is that the Serena instance is lost when you restart your client.

This is the config, if you should need this for manual setup:

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "claude-code",
        "--project",
        "NewsReader"
      ]
    }
  }
}
```

## Dashboard

The Serena web dashboard is always available at:

```
http://localhost:24282/dashboard/index.html
```

It shows live logs, active tools, token usage statistics, and current configuration.
The `/mcp` URL itself is not browser-accessible — it is the MCP protocol endpoint for clients only.

## Notes

- **Startup time**: Every time Serena starts it takes a moment for the language servers (TypeScript, PowerShell)
  to initialize. With Option B (HTTP), the server stays running so this is a one-time cost per work session.
  With Option A (stdio), prefer using `/new` or `/clear` instead of restarting your client between tasks.
- **`--context ide`**: Optimizes Serena for IDE/coding agent use by disabling tools that duplicate the
  client's own file and shell capabilities, keeping the toolset lean.
- **Project configuration**: `.serena/project.yml` defines which language servers to use
  (TypeScript, PowerShell) and other project-specific settings.
- **First run**: May be slow as `uvx` downloads and caches Serena's dependencies.
