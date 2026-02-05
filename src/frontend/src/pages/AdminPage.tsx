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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, LogOut, Plus, Trash2, AlertCircle, CheckCircle2, ShieldAlert, Image } from 'lucide-react';
import { toast } from 'sonner';
import { RichClueContent } from '../components/RichClueContent';

// OWNER ALLOWLIST: Add your principal ID here to grant admin access
// To find your principal: log in and check the console or the authenticated alert below
const OWNER_PRINCIPALS: string[] = [
  // Add your principal IDs here, e.g.:
  // '2vxsx-fae',
  // 'xxxxx-xxxxx-xxxxx-xxxxx-xxx',
];

export function AdminPage() {
  const { identity, login, clear, loginStatus, isLoginSuccess } = useInternetIdentity();
  const { data: clues, isLoading: cluesLoading } = useListClues();
  const createClue = useCreateClue();
  const deleteClue = useDeleteClue();

  const [newClue, setNewClue] = useState('');

  // Check if logged-in user is the owner
  const userPrincipal = identity?.getPrincipal().toString();
  const isOwner = userPrincipal && OWNER_PRINCIPALS.includes(userPrincipal);

  const handleCreateClue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClue.trim()) {
      toast.error('Clue content is required');
      return;
    }

    try {
      await createClue.mutateAsync(newClue);
      setNewClue('');
      toast.success('Clue created successfully');
    } catch (error: any) {
      console.error('Create clue error:', error);
      if (error.message?.includes('Unauthorized')) {
        toast.error('Access denied: Only the owner can create clues');
      } else {
        toast.error('Failed to create clue');
      }
    }
  };

  const handleDeleteClue = async (id: bigint) => {
    if (!confirm(`Are you sure you want to delete clue #${id}?`)) {
      return;
    }

    try {
      await deleteClue.mutateAsync(id);
      toast.success('Clue deleted successfully');
    } catch (error: any) {
      console.error('Delete clue error:', error);
      if (error.message?.includes('Unauthorized')) {
        toast.error('Access denied: Only the owner can delete clues');
      } else {
        toast.error('Failed to delete clue');
      }
    }
  };

  // Not logged in - show login prompt
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
                  Only the site owner can add or delete clues. The public site remains viewable without login.
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

  // Logged in but not owner - show access denied
  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md space-y-6">
          <Card className="border-2 border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You do not have permission to access this area
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Owner Access Only</AlertTitle>
                <AlertDescription>
                  This admin portal is restricted to the site owner. Your principal ID is not in the allowlist.
                </AlertDescription>
              </Alert>
              
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Your Principal ID:</p>
                <code className="block break-all rounded bg-background px-3 py-2 text-xs font-mono">
                  {userPrincipal}
                </code>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clear} className="flex-1">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Owner authenticated - show admin interface
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
          <AlertTitle>Authenticated as Owner</AlertTitle>
          <AlertDescription className="font-mono text-xs">
            {userPrincipal}
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
              Add a new clue that users can discover
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="space-y-4">
                <form onSubmit={handleCreateClue} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clue-content">Clue Content</Label>
                    <Textarea
                      id="clue-content"
                      placeholder="Enter the clue content..."
                      value={newClue}
                      onChange={(e) => setNewClue(e.target.value)}
                      rows={8}
                      required
                    />
                    <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <Image className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Markdown Image Support</p>
                          <p className="mt-1">
                            To embed an image, use: <code className="rounded bg-background px-1 py-0.5">![Alt text](https://example.com/image.jpg)</code>
                          </p>
                          <p className="mt-1 text-[11px] opacity-75">
                            Only http://, https://, and relative URLs are supported for security.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={createClue.isPending} className="w-full">
                    {createClue.isPending ? 'Creating...' : 'Create Clue'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-4">
                <div className="rounded-lg border-2 bg-card p-6">
                  {newClue ? (
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <RichClueContent content={newClue} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No content yet. Start typing in the Edit tab to see a preview.
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  This is how your clue will appear to users
                </p>
              </TabsContent>
            </Tabs>
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
              {clues.map((clue, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>Clue #{index + 1}</CardTitle>
                        <CardDescription>
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            /echofields/{index + 1}
                          </code>
                        </CardDescription>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClue(BigInt(index + 1))}
                        disabled={deleteClue.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {clue}
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
