import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllClueSummaries, useCreateClue, useDeleteClue, useEditClue, useReassignClueId, useClearAllClues } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { LogIn, LogOut, Plus, Trash2, AlertCircle, CheckCircle2, ShieldAlert, Edit, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { RichClueContent } from '../components/RichClueContent';
import { humanizeError } from '../utils/humanizeError';
import type { Clue, Media, ClueSummary } from '../backend';

// OWNER ALLOWLIST: Add your principal ID here to grant admin access
const OWNER_PRINCIPALS: string[] = [
  'zhd5h-lqb4c-ggxib-3x2cp-urwjt-sexwi-rgbem-5hf3h-trvbe-xbnyu-sae',
  'y5suo-sklcj-zena3-mpgii-cxp7w-wi6mb-3rc5h-p5xhl-ynlkh-viutp-rqe',
];

export function AdminPage() {
  const { identity, login, clear, loginStatus, isInitializing } = useInternetIdentity();
  const { data: clues, isLoading: cluesLoading } = useGetAllClueSummaries();
  const createClue = useCreateClue();
  const deleteClue = useDeleteClue();
  const editClue = useEditClue();
  const reassignClueId = useReassignClueId();
  const clearAllClues = useClearAllClues();

  const [newClueTitle, setNewClueTitle] = useState('');
  const [newClueAnswer, setNewClueAnswer] = useState('');
  const [newClueStatement, setNewClueStatement] = useState('');
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video' | 'ppt'>('none');
  const [mediaUrl, setMediaUrl] = useState('');
  const [deletingClueId, setDeletingClueId] = useState<bigint | null>(null);
  
  // Edit state
  const [editingClueId, setEditingClueId] = useState<bigint | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editStatement, setEditStatement] = useState('');
  const [editMediaType, setEditMediaType] = useState<'none' | 'image' | 'video' | 'ppt'>('none');
  const [editMediaUrl, setEditMediaUrl] = useState('');
  const [editNewId, setEditNewId] = useState('');

  // Check if user is authenticated
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();
  
  // Check if logged-in user is the owner
  const userPrincipal = identity?.getPrincipal().toString();
  const isOwner = userPrincipal && OWNER_PRINCIPALS.includes(userPrincipal);

  useEffect(() => {
    document.title = 'Echofields — Spectate Portal';
  }, []);

  const handleCreateClue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double-submit
    if (createClue.isPending) {
      return;
    }
    
    // Validation
    if (!newClueTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!newClueAnswer.trim()) {
      toast.error('Answer is required');
      return;
    }
    if (!newClueStatement.trim()) {
      toast.error('Statement is required');
      return;
    }
    if (mediaType !== 'none' && !mediaUrl.trim()) {
      toast.error('Media URL is required when a media type is selected');
      return;
    }

    try {
      let media: Media | undefined = undefined;
      if (mediaType !== 'none' && mediaUrl.trim()) {
        if (mediaType === 'image') {
          media = { __kind__: 'imageUrl', imageUrl: mediaUrl.trim() };
        } else if (mediaType === 'video') {
          media = { __kind__: 'videoUrl', videoUrl: mediaUrl.trim() };
        } else if (mediaType === 'ppt') {
          media = { __kind__: 'pptUrl', pptUrl: mediaUrl.trim() };
        }
      }

      const clue: Clue = {
        id: BigInt(0), // Backend will assign the ID
        title: newClueTitle.trim(),
        answer: newClueAnswer.trim(),
        statement: newClueStatement.trim(),
        media,
      };

      await createClue.mutateAsync(clue);
      
      // Reset form on success
      setNewClueTitle('');
      setNewClueAnswer('');
      setNewClueStatement('');
      setMediaType('none');
      setMediaUrl('');
      
      toast.success('Clue created successfully');
    } catch (error: unknown) {
      // Log full error for debugging
      console.error('Create clue error:', error);
      
      // Show human-readable error to user
      const message = humanizeError(error);
      toast.error(message);
    }
  };

  const handleDeleteClue = async (clueId: bigint) => {
    if (!confirm(`Are you sure you want to delete clue #${clueId}?`)) {
      return;
    }

    setDeletingClueId(clueId);
    try {
      await deleteClue.mutateAsync(clueId);
      toast.success('Clue deleted successfully');
    } catch (error: unknown) {
      console.error('Delete clue error:', error);
      const message = humanizeError(error);
      toast.error(message);
    } finally {
      setDeletingClueId(null);
    }
  };

  const handleClearAllClues = async () => {
    try {
      await clearAllClues.mutateAsync();
      toast.success('All clues cleared successfully');
    } catch (error: unknown) {
      console.error('Clear all clues error:', error);
      const message = humanizeError(error);
      toast.error(message);
    }
  };

  const startEditingClue = (clue: ClueSummary) => {
    setEditingClueId(clue.id);
    setEditTitle(clue.title);
    setEditStatement(clue.statement);
    setEditAnswer(''); // We don't have the answer in the summary, so leave blank
    setEditNewId(clue.id.toString());
    
    if (clue.media) {
      if (clue.media.__kind__ === 'imageUrl') {
        setEditMediaType('image');
        setEditMediaUrl(clue.media.imageUrl);
      } else if (clue.media.__kind__ === 'videoUrl') {
        setEditMediaType('video');
        setEditMediaUrl(clue.media.videoUrl);
      } else if (clue.media.__kind__ === 'pptUrl') {
        setEditMediaType('ppt');
        setEditMediaUrl(clue.media.pptUrl);
      }
    } else {
      setEditMediaType('none');
      setEditMediaUrl('');
    }
  };

  const cancelEditing = () => {
    setEditingClueId(null);
    setEditTitle('');
    setEditAnswer('');
    setEditStatement('');
    setEditMediaType('none');
    setEditMediaUrl('');
    setEditNewId('');
  };

  const handleSaveEdit = async (originalId: bigint) => {
    // Validation
    if (!editTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!editAnswer.trim()) {
      toast.error('Answer is required');
      return;
    }
    if (!editStatement.trim()) {
      toast.error('Statement is required');
      return;
    }
    if (editMediaType !== 'none' && !editMediaUrl.trim()) {
      toast.error('Media URL is required when a media type is selected');
      return;
    }

    const newIdNum = editNewId.trim() ? BigInt(editNewId.trim()) : originalId;
    
    if (newIdNum <= BigInt(0)) {
      toast.error('Clue ID must be greater than 0');
      return;
    }

    try {
      let media: Media | undefined = undefined;
      if (editMediaType !== 'none' && editMediaUrl.trim()) {
        if (editMediaType === 'image') {
          media = { __kind__: 'imageUrl', imageUrl: editMediaUrl.trim() };
        } else if (editMediaType === 'video') {
          media = { __kind__: 'videoUrl', videoUrl: editMediaUrl.trim() };
        } else if (editMediaType === 'ppt') {
          media = { __kind__: 'pptUrl', pptUrl: editMediaUrl.trim() };
        }
      }

      const updatedClue: Clue = {
        id: originalId,
        title: editTitle.trim(),
        answer: editAnswer.trim(),
        statement: editStatement.trim(),
        media,
      };

      // First, update the clue content
      await editClue.mutateAsync({ clueId: originalId, updatedClue });

      // Then, if the ID changed, reassign it
      if (newIdNum !== originalId) {
        await reassignClueId.mutateAsync({ oldId: originalId, newId: newIdNum });
      }

      toast.success('Clue updated successfully');
      cancelEditing();
    } catch (error: unknown) {
      console.error('Edit clue error:', error);
      const message = humanizeError(error);
      toast.error(message);
    }
  };

  // Build preview content for the preview tab
  const previewContent = newClueStatement;

  if (isInitializing) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md space-y-6">
          <Card className="liminal-glass border-2">
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

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md space-y-6">
          <Card className="liminal-glass-strong border-2 border-liminal-accent/30">
            <CardHeader>
              <CardTitle className="text-2xl text-liminal-text">Spectate Portal</CardTitle>
              <CardDescription className="text-liminal-muted">
                Login with Internet Identity to manage clues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="liminal-glass border border-liminal-accent/20">
                <AlertCircle className="h-4 w-4 text-liminal-accent" />
                <AlertTitle className="text-liminal-text">Authentication Required</AlertTitle>
                <AlertDescription className="text-liminal-muted">
                  Only the site owner can add or delete clues. The public site remains viewable without login.
                </AlertDescription>
              </Alert>
              <Button
                onClick={login}
                disabled={loginStatus === 'logging-in'}
                className="w-full liminal-button text-lg"
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

  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md space-y-6">
          <Card className="liminal-glass border-2 border-liminal-warning/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-liminal-warning">
                <ShieldAlert className="h-5 w-5" />
                Access Denied
              </CardTitle>
              <CardDescription className="text-liminal-muted">
                You do not have permission to access this area
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="liminal-glass border border-liminal-warning/20">
                <AlertCircle className="h-4 w-4 text-liminal-warning" />
                <AlertTitle className="text-liminal-text">Restricted Access</AlertTitle>
                <AlertDescription className="text-liminal-muted">
                  This portal is only accessible to authorized site owners.
                </AlertDescription>
              </Alert>
              <Button variant="outline" onClick={clear} className="w-full liminal-button">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
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
            <h1 className="text-4xl font-bold text-liminal-text">Spectate Portal</h1>
            <p className="mt-2 text-liminal-muted">
              Manage clues for the Echofields experience
            </p>
            <p className="mt-1 text-xs text-liminal-muted/70">
              Portal path: <code className="rounded liminal-glass px-2 py-1 border border-liminal-accent/20">/echofields/spectate</code>
            </p>
          </div>
          <Button variant="outline" onClick={clear} className="liminal-button border">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Identity Info */}
        <Alert className="liminal-glass border border-liminal-accent/30">
          <CheckCircle2 className="h-4 w-4 text-liminal-accent" />
          <AlertTitle className="text-liminal-text">Authenticated as Owner</AlertTitle>
          <AlertDescription className="font-mono text-xs text-liminal-muted">
            {userPrincipal}
          </AlertDescription>
        </Alert>

        {/* Create Clue Form */}
        <Card className="liminal-glass-strong border-2 border-liminal-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-liminal-text">
              <Plus className="h-5 w-5" />
              Create Clue
            </CardTitle>
            <CardDescription className="text-liminal-muted">
              Add a new clue with title, answer, statement, and optional media
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2 liminal-glass border border-liminal-accent/20">
                <TabsTrigger value="edit" className="data-[state=active]:liminal-glass-strong data-[state=active]:border data-[state=active]:border-liminal-accent/30">Edit</TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:liminal-glass-strong data-[state=active]:border data-[state=active]:border-liminal-accent/30">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="space-y-4">
                <form onSubmit={handleCreateClue} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clue-title" className="text-liminal-text">Title *</Label>
                    <Input
                      id="clue-title"
                      type="text"
                      placeholder="e.g., The Beginning"
                      value={newClueTitle}
                      onChange={(e) => setNewClueTitle(e.target.value)}
                      required
                      disabled={createClue.isPending}
                      className="liminal-glass border border-liminal-accent/20 focus:border-liminal-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clue-answer" className="text-liminal-text">Answer *</Label>
                    <Input
                      id="clue-answer"
                      type="text"
                      placeholder="e.g., echo"
                      value={newClueAnswer}
                      onChange={(e) => setNewClueAnswer(e.target.value)}
                      required
                      disabled={createClue.isPending}
                      className="liminal-glass border border-liminal-accent/20 focus:border-liminal-accent"
                    />
                    <p className="text-xs text-liminal-muted/70">
                      The word users must guess to unlock the next clue
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clue-statement" className="text-liminal-text">Statement *</Label>
                    <Textarea
                      id="clue-statement"
                      placeholder="Enter the clue statement..."
                      value={newClueStatement}
                      onChange={(e) => setNewClueStatement(e.target.value)}
                      rows={6}
                      required
                      disabled={createClue.isPending}
                      className="liminal-glass border border-liminal-accent/20 focus:border-liminal-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="media-type" className="text-liminal-text">Media Type (Optional)</Label>
                    <Select 
                      value={mediaType} 
                      onValueChange={(value: any) => setMediaType(value)}
                      disabled={createClue.isPending}
                    >
                      <SelectTrigger className="liminal-glass border border-liminal-accent/20">
                        <SelectValue placeholder="Select media type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="ppt">PowerPoint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {mediaType !== 'none' && (
                    <div className="space-y-2">
                      <Label htmlFor="media-url" className="text-liminal-text">Media URL *</Label>
                      <Input
                        id="media-url"
                        type="url"
                        placeholder="https://example.com/media.jpg"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        required
                        disabled={createClue.isPending}
                        className="liminal-glass border border-liminal-accent/20 focus:border-liminal-accent"
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={createClue.isPending} 
                    className="w-full liminal-button text-lg border border-liminal-accent/30"
                  >
                    {createClue.isPending ? 'Creating...' : 'Create Clue'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-4">
                <div className="rounded-lg border-2 border-liminal-accent/30 liminal-glass p-6">
                  {previewContent ? (
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <RichClueContent content={previewContent} />
                    </div>
                  ) : (
                    <p className="text-sm text-liminal-muted italic">
                      No content yet. Start typing in the Edit tab to see a preview.
                    </p>
                  )}
                </div>
                <p className="text-xs text-liminal-muted/70 text-center">
                  This is how your clue statement will appear to users
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Separator className="liminal-glass border border-liminal-accent/20" />

        {/* Existing Clues */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-liminal-text">Existing Clues</h2>
            
            {clues && clues.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    disabled={clearAllClues.isPending}
                    className="liminal-button border border-liminal-warning/30 bg-liminal-warning/10 hover:bg-liminal-warning/20"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {clearAllClues.isPending ? 'Deleting...' : 'Delete All Clues'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="liminal-glass-strong border-2 border-liminal-warning/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-liminal-warning">
                      <AlertTriangle className="h-5 w-5" />
                      Delete All Clues?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-liminal-muted">
                      This action cannot be undone. This will permanently delete all {clues.length} clue{clues.length !== 1 ? 's' : ''} from the system.
                      The home page will no longer show the Start button until you create new clues.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="liminal-button border" disabled={clearAllClues.isPending}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAllClues}
                      disabled={clearAllClues.isPending}
                      className="liminal-button border border-liminal-warning/30 bg-liminal-warning/10 hover:bg-liminal-warning/20"
                    >
                      {clearAllClues.isPending ? 'Deleting...' : 'Delete All'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {cluesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : clues && clues.length > 0 ? (
            <div className="space-y-4">
              {clues.map((clue) => {
                const isDeleting = deletingClueId === clue.id;
                const isEditing = editingClueId === clue.id;
                
                return (
                  <Card key={clue.id.toString()} className="liminal-glass border border-liminal-accent/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-liminal-text">{clue.title}</CardTitle>
                          <CardDescription className="text-liminal-muted">
                            <code className="rounded liminal-glass px-2 py-1 text-xs border border-liminal-accent/20">
                              ID: {clue.id.toString()}
                            </code>
                            {clue.media && (
                              <span className="ml-2 text-xs">
                                • Has {clue.media.__kind__ === 'imageUrl' ? 'Image' : clue.media.__kind__ === 'videoUrl' ? 'Video' : 'PPT'}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => isEditing ? cancelEditing() : startEditingClue(clue)}
                            className="liminal-button border border-liminal-accent/30"
                          >
                            {isEditing ? <ChevronUp className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClue(clue.id)}
                            disabled={isDeleting || deleteClue.isPending}
                            className="liminal-button border border-liminal-warning/30 bg-liminal-warning/10 hover:bg-liminal-warning/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-4 pt-4 border-t border-liminal-accent/20">
                          <div className="space-y-2">
                            <Label htmlFor={`edit-id-${clue.id}`} className="text-liminal-text">Clue ID *</Label>
                            <Input
                              id={`edit-id-${clue.id}`}
                              type="number"
                              min="1"
                              placeholder="e.g., 1"
                              value={editNewId}
                              onChange={(e) => setEditNewId(e.target.value)}
                              className="liminal-glass border border-liminal-accent/20 focus:border-liminal-accent"
                            />
                            <p className="text-xs text-liminal-muted/70">
                              Change the clue ID to reorder clues
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`edit-title-${clue.id}`} className="text-liminal-text">Title *</Label>
                            <Input
                              id={`edit-title-${clue.id}`}
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="liminal-glass border border-liminal-accent/20 focus:border-liminal-accent"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`edit-answer-${clue.id}`} className="text-liminal-text">Answer *</Label>
                            <Input
                              id={`edit-answer-${clue.id}`}
                              type="text"
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              className="liminal-glass border border-liminal-accent/20 focus:border-liminal-accent"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`edit-statement-${clue.id}`} className="text-liminal-text">Statement *</Label>
                            <Textarea
                              id={`edit-statement-${clue.id}`}
                              value={editStatement}
                              onChange={(e) => setEditStatement(e.target.value)}
                              rows={6}
                              className="liminal-glass border border-liminal-accent/20 focus:border-liminal-accent"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`edit-media-type-${clue.id}`} className="text-liminal-text">Media Type</Label>
                            <Select value={editMediaType} onValueChange={(value: any) => setEditMediaType(value)}>
                              <SelectTrigger className="liminal-glass border border-liminal-accent/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="ppt">PowerPoint</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {editMediaType !== 'none' && (
                            <div className="space-y-2">
                              <Label htmlFor={`edit-media-url-${clue.id}`} className="text-liminal-text">Media URL *</Label>
                              <Input
                                id={`edit-media-url-${clue.id}`}
                                type="url"
                                value={editMediaUrl}
                                onChange={(e) => setEditMediaUrl(e.target.value)}
                                className="liminal-glass border border-liminal-accent/20 focus:border-liminal-accent"
                              />
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSaveEdit(clue.id)}
                              disabled={editClue.isPending || reassignClueId.isPending}
                              className="flex-1 liminal-button border border-liminal-accent/30"
                            >
                              {editClue.isPending || reassignClueId.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={cancelEditing}
                              className="liminal-button border"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="line-clamp-3 text-sm text-liminal-muted">
                          {clue.statement}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Alert className="liminal-glass border border-liminal-accent/20">
              <AlertCircle className="h-4 w-4 text-liminal-accent" />
              <AlertTitle className="text-liminal-text">No Clues Yet</AlertTitle>
              <AlertDescription className="text-liminal-muted">
                Create your first clue using the form above to get started.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
