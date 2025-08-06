import { Agent, AgentOptions } from "@multimodal/agent";
import { WebSearchTool } from "./tools/web-search";

export class SearchAgent extends Agent {
  constructor(options: AgentOptions) {
    super({
      ...options,
      instructions: `You are a helpful assistant that can search the web for information.
When users ask questions that require current information or research, use the web search tool to find relevant information.
Always provide helpful and accurate responses based on the search results.`,
      tools: [WebSearchTool],
    });
  }
}
