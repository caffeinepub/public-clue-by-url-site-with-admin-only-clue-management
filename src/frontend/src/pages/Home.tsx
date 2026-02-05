import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Map, Search } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Welcome to <span className="text-accent">Echofields</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            A journey of discovery through hidden clues. Progress by exploring different paths.
            Each URL reveals a new piece of the puzzle.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Search className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Discover Clues</CardTitle>
              <CardDescription>
                Navigate through unique URLs to uncover hidden clues and messages
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Map className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>URL-Based Progress</CardTitle>
              <CardDescription>
                Your journey is guided by the paths you take. Change the URL to advance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Lock className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Public Access</CardTitle>
              <CardDescription>
                Anyone can view and explore. No login required for the journey
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="space-y-6 rounded-lg border-2 bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold">Ready to Begin?</h2>
          <p className="text-muted-foreground">
            Start your exploration by visiting a clue URL, or manage clues if you're the admin.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/echofields/admin' })}
            >
              Admin Portal
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 rounded-lg bg-muted/30 p-6">
          <h3 className="text-lg font-semibold">How It Works</h3>
          <ol className="space-y-2 text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">1.</span>
              <span>Visit a clue URL like <code className="rounded bg-muted px-2 py-1 text-sm">/echofields/first-clue</code></span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">2.</span>
              <span>Read the clue content and discover the next path</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">3.</span>
              <span>Continue exploring by changing the URL based on clues you find</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
