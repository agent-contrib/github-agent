import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Repository context interface for automatic injection
 */
export interface RepositoryContext {
  workingDirectory: string;
  isValidGitRepo: boolean;
  gitRemotes: GitRemote[];
  githubRepo?: {
    owner: string;
    name: string;
    url: string;
  };
  validationError?: string;
  lastUpdated: Date;
}

export interface GitRemote {
  name: string;
  url: string;
  type: 'fetch' | 'push';
}

/**
 * Repository context manager for automatic context injection
 * Features: intelligent caching, graceful error handling, performance optimization
 */
export class RepositoryContextManager {
  private context?: RepositoryContext;
  private readonly cacheTTL = 30000; // 30 seconds cache
  private isUpdating = false; // Prevent concurrent updates

  /**
   * Get current repository context with intelligent caching
   * Prevents concurrent updates and provides immediate fallback
   */
  async getContext(): Promise<RepositoryContext> {
    if (this.isContextValid()) {
      return this.context!;
    }

    // Prevent concurrent updates
    if (this.isUpdating) {
      // Return stale context if available, otherwise wait
      if (this.context) {
        return this.context;
      }
      // Wait for ongoing update with timeout
      await this.waitForUpdate(5000);
      return this.context || this.createFallbackContext();
    }

    await this.updateContext();
    return this.context!;
  }

  /**
   * Force refresh of repository context
   */
  async refreshContext(): Promise<RepositoryContext> {
    await this.updateContext();
    return this.context!;
  }

  /**
   * Check if cached context is still valid
   */
  private isContextValid(): boolean {
    if (!this.context) {
      return false;
    }

    const now = new Date();
    const timeDiff = now.getTime() - this.context.lastUpdated.getTime();
    return timeDiff < this.cacheTTL;
  }

  /**
   * Update repository context by gathering fresh information
   * Enhanced with concurrent update prevention and better error handling
   */
  private async updateContext(): Promise<void> {
    if (this.isUpdating) {
      return;
    }

    this.isUpdating = true;
    try {
      const workingDirectory = process.cwd();
      const gitRemotes = await this.getGitRemotes();
      const githubRepo = this.extractGithubRepo(gitRemotes);

      this.context = {
        workingDirectory,
        isValidGitRepo: gitRemotes.length > 0,
        gitRemotes,
        githubRepo,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.context = this.createErrorContext(error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Get git remotes using git command
   */
  private async getGitRemotes(): Promise<GitRemote[]> {
    try {
      const { stdout } = await execAsync('git remote -v', {
        timeout: 5000,
        cwd: process.cwd(),
      });

      const remotes: GitRemote[] = [];
      const lines = stdout.trim().split('\n').filter(line => line.trim());

      for (const line of lines) {
        const match = line.match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
        if (match && match[1] && match[2] && match[3]) {
          const [, name, url, type] = match;
          remotes.push({
            name,
            url,
            type: type as 'fetch' | 'push',
          });
        }
      }

      return remotes;
    } catch (error) {
      // Not a git repository or git command failed
      return [];
    }
  }

  /**
   * Extract GitHub repository information from remotes
   */
  private extractGithubRepo(remotes: GitRemote[]): RepositoryContext['githubRepo'] {
    for (const remote of remotes) {
      const githubInfo = this.parseGithubUrl(remote.url);
      if (githubInfo) {
        return {
          ...githubInfo,
          url: remote.url,
        };
      }
    }
    return undefined;
  }

  /**
   * Parse GitHub repository information from URL
   */
  private parseGithubUrl(url: string): { owner: string; name: string } | null {
    // Handle SSH format: git@github.com:owner/repo.git
    const sshMatch = url.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (sshMatch && sshMatch[1] && sshMatch[2]) {
      return {
        owner: sshMatch[1],
        name: sshMatch[2],
      };
    }

    // Handle HTTPS format: https://github.com/owner/repo.git
    const httpsMatch = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
    if (httpsMatch && httpsMatch[1] && httpsMatch[2]) {
      return {
        owner: httpsMatch[1],
        name: httpsMatch[2],
      };
    }

    return null;
  }

  /**
   * Wait for ongoing update with timeout
   */
  private async waitForUpdate(timeoutMs: number): Promise<void> {
    const startTime = Date.now();
    while (this.isUpdating && (Date.now() - startTime) < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Create fallback context when all else fails
   */
  private createFallbackContext(): RepositoryContext {
    return {
      workingDirectory: process.cwd(),
      isValidGitRepo: false,
      gitRemotes: [],
      validationError: 'Unable to determine repository context',
      lastUpdated: new Date(),
    };
  }

  /**
   * Create error context with proper error handling
   */
  private createErrorContext(error: unknown): RepositoryContext {
    return {
      workingDirectory: process.cwd(),
      isValidGitRepo: false,
      gitRemotes: [],
      validationError: error instanceof Error ? error.message : 'Unknown error',
      lastUpdated: new Date(),
    };
  }

  /**
   * Build repository context section for system prompt injection
   */
  buildContextSection(context: RepositoryContext): string {
    if (!context.isValidGitRepo) {
      return `<repository_context>
  <status>invalid</status>
  <working_directory>${context.workingDirectory}</working_directory>
  <error>${context.validationError || 'Not a Git repository'}</error>
  <instruction>Repository operations are not available. Only general GitHub operations can be performed.</instruction>
</repository_context>`;
    }

    const remotesXml = context.gitRemotes
      .map(r => `    <remote name="${r.name}" type="${r.type}">${r.url}</remote>`)
      .join('\n');

    const githubRepoXml = context.githubRepo
      ? `  <github_repository>
    <owner>${context.githubRepo.owner}</owner>
    <name>${context.githubRepo.name}</name>
    <url>${context.githubRepo.url}</url>
  </github_repository>`
      : '  <github_repository>none</github_repository>';

    return `<repository_context>
  <status>valid</status>
  <working_directory>${context.workingDirectory}</working_directory>
${githubRepoXml}
  <git_remotes>
${remotesXml}
  </git_remotes>
  <instruction>Repository context is automatically available. No manual validation required.</instruction>
</repository_context>`;
  }
}
