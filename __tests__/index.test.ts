import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GithubAgent } from '../src';
import { RepositoryContextManager } from '../src/repository-context';
import { generateSystemPrompt } from '../src/system-prompt-template';
import { getLanguageConfig } from '../src/language-config';

describe('GithubAgent', () => {
  let agent: GithubAgent;
  
  beforeEach(() => {
    agent = new GithubAgent({ workspace: process.cwd() });
  });

  it('should initialize with default configuration', () => {
    expect(agent.status()).toBe('idle');
    expect(agent).toBeInstanceOf(GithubAgent);
  });

  it('should support custom language configuration', () => {
    const zhAgent = new GithubAgent({ 
      workspace: process.cwd(), 
      language: 'zh' 
    });
    expect(zhAgent.status()).toBe('idle');
  });

  it('should handle auto language detection', () => {
    const autoAgent = new GithubAgent({ 
      workspace: process.cwd(), 
      language: 'auto' 
    });
    expect(autoAgent.status()).toBe('idle');
  });
});

describe('RepositoryContextManager', () => {
  let manager: RepositoryContextManager;
  
  beforeEach(() => {
    manager = new RepositoryContextManager();
  });

  it('should get repository context', async () => {
    const context = await manager.getContext();
    expect(context).toBeDefined();
    expect(context.workingDirectory).toBeDefined();
    expect(context.lastUpdated).toBeInstanceOf(Date);
  });

  it('should cache context for performance', async () => {
    const context1 = await manager.getContext();
    const context2 = await manager.getContext();
    expect(context1.lastUpdated).toEqual(context2.lastUpdated);
  });

  it('should build context section for system prompt', async () => {
    const context = await manager.getContext();
    const section = manager.buildContextSection(context);
    expect(section).toContain('<repository_context>');
    expect(section).toContain('</repository_context>');
  });

  it('should handle invalid repositories gracefully', async () => {
    const context = await manager.getContext();
    if (!context.isValidGitRepo) {
      expect(context.validationError).toBeDefined();
    }
  });
});

describe('System Prompt Generation', () => {
  it('should generate base system prompt', () => {
    const languageConfig = getLanguageConfig('en');
    const prompt = generateSystemPrompt(languageConfig);
    expect(prompt).toContain('<system_instruction>');
    expect(prompt).toContain('GitHub Agent');
    expect(prompt).toContain('English');
  });

  it('should generate prompt with repository context', () => {
    const languageConfig = getLanguageConfig('en');
    const contextSection = '<repository_context><status>valid</status></repository_context>';
    const prompt = generateSystemPrompt(languageConfig, contextSection);
    expect(prompt).toContain(contextSection);
  });

  it('should include self-improvement for github-agent repo', () => {
    const languageConfig = getLanguageConfig('en');
    const contextSection = '<repository_context><github_repository><owner>agent-contrib</owner><name>github-agent</name><url>git@github.com:agent-contrib/github-agent.git</url></github_repository></repository_context>';
    const prompt = generateSystemPrompt(languageConfig, contextSection);
    // The self-improvement section should be included for github-agent repo
    expect(prompt).toContain('self_improvement_workflow');
  });

  it('should support different languages', () => {
    const zhConfig = getLanguageConfig('zh');
    const prompt = generateSystemPrompt(zhConfig);
    expect(prompt).toContain('Chinese (中文)');
  });
});

describe('Language Configuration', () => {
  it('should return English for unknown languages', () => {
    const config = getLanguageConfig('unknown');
    expect(config.code).toBe('en');
    expect(config.name).toBe('English');
  });

  it('should handle auto detection', () => {
    const config = getLanguageConfig('auto');
    expect(config).toBeDefined();
    expect(config.code).toBeDefined();
    expect(config.name).toBeDefined();
  });

  it('should support all configured languages', () => {
    const languages = ['en', 'zh', 'ja', 'es', 'fr', 'de'];
    languages.forEach(lang => {
      const config = getLanguageConfig(lang);
      expect(config.code).toBe(lang);
      expect(config.name).toBeDefined();
    });
  });
});
