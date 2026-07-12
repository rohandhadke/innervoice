import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import { getPosts, getPost } from '../api/posts';
import { getSavedPosts } from '../api/users';
import PostCard from '../components/PostCard';
import useAuthStore from '../store/authStore';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import toast from 'react-hot-toast';

dayjs.extend(utc);

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('posts');
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    refreshUser();
    fetchMyPosts();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
    } catch {
      // Use cached user data
    }
  };

  const fetchMyPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await getPosts({ limit: 100 });
      const filtered = res.data.filter((p) => p.user_id === user?.id);
      setMyPosts(filtered);
    } catch {
      toast.error('Could not load your posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchSavedPosts = async () => {
    if (savedPosts.length > 0) return; // already loaded
    setLoadingSaved(true);
    try {
      const res = await getSavedPosts();
      // Backend returns { id, user_id, post_id, created_at } — no nested post
      // Fetch each post by its post_id
      const postPromises = res.data.map((item) => getPost(item.post_id));
      const postResults = await Promise.allSettled(postPromises);
      const posts = postResults
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value.data);
      setSavedPosts(posts);
    } catch {
      toast.error('Could not load saved posts');
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'saved') fetchSavedPosts();
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="glass-card p-6 sm:p-8 text-center mb-8 animate-fade-in">
        {/* Avatar */}
        <div className="w-24 h-24 mx-auto mb-4">
          {user.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover shadow-lg shadow-brand-200/50"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-200/50">
              {user.username[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Name & Username */}
        <h1 className="text-xl font-bold text-gray-900">
          {user.full_name || user.username}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">@{user.username}</p>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-gray-600 mt-3 max-w-sm mx-auto leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
          <span className="text-xs text-gray-400">
            Member since {dayjs.utc(user.created_at).local().format('MMM YYYY')}
          </span>

          {/* Verification badge */}
          {user.is_verified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          ) : (
            <Link
              to="/verify-email"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 text-xs font-medium hover:bg-yellow-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Unverified — Verify Email
            </Link>
          )}
        </div>

        {/* Edit Profile button */}
        <Link
          to="/edit-profile"
          className="btn-secondary text-sm mt-5 inline-flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange('posts')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${
            activeTab === 'posts'
              ? 'text-brand-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          My Posts
          {activeTab === 'posts' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => handleTabChange('saved')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${
            activeTab === 'saved'
              ? 'text-brand-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Saved Posts
          {activeTab === 'saved' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div>
          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-brand-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : myPosts.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-gray-400 text-sm">You haven't posted anything yet.</p>
              <Link to="/write" className="btn-primary text-sm mt-4 inline-block">
                Write your first post
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {myPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div>
          {loadingSaved ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-brand-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-gray-400 text-sm">No saved posts yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
