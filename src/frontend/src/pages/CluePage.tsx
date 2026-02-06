import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useGetClueSummary, useSubmitAnswer } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Home, AlertCircle, ArrowRight, LockKeyhole, CheckCircle2 } from 'lucide-react';
import { RichClueContent } from '../components/RichClueContent';
import { hasStarted, isClueUnlocked, unlockNextClue } from '../utils/sessionGating';

export function CluePage() {
  const { clueId } = useParams({ strict: false });
  const navigate = useNavigate();
  
  // Parse clueId as number for backend
  const clueIdNum = clueId ? parseInt(clueId, 10) : NaN;
  const clueIdBigInt = isNaN(clueIdNum) ? null : BigInt(clueIdNum);
  const { data: clue, isLoading, error } = useGetClueSummary(clueIdBigInt);
  const submitAnswer = useSubmitAnswer();

  const [guess, setGuess] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [answerSuccess, setAnswerSuccess] = useState(false);
  const [nextClueId, setNextClueId] = useState<bigint | null>(null);

  // Check session gating
  const started = hasStarted();
  const unlocked = clueIdBigInt !== null && isClueUnlocked(clueIdBigInt);
  const isLocked = !started || !unlocked;

  useEffect(() => {
    // Set document title
    if (clueId && !isNaN(clueIdNum)) {
      document.title = `Echofields — Clue #${clueId}`;
    } else {
      document.title = 'Echofields';
    }
  }, [clueId, clueIdNum]);

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueIdBigInt || !guess.trim()) return;

    setAnswerError('');
    setAnswerSuccess(false);

    try {
      const result = await submitAnswer.mutateAsync({
        clueId: clueIdBigInt,
        answer: guess.trim(),
      });

      if (result.correct) {
        setAnswerSuccess(true);
        setAnswerError('');
        if (result.nextClueId) {
          setNextClueId(result.nextClueId);
          unlockNextClue(result.nextClueId);
        }
      } else {
        setAnswerError('Incorrect answer. Try again!');
        setAnswerSuccess(false);
      }
    } catch (error: any) {
      console.error('Submit answer error:', error);
      setAnswerError(error.message || 'Failed to submit answer');
      setAnswerSuccess(false);
    }
  };

  const handleNavigateToNext = () => {
    if (nextClueId) {
      navigate({ to: '/echofields/$clueId', params: { clueId: nextClueId.toString() } });
      // Reset state for next clue
      setGuess('');
      setAnswerError('');
      setAnswerSuccess(false);
      setNextClueId(null);
    }
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
          <Alert variant="destructive" className="liminal-glass">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Clue Not Found</AlertTitle>
            <AlertDescription>
              The clue "{clueId}" doesn't exist. Check the URL or return home to start your journey.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate({ to: '/echofields' })} className="liminal-button">
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  // Show locked state if session hasn't started or clue is beyond unlocked progression
  if (isLocked) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <Card className="liminal-glass-strong border-2 border-yellow-500/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                <LockKeyhole className="h-8 w-8 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl">Clue Locked</CardTitle>
              <CardDescription>
                {!started
                  ? 'You need to press Start on the home page to begin your journey'
                  : 'You must solve the previous clues to unlock this one'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/echofields' })}
                className="liminal-button"
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
          className="mb-4 liminal-button"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>

        <Card className="liminal-glass-strong border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl">{clue.title}</CardTitle>
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

        {/* Answer Submission */}
        {!answerSuccess && (
          <Card className="liminal-glass border-2">
            <CardHeader>
              <CardTitle className="text-lg">Solve the Clue</CardTitle>
              <CardDescription>
                Enter your answer to unlock the next clue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitGuess} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guess">Your Answer</Label>
                  <Input
                    id="guess"
                    type="text"
                    placeholder="Enter your guess..."
                    value={guess}
                    onChange={(e) => {
                      setGuess(e.target.value);
                      setAnswerError('');
                    }}
                    className="liminal-glass"
                    disabled={submitAnswer.isPending}
                  />
                </div>
                {answerError && (
                  <Alert variant="destructive" className="liminal-glass">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{answerError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full liminal-button"
                  disabled={!guess.trim() || submitAnswer.isPending}
                >
                  {submitAnswer.isPending ? 'Checking...' : 'Submit Answer'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {answerSuccess && (
          <Card className="liminal-glass-strong border-2 border-green-500/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-500">Correct!</CardTitle>
              <CardDescription>
                {nextClueId
                  ? 'You solved the clue! Continue to the next one.'
                  : 'You solved the final clue! Congratulations!'}
              </CardDescription>
            </CardHeader>
            {nextClueId && (
              <CardContent className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleNavigateToNext}
                  className="liminal-button bg-liminal-accent hover:bg-liminal-accent/90"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Next Clue
                </Button>
              </CardContent>
            )}
          </Card>
        )}

        <div className="rounded-lg liminal-glass p-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Read the clue carefully. The answer might be hidden in the text, images, or other media.
          </p>
        </div>
      </div>
    </div>
  );
}
