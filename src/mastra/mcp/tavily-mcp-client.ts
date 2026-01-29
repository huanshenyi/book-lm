import { MCPClient } from "@mastra/mcp";

export const tavilyMcpClient = new MCPClient({
    id: "tavily-mcp-client",
    servers: {
        "tavilyRemoteMcp": {
            url: new URL(`https://mcp.tavily.com/mcp/?tavilyApiKey=${process.env.TAVILY_API_KEY}`),
        }
    },
});