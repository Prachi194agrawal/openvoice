import { CommonModule } from "@angular/common";
import { HttpClient, provideHttpClient } from "@angular/common/http";
import { Component, HostListener, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { bootstrapApplication } from "@angular/platform-browser";
import { firstValueFrom } from "rxjs";

type Role = "USER" | "ADMIN";
type ReactionType = "UPVOTE" | "DOWNVOTE";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: Role;
  isBlocked?: boolean;
};

type Reaction = {
  value: ReactionType | string;
  userId?: string;
};

type Post = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  tags?: string[];
  hashtags?: string[];
  createdAt: string;
  author: { id?: string; name?: string | null; email?: string | null };
  reactions: Reaction[];
  comments?: Comment[];
  _count?: { comments: number };
};

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  parentId?: string | null;
  postId: string;
  author: { id?: string; name?: string | null };
  reactions: Reaction[];
};

type Report = {
  id: string;
  reason: string;
  status: string;
  reporter: { id: string; name?: string | null; email?: string | null };
  post?: { id: string; title: string } | null;
  comment?: { id: string; body: string } | null;
};

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-bg" [class.signin-bg]="page === 'signin'">
      <div class="backdrop"></div>

      <section *ngIf="page === 'signin'; else authedApp" class="signin-page">
        <div class="signin-panel">
          <div class="brand-row"><span class="icon">OV</span><span>OpenVoice IIITM</span></div>
          <h1>Signup</h1>
          <p>Continue with your IIITM Google account.</p>
          <a *ngIf="!preview" class="primary full" href="/api/auth/signin/google">Continue with Google</a>
          <button *ngIf="preview" class="primary full" type="button" (click)="go('/')">Open preview directly</button>
        </div>
      </section>

      <ng-template #authedApp>
        <header class="topbar">
          <button class="icon-btn mobile-only" type="button" (click)="mobileOpen = !mobileOpen" aria-label="Menu">☰</button>
          <button class="brand-link" type="button" (click)="go('/')">OpenVoice IIITM</button>
          <form class="top-search" (ngSubmit)="submitTopSearch()">
            <span>⌕</span>
            <input name="topSearch" [(ngModel)]="topSearch" placeholder="Search discussions, tags, people...">
          </form>
          <div class="user-tools">
            <span class="avatar">{{ initials(sessionUser?.name || 'Student') }}</span>
            <span class="user-name">{{ sessionUser?.name || 'Student' }}</span>
            <button class="outline compact" type="button" (click)="logout()">Logout</button>
          </div>
        </header>

        <div class="mobile-menu" *ngIf="mobileOpen">
          <button type="button" (click)="go('/')">Home</button>
          <button type="button" (click)="go('/search')">Search</button>
          <button type="button" (click)="go('/profile')">Profile</button>
          <button *ngIf="isAdmin" type="button" (click)="go('/admin')">Admin</button>
        </div>

        <div class="layout">
          <aside class="sidebar">
            <button [class.active]="page === 'home'" type="button" (click)="go('/')">Home</button>
            <button [class.active]="page === 'search'" type="button" (click)="go('/search')">Search</button>
            <button [class.active]="page === 'profile'" type="button" (click)="go('/profile')">Profile</button>
            <button *ngIf="isAdmin" [class.active]="page === 'admin'" type="button" (click)="go('/admin')">Admin</button>
          </aside>

          <main>
            <p *ngIf="notice" class="notice">{{ notice }}</p>
            <p *ngIf="error" class="error">{{ error }}</p>

            <section *ngIf="page === 'home'">
              <form class="panel compose" (ngSubmit)="createPost()">
                <div class="compose-head">
                  <span class="avatar">OV</span>
                  <button *ngIf="!composeOpen" class="fake-input" type="button" (click)="composeOpen = true">
                    What's happening in IIITM?
                  </button>
                </div>
                <div *ngIf="composeOpen" class="compose-fields">
                  <input [(ngModel)]="newPost.title" name="title" placeholder="Post title">
                  <textarea [(ngModel)]="newPost.body" name="body" placeholder="Share your thoughts with IIITM..."></textarea>
                  <input [(ngModel)]="newPost.tags" name="tags" placeholder="Tags, e.g. academics, mess">
                  <input [(ngModel)]="newPost.hashtags" name="hashtags" placeholder="#hackathon #hostel-updates">
                  <div *ngIf="imagePreview" class="image-preview">
                    <img [src]="imagePreview" alt="">
                    <button type="button" (click)="clearImage()">Remove</button>
                  </div>
                  <div class="row between">
                    <label class="ghost compact">
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="uploadImage($event)" hidden>
                      {{ uploading ? 'Uploading...' : 'Image' }}
                    </label>
                    <div class="row">
                      <button class="ghost compact" type="button" (click)="composeOpen = false">Cancel</button>
                      <button class="primary compact" type="submit" [disabled]="posting || uploading">{{ posting ? 'Posting...' : 'Post' }}</button>
                    </div>
                  </div>
                </div>
              </form>

              <p *ngIf="loading" class="panel muted">Loading posts...</p>
              <p *ngIf="!loading && posts.length === 0" class="panel muted">No posts yet.</p>
              <ng-container *ngFor="let post of posts">
                <ng-container *ngTemplateOutlet="postCard; context: { post: post }"></ng-container>
              </ng-container>
            </section>

            <section *ngIf="page === 'search'">
              <form class="panel search-panel" (ngSubmit)="runSearch()">
                <input [(ngModel)]="query" name="q" placeholder="Search posts...">
                <div class="row meta"><span class="pill">{{ searchResults.length }} results</span><span *ngIf="query">Keyword: {{ query }}</span></div>
              </form>
              <p *ngIf="!loading && searchResults.length === 0" class="panel muted">No posts found.</p>
              <ng-container *ngFor="let post of searchResults">
                <ng-container *ngTemplateOutlet="postCard; context: { post: post, highlight: query }"></ng-container>
              </ng-container>
            </section>

            <section *ngIf="page === 'post' && selectedPost">
              <ng-container *ngTemplateOutlet="postCard; context: { post: selectedPost }"></ng-container>
              <div class="panel">
                <h2>Comments</h2>
                <form class="comment-form" (ngSubmit)="createComment(selectedPost.id)">
                  <textarea [(ngModel)]="newComment" name="newComment" placeholder="Write your comment..."></textarea>
                  <button class="primary compact" type="submit">Comment</button>
                </form>
                <ng-container *ngFor="let comment of rootComments(selectedPost.comments || [])">
                  <ng-container *ngTemplateOutlet="commentNode; context: { comment: comment, all: selectedPost.comments || [], depth: 0 }"></ng-container>
                </ng-container>
              </div>
            </section>

            <section *ngIf="page === 'profile'">
              <div class="panel profile-head">
                <span class="avatar large">{{ initials(sessionUser?.name || 'Student') }}</span>
                <div>
                  <h1>{{ sessionUser?.name || 'Student' }}</h1>
                  <p>{{ sessionUser?.email }}</p>
                </div>
              </div>
              <div class="tabs">
                <button [class.active]="profileTab === 'posts'" type="button" (click)="profileTab = 'posts'">Posts</button>
                <button [class.active]="profileTab === 'comments'" type="button" (click)="profileTab = 'comments'">Comments</button>
              </div>
              <div class="panel list-panel" *ngIf="profileTab === 'posts'">
                <h2>Your Posts</h2>
                <button *ngFor="let post of profilePosts" type="button" (click)="go('/posts/' + post.id)">{{ post.title }}</button>
              </div>
              <div class="panel list-panel" *ngIf="profileTab === 'comments'">
                <h2>Your Comments</h2>
                <button *ngFor="let comment of profileComments" type="button" (click)="go('/posts/' + comment.postId)">
                  {{ comment.body | slice:0:100 }} on {{ comment.post?.title }}
                </button>
              </div>
            </section>

            <section *ngIf="page === 'admin'">
              <div class="panel">
                <h1>Admin Dashboard</h1>
                <p class="muted">Moderate reported content, resolve abuse reports, and block users.</p>
              </div>
              <div class="panel table-panel">
                <input [(ngModel)]="reportFilter" name="reportFilter" placeholder="Filter by reporter, reason, or content...">
                <table>
                  <thead><tr><th>Reporter</th><th>Reason</th><th>Content</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let report of filteredReports()">
                      <td>{{ report.reporter.email }}</td>
                      <td>{{ report.reason }}</td>
                      <td>{{ report.post?.title || (report.comment?.body | slice:0:60) }}</td>
                      <td>{{ report.status }}</td>
                      <td class="actions">
                        <button class="primary compact" type="button" (click)="updateReport(report.id, 'RESOLVED')">Resolve</button>
                        <button class="danger compact" type="button" (click)="updateReport(report.id, 'REJECTED')">Delete</button>
                        <button class="outline compact" type="button" (click)="blockUser(report.reporter.id)">Ban User</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          <aside class="trending">
            <p class="eyebrow">Trending</p>
            <button *ngFor="let tag of trending" type="button" (click)="go('/search?q=' + encodeURIComponent('#' + tag))">#{{ tag }}</button>
            <p *ngIf="trending.length === 0" class="mini-card">Add hashtags to posts to see trends here.</p>
            <p class="eyebrow spaced">Announcements</p>
            <p class="mini-card">Campus-only platform: use your @iiitm.ac.in account for verified discussions.</p>
          </aside>
        </div>
      </ng-template>

      <ng-template #postCard let-post="post" let-highlight="highlight">
        <article class="panel post-card">
          <div class="author-row">
            <span class="avatar">{{ initials(post.author?.name || 'Student') }}</span>
            <div><strong>{{ post.author?.name || 'Anonymous' }}</strong><p>{{ timeAgo(post.createdAt) }}</p></div>
          </div>
          <button class="title-link" type="button" (click)="go('/posts/' + post.id)" [innerHTML]="marked(post.title, highlight)"></button>
          <div class="tags" *ngIf="post.tags?.length"><span *ngFor="let tag of post.tags">{{ tag }}</span></div>
          <div class="hashtags" *ngIf="post.hashtags?.length"><button *ngFor="let tag of post.hashtags" type="button" (click)="go('/search?q=' + encodeURIComponent('#' + tag))">#{{ tag }}</button></div>
          <img *ngIf="post.imageUrl" class="post-image" [src]="post.imageUrl" alt="">
          <p class="body" [innerHTML]="marked(post.body, highlight)"></p>
          <footer>
            <div class="row">
              <button [class.selected]="selectedReaction(post) === 'UPVOTE'" class="outline compact" type="button" (click)="react('/api/posts/' + post.id + '/react', 'UPVOTE')">Up {{ reactionCounts(post).likes }}</button>
              <button [class.selected]="selectedReaction(post) === 'DOWNVOTE'" class="outline compact" type="button" (click)="react('/api/posts/' + post.id + '/react', 'DOWNVOTE')">Down {{ reactionCounts(post).dislikes }}</button>
              <button class="outline compact" type="button" (click)="go('/posts/' + post.id)">Comments {{ post._count?.comments || post.comments?.length || 0 }}</button>
            </div>
            <div class="row">
              <button class="ghost compact" type="button" (click)="openReport('post', post.id)">Report</button>
              <button *ngIf="canDeletePost(post)" class="danger compact" type="button" (click)="deletePost(post.id)">Delete</button>
            </div>
          </footer>
        </article>
      </ng-template>

      <ng-template #commentNode let-comment="comment" let-all="all" let-depth="depth">
        <div class="comment-node" [style.margin-left.rem]="depth ? 1 : 0">
          <div class="comment-card">
            <div class="row between">
              <p class="muted small">{{ comment.author?.name || 'Student' }} · {{ timeAgo(comment.createdAt) }}</p>
              <button *ngIf="childComments(all, comment.id).length" class="ghost compact" type="button" (click)="toggleCollapse(comment.id)">
                {{ collapsed.has(comment.id) ? 'Expand' : 'Collapse' }} ({{ childComments(all, comment.id).length }})
              </button>
            </div>
            <p>{{ comment.body }}</p>
            <div class="row wrap">
              <button [class.selected]="selectedReaction(comment) === 'UPVOTE'" class="outline compact" type="button" (click)="react('/api/comments/' + comment.id + '/react', 'UPVOTE')">Up {{ reactionCounts(comment).likes }}</button>
              <button [class.selected]="selectedReaction(comment) === 'DOWNVOTE'" class="outline compact" type="button" (click)="react('/api/comments/' + comment.id + '/react', 'DOWNVOTE')">Down {{ reactionCounts(comment).dislikes }}</button>
              <button class="ghost compact" type="button" (click)="replyingTo = replyingTo === comment.id ? null : comment.id">Reply</button>
              <button class="ghost compact" type="button" (click)="openReport('comment', comment.id)">Report</button>
              <button *ngIf="canDeleteComment(comment)" class="danger compact" type="button" (click)="deleteComment(comment.id)">Delete</button>
            </div>
            <form *ngIf="replyingTo === comment.id" class="comment-form" (ngSubmit)="createComment(comment.postId, comment.id)">
              <textarea [(ngModel)]="replyBody" name="replyBody" placeholder="Write your reply..."></textarea>
              <button class="primary compact" type="submit">Reply</button>
            </form>
          </div>
          <ng-container *ngIf="!collapsed.has(comment.id)">
            <ng-container *ngFor="let child of childComments(all, comment.id)">
              <ng-container *ngTemplateOutlet="commentNode; context: { comment: child, all: all, depth: depth + 1 }"></ng-container>
            </ng-container>
          </ng-container>
        </div>
      </ng-template>

      <div class="modal-backdrop" *ngIf="reportTarget" (click)="reportTarget = null"></div>
      <form class="modal panel" *ngIf="reportTarget" (ngSubmit)="submitReport()">
        <h2>Report content</h2>
        <textarea [(ngModel)]="reportReason" name="reportReason" placeholder="Brief reason..."></textarea>
        <div class="row end">
          <button class="outline compact" type="button" (click)="reportTarget = null">Cancel</button>
          <button class="primary compact" type="submit" [disabled]="reportReason.length < 4">Submit</button>
        </div>
      </form>
    </div>
  `
})
class AppComponent implements OnInit {
  private http = inject(HttpClient);

  page: "home" | "search" | "post" | "profile" | "admin" | "signin" = "home";
  sessionUser: User | null = null;
  preview = false;
  isAdmin = false;
  mobileOpen = false;
  loading = false;
  error = "";
  notice = "";
  topSearch = "";
  query = "";
  posts: Post[] = [];
  searchResults: Post[] = [];
  selectedPost: Post | null = null;
  trending: string[] = [];
  composeOpen = false;
  posting = false;
  uploading = false;
  imagePreview: string | null = null;
  newPost = { title: "", body: "", tags: "", hashtags: "", imageUrl: "" };
  newComment = "";
  replyBody = "";
  replyingTo: string | null = null;
  collapsed = new Set<string>();
  reportTarget: { kind: "post" | "comment"; id: string } | null = null;
  reportReason = "";
  profileTab: "posts" | "comments" = "posts";
  profilePosts: Post[] = [];
  profileComments: Array<Comment & { post?: { id: string; title: string } }> = [];
  reports: Report[] = [];
  reportFilter = "";
  encodeURIComponent = encodeURIComponent;

  async ngOnInit() {
    await this.loadSession();
    await this.loadTrending();
    await this.route();
  }

  @HostListener("window:popstate")
  async route() {
    this.error = "";
    this.notice = "";
    this.mobileOpen = false;
    const path = window.location.pathname;
    if (path === "/signin") {
      this.page = "signin";
      return;
    }
    if (path.startsWith("/posts/")) {
      this.page = "post";
      await this.loadPost(path.split("/").filter(Boolean)[1]);
      return;
    }
    if (path === "/search") {
      this.page = "search";
      this.query = new URLSearchParams(window.location.search).get("q") || "";
      await this.runSearch(false);
      return;
    }
    if (path === "/profile") {
      this.page = "profile";
      await this.loadProfile();
      return;
    }
    if (path === "/admin") {
      this.page = "admin";
      if (!this.isAdmin) {
        this.go("/");
        return;
      }
      await this.loadReports();
      return;
    }
    this.page = "home";
    await this.loadPosts();
  }

  async loadSession() {
    const session = await firstValueFrom(this.http.get<{ user: User | null; preview: boolean }>("/api/session"));
    this.sessionUser = session.user;
    this.preview = session.preview;
    this.isAdmin = session.user?.role === "ADMIN";
  }

  async loadTrending() {
    this.trending = await firstValueFrom(this.http.get<string[]>("/api/meta/trending"));
  }

  async loadPosts() {
    this.loading = true;
    this.posts = await firstValueFrom(this.http.get<Post[]>("/api/posts"));
    this.loading = false;
  }

  async loadPost(id: string) {
    this.loading = true;
    try {
      this.selectedPost = await firstValueFrom(this.http.get<Post>(`/api/posts/${id}`));
    } catch {
      this.error = "Post not found.";
      this.selectedPost = null;
    }
    this.loading = false;
  }

  async loadProfile() {
    const data = await firstValueFrom(this.http.get<{ user: User; posts: Post[]; comments: Array<Comment & { post?: { id: string; title: string } }> }>("/api/profile"));
    this.sessionUser = data.user;
    this.profilePosts = data.posts;
    this.profileComments = data.comments;
  }

  async loadReports() {
    this.reports = await firstValueFrom(this.http.get<Report[]>("/api/reports"));
  }

  async runSearch(push = true) {
    if (push) this.push(`/search${this.query ? `?q=${encodeURIComponent(this.query)}` : ""}`);
    this.loading = true;
    this.searchResults = this.query.trim()
      ? await firstValueFrom(this.http.get<Post[]>(`/api/posts/search?q=${encodeURIComponent(this.query)}`))
      : [];
    this.loading = false;
  }

  submitTopSearch() {
    this.go(`/search?q=${encodeURIComponent(this.topSearch)}`);
    this.topSearch = "";
  }

  async createPost() {
    this.posting = true;
    try {
      await firstValueFrom(this.http.post("/api/posts", this.newPost));
      this.newPost = { title: "", body: "", tags: "", hashtags: "", imageUrl: "" };
      this.clearImage();
      this.composeOpen = false;
      this.notice = "Post created.";
      await this.loadPosts();
      await this.loadTrending();
    } catch (error) {
      this.error = this.messageFrom(error, "Could not create post.");
    }
    this.posting = false;
  }

  async uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading = true;
    const form = new FormData();
    form.append("file", file);
    try {
      const data = await firstValueFrom(this.http.post<{ url: string }>("/api/upload", form));
      this.newPost.imageUrl = data.url;
      this.imagePreview = data.url;
      this.notice = "Image attached.";
    } catch (error) {
      this.error = this.messageFrom(error, "Could not upload image.");
      this.clearImage();
    }
    this.uploading = false;
  }

  clearImage() {
    this.newPost.imageUrl = "";
    this.imagePreview = null;
  }

  async createComment(postId: string, parentId?: string) {
    const body = parentId ? this.replyBody : this.newComment;
    try {
      await firstValueFrom(this.http.post("/api/comments", { postId, body, parentId }));
      this.newComment = "";
      this.replyBody = "";
      this.replyingTo = null;
      await this.loadPost(postId);
    } catch (error) {
      this.error = this.messageFrom(error, "Comment failed.");
    }
  }

  async react(endpoint: string, value: ReactionType) {
    try {
      await firstValueFrom(this.http.post(endpoint, { value }));
      await this.refreshCurrent();
    } catch {
      this.error = "Unable to react.";
    }
  }

  async deletePost(id: string) {
    if (!window.confirm("Permanently delete this post? This cannot be undone.")) return;
    try {
      await firstValueFrom(this.http.delete(`/api/posts/${id}`));
      this.go("/");
    } catch (error) {
      this.error = this.messageFrom(error, "Failed to delete post.");
    }
  }

  async deleteComment(id: string) {
    if (!window.confirm("Permanently delete this comment and all of its replies?")) return;
    try {
      await firstValueFrom(this.http.delete(`/api/comments/${id}`));
      if (this.selectedPost) await this.loadPost(this.selectedPost.id);
    } catch (error) {
      this.error = this.messageFrom(error, "Failed to delete comment.");
    }
  }

  openReport(kind: "post" | "comment", id: string) {
    this.reportTarget = { kind, id };
    this.reportReason = "";
  }

  async submitReport() {
    if (!this.reportTarget) return;
    const body = {
      reason: this.reportReason,
      postId: this.reportTarget.kind === "post" ? this.reportTarget.id : undefined,
      commentId: this.reportTarget.kind === "comment" ? this.reportTarget.id : undefined,
    };
    try {
      await firstValueFrom(this.http.post("/api/reports", body));
      this.reportTarget = null;
      this.notice = "Report submitted.";
    } catch {
      this.error = "Could not submit report.";
    }
  }

  async updateReport(id: string, status: "RESOLVED" | "REJECTED") {
    try {
      await firstValueFrom(this.http.patch(`/api/reports/${id}`, { status }));
      this.notice = "Updated.";
      await this.loadReports();
    } catch {
      this.error = "Action failed.";
    }
  }

  async blockUser(userId: string) {
    try {
      await firstValueFrom(this.http.patch(`/api/admin/users/${userId}/block`, {}));
      this.notice = "User blocked.";
    } catch {
      this.error = "Unable to block user.";
    }
  }

  async logout() {
    const csrf = await firstValueFrom(this.http.get<{ csrfToken: string }>("/api/auth/csrf"));
    const body = new URLSearchParams({ csrfToken: csrf.csrfToken, callbackUrl: "/signin" });
    await firstValueFrom(this.http.post("/api/auth/signout", body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      responseType: "text",
    }));
    window.location.href = "/signin";
  }

  go(url: string) {
    this.push(url);
    void this.route();
  }

  push(url: string) {
    window.history.pushState({}, "", url);
  }

  async refreshCurrent() {
    if (this.page === "post" && this.selectedPost) await this.loadPost(this.selectedPost.id);
    else if (this.page === "search") await this.runSearch(false);
    else await this.loadPosts();
  }

  rootComments(comments: Comment[]) {
    return comments.filter((comment) => !comment.parentId);
  }

  childComments(comments: Comment[], parentId: string) {
    return comments.filter((comment) => comment.parentId === parentId);
  }

  toggleCollapse(id: string) {
    if (this.collapsed.has(id)) this.collapsed.delete(id);
    else this.collapsed.add(id);
    this.collapsed = new Set(this.collapsed);
  }

  reactionCounts(item: { reactions?: Reaction[] }) {
    const reactions = item.reactions || [];
    return {
      likes: reactions.filter((reaction) => reaction.value === "UPVOTE" || reaction.value === "LIKE").length,
      dislikes: reactions.filter((reaction) => reaction.value === "DOWNVOTE" || reaction.value === "DISLIKE").length,
    };
  }

  selectedReaction(item: { reactions?: Reaction[] }) {
    const raw = item.reactions?.find((reaction) => reaction.userId === this.sessionUser?.id)?.value;
    if (raw === "UPVOTE" || raw === "DOWNVOTE") return raw;
    if (raw === "LIKE") return "UPVOTE";
    if (raw === "DISLIKE") return "DOWNVOTE";
    return null;
  }

  canDeletePost(post: Post) {
    return Boolean(this.sessionUser?.id && (this.isAdmin || this.sessionUser.id === post.author?.id));
  }

  canDeleteComment(comment: Comment) {
    return Boolean(this.sessionUser?.id && (this.isAdmin || this.sessionUser.id === comment.author?.id));
  }

  filteredReports() {
    const filter = this.reportFilter.toLowerCase();
    return this.reports.filter((report) =>
      `${report.reporter.email || ""} ${report.reason} ${report.post?.title || ""} ${report.comment?.body || ""}`.toLowerCase().includes(filter)
    );
  }

  initials(name: string) {
    return name.split(" ").map((chunk) => chunk[0]).join("").slice(0, 2).toUpperCase();
  }

  timeAgo(value: string) {
    const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  marked(text = "", query = "") {
    const escaped = this.escape(text);
    if (!query.trim()) return escaped;
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return escaped.replace(new RegExp(`(${safeQuery})`, "gi"), "<mark>$1</mark>");
  }

  escape(value: string) {
    return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] || char);
  }

  messageFrom(error: unknown, fallback: string) {
    const maybe = error as { error?: { error?: string } };
    return maybe.error?.error || fallback;
  }
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()],
}).catch((error) => console.error(error));
