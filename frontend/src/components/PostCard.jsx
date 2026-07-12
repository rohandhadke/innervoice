import { Link, useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/formatTime';

const MOOD_EMOJI = {
  happy: '😊', sad: '😢', anxious: '😰', angry: '😠', confused: '😕',
  grateful: '🙏', lost: '🌫️', hopeful: '🌟', numb: '😶', exhausted: '😩',
};

// Strip HTML tags for preview text
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const plainContent = stripHtml(post.content);
  const previewContent =
    plainContent.length > 220 ? plainContent.slice(0, 220) + '…' : plainContent;

  // Resolve display name and avatar from backend author object
  const author = post.author; // null for anonymous posts
  const displayName = author ? author.username : 'Anonymous';
  const profilePicture = author?.profile_picture_url || null;
  const avatarLetter = author ? author.username[0].toUpperCase() : '?';

  const handleAuthorClick = (e) => {
    if (!author) return;
    e.preventDefault();
    e.stopPropagation();
    navigate(`/user/${author.username}`);
  };

  return (
    <Link
      to={`/post/${post.id}`}
      className="block glass-card p-5 hover:shadow-md hover:border-brand-200/50 transition-all duration-300 animate-slide-up group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Avatar — clickable if not anonymous */}
          <div
            onClick={handleAuthorClick}
            className={author ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
          >
            {!author ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            ) : profilePicture ? (
              <img
                src={profilePicture}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                {avatarLetter}
              </div>
            )}
          </div>
          <div>
            {/* Username — clickable if not anonymous */}
            <span
              onClick={handleAuthorClick}
              className={`text-sm font-medium text-gray-700 ${
                author ? 'cursor-pointer hover:text-brand-500 transition-colors' : ''
              }`}
            >
              {displayName}
            </span>
            <span className="text-xs text-gray-400 ml-2">{formatTime(post.created_at)}</span>
          </div>
        </div>

        {post.mood && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium">
            <span>{MOOD_EMOJI[post.mood] || '💭'}</span>
            <span className="capitalize">{post.mood}</span>
          </span>
        )}
      </div>

      {/* Content — plain text preview */}
      <p className="text-gray-700 leading-relaxed text-[15px] mb-4 group-hover:text-gray-800 transition-colors">
        {previewContent}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post.comment_count != null ? `${post.comment_count} Comments` : 'Comments'}
        </span>
        <span className="inline-flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {post.total_reactions > 0 ? `${post.total_reactions} Reactions` : 'Reactions'}
        </span>
      </div>
    </Link>
  );
}
