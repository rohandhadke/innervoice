import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, deletePost } from '../api/posts';
import { savePost, unsavePost } from '../api/saved';
import ReactionBar from '../components/ReactionBar';
import CommentBox from '../components/CommentBox';
import useAuthStore from '../store/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import toast from 'react-hot-toast';

dayjs.extend(relativeTime);
dayjs.extend(utc);

const MOOD_EMOJI = {
  happy: '😊', sad: '😢', anxious: '😰', angry: '😠', confused: '😕',
  grateful: '🙏', lost: '🌫️', hopeful: '🌟', numb: '😶', exhausted: '😩',
};

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await getPost(postId);
      setPost(res.data);
    } catch {
      toast.error('Post not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated()) {
      toast.error('Please login to save posts');
      return;
    }
    setSavingPost(true);
    try {
      if (saved) {
        await unsavePost(postId);
        setSaved(false);
        toast.success('Post unsaved');
      } else {
        await savePost(postId);
        setSaved(true);
        toast.success('Post saved');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not save post');
    } finally {
      setSavingPost(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeleting(true);
    try {
      await deletePost(postId);
      toast.success('Post deleted');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not delete post');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-brand-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  const isOwner = user && post.user_id === user.id;

  // Resolve display name and avatar for non-anonymous posts
  const displayName = post.is_anonymous
    ? 'Anonymous'
    : isOwner
      ? user.username
      : `User #${post.user_id}`;
  const profilePicture = !post.is_anonymous && isOwner ? user.profile_picture_url : null;
  const avatarLetter = !post.is_anonymous && isOwner
    ? user.username[0].toUpperCase()
    : 'U';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost text-sm mb-6 -ml-2"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Post */}
      <article className="glass-card p-6 sm:p-8 mb-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {post.is_anonymous ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            ) : profilePicture ? (
              <img
                src={profilePicture}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                {avatarLetter}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700">
                {displayName}
              </p>
              <p className="text-xs text-gray-400">{dayjs.utc(post.created_at).local().fromNow()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.mood && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 text-xs font-medium">
                {MOOD_EMOJI[post.mood] || '💭'} {post.mood}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-800 leading-relaxed text-[16px] whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <ReactionBar postId={post.id} reactions={post.reactions || []} />

          <div className="flex items-center gap-2">
            {isAuthenticated() && (
              <button
                onClick={handleSave}
                disabled={savingPost}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  saved
                    ? 'text-brand-500 bg-brand-50 hover:bg-brand-100'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
                title={saved ? 'Unsave' : 'Save'}
              >
                <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}

            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                title="Delete post"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Comments */}
      <CommentBox postId={post.id} />
    </div>
  );
}
