import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, getMyPosts } from '../api/posts';
import { getSavedPosts } from '../api/saved';
import { logMood } from '../api/moodlog';
import PostCard from '../components/PostCard';
import { MOODS } from '../components/MoodPicker';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('posts');
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moodLogging, setMoodLogging] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [myPostsRes, postsRes, savedRes] = await Promise.all([
        getMyPosts(),
        getPosts({ limit: 200 }),
        getSavedPosts(),
      ]);
      setMyPosts(myPostsRes.data);
      setAllPosts(postsRes.data);
      setSavedPosts(savedRes.data);
    } catch {
      toast.error('Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMoodLog = async (mood) => {
    setMoodLogging(mood);
    try {
      await logMood({ mood });
      toast.success(`Mood logged: ${MOODS.find((m) => m.value === mood)?.emoji} ${mood}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not log mood');
    } finally {
      setMoodLogging(null);
    }
  };

  // Get the post data for saved posts
  const savedPostsData = savedPosts
    .map((s) => allPosts.find((p) => p.id === s.post_id))
    .filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          {user?.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={user.username}
              className="w-14 h-14 rounded-full object-cover shadow-md shadow-brand-200/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-brand-200/30">
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Hey, {user?.full_name || user?.username} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Here's your personal space.</p>
          </div>
        </div>
        <Link
          to="/edit-profile"
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-brand-500 font-medium hover:text-brand-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </Link>
      </div>

      {/* Mood Check-in */}
      <div className="glass-card p-5 sm:p-6 mb-8 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">How are you feeling today?</h2>
            <p className="text-xs text-gray-400">Take a moment to check in with yourself</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodLog(mood.value)}
              disabled={moodLogging === mood.value}
              className={`
                px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                bg-gray-50 text-gray-600 hover:bg-brand-50 hover:text-brand-600
                hover:scale-[1.03] active:scale-[0.97]
                ${moodLogging === mood.value ? 'animate-pulse-soft ring-2 ring-brand-300' : ''}
              `}
            >
              <span className="mr-1">{mood.emoji}</span>
              {mood.label}
            </button>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link
            to="/mood-journal"
            className="text-xs text-brand-500 font-medium hover:text-brand-600 transition-colors inline-flex items-center gap-1"
          >
            View mood journal
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('posts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === 'posts'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Posts ({myPosts.length})
        </button>
        <button
          onClick={() => setTab('saved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === 'saved'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Saved ({savedPostsData.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'posts' ? (
        myPosts.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-400 text-sm mb-3">You haven't written any posts yet.</p>
            <Link to="/write" className="btn-primary text-sm">
              Write your first post
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {myPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )
      ) : savedPostsData.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-400 text-sm mb-3">No saved posts yet.</p>
          <Link to="/" className="btn-primary text-sm">
            Explore posts
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {savedPostsData.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
