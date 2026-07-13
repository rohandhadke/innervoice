import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getUserByUsername } from '../api/auth';
import { getUserPosts } from '../api/users';
import PostCard from '../components/PostCard';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import toast from 'react-hot-toast';

dayjs.extend(utc);

export default function PublicProfile() {
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [userRes, postsRes] = await Promise.all([
        getUserByUsername(username),
        getUserPosts(username),
      ]);
      setProfileUser(userRes.data);
      setPosts(postsRes.data);
    } catch {
      setNotFound(true);
      toast.error('User not found');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-brand-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profileUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-600">User not found</h2>
        <p className="text-sm text-gray-400 mt-1">The user @{username} doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="glass-card p-6 sm:p-8 text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4">
          {profileUser.profile_picture_url ? (
            <img
              src={profileUser.profile_picture_url}
              alt={profileUser.username}
              className="w-20 h-20 rounded-full object-cover shadow-lg shadow-brand-200/50"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-200/50">
              {profileUser.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {profileUser.full_name || profileUser.username}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">@{profileUser.username}</p>
        {profileUser.bio && (
          <p className="text-sm text-gray-600 mt-3 max-w-sm mx-auto leading-relaxed">
            {profileUser.bio}
          </p>
        )}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
          <span>Member since {dayjs.utc(profileUser.created_at).local().format('MMM YYYY')}</span>
          <span>•</span>
          <span>{posts.length} public posts</span>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          Posts by {profileUser.username}
        </h2>
        {posts.length === 0 ? (
          <div className="text-center py-12 glass-card">
            <p className="text-sm text-gray-400">No public posts yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
