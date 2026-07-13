import { useState } from 'react';
import { addReaction } from '../api/reactions';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const REACTIONS = [
  { type: 'heart',  emoji: '❤️',  label: 'Heart' },
  { type: 'hug',    emoji: '🤗',  label: 'Hug' },
  { type: 'relate', emoji: '🤝',  label: 'Relate' },
  { type: 'strong', emoji: '💪',  label: 'Strong' },
  { type: 'sad',    emoji: '😢',  label: 'Sad' },
];

export default function ReactionBar({ postId, reactionCounts = {} }) {
  const [sending, setSending] = useState(null);
  const [localCounts, setLocalCounts] = useState(reactionCounts);
  const [myReactionType, setMyReactionType] = useState(null);
  const { isAuthenticated } = useAuthStore();

  const handleReact = async (type) => {
    // Check auth before sending
    if (!isAuthenticated()) {
      toast.error('Please login to react to posts or if you want to comment openly');
      return;
    }

    if (sending) return;
    setSending(type);

    try {
      if (myReactionType === type) {
        // Toggle off — same reaction clicked again
        setLocalCounts((prev) => ({
          ...prev,
          [type]: Math.max(0, (prev[type] || 0) - 1),
        }));
        setMyReactionType(null);
        try {
          await addReaction(postId, type);
        } catch {
          // Restore on error
          setLocalCounts((prev) => ({
            ...prev,
            [type]: (prev[type] || 0) + 1,
          }));
          setMyReactionType(type);
        }
      } else if (myReactionType) {
        // Switch — different reaction type clicked
        const oldType = myReactionType;
        setLocalCounts((prev) => ({
          ...prev,
          [oldType]: Math.max(0, (prev[oldType] || 0) - 1),
          [type]: (prev[type] || 0) + 1,
        }));
        setMyReactionType(type);
        try {
          await addReaction(postId, type);
        } catch {
          // Restore on error
          setLocalCounts((prev) => ({
            ...prev,
            [oldType]: (prev[oldType] || 0) + 1,
            [type]: Math.max(0, (prev[type] || 0) - 1),
          }));
          setMyReactionType(oldType);
        }
      } else {
        // New reaction
        setLocalCounts((prev) => ({
          ...prev,
          [type]: (prev[type] || 0) + 1,
        }));
        setMyReactionType(type);
        try {
          await addReaction(postId, type);
        } catch {
          // Restore on error
          setLocalCounts((prev) => ({
            ...prev,
            [type]: Math.max(0, (prev[type] || 0) - 1),
          }));
          setMyReactionType(null);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not react');
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTIONS.map((r) => {
        const count = localCounts[r.type] || 0;
        const isMyReaction = myReactionType === r.type;
        return (
          <button
            key={r.type}
            onClick={() => handleReact(r.type)}
            disabled={sending === r.type}
            className={`
              inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200
              ${isMyReaction
                ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-300 shadow-sm'
                : count > 0
                  ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
              ${sending === r.type ? 'animate-pulse-soft' : ''}
              hover:scale-105 active:scale-95
            `}
          >
            <span>{r.emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
