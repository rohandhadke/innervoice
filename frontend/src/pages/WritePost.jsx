import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createPost } from '../api/posts';
import { getTags } from '../api/tags';
import MoodPicker from '../components/MoodPicker';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function WritePost() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [mood, setMood] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [visibility, setVisibility] = useState('public');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const contentValue = watch('content', '');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await getTags();
      setTags(res.data);
    } catch {
      // Tags are optional, don't block the page
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        content: data.content,
        is_anonymous: isAnonymous,
        mood,
        visibility,
        tag_ids: selectedTags,
      };
      const res = await createPost(payload);
      toast.success('Your thought has been shared 💜');
      navigate(`/post/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          What's on your mind?
        </h1>
        <p className="text-gray-500 text-sm">
          Express yourself freely. You're safe here.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-slide-up">
        {/* Content */}
        <div className="glass-card p-5">
          <textarea
            {...register('content', {
              required: 'Please write something before sharing',
              minLength: { value: 10, message: 'Write at least 10 characters' },
            })}
            rows={6}
            placeholder="I've been feeling..."
            className="textarea-field text-[16px] leading-relaxed border-none focus:ring-0 p-0 bg-transparent"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">{contentValue.length} characters</span>
            {errors.content && (
              <span className="text-xs text-red-500">{errors.content.message}</span>
            )}
          </div>
        </div>

        {/* Mood */}
        <div className="glass-card p-5">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            How are you feeling?
          </label>
          <MoodPicker selected={mood} onSelect={setMood} size="sm" />
        </div>

        {/* Settings */}
        <div className="glass-card p-5 space-y-5">
          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Post anonymously</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isAnonymous
                  ? 'Your identity will be hidden'
                  : isAuthenticated()
                  ? 'Post with your profile'
                  : 'Login to post with your identity'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!isAnonymous && !isAuthenticated()) {
                  toast.error('Please login to post with your identity');
                  return;
                }
                setIsAnonymous(!isAnonymous);
              }}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                isAnonymous ? 'bg-brand-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  isAnonymous ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Visibility</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {visibility === 'public' ? 'Everyone can see this' : 'Only you can see this'}
              </p>
            </div>
            <div className="flex bg-gray-100 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  visibility === 'public'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  visibility === 'private'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                Private
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="glass-card p-5">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Tags <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    selectedTags.includes(tag.id)
                      ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3 text-base"
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sharing...
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Share your thought
            </>
          )}
        </button>
      </form>
    </div>
  );
}
