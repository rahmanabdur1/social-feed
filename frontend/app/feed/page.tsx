"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { fetchPosts, createPost, deletePost, likePost } from "../../src/lib/posts";
import { logout } from "../../src/lib/auth";
import api from "../../src/lib/axios";
import Comments from "./comments";

interface Post {
  id: string;
  content: string;
  image_url?: string;
  is_private: boolean;
  user_id: string;
  created_at: string;
}

interface CurrentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current user
  useEffect(() => {
    api.get("/users/me")
      .then((res) => setCurrentUser(res.data))
      .catch(() => {});
  }, []);

  const loadPosts = useCallback(async (cur?: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await fetchPosts(cur, 10);
      const newPosts: Post[] = data.posts || [];

      if (cur) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const unique = newPosts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...unique];
        });
      } else {
        setPosts(newPosts);
      }

      setCursor(data.next_cursor || null);
      setHasMore(!!data.next_cursor);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCreate = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await createPost(content, isPrivate, image || undefined);
      const newPost: Post = res.post;
      setPosts((prev) => [newPost, ...prev]);
      setContent("");
      setImage(null);
      setIsPrivate(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Failed to create post", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
    } catch (err) {
      console.error("Failed to like", err);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      alert("Could not delete post.");
    }
  };

  const handleLoadMore = async () => {
    if (!cursor || loading) return;
    await loadPosts(cursor);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f7] px-4 py-6 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📰 Feed</h1>
        {currentUser && (
          <button
            onClick={logout}
            className="bg-gradient-to-r from-[#4252b4] to-[#3646a8] text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Logout
          </button>
        )}
      </header>

      {/* Create Post */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 mb-6">
        <textarea
          className="w-full border-b py-3 outline-none focus:border-[#4252b4] resize-none text-gray-700"
          placeholder="What's on your mind?"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="text-sm text-gray-500"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            🔒 Private
          </label>
          <button
            onClick={handleCreate}
            disabled={posting || !content.trim()}
            className="ml-auto bg-gradient-to-r from-[#4252b4] to-[#3646a8] text-white px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 && !loading && (
        <p className="text-center text-gray-400 mt-10">
          No posts yet. Be the first!
        </p>
      )}

      {posts.map((post) => (
        <div key={post.id} className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-400">
              {post.is_private ? "🔒 Private" : "🌍 Public"} ·{" "}
              {new Date(post.created_at).toLocaleString()}
            </span>
            {currentUser && post.user_id === currentUser.id && (
              <button
                onClick={() => handleDelete(post.id)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                🗑 Delete
              </button>
            )}
          </div>

          <p className="text-gray-800 mb-3">{post.content}</p>

          {post.image_url && (
            <Image
              src={post.image_url}
              alt="post"
              width={600}
              height={400}
              className="w-full rounded-lg mb-3 max-h-80 object-cover"
            />
          )}

          <div className="flex gap-4 text-sm text-gray-500 border-t pt-2">
            <button
              onClick={() => handleLike(post.id)}
              className="hover:text-red-500 transition"
            >
              ❤️ Like
            </button>
            <button
              onClick={() =>
                setOpenComments(openComments === post.id ? null : post.id)
              }
              className="hover:text-blue-500 transition"
            >
              💬 Comment
            </button>
          </div>

          {openComments === post.id && <Comments postId={post.id} />}
        </div>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full max-w-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-xl text-sm font-medium disabled:opacity-50 mb-6"
        >
          {loading ? "Loading..." : "Load more posts"}
        </button>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-gray-300 text-sm mb-6">
          No more posts
        </p>
      )}
    </div>
  );
}