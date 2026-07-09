import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateMe } from '../api/auth';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profile_picture_url || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await updateMe({
        full_name: fullName || null,
        bio: bio || null,
        profile_picture_url: profilePictureUrl || null,
      });
      setUser(res.data);
      toast.success('Profile updated 💜');
      navigate(`/user/${user.username}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profile preview"
                className="w-20 h-20 rounded-full object-cover shadow-lg shadow-brand-200/50"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-200/50 ${profilePictureUrl ? 'hidden' : 'flex'}`}
            >
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Personalize your InnerVoice presence</p>
        </div>

        {/* Form */}
        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="input-field"
                maxLength={100}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others a bit about yourself..."
                className="input-field min-h-[80px] resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/500</p>
            </div>

            {/* Profile Picture URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Picture URL</label>
              <input
                type="url"
                value={profilePictureUrl}
                onChange={(e) => setProfilePictureUrl(e.target.value)}
                placeholder="https://example.com/your-photo.jpg"
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">Paste a link to your profile image</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1 py-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 py-3"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  'Save changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
