import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

const CONFIG_DIR = join(homedir(), ".vocably");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface CliConfig {
	token?: string;
	apiUrl: string;
}

const DEFAULT_CONFIG: CliConfig = {
	apiUrl: "http://localhost:3000",
};

export function getConfig(): CliConfig {
	if (!existsSync(CONFIG_FILE)) {
		return DEFAULT_CONFIG;
	}

	try {
		const raw = readFileSync(CONFIG_FILE, "utf-8");
		return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
	} catch {
		return DEFAULT_CONFIG;
	}
}

export function saveConfig(config: Partial<CliConfig>): void {
	if (!existsSync(CONFIG_DIR)) {
		mkdirSync(CONFIG_DIR, { recursive: true });
	}

	const current = getConfig();
	writeFileSync(
		CONFIG_FILE,
		JSON.stringify({ ...current, ...config }, null, 2),
	);
}

export function clearToken(): void {
	const config = getConfig();
	delete config.token;
	writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function hasToken(): boolean {
	const config = getConfig();
	return !!config.token;
}
