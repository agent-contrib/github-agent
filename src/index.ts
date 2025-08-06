import { MCPAgent, MCPAgentOptions } from '@mcp-agent/core';

export interface GithubAgentOptions extends MCPAgentOptions { }

export class GithubAgent<
  T extends GithubAgentOptions = GithubAgentOptions,
> extends MCPAgent<T> {
  static readonly label = '@tarko/github-agent';

  constructor(options: T) {
    super({
      ...options,
      maxIterations: 100,
      maxTokens: 8192,
      toolCallEngine: 'prompt_engineering',
      instructions: `You are Github Agent, a helpful assistant that can use the tools available to help users with their questions.`,
      mcpServers: {
        commands: {
          command: 'npx',
          args: [
            '-y',
            '@agent-infra/mcp-server-commands@latest',
            '--cwd',
            // @ts-expect-error
            options.workspace,
          ],
        },
        filesystem: {
          command: 'npx',
          args: [
            '-y',
            '@agent-infra/mcp-server-filesystem@latest',
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
