import { MCPAgent, MCPAgentOptions } from '@mcp-agent/core';
import { SYSTEM_PROMPT } from './system-prompt'

export interface GithubAgentOptions extends MCPAgentOptions {
  /**
   * Preferred language for Agent communications
   * @default 'en' (English)
   */
  language?: 'en' | 'zh' | 'ja' | 'es' | 'fr' | 'de' | 'auto' | string;
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
    const systemPrompt = this.generateSystemPrompt(language);
    
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
            // @ts-expect-error
            options.workspace,
          ],
        },
        filesystem: {
          command: 'npx',
          args: [
            '-y',
            '@agent-infra/mcp-server-filesystem@latest',
            '--allowed-directories',
            // @ts-expect-error
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

  /**
   * Generate system prompt with language-specific configuration
   */
  private generateSystemPrompt(language: string): string {
    const languageConfig = this.getLanguageConfig(language);
    
    return SYSTEM_PROMPT.replace(
      /<communication_style>([\s\S]*?)<\/communication_style>/,
      `<communication_style>
    <tone>Professional, helpful, and precise</tone>
    <language>${languageConfig.name}</language>
    <fallback_language>English</fallback_language>
    <consistency>
      <rule>Maintain the same language throughout the session</rule>
      <rule>Use appropriate technical terminology in the selected language</rule>
      <rule>Ensure professional tone regardless of language</rule>
    </consistency>
    <format>
      <guideline>Use clear, actionable language</guideline>
      <guideline>Provide context for technical decisions</guideline>
      <guideline>Include relevant code examples when helpful</guideline>
      <guideline>Structure responses logically with appropriate headers</guideline>
    </format>
  </communication_style>`
    ).replace(
      /<principle>Use English for all communications, comments, and documentation<\/principle>/,
      `<principle>Use ${languageConfig.name} for all communications, comments, and documentation</principle>`
    );
  }

  /**
   * Get language configuration
   */
  private getLanguageConfig(language: string): { code: string; name: string } {
    const languageMap: Record<string, { code: string; name: string }> = {
      'en': { code: 'en', name: 'English' },
      'zh': { code: 'zh', name: 'Chinese (中文)' },
      'ja': { code: 'ja', name: 'Japanese (日本語)' },
      'es': { code: 'es', name: 'Spanish (Español)' },
      'fr': { code: 'fr', name: 'French (Français)' },
      'de': { code: 'de', name: 'German (Deutsch)' },
      'auto': { code: 'auto', name: 'Auto-detect' }
    };

    // Handle auto-detection
    if (language === 'auto') {
      const systemLang = process.env.LANG?.split('.')[0]?.split('_')[0] || 'en';
      return languageMap[systemLang] || languageMap['en'];
    }

    // Return specified language or fallback to English
    return languageMap[language] || languageMap['en'];
  }
}

export default GithubAgent;
