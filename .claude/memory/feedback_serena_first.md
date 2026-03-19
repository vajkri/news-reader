---
name: feedback_serena_first
description: Always use Serena MCP tools before Read/Grep/Glob for code navigation in this project
type: feedback
---

Use Serena tools first for all code navigation: `find_symbol`, `get_symbols_overview`, `search_for_pattern`, `find_file`, `find_referencing_symbols`.

**Why:** CLAUDE.md and Serena's own instructions both require this. User corrected after a code review session where full files were read via Read tool instead of using Serena's symbolic tools. Reading entire files wastes tokens when only specific symbols are needed.

**How to apply:** Before reaching for Read, Grep, or Glob on source code, ask: "Can Serena's tools answer this more efficiently?" Use `get_symbols_overview` to scan a file's structure, `find_symbol` with `include_body=True` for specific functions, and `find_referencing_symbols` to trace dependencies. Only fall back to Read for non-code files (configs, planning docs, markdown) or when you need the full file after Serena has confirmed what to look at.
