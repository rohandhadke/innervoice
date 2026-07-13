import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { addComment, getComments, getReplies } from '../api/comments';
import { formatTime } from '../utils/formatTime';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

function CommentItem({ comment, postId, depth = 0 }) {
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated();

  // Resolve display name and avatar using backend's author field
  const isOwnComment = user && comment.user_id === user.id;
  const author = comment.author; // { username, profile_picture_url } from backend

  let displayName, profilePicture, avatarLetter, authorUsername;

  if (comment.is_anonymous) {
    displayName = 'Anonymous';
    profilePicture = null;
    avatarLetter = null;
    authorUsername = null;
  } else if (author?.username) {
    // Backend provided author info — use it (works for ALL users)
    displayName = author.username;
    profilePicture = author.profile_picture_url;
    avatarLetter = author.username[0].toUpperCase();
    authorUsername = author.username;
  } else if (isOwnComment && user) {
    // Fallback for own comment if author field is missing
    displayName = user.username;
    profilePicture = user.profile_picture_url;
    avatarLetter = user.username[0].toUpperCase();
    authorUsername = user.username;
  } else {
    displayName = 'Unknown';
    profilePicture = null;
    avatarLetter = '?';
    authorUsername = null;
  }

  const fetchReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setLoadingReplies(true);
    try {
      const res = await getReplies(postId, comment.id);
      setReplies(res.data);
      setShowReplies(true);
    } catch {
      toast.error('Could not load replies');
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await addComment(postId, {
        content: replyText.trim(),
        is_anonymous: loggedIn ? isAnonymous : true,
        parent_comment_id: comment.id,
      });
      setReplies((prev) => [...prev, res.data]);
      setReplyText('');
      setShowReplyInput(false);
      setShowReplies(true);
      toast.success('Reply added');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-100' : ''}`}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-1">
          {comment.is_anonymous ? (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          ) : profilePicture ? (
            <img
              src={profilePicture}
              alt={displayName}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">
                {avatarLetter}
              </span>
            </div>
          )}
          {!comment.is_anonymous && authorUsername ? (
            <Link to={`/user/${authorUsername}`} className="text-xs font-medium text-gray-600 hover:text-brand-500 transition-colors">
              {displayName}
            </Link>
          ) : (
            <span className="text-xs font-medium text-gray-600">
              {displayName}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {formatTime(comment.created_at)}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed ml-8">
          {comment.content}
        </p>
        <div className="flex items-center gap-3 ml-8 mt-1.5">
          <button
            onClick={fetchReplies}
            className="text-xs text-gray-400 hover:text-brand-500 transition-colors"
            disabled={loadingReplies}
          >
            {loadingReplies ? 'Loading...' : showReplies ? 'Hide replies' : 'Replies'}
          </button>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs text-gray-400 hover:text-brand-500 transition-colors"
          >
            Reply
          </button>
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <form onSubmit={handleSubmitReply} className="ml-8 mt-2 animate-fade-in">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="input-field text-sm py-2"
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting || !replyText.trim()}
                className="btn-primary text-xs px-3 py-2 whitespace-nowrap"
              >
                {submitting ? '...' : 'Send'}
              </button>
            </div>
            {loggedIn ? (
              <label className="flex items-center gap-1.5 mt-1.5 ml-1">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-300"
                />
                <span className="text-xs text-gray-400">Anonymous</span>
              </label>
            ) : (
              <p className="text-xs text-gray-400 mt-1.5 ml-1">You are replying anonymously</p>
            )}
          </form>
        )}

        {/* Nested replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-2">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentBox({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated();

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getComments(postId);
      setComments(res.data);
    } catch {
      toast.error('Could not load comments');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await addComment(postId, {
        content: text.trim(),
        is_anonymous: loggedIn ? isAnonymous : true,
      });
      setComments((prev) => [...prev, res.data]);
      setText('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments
      </h3>

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-brand-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="divide-y divide-gray-50 mb-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4 mt-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            className="input-field text-sm"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="btn-primary text-sm whitespace-nowrap"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send'
            )}
          </button>
        </div>
        {loggedIn ? (
          <label className="flex items-center gap-1.5 mt-2 ml-1">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-300"
            />
            <span className="text-xs text-gray-400">Post anonymously</span>
          </label>
        ) : (
          <p className="text-xs text-gray-400 mt-2 ml-1">You are commenting anonymously</p>
        )}
      </form>
    </div>
  );
}
