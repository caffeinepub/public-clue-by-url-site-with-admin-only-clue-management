import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Map, Search, Play } from 'lucide-react';
import { useListClues } from '../hooks/useQueries';
import { markStarted } from '../utils/sessionGating';

export function Home() {
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const navigate = useNavigate();
  const { data: clues, isLoading: cluesLoading } = useListClues();

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

  const hasClues = clues && clues.length > 0;

  const handleStart = () => {
    markStarted();
    navigate({ to: '/echofields/$clueId', params: { clueId: '1' } });
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
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Welcome to <span className="echofields-title">Echofields</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            A journey of discovery through hidden clues. Progress by exploring different paths.
            Each URL reveals a new piece of the puzzle.
          </p>
        </div>

        {/* Start Button - Only show if clues exist */}
        {hasClues && (
          <div className="flex justify-center">
            <Card className="aero-glass-strong border-2 border-echofields-green/30 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Ready to Begin?</CardTitle>
                <CardDescription>
                  Press Start to reveal the first clue
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="aero-button bg-echofields-green hover:bg-echofields-green/90 text-white font-semibold px-8 py-6 text-lg transition-all hover:scale-105"
                >
                  <Play className="mr-2 h-6 w-6 fill-current" />
                  Start
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="aero-glass border-2 transition-all hover:scale-105">
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

          <Card className="aero-glass border-2 transition-all hover:scale-105">
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

          <Card className="aero-glass border-2 transition-all hover:scale-105">
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

        {/* Instructions */}
        <div className="space-y-4 rounded-lg aero-glass p-6">
          <h3 className="text-lg font-semibold">How It Works</h3>
          <ol className="space-y-2 text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">1.</span>
              <span>Press the Start button to begin your journey</span>
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
