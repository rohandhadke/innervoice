import { useState, useEffect, useCallback } from 'react';
import { getPosts } from '../api/posts';
import PostCard from '../components/PostCard';
import { MOODS } from '../components/MoodPicker';
import toast from 'react-hot-toast';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moodFilter, setMoodFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 12;

  const fetchPosts = useCallback(async (skip = 0, mood = null, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = { skip, limit: LIMIT };
      if (mood) params.mood = mood;
      const res = await getPosts(params);
      if (append) {
        setPosts((prev) => [...prev, ...res.data]);
      } else {
        setPosts(res.data);
      }
      setHasMore(res.data.length === LIMIT);
    } catch {
      toast.error('Could not load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(0);
    fetchPosts(0, moodFilter, false);
  }, [moodFilter, fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage * LIMIT, moodFilter, true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Share Your{' '}
          <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
            Inner World
          </span>
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          A safe space to express your thoughts and feelings — anonymously or openly.
        </p>
      </div>

      {/* Mood Filter Bar */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filter by mood</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setMoodFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              !moodFilter
                ? 'bg-gray-800 text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setMoodFilter(moodFilter === mood.value ? null : mood.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                moodFilter === mood.value
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {mood.emoji} {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-brand-300 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-400">Loading thoughts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-600 mb-1">No thoughts yet</h2>
          <p className="text-sm text-gray-400">Be the first to share what's on your mind.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-secondary"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  'Load more'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
