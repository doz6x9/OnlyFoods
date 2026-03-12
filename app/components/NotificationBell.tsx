'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Bell, BookOpen, MessageSquare, Inbox, Loader2, CheckCircle2 } from 'lucide-react';

interface Notification {
  id: string;
  type: 'request' | 'comment' | 'recipe_added';
  requesterName: string; // For 'recipe_added', this is the author
  requesterAvatar: string | null;
  postTitle: string;
  postId: string;
  createdAt: string;
  content?: string;
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const supabase = createClient();

      try {
        // --- 1. NOTIFICATIONS FOR ME (Requests & Comments on MY posts) ---

        // Fetch my posts
        const { data: myPosts, error: myPostsError } = await supabase
          .from('posts')
          .select('id, description')
          .eq('user_id', userId);

        if (myPostsError) throw myPostsError;

        let requests: any[] = [];
        let comments: any[] = [];

        if (myPosts && myPosts.length > 0) {
          const myPostIds = myPosts.map(p => p.id);

          // Fetch requests on my posts
          const { data: reqs } = await supabase
            .from('recipe_requests')
            .select(`
              created_at,
              post_id,
              user_id,
              profiles (email, avatar_url)
            `)
            .in('post_id', myPostIds)
            .neq('user_id', userId);
          if (reqs) requests = reqs;

          // Fetch comments on my posts
          const { data: comms } = await supabase
            .from('comments')
            .select(`
              id,
              content,
              created_at,
              post_id,
              user_id,
              profiles (email, avatar_url)
            `)
            .in('post_id', myPostIds)
            .neq('user_id', userId);
          if (comms) comments = comms;
        }

        // --- 2. NOTIFICATIONS FROM OTHERS (Recipe Added to posts I requested) ---

        // Fetch requests I made
        const { data: myRequests, error: myReqError } = await supabase
          .from('recipe_requests')
          .select('post_id, created_at')
          .eq('user_id', userId);

        if (myReqError) throw myReqError;

        let recipeAddedNotifs: any[] = [];

        if (myRequests && myRequests.length > 0) {
          const requestedPostIds = myRequests.map(r => r.post_id);

          // Check if any of these posts now have a recipe
          // We also fetch the author's profile
          const { data: fulfilledPosts } = await supabase
            .from('posts')
            .select(`
              id,
              description,
              has_recipe,
              created_at,
              updated_at,
              profiles!posts_user_id_fkey (email, avatar_url)
            `)
            .in('id', requestedPostIds)
            .eq('has_recipe', true); // Only if recipe is added

          if (fulfilledPosts) {
            recipeAddedNotifs = fulfilledPosts;
          }
        }

        // --- 3. MERGE & TRANSFORM ---

        let allNotifs: Notification[] = [];

        // Add Requests
        allNotifs = allNotifs.concat(requests.map((req: any) => {
          const post = myPosts?.find(p => p.id === req.post_id);
          return {
            id: `req_${req.user_id}_${req.post_id}`,
            type: 'request',
            requesterName: req.profiles?.email?.split('@')[0] || 'Someone',
            requesterAvatar: req.profiles?.avatar_url,
            postTitle: post?.description || 'your meal',
            postId: req.post_id,
            createdAt: req.created_at,
          };
        }));

        // Add Comments
        allNotifs = allNotifs.concat(comments.map((comment: any) => {
          const post = myPosts?.find(p => p.id === comment.post_id);
          return {
            id: `com_${comment.id}`,
            type: 'comment',
            requesterName: comment.profiles?.email?.split('@')[0] || 'Someone',
            requesterAvatar: comment.profiles?.avatar_url,
            postTitle: post?.description || 'your meal',
            postId: comment.post_id,
            createdAt: comment.created_at,
            content: comment.content,
          };
        }));

        // Add Recipe Added
        // Note: 'created_at' for this notification ideally should be when the recipe was added.
        // We don't track 'recipe_added_at' explicitly, so we'll use the post's 'updated_at' if available, or 'created_at' as fallback.
        // If 'updated_at' column doesn't exist, we might need to add it or just use post creation time (less accurate).
        // Assuming Supabase usually has updated_at or we can just use the post's created_at for now.
        // Actually, let's use the time the request was made for sorting if updated_at is missing, but that's old.
        // Let's check if we can query for updated_at. Standard Supabase tables don't always have it auto-updated unless configured.
        // For now, I'll use the post's created_at, which means these might appear lower in the list than ideally desired,
        // but they will still be there. A better fix is adding an `updated_at` column.

        allNotifs = allNotifs.concat(recipeAddedNotifs.map((post: any) => {
           return {
            id: `added_${post.id}`,
            type: 'recipe_added',
            requesterName: post.profiles?.email?.split('@')[0] || 'Author',
            requesterAvatar: post.profiles?.avatar_url,
            postTitle: post.description,
            postId: post.id,
            // Use updated_at if available, otherwise just use current time to bump it? No, bad practice.
            // Using post.created_at for now.
            createdAt: post.updated_at || post.created_at,
          };
        }));

        // Sort by date (newest first)
        allNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setNotifications(allNotifs);
      } catch (error) {
        console.error('Unexpected error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  return (
    <div className="relative group">
      <button
        className="relative p-2 text-slate-600 hover:text-red-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right transition-all"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700">Notifications</h3>
            {notifications.length > 0 && (
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                {notifications.length} new
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 flex justify-center items-center text-slate-400">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center text-slate-400">
                <Inbox size={32} className="mb-2 opacity-50" />
                <p className="text-xs text-slate-500 font-medium">No new activity.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.type === 'request' ? `/post/${notif.postId}/add-recipe` : `/post/${notif.postId}`}
                  className={`block px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${notif.type === 'recipe_added' ? 'bg-orange-50/50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1 text-slate-500">
                      {notif.type === 'request' && <BookOpen size={16} className="text-orange-500" />}
                      {notif.type === 'comment' && <MessageSquare size={16} className="text-blue-500" />}
                      {notif.type === 'recipe_added' && <CheckCircle2 size={16} className="text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900">{notif.requesterName}</span>
                        {notif.type === 'request' && <> requested the recipe for <span className="italic text-slate-600">"{notif.postTitle.slice(0, 20)}..."</span></>}
                        {notif.type === 'comment' && <> commented on <span className="italic text-slate-600">"{notif.postTitle.slice(0, 20)}..."</span></>}
                        {notif.type === 'recipe_added' && <> added the recipe for <span className="italic text-slate-600">"{notif.postTitle.slice(0, 20)}..."</span></>}
                      </p>

                      {notif.type === 'comment' && notif.content && (
                        <p className="text-slate-500 italic mt-1 truncate">"{notif.content}"</p>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                        {notif.type === 'request' && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 rounded-full">Request</span>}
                        {notif.type === 'comment' && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded-full">Comment</span>}
                        {notif.type === 'recipe_added' && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 rounded-full">Ready!</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
