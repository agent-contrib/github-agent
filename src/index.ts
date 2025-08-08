import { MCPAgent, MCPAgentOptions } from '@mcp-agent/core';
import { getLanguageConfig, SupportedLanguage } from './language-config';
import { generateSystemPrompt } from './system-prompt-template';

export interface GithubAgentOptions extends MCPAgentOptions {
  /**
   * Preferred language for Agent communications
   * @default 'en' (English)
   */
  language?: SupportedLanguage | 'auto' | string;
  /**
   * Workspace directory for file operations
   */
  workspace?: string;
}

export class GithubAgent<
  T extends GithubAgentOptions = GithubAgentOptions,
> extends MCPAgent<T> {
  static readonly label = '@tarko/github-agent';

  constructor(options: T) {
    const language = options.language || 'en';
    const languageConfig = getLanguageConfig(language);
    const systemPrompt = generateSystemPrompt(languageConfig);
    
    super({
      ...options,
      maxIterations: 100,
      maxTokens: 8192,
      toolCallEngine: 'prompt_engineering',
      instructions: systemPrompt,
      mcpServers: {
        commands: {
          command: 'npx',
          args: [
            '-y',
            '@agent-infra/mcp-server-commands@latest',
            '--cwd',
            options.workspace,
          ],
        },
        filesystem: {
          command: 'npx',
          args: [
            '-y',
            '@agent-infra/mcp-server-filesystem@latest',
            '--allowed-directories',
            options.workspace,
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
