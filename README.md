<h1 align="center">Agent Starter</h1>

<p align="center">
    ⚡ A hassle-free basic Agent template 💨
</p>

## Motivation

This scaffolding template shows an example of the simplest implementation of Search Agent, which mainly relies on "search tools" to complete tasks.

## Quick Start

1. Click "Use this template" at this repository.
3. Commands:

```bash
pnpm bootstrap   # install dependencies
pnpm example     # run agent example
pnpm release     # release this package to npm
```

## Directory Structure

```bash
.
├── examples                 # example scripts to test agent
│   └── index.ts
├── src
│   ├── index.ts             # agent implementation
│   └── tools                # agent tools
│       └── web-search.ts
├── tsconfig.json
└── package.json
```

## Roadmap

- [ ] Documentation
- [ ] Integrate CLI
- [ ] Integrate Web UI
