import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useGetClue } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Home, AlertCircle } from 'lucide-react';
import { RichClueContent } from '../components/RichClueContent';

export function CluePage() {
  const { clueId } = useParams({ strict: false });
  const navigate = useNavigate();
  
  // Parse clueId as number for backend
  const clueIdNum = clueId ? parseInt(clueId, 10) : NaN;
  const { data: clue, isLoading, error } = useGetClue(isNaN(clueIdNum) ? null : BigInt(clueIdNum));

  useEffect(() => {
    // Set document title
    if (clueId && !isNaN(clueIdNum)) {
      document.title = `Echofields — Clue #${clueId}`;
    } else {
      document.title = 'Echofields';
    }
  }, [clueId, clueIdNum]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !clue || isNaN(clueIdNum)) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Clue Not Found</AlertTitle>
            <AlertDescription>
              The clue "{clueId}" doesn't exist. Check the URL or return home to start your journey.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate({ to: '/echofields' })}>
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/echofields' })}
          className="mb-4"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl">Clue #{clueId}</CardTitle>
                <CardDescription>
                  Clue ID: <code className="rounded bg-muted px-2 py-1 text-sm">{clueId}</code>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <RichClueContent content={clue} />
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg bg-muted/30 p-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> The clue above might contain hints about the next URL to visit.
            Look for keywords or patterns that could form the next path.
          </p>
        </div>
      </div>
    </div>
  );
}
