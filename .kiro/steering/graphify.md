---
inclusion: always
---

# Graphify Knowledge Graph

A knowledge graph of this project lives in `graphify-out/`. It contains pre-computed entity relationships, dependency maps, and architectural context derived from the codebase.

## When to Use

For any question about codebase architecture, component relationships, file dependencies, or data flow, prefer graphify commands over raw grep or file reading. The commands return a focused subgraph that is smaller and more relevant than `GRAPH_REPORT.md` or broad file searches.

## Commands

- `graphify query "<question>"` — answer a natural-language question about the codebase (e.g., "which stores does QuickEntry.tsx depend on?")
- `graphify path "<A>" "<B>"` — find the dependency/relationship path between two entities (files, components, stores)
- `graphify explain "<concept>"` — get a scoped explanation of a concept, module, or pattern in the project

## Fallback

Read `graphify-out/GRAPH_REPORT.md` only when:
- You need a broad architecture overview of the entire project
- The above commands do not surface enough context for the task
