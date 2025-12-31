import type { XmcpConfig } from "xmcp";

const config: XmcpConfig = {
	stdio: true, // Required for Claude Desktop
	paths: {
		tools: "./src/tools",
		prompts: false,
		resources: false,
	},
};

export default config;
