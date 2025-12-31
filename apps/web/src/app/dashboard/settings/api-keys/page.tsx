"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Key, Loader2, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { client } from "@/utils/orpc";

export default function ApiKeysPage() {
	const queryClient = useQueryClient();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newTokenName, setNewTokenName] = useState("");
	const [createdToken, setCreatedToken] = useState<string | null>(null);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["apiTokens", "list"],
		queryFn: () => client.apiTokens.list(),
	});

	const createMutation = useMutation({
		mutationFn: (name: string) => client.apiTokens.create({ name }),
		onSuccess: (data) => {
			setCreatedToken(data.token);
			setNewTokenName("");
			queryClient.invalidateQueries({ queryKey: ["apiTokens", "list"] });
			toast.success("API key created");
		},
		onError: () => {
			toast.error("Failed to create API key");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => client.apiTokens.delete({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["apiTokens", "list"] });
			toast.success("API key deleted");
		},
		onError: () => {
			toast.error("Failed to delete API key");
		},
	});

	const revokeMutation = useMutation({
		mutationFn: (id: string) => client.apiTokens.revoke({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["apiTokens", "list"] });
			toast.success("API key revoked");
		},
		onError: () => {
			toast.error("Failed to revoke API key");
		},
	});

	function handleCopy(text: string, id: string) {
		navigator.clipboard.writeText(text);
		setCopiedId(id);
		toast.success("Copied to clipboard");
		setTimeout(() => setCopiedId(null), 2000);
	}

	function handleCreate() {
		if (!newTokenName.trim()) return;
		createMutation.mutate(newTokenName.trim());
	}

	function handleDialogClose() {
		setIsCreateOpen(false);
		setCreatedToken(null);
		setNewTokenName("");
	}

	const tokens = data?.tokens ?? [];

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>API Keys</CardTitle>
							<CardDescription>
								Manage API keys for CLI and MCP server access
							</CardDescription>
						</div>
						<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
							<DialogTrigger asChild>
								<Button size="sm">
									<Plus className="w-4 h-4 mr-2" />
									Create Key
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Create API Key</DialogTitle>
									<DialogDescription>
										{createdToken
											? "Your new API key has been created. Copy it now - you won't be able to see it again."
											: "Create a new API key for CLI or MCP server access."}
									</DialogDescription>
								</DialogHeader>

								{createdToken ? (
									<div className="space-y-4">
										<div className="p-4 bg-secondary font-mono text-sm break-all">
											{createdToken}
										</div>
										<Button
											variant="outline"
											className="w-full"
											onClick={() => handleCopy(createdToken, "new")}
										>
											{copiedId === "new" ? (
												<Check className="w-4 h-4 mr-2" />
											) : (
												<Copy className="w-4 h-4 mr-2" />
											)}
											{copiedId === "new" ? "Copied!" : "Copy to Clipboard"}
										</Button>
									</div>
								) : (
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="name">Key Name</Label>
											<Input
												id="name"
												placeholder="e.g., CLI, MCP Server, Laptop"
												value={newTokenName}
												onChange={(e) => setNewTokenName(e.target.value)}
												onKeyDown={(e) =>
													e.key === "Enter" && handleCreate()
												}
											/>
										</div>
									</div>
								)}

								<DialogFooter>
									{createdToken ? (
										<Button onClick={handleDialogClose}>Done</Button>
									) : (
										<>
											<Button
												variant="ghost"
												onClick={() => setIsCreateOpen(false)}
											>
												Cancel
											</Button>
											<Button
												onClick={handleCreate}
												disabled={
													!newTokenName.trim() || createMutation.isPending
												}
											>
												{createMutation.isPending && (
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												)}
												Create
											</Button>
										</>
									)}
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
						</div>
					) : tokens.length === 0 ? (
						<div className="text-center py-8">
							<Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No API keys yet</p>
							<p className="text-sm text-muted-foreground">
								Create a key to use the CLI or MCP server
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{tokens.map((token) => (
								<div
									key={token.id}
									className="flex items-center justify-between p-3 bg-secondary/50"
								>
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<p className="font-medium">{token.name}</p>
											{!token.isActive && (
												<span className="text-xs px-1.5 py-0.5 bg-destructive/10 text-destructive">
													Revoked
												</span>
											)}
										</div>
										<div className="flex items-center gap-3 text-xs text-muted-foreground">
											<span className="font-mono">{token.tokenPrefix}...</span>
											<span>
												Created{" "}
												{new Date(token.createdAt).toLocaleDateString()}
											</span>
											{token.lastUsedAt && (
												<span>
													Last used{" "}
													{new Date(token.lastUsedAt).toLocaleDateString()}
												</span>
											)}
										</div>
									</div>
									<div className="flex items-center gap-2">
										{token.isActive && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => revokeMutation.mutate(token.id)}
												disabled={revokeMutation.isPending}
											>
												Revoke
											</Button>
										)}
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												if (
													confirm(
														`Delete API key "${token.name}"? This cannot be undone.`
													)
												) {
													deleteMutation.mutate(token.id);
												}
											}}
											disabled={deleteMutation.isPending}
										>
											<Trash2 className="w-4 h-4 text-destructive" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Usage</CardTitle>
					<CardDescription>How to use your API keys</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<p className="text-sm font-medium mb-2">CLI</p>
						<div className="relative">
							<div className="p-3 bg-secondary font-mono text-sm pr-12">
								vocably auth login YOUR_API_KEY
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
								onClick={() => handleCopy("vocably auth login YOUR_API_KEY", "cli")}
							>
								{copiedId === "cli" ? (
									<Check className="w-3.5 h-3.5" />
								) : (
									<Copy className="w-3.5 h-3.5" />
								)}
							</Button>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Replace YOUR_API_KEY with your actual token
						</p>
					</div>
					<div>
						<p className="text-sm font-medium mb-2">MCP Server (Remote)</p>
						<p className="text-xs text-muted-foreground mb-2">
							Add to Claude Desktop config - no installation required
						</p>
						<div className="relative">
							<pre className="p-3 bg-secondary font-mono text-xs overflow-x-auto pr-12">
{`{
  "mcpServers": {
    "vocably": {
      "url": "https://vocab.surajgaud.com/api/mcp",
      "headers": {
        "Authorization": "Bearer vocably_your_token_here"
      }
    }
  }
}`}
							</pre>
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-1 top-2 h-7 w-7 p-0"
								onClick={() => handleCopy(`{
  "mcpServers": {
    "vocably": {
      "url": "https://vocab.surajgaud.com/api/mcp",
      "headers": {
        "Authorization": "Bearer vocably_your_token_here"
      }
    }
  }
}`, "mcp")}
							>
								{copiedId === "mcp" ? (
									<Check className="w-3.5 h-3.5" />
								) : (
									<Copy className="w-3.5 h-3.5" />
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
