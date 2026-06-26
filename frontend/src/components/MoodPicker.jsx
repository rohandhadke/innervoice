const MOODS = [
  { value: 'happy',     emoji: '😊', label: 'Happy' },
  { value: 'sad',       emoji: '😢', label: 'Sad' },
  { value: 'anxious',   emoji: '😰', label: 'Anxious' },
  { value: 'angry',     emoji: '😠', label: 'Angry' },
  { value: 'confused',  emoji: '😕', label: 'Confused' },
  { value: 'grateful',  emoji: '🙏', label: 'Grateful' },
  { value: 'lost',      emoji: '🌫️', label: 'Lost' },
  { value: 'hopeful',   emoji: '🌟', label: 'Hopeful' },
  { value: 'numb',      emoji: '😶', label: 'Numb' },
  { value: 'exhausted', emoji: '😩', label: 'Exhausted' },
];

export { MOODS };

export default function MoodPicker({ selected, onSelect, size = 'md', disabled = false }) {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1',
    md: 'px-3 py-2 text-sm gap-1.5',
    lg: 'px-4 py-3 text-base gap-2',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(mood.value === selected ? null : mood.value)}
          className={`
            inline-flex items-center rounded-xl font-medium transition-all duration-200
            ${sizeClasses[size]}
            ${
              selected === mood.value
                ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-300 shadow-sm scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-[1.02]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className={size === 'lg' ? 'text-xl' : 'text-base'}>{mood.emoji}</span>
          <span>{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
