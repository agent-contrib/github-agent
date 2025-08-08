import { GithubAgent } from "../src";

// Example 1: Default English Agent
const githubAgentEn = new GithubAgent({
  model: {
    provider: "volcengine",
    id: "ep-20250613182556-7z8pl",
    apiKey: process.env.ARK_API_KEY,
  },
  language: 'en', // Optional: defaults to English
  workspace: process.cwd(),
});

// Example 2: Chinese Agent
const githubAgentZh = new GithubAgent({
  model: {
    provider: "volcengine",
    id: "ep-20250613182556-7z8pl",
    apiKey: process.env.ARK_API_KEY,
  },
  language: 'zh', // Chinese communications
  workspace: process.cwd(),
});

// Example 3: Auto-detect language from system
const githubAgentAuto = new GithubAgent({
  model: {
    provider: "volcengine",
    id: "ep-20250613182556-7z8pl",
    apiKey: process.env.ARK_API_KEY,
  },
  language: 'auto', // Auto-detect from system locale
  workspace: process.cwd(),
});

async function main() {
  console.log('=== English Agent Example ===');
  const responseEn = await githubAgentEn.run(`Create an issue about improving documentation`);
  console.log(responseEn.content);
  
  console.log('\n=== Chinese Agent Example ===');
  const responseZh = await githubAgentZh.run(`创建一个关于改进文档的 Issue`);
  console.log(responseZh.content);
}

// Uncomment to run examples
// main();

// Export for demonstration
export { githubAgentEn, githubAgentZh, githubAgentAuto };