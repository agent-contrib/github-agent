import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RepositoryContextManager } from '../src/repository-context';
import { exec } from 'child_process';
import { promisify } from 'util';

// Mock child_process
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

const mockExec = vi.mocked(promisify(exec));

describe('RepositoryContextManager', () => {
  let manager: RepositoryContextManager;

  beforeEach(() => {
    manager = new RepositoryContextManager();
    vi.clearAllMocks();
  });

  describe('getContext', () => {
    it('should return valid context for GitHub repository', async () => {
      // Mock git remote -v output
      mockExec.mockResolvedValueOnce({
        stdout: 'origin\tgit@github.com:owner/repo.git (fetch)\norigin\tgit@github.com:owner/repo.git (push)\n',
        stderr: '',
      });

      const context = await manager.getContext();

      expect(context.isValidGitRepo).toBe(true);
      expect(context.githubRepo).toEqual({
        owner: 'owner',
        name: 'repo',
        url: 'git@github.com:owner/repo.git',
      });
      expect(context.gitRemotes).toHaveLength(2);
    });

    it('should handle HTTPS GitHub URLs', async () => {
      mockExec.mockResolvedValueOnce({
        stdout: 'origin\thttps://github.com/owner/repo.git (fetch)\n',
        stderr: '',
      });

      const context = await manager.getContext();

      expect(context.githubRepo).toEqual({
        owner: 'owner',
        name: 'repo',
        url: 'https://github.com/owner/repo.git',
      });
    });

    it('should handle non-Git directories gracefully', async () => {
      mockExec.mockRejectedValueOnce(new Error('not a git repository'));

      const context = await manager.getContext();

      expect(context.isValidGitRepo).toBe(false);
      expect(context.githubRepo).toBeUndefined();
      expect(context.validationError).toBe('not a git repository');
    });

    it('should handle non-GitHub repositories', async () => {
      mockExec.mockResolvedValueOnce({
        stdout: 'origin\tgit@gitlab.com:owner/repo.git (fetch)\n',
        stderr: '',
      });

      const context = await manager.getContext();

      expect(context.isValidGitRepo).toBe(true);
      expect(context.githubRepo).toBeUndefined();
      expect(context.gitRemotes).toHaveLength(1);
    });
  });

  describe('buildContextSection', () => {
    it('should build valid repository context XML', () => {
      const context = {
        workingDirectory: '/path/to/repo',
        isValidGitRepo: true,
        gitRemotes: [
          { name: 'origin', url: 'git@github.com:owner/repo.git', type: 'fetch' as const },
        ],
        githubRepo: {
          owner: 'owner',
          name: 'repo',
          url: 'git@github.com:owner/repo.git',
        },
        lastUpdated: new Date(),
      };

      const xml = manager.buildContextSection(context);

      expect(xml).toContain('<status>valid</status>');
      expect(xml).toContain('<owner>owner</owner>');
      expect(xml).toContain('<name>repo</name>');
      expect(xml).toContain('Repository context is automatically available');
    });

    it('should build invalid repository context XML', () => {
      const context = {
        workingDirectory: '/path/to/non-repo',
        isValidGitRepo: false,
        gitRemotes: [],
        validationError: 'Not a Git repository',
        lastUpdated: new Date(),
      };

      const xml = manager.buildContextSection(context);

      expect(xml).toContain('<status>invalid</status>');
      expect(xml).toContain('<error>Not a Git repository</error>');
      expect(xml).toContain('Repository operations are not available');
    });
  });

  describe('caching', () => {
    it('should cache context and avoid redundant calls', async () => {
      mockExec.mockResolvedValue({
        stdout: 'origin\tgit@github.com:owner/repo.git (fetch)\n',
        stderr: '',
      });

      // First call
      await manager.getContext();
      expect(mockExec).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await manager.getContext();
      expect(mockExec).toHaveBeenCalledTimes(1);
    });

    it('should refresh context when explicitly requested', async () => {
      mockExec.mockResolvedValue({
        stdout: 'origin\tgit@github.com:owner/repo.git (fetch)\n',
        stderr: '',
      });

      // First call
      await manager.getContext();
      expect(mockExec).toHaveBeenCalledTimes(1);

      // Refresh should force new call
      await manager.refreshContext();
      expect(mockExec).toHaveBeenCalledTimes(2);
    });
  });
});
