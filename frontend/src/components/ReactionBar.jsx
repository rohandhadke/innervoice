import { useState } from 'react';
import { addReaction } from '../api/reactions';
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

  // Count reactions by type
  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count: localReactions.filter((lr) => lr.reaction_type === r.type).length,
  }));

  const handleReact = async (type) => {
    if (sending) return;
    setSending(type);
    try {
      const res = await addReaction(postId, type);
      setLocalReactions((prev) => [...prev, res.data]);
      toast.success('Reaction sent 💜');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not react');
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {reactionCounts.map((r) => (
        <button
          key={r.type}
          onClick={() => handleReact(r.type)}
          disabled={sending === r.type}
          className={`
            inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200
            ${r.count > 0
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
      ))}
    </div>
  );
}
