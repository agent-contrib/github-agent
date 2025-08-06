import { BrowserSearch } from '@agent-infra/browser-search';
import { Tool, z } from '@multimodal/agent';

export const WebSearchTool = new Tool({
  id: "web-search",
  description:
    "Perform a comprehensive web search on a topic and extract detailed information",
  parameters: z.object({
    query: z.string().describe("The search query to research"),
    count: z
      .number()
      .optional()
      .describe("Number of results to fetch (default: 3)"),
  }),
  function: async ({ query, count = 3 }) => {
    const browserSearch = new BrowserSearch();
    const results = await browserSearch.perform({
      query: query,
      count: count,
      engine: "google",
      needVisitedUrls: true,
    });
    return results;
  },
});
