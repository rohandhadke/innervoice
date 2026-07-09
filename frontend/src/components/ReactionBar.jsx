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

export default function ReactionBar({ postId, reactions = [] }) {
  const [sending, setSending] = useState(null);
  const [localReactions, setLocalReactions] = useState(reactions);
  const { user } = useAuthStore();

  // Find the current user's existing reaction (if any)
  const myReaction = user
    ? localReactions.find((r) => r.user_id === user.id)
    : null;

  // Count reactions by type
  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count: localReactions.filter((lr) => lr.reaction_type === r.type).length,
  }));

  const handleReact = async (type) => {
    if (sending) return;
    setSending(type);

    try {
      if (myReaction && myReaction.reaction_type === type) {
        // Toggle off — same reaction clicked again
        // Optimistically remove from local state
        setLocalReactions((prev) => prev.filter((r) => r.id !== myReaction.id));
        try {
          await addReaction(postId, type);
          // Backend returns { detail: "Reaction removed" } with status 200
        } catch {
          // If the API errors, restore the reaction
          setLocalReactions((prev) => [...prev, myReaction]);
        }
      } else if (myReaction) {
        // Switch — different reaction type clicked
        // Optimistically update local state
        const updatedReaction = { ...myReaction, reaction_type: type };
        setLocalReactions((prev) =>
          prev.map((r) => (r.id === myReaction.id ? updatedReaction : r))
        );
        try {
          const res = await addReaction(postId, type);
          // Backend returns the updated reaction object
          if (res.data && res.data.id) {
            setLocalReactions((prev) =>
              prev.map((r) => (r.id === myReaction.id ? res.data : r))
            );
          }
        } catch {
          // Restore original on error
          setLocalReactions((prev) =>
            prev.map((r) => (r.id === updatedReaction.id ? myReaction : r))
          );
        }
      } else {
        // New reaction — no existing reaction from this user
        const res = await addReaction(postId, type);
        if (res.data && res.data.id) {
          setLocalReactions((prev) => [...prev, res.data]);
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
      {reactionCounts.map((r) => {
        const isMyReaction = myReaction?.reaction_type === r.type;
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
                : r.count > 0
                  ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
              ${sending === r.type ? 'animate-pulse-soft' : ''}
              hover:scale-105 active:scale-95
            `}
          >
            <span>{r.emoji}</span>
            {r.count > 0 && <span>{r.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
