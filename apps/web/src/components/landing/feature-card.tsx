interface FeatureCardProps {
	icon: string;
	title: string;
	description: string;
	code?: string;
}

export function FeatureCard({
	icon,
	title,
	description,
	code,
}: FeatureCardProps) {
	return (
		<div className="border border-border p-6 bg-card hover:bg-accent/50 transition-colors">
			<div className="text-2xl mb-3 font-mono">{icon}</div>
			<h3 className="text-sm font-medium mb-2">{title}</h3>
			<p className="text-xs text-muted-foreground mb-4">{description}</p>
			{code && (
				<pre className="text-xs bg-background p-3 border border-border overflow-x-auto">
					<code>{code}</code>
				</pre>
			)}
		</div>
	);
}
