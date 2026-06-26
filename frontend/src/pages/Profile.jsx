import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserByUsername } from '../api/auth';
import { getPosts } from '../api/posts';
import PostCard from '../components/PostCard';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const userRes = await getUserByUsername(username);
      setUser(userRes.data);

      // Fetch all posts and filter by user_id
      const postsRes = await getPosts({ limit: 100 });
      const userPosts = postsRes.data.filter(
        (p) => p.user_id === userRes.data.id && !p.is_anonymous
      );
      setPosts(userPosts);
    } catch {
      toast.error('User not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-brand-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-600">User not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="glass-card p-6 sm:p-8 text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg shadow-brand-200/50">
          {user.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user.username[0].toUpperCase()
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-900">{user.full_name || user.username}</h1>
        <p className="text-sm text-gray-500 mt-0.5">@{user.username}</p>
        {user.bio && (
          <p className="text-sm text-gray-600 mt-3 max-w-sm mx-auto leading-relaxed">
            {user.bio}
          </p>
        )}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
          <span>Joined {dayjs(user.created_at).format('MMM YYYY')}</span>
          <span>•</span>
          <span>{posts.length} public posts</span>
        </div>
      </div>

      {/* User's Posts */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          Posts by {user.username}
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
