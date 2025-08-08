import { MCPAgent, MCPAgentOptions, PrepareRequestContext, PrepareRequestResult } from '@mcp-agent/core';
import { getLanguageConfig, SupportedLanguage } from './language-config';
import { generateSystemPrompt } from './system-prompt-template';
import { RepositoryContextManager, RepositoryContext } from './repository-context';

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
  private repositoryContextManager: RepositoryContextManager;
  private languageConfig: ReturnType<typeof getLanguageConfig>;

  constructor(options: T) {
    const language = options.language || 'en';
    const languageConfig = getLanguageConfig(language);
    const systemPrompt = generateSystemPrompt(languageConfig);
    
    // Initialize repository context manager
    const repositoryContextManager = new RepositoryContextManager();
    
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
    
    // Store references for hooks
    this.repositoryContextManager = repositoryContextManager;
    this.languageConfig = languageConfig;
  }

  /**
   * Hook called before preparing each LLM request
   * Automatically injects repository context into system prompt
   */
  async onPrepareRequest(context: PrepareRequestContext): Promise<PrepareRequestResult> {
    try {
      // Gather repository context
      const repositoryContext = await this.repositoryContextManager.getContext();
      
      // Build repository context section
      const repositoryContextSection = this.repositoryContextManager.buildContextSection(repositoryContext);
      
      // Generate enhanced system prompt with repository context
      const enhancedPrompt = generateSystemPrompt(this.languageConfig, repositoryContextSection);
      
      return {
        systemPrompt: enhancedPrompt,
        tools: context.tools,
      };
    } catch (error) {
      // Fallback to base prompt if context injection fails
      console.warn('Failed to inject repository context:', error);
      return {
        systemPrompt: generateSystemPrompt(this.languageConfig),
        tools: context.tools,
      };
    }
  }



  /**
   * Get current repository context (for debugging/testing)
   */
  async getRepositoryContext(): Promise<RepositoryContext> {
    return this.repositoryContextManager.getContext();
  }
}

export default GithubAgent;
