import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const MOOD_EMOJI = {
  happy: '😊', sad: '😢', anxious: '😰', angry: '😠', confused: '😕',
  grateful: '🙏', lost: '🌫️', hopeful: '🌟', numb: '😶', exhausted: '😩',
};

export default function PostCard({ post }) {
  const timeAgo = dayjs(post.created_at).fromNow();
  const previewContent =
    post.content.length > 220 ? post.content.slice(0, 220) + '…' : post.content;

  return (
    <Link
      to={`/post/${post.id}`}
      className="block glass-card p-5 hover:shadow-md hover:border-brand-200/50 transition-all duration-300 animate-slide-up group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {post.is_anonymous ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {post.user_id ? 'U' : '?'}
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-gray-700">
              {post.is_anonymous ? 'Anonymous' : `User #${post.user_id}`}
            </span>
            <span className="text-xs text-gray-400 ml-2">{timeAgo}</span>
          </div>
        </div>

        {post.mood && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium">
            <span>{MOOD_EMOJI[post.mood] || '💭'}</span>
            <span className="capitalize">{post.mood}</span>
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-700 leading-relaxed text-[15px] mb-4 group-hover:text-gray-800 transition-colors">
        {previewContent}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comments
        </span>
        <span className="inline-flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Reactions
        </span>
      </div>
    </Link>
  );
}
