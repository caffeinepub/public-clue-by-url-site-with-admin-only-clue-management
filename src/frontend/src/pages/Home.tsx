import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Lock, Map, Search, Play } from 'lucide-react';
import { useGetFirstAvailableClueSummary } from '../hooks/useQueries';
import { markStarted } from '../utils/sessionGating';

export function Home() {
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const navigate = useNavigate();
  const { data: firstClue, isLoading: firstClueLoading, isFetched } = useGetFirstAvailableClueSummary();

  useEffect(() => {
    // Set document title
    document.title = 'Echofields';

    // Check if user has seen the intro
    const hasSeenIntro = sessionStorage.getItem('echofields-intro-seen');
    
    if (!hasSeenIntro) {
      setShowIntro(true);
      // Mark intro as complete after animation
      const timer = setTimeout(() => {
        setIntroComplete(true);
        sessionStorage.setItem('echofields-intro-seen', 'true');
      }, 3000); // 3 second animation

      return () => clearTimeout(timer);
    } else {
      setIntroComplete(true);
    }
  }, []);

  const hasClues = isFetched && !!firstClue;

  const handleStart = () => {
    if (!firstClue) return;
    markStarted(firstClue.id);
    navigate({ to: '/echofields/$clueId', params: { clueId: firstClue.id.toString() } });
  };

  if (showIntro && !introComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="intro-animation">
          <h1 className="echofields-title text-7xl font-bold tracking-tight sm:text-8xl">
            Echofields
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl text-liminal-text">
            Welcome to <span className="echofields-title">Echofields</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-liminal-muted">
            A journey of discovery through hidden clues. Solve each puzzle to unlock the next.
            Each clue reveals a new piece of the mystery.
          </p>
        </div>

        {/* Start Button - Only show if clues exist */}
        {hasClues && (
          <div className="flex justify-center">
            <Card className="liminal-glass-strong border-2 border-liminal-accent/30 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-liminal-text">Ready to Begin?</CardTitle>
                <CardDescription className="text-liminal-muted">
                  Press Start to reveal the first clue
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleStart}
                  disabled={firstClueLoading}
                  className="liminal-button bg-liminal-accent hover:bg-liminal-accent/90 text-white font-semibold px-8 py-6 text-lg transition-all hover:scale-105 border border-liminal-accent/30"
                >
                  <Play className="mr-2 h-6 w-6 fill-current" />
                  {firstClueLoading ? 'Loading...' : 'Start'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="liminal-glass border-2 border-liminal-accent/20 transition-all hover:scale-105 hover:border-liminal-accent/30">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg liminal-glass border border-liminal-accent/30">
                <Search className="h-6 w-6 text-liminal-accent" />
              </div>
              <CardTitle className="text-liminal-text">Discover Clues</CardTitle>
              <CardDescription className="text-liminal-muted">
                Uncover hidden clues and messages as you progress through the journey
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="liminal-glass border-2 border-liminal-accent/20 transition-all hover:scale-105 hover:border-liminal-accent/30">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg liminal-glass border border-liminal-accent/30">
                <Map className="h-6 w-6 text-liminal-accent" />
              </div>
              <CardTitle className="text-liminal-text">Solve to Progress</CardTitle>
              <CardDescription className="text-liminal-muted">
                Each clue contains a word puzzle. Solve it correctly to unlock the next clue
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="liminal-glass border-2 border-liminal-accent/20 transition-all hover:scale-105 hover:border-liminal-accent/30">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg liminal-glass border border-liminal-accent/30">
                <Lock className="h-6 w-6 text-liminal-accent" />
              </div>
              <CardTitle className="text-liminal-text">Public Access</CardTitle>
              <CardDescription className="text-liminal-muted">
                Anyone can view and explore. No login required for the journey
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Instructions */}
        <div className="space-y-4 rounded-lg liminal-glass border-2 border-liminal-accent/20 p-6">
          <h3 className="text-lg font-semibold text-liminal-text">How It Works</h3>
          <ol className="space-y-2 text-liminal-muted">
            <li className="flex gap-3">
              <span className="font-semibold text-liminal-text">1.</span>
              <span>Press the Start button to begin your journey</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-liminal-text">2.</span>
              <span>Read each clue carefully and find the hidden word</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-liminal-text">3.</span>
              <span>Submit your answer to unlock the next clue in the sequence</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
