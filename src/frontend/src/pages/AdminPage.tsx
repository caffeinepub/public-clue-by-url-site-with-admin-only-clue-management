import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListClues, useCreateClue, useDeleteClue } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LogIn, LogOut, Plus, Trash2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';

export function AdminPage() {
  const { identity, login, clear, loginStatus, isLoginSuccess } = useInternetIdentity();
  const { data: clues, isLoading: cluesLoading } = useListClues();
  const createClue = useCreateClue();
  const deleteClue = useDeleteClue();

  const [newClue, setNewClue] = useState({ id: '', title: '', content: '' });

  const handleCreateClue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClue.id || !newClue.title || !newClue.content) {
      toast.error('All fields are required');
      return;
    }

    try {
      await createClue.mutateAsync(newClue);
      setNewClue({ id: '', title: '', content: '' });
      toast.success('Clue created successfully (mock data - backend not yet implemented)');
    } catch (error) {
      toast.error('Failed to create clue');
    }
  };

  const handleDeleteClue = async (id: string) => {
    if (!confirm(`Are you sure you want to delete the clue "${id}"?`)) {
      return;
    }

    try {
      await deleteClue.mutateAsync(id);
      toast.success('Clue deleted successfully (mock data - backend not yet implemented)');
    } catch (error) {
      toast.error('Failed to delete clue');
    }
  };

  // Not logged in
  if (!isLoginSuccess) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>
                Login with Internet Identity to manage clues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  Only authorized administrators can add or delete clues. The site remains publicly viewable.
                </AlertDescription>
              </Alert>
              <Button
                onClick={login}
                disabled={loginStatus === 'logging-in'}
                className="w-full"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {loginStatus === 'logging-in' ? 'Connecting...' : 'Login with Internet Identity'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Admin Portal</h1>
            <p className="mt-2 text-muted-foreground">
              Manage clues for the Echofields experience
            </p>
          </div>
          <Button variant="outline" onClick={clear}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Identity Info */}
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Authenticated</AlertTitle>
          <AlertDescription className="font-mono text-xs">
            {identity?.getPrincipal().toString()}
          </AlertDescription>
        </Alert>

        {/* Backend Notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Development Mode</AlertTitle>
          <AlertDescription>
            Backend methods are not yet implemented. Currently using mock data for demonstration.
            Changes will not persist across page reloads.
          </AlertDescription>
        </Alert>

        {/* Create Clue Form */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Clue
            </CardTitle>
            <CardDescription>
              Add a new clue that users can discover by visiting its URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClue} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clue-id">Clue ID (URL path)</Label>
                <Input
                  id="clue-id"
                  placeholder="e.g., first-clue, hidden-message"
                  value={newClue.id}
                  onChange={(e) => setNewClue({ ...newClue, id: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be accessible at: /echofields/{newClue.id || '<clue-id>'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clue-title">Title</Label>
                <Input
                  id="clue-title"
                  placeholder="Enter clue title"
                  value={newClue.title}
                  onChange={(e) => setNewClue({ ...newClue, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clue-content">Content</Label>
                <Textarea
                  id="clue-content"
                  placeholder="Enter the clue content..."
                  value={newClue.content}
                  onChange={(e) => setNewClue({ ...newClue, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" disabled={createClue.isPending} className="w-full">
                {createClue.isPending ? 'Creating...' : 'Create Clue'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Existing Clues */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Existing Clues</h2>

          {cluesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : clues && clues.length > 0 ? (
            <div className="space-y-4">
              {clues.map((clue) => (
                <Card key={clue.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{clue.title}</CardTitle>
                        <CardDescription>
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            /echofields/{clue.id}
                          </code>
                        </CardDescription>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClue(clue.id)}
                        disabled={deleteClue.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {clue.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Clues Yet</AlertTitle>
              <AlertDescription>
                Create your first clue using the form above to get started.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
