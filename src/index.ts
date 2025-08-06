import { MCPAgent, MCPAgentOptions } from '@mcp-agent/core';

export interface GithubAgentOptions extends MCPAgentOptions {
  /** The workspace directory for filesystem operations */
  workspace?: string;
}

export class GithubAgent<
  T extends GithubAgentOptions = GithubAgentOptions,
> extends MCPAgent<T> {
  static readonly label = '@tarko/github-agent';

  constructor(options: T) {
    const workspace = options.workspace || process.cwd();
    
    super({
      ...options,
      maxIterations: 100,
      maxTokens: 8192,
      toolCallEngine: 'prompt_engineering',
      instructions: `You are Github Agent, a helpful assistant that can use the tools available to help users with their questions.

Current time: ${new Date().toLocaleString()}`,
      mcpServers: {
        commands: {
          command: 'npx',
          args: [
            '-y',
            '@agent-infra/mcp-server-commands@latest',
            '--cwd',
            workspace,
          ],
        },
        filesystem: {
          command: 'npx',
          args: [
            '-y',
            '@agent-infra/mcp-server-filesystem@latest',
            workspace,
          ],
        },
        github: {
          command: 'docker',
          args: [
            'run',
            '-i',
            '--rm',
            '-e',
            'GITHUB_PERSONAL_ACCESS_TOKEN',
            'ghcr.io/github/github-mcp-server',
          ],
          env: {
            GITHUB_PERSONAL_ACCESS_TOKEN: process.env
              .GITHUB_PERSONAL_ACCESS_TOKEN as string,
          },
        },
      },
    });
  }
}

export default GithubAgent;
