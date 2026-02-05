import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListClues, useCreateClue, useDeleteClue } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, LogOut, Plus, Trash2, AlertCircle, CheckCircle2, ShieldAlert, Image, Video, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { RichClueContent } from '../components/RichClueContent';
import { transformPastedMedia, insertAtCursor } from '../utils/pasteRichMedia';

// OWNER ALLOWLIST: Add your principal ID here to grant admin access
// To find your principal: log in and check the console or the authenticated alert below
const OWNER_PRINCIPALS: string[] = [
  'zhd5h-lqb4c-ggxib-3x2cp-urwjt-sexwi-rgbem-5hf3h-trvbe-xbnyu-sae',
  'y5suo-sklcj-zena3-mpgii-cxp7w-wi6mb-3rc5h-p5xhl-ynlkh-viutp-rqe',
];

export function AdminPage() {
  const { identity, login, clear, loginStatus, isInitializing } = useInternetIdentity();
  const { data: clues, isLoading: cluesLoading } = useListClues();
  const createClue = useCreateClue();
  const deleteClue = useDeleteClue();

  const [newClueTitle, setNewClueTitle] = useState('');
  const [newClueSlug, setNewClueSlug] = useState('');
  const [newClueContent, setNewClueContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if user is authenticated (has a non-anonymous identity)
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();
  
  // Check if logged-in user is the owner
  const userPrincipal = identity?.getPrincipal().toString();
  const isOwner = userPrincipal && OWNER_PRINCIPALS.includes(userPrincipal);

  useEffect(() => {
    // Set document title
    document.title = 'Echofields — Spectate Portal';
  }, []);

  const handleCreateClue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newClueTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!newClueSlug.trim()) {
      toast.error('URL segment is required');
      return;
    }
    if (newClueSlug.includes('/')) {
      toast.error('URL segment cannot contain "/"');
      return;
    }
    if (!newClueContent.trim()) {
      toast.error('Content is required');
      return;
    }

    try {
      // For now, just create with content until backend supports structured clues
      await createClue.mutateAsync(newClueContent);
      setNewClueTitle('');
      setNewClueSlug('');
      setNewClueContent('');
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

  const insertTemplate = (template: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const result = insertAtCursor(textarea, template, newClueContent);
    setNewClueContent(result.newValue);

    // Set cursor position after inserted template
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(result.newCursorPos, result.newCursorPos);
    }, 0);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const transformed = transformPastedMedia(pastedText);
    
    if (transformed) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const result = insertAtCursor(textarea, transformed, newClueContent);
      setNewClueContent(result.newValue);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(result.newCursorPos, result.newCursorPos);
      }, 0);
    }
    // If not transformed, let default paste behavior happen
  };

  const handleInsertImage = () => {
    insertTemplate('![Alt text](https://example.com/image.png)');
  };

  const handleInsertVideo = () => {
    insertTemplate('{{video:https://example.com/video.mp4}}');
  };

  const handleInsertPPT = () => {
    insertTemplate('{{ppt:https://example.com/slides.pptx}}');
  };

  // Still initializing - show loading state
  if (isInitializing) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md space-y-6">
          <Card className="aero-glass border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md space-y-6">
          <Card className="aero-glass-strong border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Spectate Portal</CardTitle>
              <CardDescription>
                Login with Internet Identity to manage clues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="aero-glass">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  Only the site owner can add or delete clues. The public site remains viewable without login.
                </AlertDescription>
              </Alert>
              <Button
                onClick={login}
                disabled={loginStatus === 'logging-in'}
                className="w-full aero-button"
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
          <Card className="aero-glass border-2 border-destructive">
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
              <Alert className="aero-glass">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Restricted Access</AlertTitle>
                <AlertDescription>
                  This portal is only accessible to authorized site owners.
                </AlertDescription>
              </Alert>
              <Button variant="outline" onClick={clear} className="w-full aero-button">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
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
            <h1 className="text-4xl font-bold">Spectate Portal</h1>
            <p className="mt-2 text-muted-foreground">
              Manage clues for the Echofields experience
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Portal path: <code className="rounded bg-muted px-2 py-1">/echofields/spectate</code>
            </p>
          </div>
          <Button variant="outline" onClick={clear} className="aero-button">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Identity Info */}
        <Alert className="aero-glass">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Authenticated as Owner</AlertTitle>
          <AlertDescription className="font-mono text-xs">
            {userPrincipal}
          </AlertDescription>
        </Alert>

        {/* Create Clue Form */}
        <Card className="aero-glass-strong border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Clue
            </CardTitle>
            <CardDescription>
              Add a new clue with a title and URL segment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2 aero-glass">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="space-y-4">
                <form onSubmit={handleCreateClue} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clue-title">Title</Label>
                    <Input
                      id="clue-title"
                      type="text"
                      placeholder="e.g., The Beginning"
                      value={newClueTitle}
                      onChange={(e) => setNewClueTitle(e.target.value)}
                      required
                      className="aero-glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clue-slug">URL Segment</Label>
                    <Input
                      id="clue-slug"
                      type="text"
                      placeholder="e.g., something"
                      value={newClueSlug}
                      onChange={(e) => setNewClueSlug(e.target.value)}
                      required
                      className="aero-glass"
                    />
                    <p className="text-xs text-muted-foreground">
                      This clue will be accessible at: <code className="rounded bg-muted px-2 py-1">/echofields/{newClueSlug || '...'}</code>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="clue-content">Content</Label>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleInsertImage}
                          title="Insert Image"
                          className="aero-button"
                        >
                          <Image className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleInsertVideo}
                          title="Insert Video"
                          className="aero-button"
                        >
                          <Video className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleInsertPPT}
                          title="Insert PPT"
                          className="aero-button"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      ref={textareaRef}
                      id="clue-content"
                      placeholder="Enter the clue content... (paste image/video/ppt URLs to auto-format)"
                      value={newClueContent}
                      onChange={(e) => setNewClueContent(e.target.value)}
                      onPaste={handlePaste}
                      rows={8}
                      required
                      className="aero-glass"
                    />
                    <div className="rounded-md aero-glass p-3 text-xs text-muted-foreground space-y-2">
                      <p className="font-medium">💡 Paste URLs directly to auto-format:</p>
                      <div className="flex items-start gap-2">
                        <Image className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Image (.png, .jpg, .gif, .webp):</p>
                          <p className="mt-1">
                            <code className="rounded bg-background px-1 py-0.5">![Alt text](https://example.com/image.jpg)</code>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Video className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Video (.mp4, .webm, .mov):</p>
                          <p className="mt-1">
                            <code className="rounded bg-background px-1 py-0.5">{'{{video:https://example.com/video.mp4}}'}</code>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                          <p className="font-medium">PPT (.ppt, .pptx):</p>
                          <p className="mt-1">
                            <code className="rounded bg-background px-1 py-0.5">{'{{ppt:https://example.com/slides.pptx}}'}</code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={createClue.isPending} className="w-full aero-button">
                    {createClue.isPending ? 'Creating...' : 'Create Clue'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-4">
                <div className="rounded-lg border-2 aero-glass p-6">
                  {newClueContent ? (
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <RichClueContent content={newClueContent} />
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

        <Separator className="aero-glass" />

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
                <Card key={index} className="aero-glass">
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
                        className="aero-button"
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
            <Alert className="aero-glass">
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
