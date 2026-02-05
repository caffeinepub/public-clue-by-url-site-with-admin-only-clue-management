import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useGetClue } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Home, AlertCircle, ArrowRight, Edit3, X, LockKeyhole } from 'lucide-react';
import { RichClueContent } from '../components/RichClueContent';
import { hasStarted } from '../utils/sessionGating';

export function CluePage() {
  const { clueId } = useParams({ strict: false });
  const navigate = useNavigate();
  
  // Parse clueId as number for backend
  const clueIdNum = clueId ? parseInt(clueId, 10) : NaN;
  const { data: clue, isLoading, error } = useGetClue(isNaN(clueIdNum) ? null : BigInt(clueIdNum));

  const [showSlugInput, setShowSlugInput] = useState(false);
  const [nextSlug, setNextSlug] = useState('');

  // Check if this is the first clue and if Start has been pressed
  const isFirstClue = clueId === '1';
  const started = hasStarted();
  const isLocked = isFirstClue && !started;

  useEffect(() => {
    // Set document title
    if (clueId && !isNaN(clueIdNum)) {
      document.title = `Echofields — Clue #${clueId}`;
    } else {
      document.title = 'Echofields';
    }
  }, [clueId, clueIdNum]);

  const handleNavigateToSlug = () => {
    const trimmed = nextSlug.trim();
    if (!trimmed) {
      return;
    }

    // Navigate to the slug
    navigate({ to: '/echofields/$clueId', params: { clueId: trimmed } });
  };

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
          <Alert variant="destructive" className="aero-glass">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Clue Not Found</AlertTitle>
            <AlertDescription>
              The clue "{clueId}" doesn't exist. Check the URL or return home to start your journey.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate({ to: '/echofields' })} className="aero-button">
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  // Show locked state for first clue if Start hasn't been pressed
  if (isLocked) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <Card className="aero-glass-strong border-2 border-yellow-500/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                <LockKeyhole className="h-8 w-8 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl">Clue Locked</CardTitle>
              <CardDescription>
                You need to press Start on the home page to begin your journey
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/echofields' })}
                className="aero-button"
              >
                <Home className="mr-2 h-5 w-5" />
                Go to Home Page
              </Button>
            </CardContent>
          </Card>
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
          className="mb-4 aero-button"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>

        <Card className="aero-glass-strong border-2">
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

        {/* Slug Navigation Control */}
        <Card className="aero-glass border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Next Clue Navigation</CardTitle>
                <CardDescription>
                  Enter the URL segment to open the next clue
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSlugInput(!showSlugInput);
                  setNextSlug('');
                }}
                className="aero-button"
              >
                {showSlugInput ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showSlugInput && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="next-slug">URL Segment</Label>
                <Input
                  id="next-slug"
                  type="text"
                  placeholder="e.g., something"
                  value={nextSlug}
                  onChange={(e) => setNextSlug(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNavigateToSlug();
                    }
                  }}
                  className="aero-glass"
                />
                <p className="text-xs text-muted-foreground">
                  This will navigate to: <code className="rounded bg-muted px-2 py-1">/echofields/{nextSlug || '...'}</code>
                </p>
              </div>
              <Button onClick={handleNavigateToSlug} className="w-full aero-button" disabled={!nextSlug.trim()}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Next Clue
              </Button>
            </CardContent>
          )}
        </Card>

        <div className="rounded-lg aero-glass p-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> The clue above might contain hints about the next URL segment to visit.
            Look for keywords or patterns that could form the next path.
          </p>
        </div>
      </div>
    </div>
  );
}
