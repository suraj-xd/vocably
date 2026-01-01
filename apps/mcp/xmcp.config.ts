import type { XmcpConfig } from "xmcp";

const config: XmcpConfig = {
	stdio: true, // For local Claude Desktop
	http: true, // For Vercel deployment (auto-generates landing page)
	paths: {
		tools: "./src/tools",
		prompts: false,
		resources: false,
	},
};

export default config;
