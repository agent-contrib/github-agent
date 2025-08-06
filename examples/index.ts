import { GithubAgent } from "../src";

const githubAgent = new GithubAgent({
  model: {
    provider: "volcengine",
    id: "ep-20250613182556-7z8pl",
    apiKey: process.env.ARK_API_KEY,
  },
});

async function main() {
  const response = await githubAgent.run(`Latest and next version of Agent TARS CLI`);
  console.log(response.content);
}

main();