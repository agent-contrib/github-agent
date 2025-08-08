# GitHub Agent

> [!NOTE]
> **Status:** This project is currently under development and is built on the TARS Stack. Please visit [TARS Stack](https://github.com/bytedance/UI-TARS-desktop) for more information.

[![npm version](https://badge.fury.io/js/tarko-github-agent.svg)](https://badge.fury.io/js/tarko-github-agent)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/agent-contrib/github-agent)](https://github.com/agent-contrib/github-agent/issues)
[![GitHub stars](https://img.shields.io/github/stars/agent-contrib/github-agent)](https://github.com/agent-contrib/github-agent/stargazers)

A powerful GitHub Agent built on the MCP (Model Context Protocol) framework that enables intelligent interaction with GitHub repositories through natural language commands.

## Features

### 🤖 GitHub Automation
- Semantic branch management and automated PRs
- Issue creation with intelligent labeling
- Code reviews with CI/CD status validation
- Repository context verification

### 🔧 Development Tools
- Intelligent code search and analysis
- File operations and dependency management
- Template generation and documentation
- Workflow automation and notifications

### 🌐 Multi-Language Support
- 6 languages with auto-detection
- Localized templates and documentation
- Consistent communication across operations

## Installation

```bash
npm install tarko-github-agent
# or
pnpm add tarko-github-agent
# or
yarn add tarko-github-agent
```

## Quick Start

```typescript
import { GithubAgent } from 'tarko-github-agent';

const agent = new GithubAgent({
  model: {
    provider: "openai", // or your preferred provider
    id: "gpt-4",
    apiKey: process.env.OPENAI_API_KEY,
  },
  workspace: process.cwd(), // your working directory
  language: 'en', // optional: 'en', 'zh', 'ja', 'es', 'fr', 'de', 'auto'
});

// Use the agent
const response = await agent.run("Create a new issue in my repository about bug fixes");
console.log(response.content);
```

## Prerequisites

- **GitHub Personal Access Token**: Set `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable
- **Docker**: Required for running the GitHub MCP server
- **Node.js**: Version 16 or higher

## Configuration

### GitHub Authentication

The GitHub Agent requires a GitHub Personal Access Token to interact with GitHub APIs:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token_here
```

### Language Configuration

The GitHub Agent supports multiple languages for communication:

```typescript
const agent = new GithubAgent({
  // ... other options
  language: 'zh', // Chinese
});

// Supported languages:
// 'en' - English (default)
// 'zh' - Chinese (中文)
// 'ja' - Japanese (日本語)
// 'es' - Spanish (Español)
// 'fr' - French (Français)
// 'de' - German (Deutsch)
// 'auto' - Auto-detect from system locale
```

**Examples:**

```typescript
// English Agent (default)
const enAgent = new GithubAgent({ language: 'en' });

// Chinese Agent - will create issues and PRs in Chinese
const zhAgent = new GithubAgent({ language: 'zh' });

// Auto-detect language from system
const autoAgent = new GithubAgent({ language: 'auto' });
```

## Development

```bash
# Install dependencies
pnpm bootstrap

# Run example
pnpm example

# Build the project
pnpm build

# Run tests
pnpm test

# Watch mode for development
pnpm dev
```

## Architecture

The GitHub Agent leverages:

- **MCP Core**: Foundation for agent communication
- **GitHub MCP Server**: Docker-based GitHub API integration
- **Commands Server**: Local command execution capabilities
- **Prompt Engineering**: Advanced tool calling engine

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [agent-contrib](https://github.com/agent-contrib)

## Related Projects

- [@mcp-agent/core](https://www.npmjs.com/package/@mcp-agent/core) - Core MCP Agent framework
- [@agent-infra/mcp-server-commands](https://www.npmjs.com/package/@agent-infra/mcp-server-commands) - Command execution server
- [GitHub MCP Server](https://github.com/github/github-mcp-server) - Official GitHub MCP integration