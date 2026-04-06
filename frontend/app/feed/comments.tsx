"use client";
import { useState, useEffect, useCallback } from "react";
import {
  fetchComments,
  createComment,
  likeComment,
  deleteComment,
} from "../../src/lib/comments";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  parent_id?: string;
}

export default function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadComments = useCallback(async () => {
    const data = await fetchComments(postId);
    setComments(data);
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [postId, loadComments]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await createComment(postId, text, replyTo || undefined);
      setText("");
      setReplyTo(null);
      await loadComments();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    await likeComment(commentId);
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="mt-3 border-t pt-3">

      {/* Comments */}
      {topLevel.map((comment) => (
        <div key={comment.id} className="mb-3">
          <div className="bg-gray-50 rounded-lg p-2 text-sm">
            <p className="text-gray-800">{comment.content}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(comment.created_at).toLocaleString()}
            </p>
            <div className="flex gap-3 mt-1 text-xs text-gray-400">
              <button
                onClick={() => handleLike(comment.id)}
                className="hover:text-red-400"
              >
                ❤️ Like
              </button>
              <button
                onClick={() => setReplyTo(comment.id)}
                className="hover:text-blue-400"
              >
                ↩ Reply
              </button>
              <button
                onClick={() => handleDelete(comment.id)}
                className="hover:text-red-500"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Replies */}
          {replies(comment.id).map((reply) => (
            <div
              key={reply.id}
              className="ml-6 mt-1 bg-gray-100 rounded-lg p-2 text-sm"
            >
              <p className="text-gray-700">{reply.content}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-400">
                <button
                  onClick={() => handleLike(reply.id)}
                  className="hover:text-red-400"
                >
                  ❤️ Like
                </button>
                <button
                  onClick={() => handleDelete(reply.id)}
                  className="hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Reply indicator */}
      {replyTo && (
        <p className="text-xs text-blue-400 mb-1">
          Replying to a comment ·{" "}
          <button
            onClick={() => setReplyTo(null)}
            className="underline hover:text-blue-600"
          >
            cancel
          </button>
        </p>
      )}

      {/* Input */}
      <div className="flex gap-2 mt-2">
        <input
          className="border border-gray-200 rounded-lg p-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}