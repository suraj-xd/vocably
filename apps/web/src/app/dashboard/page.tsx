import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

import Dashboard from "./dashboard";

export default async function DashboardPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-start justify-between mb-8">
        <div>
          {/* <h1 className="text-3xl font-bold tracking-tight uppercase">Your Vocabulary</h1> */}
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}
          </p>
        </div>
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </Link>
      </div>
      <Dashboard session={session} />
    </div>
  );
}
