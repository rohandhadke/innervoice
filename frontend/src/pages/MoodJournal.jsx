import { useState, useEffect } from 'react';
import { getMoodLogs, logMood } from '../api/moodlog';
import { MOODS } from '../components/MoodPicker';
import MoodPicker from '../components/MoodPicker';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

// Map mood to a numeric value for the chart
const MOOD_VALUES = {
  happy: 10,
  grateful: 9,
  hopeful: 8,
  confused: 5,
  numb: 4,
  lost: 3,
  anxious: 3,
  exhausted: 2,
  sad: 2,
  angry: 1,
};

const MOOD_EMOJI = {};
MOODS.forEach((m) => {
  MOOD_EMOJI[m.value] = m.emoji;
});

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs text-gray-500">{data.date}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">
          {MOOD_EMOJI[data.mood] || '💭'} {data.mood}
        </p>
        {data.note && (
          <p className="text-xs text-gray-500 mt-1 max-w-[180px]">{data.note}</p>
        )}
      </div>
    );
  }
  return null;
}

export default function MoodJournal() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getMoodLogs();
      setLogs(res.data);
    } catch {
      toast.error('Could not load mood history');
    } finally {
      setLoading(false);
    }
  };

  const handleLogMood = async (e) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }
    setSubmitting(true);
    try {
      await logMood({ mood: selectedMood, note: note || null });
      toast.success('Mood logged! 💜');
      setSelectedMood(null);
      setNote('');
      fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not log mood');
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare chart data — last 30 days
  const thirtyDaysAgo = dayjs().subtract(30, 'day');
  const chartData = logs
    .filter((log) => dayjs(log.created_at).isAfter(thirtyDaysAgo))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((log) => ({
      date: dayjs(log.created_at).format('MMM D'),
      value: MOOD_VALUES[log.mood] || 5,
      mood: log.mood,
      note: log.note,
    }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">📊</span> Mood Journal
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track your emotional journey over time</p>
      </div>

      {/* Log Mood Form */}
      <form onSubmit={handleLogMood} className="glass-card p-5 sm:p-6 mb-8 animate-slide-up">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Log a new mood entry</h2>
        <MoodPicker selected={selectedMood} onSelect={setSelectedMood} size="sm" />
        <div className="mt-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about how you're feeling... (optional)"
            rows={2}
            className="textarea-field text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !selectedMood}
          className="btn-primary mt-3 text-sm"
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Logging...
            </div>
          ) : (
            'Log mood'
          )}
        </button>
      </form>

      {/* Mood Chart */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chartData.length > 0 ? (
        <div className="glass-card p-5 sm:p-6 mb-8 animate-slide-up">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">
            Mood over the last 30 days
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  ticks={[0, 2, 4, 6, 8, 10]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{
                    fill: '#8b5cf6',
                    stroke: '#fff',
                    strokeWidth: 2,
                    r: 5,
                  }}
                  activeDot={{
                    fill: '#7c3aed',
                    stroke: '#ede9fe',
                    strokeWidth: 3,
                    r: 7,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400 px-1">
            <span>😠 Low</span>
            <span>😊 High</span>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center mb-8">
          <p className="text-gray-400 text-sm">No mood data yet. Start logging above!</p>
        </div>
      )}

      {/* Mood History List */}
      <div className="animate-slide-up">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Mood History</h2>
        {logs.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-400 text-sm">No entries yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="glass-card p-4 flex items-start gap-3 hover:shadow-sm transition-shadow"
              >
                <span className="text-2xl mt-0.5">
                  {MOOD_EMOJI[log.mood] || '💭'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 capitalize">
                      {log.mood}
                    </span>
                    <span className="text-xs text-gray-400">
                      {dayjs(log.created_at).format('MMM D, YYYY • h:mm A')}
                    </span>
                  </div>
                  {log.note && (
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{log.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
