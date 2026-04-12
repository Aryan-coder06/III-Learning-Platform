"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, GraduationCap, Users, LoaderCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth/auth-store";
import { cn } from "@/lib/utils";
import { 
  SkillSharePost, 
  getSkillSharesApi, 
  createSkillShareApi, 
  rsvpSkillShareApi, 
  cancelRsvpSkillShareApi 
} from "@/lib/api/skill-share";

export function SkillShareView() {
  const user = useAuthStore((state) => state.user);

  const [posts, setPosts] = useState<SkillSharePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"teach" | "learn">("teach");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"teach" | "learn">("teach");
  const [sessionDate, setSessionDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const data = await getSkillSharesApi();
      setPosts(data);
    } catch (error) {
      console.error("Failed to load skill shares:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !user) return;

    setSubmitting(true);
    try {
      const newPost = await createSkillShareApi({
        title,
        description,
        type,
        authorId: user.mongoId!,
        sessionDate: sessionDate ? new Date(sessionDate) : null,
      });
      setPosts([newPost, ...posts]);
      setShowForm(false);
      setTitle("");
      setDescription("");
      setSessionDate("");
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRsvp(postId: string, isRsvpd: boolean) {
    if (!user?.mongoId) return;
    
    // Optimistic update
    setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const newRsvps = isRsvpd 
            ? p.rsvps.filter(id => id !== user.mongoId)
            : [...p.rsvps, user.mongoId!];
        return { ...p, rsvps: newRsvps };
    }));

    try {
      if (isRsvpd) {
        await cancelRsvpSkillShareApi(postId, user.mongoId);
      } else {
        await rsvpSkillShareApi(postId, user.mongoId);
      }
    } catch (error) {
      console.error("Failed to toggle RSVP:", error);
      fetchPosts(); // revert on failure
    }
  }

  const filteredPosts = posts.filter((p) => p.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl bg-sidebar-foreground/5 p-1">
          <button
            onClick={() => setActiveTab("teach")}
            className={cn(
              "rounded-lg px-6 py-2 text-sm font-semibold transition-all",
              activeTab === "teach"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            I want to Teach
          </button>
          <button
            onClick={() => setActiveTab("learn")}
            className={cn(
              "rounded-lg px-6 py-2 text-sm font-semibold transition-all",
              activeTab === "learn"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            I want to Learn
          </button>
        </div>

        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "accent"} className="h-10">
          {showForm ? "Cancel" : "Create Post"}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-2 border-accent/20 bg-accent/5">
          <CardContent className="p-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
                  <Input 
                    required 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Intro to Next.js App Router" 
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value as "teach" | "learn")}
                    className="flex h-12 w-full items-center justify-between rounded-[8px] border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="teach">Teaching Session</option>
                    <option value="learn">Learning Request</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                <Textarea 
                  required 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="What will be covered or what do you need help with?" 
                  className="bg-white"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Session Date & Time (Optional)</label>
                <Input 
                  type="datetime-local" 
                  value={sessionDate} 
                  onChange={e => setSessionDate(e.target.value)} 
                  className="bg-white md:w-1/2"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting || !user?.mongoId} variant="dark">
                  {submitting ? "Posting..." : "Post Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Posts Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground/50" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center text-muted-foreground">
          <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-semibold text-foreground">No posts yet</p>
          <p className="text-sm">Be the first to post a {activeTab} request!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post) => {
            const isAuthor = user?.mongoId === post.author._id;
            const isRsvpd = Boolean(user?.mongoId && post.rsvps.includes(user.mongoId));
            const isFull = post.rsvps.length >= post.maxCap;
            
            return (
              <Card key={post._id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight">{post.title}</h3>
                    <span className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider",
                      post.type === 'teach' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    )}>
                      {post.type}
                    </span>
                  </div>
                  
                  <p className="mb-4 text-xs text-muted-foreground">
                    by <span className="font-medium text-foreground">{post.author.name}</span>
                  </p>

                  <p className="mb-6 flex-1 text-sm leading-relaxed text-foreground/80 line-clamp-3">
                    {post.description}
                  </p>

                  <div className="mt-auto space-y-4 rounded-xl bg-secondary/50 p-4">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{post.rsvps.length} / {post.maxCap} RSVPs</span>
                      </div>
                      {post.sessionDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(post.sessionDate), "MMM d, h:mm a")}</span>
                        </div>
                      )}
                    </div>

                    {!isAuthor && (
                        <Button 
                            variant={isRsvpd ? "outline" : "dark"} 
                            className="w-full h-9" 
                            disabled={!isRsvpd && isFull}
                            onClick={() => handleRsvp(post._id, isRsvpd)}
                        >
                            {isRsvpd ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                    RSVP Confirmed
                                </>
                            ) : isFull ? (
                                "Session Full"
                            ) : (
                                "RSVP Now"
                            )}
                        </Button>
                    )}
                    {isAuthor && (
                        <Button variant="ghost" disabled className="w-full h-9 bg-white/50 text-xs uppercase tracking-widest">
                            Your Post
                        </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
