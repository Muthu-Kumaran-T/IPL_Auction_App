// frontend/src/pages/JoinRoom.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { ArrowLeft, Users, CheckCircle } from 'lucide-react';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    roomId: '',
    teamName: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleTeamNameChange = (e) => {
    setFormData({
      ...formData,
      teamName: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await roomAPI.joinRoom({
        roomId: formData.roomId.trim(),
        teamName: formData.teamName.trim()
      });

      if (response.data.success) {
        setJoinSuccess(response.data.room);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    navigate(`/contestant-dashboard/${joinSuccess.roomId}`);
  };

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-base sm:text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Safety check: If user is still null after loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white text-base sm:text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (joinSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full max-w-[95vw] sm:max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Success Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              Successfully Joined! 🎉
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              You're now part of the auction
            </p>
          </div>

          {/* Room & Team Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 mb-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Room Name</p>
                <p className="text-base sm:text-xl font-bold text-gray-900">{joinSuccess.name}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Your Team</p>
                <p className="text-base sm:text-lg font-semibold text-blue-600">{formData.teamName}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Room ID</p>
                <p className="text-sm sm:text-lg font-mono font-semibold text-gray-900">{joinSuccess.roomId}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-3 text-sm sm:text-base">What's Next?</h3>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>✓ Wait for the auctioneer to start</li>
              <li>✓ Get ready to bid on your favorite players</li>
              <li>✓ Build your dream squad!</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/game-selection')}
              className="flex-1 px-4 sm:px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base min-h-[48px]"
            >
              Go Back
            </button>
            <button
              onClick={goToDashboard}
              className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-sm sm:text-base min-h-[48px]"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full max-w-[95vw] sm:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/game-selection')}
            className="flex items-center text-white hover:text-white/80 transition-colors text-sm sm:text-base min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            Back
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="text-white hover:text-white/80 transition-colors text-sm sm:text-base"
          >
            Logout
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* User Info */}
          <div className="bg-purple-50 rounded-xl p-3 sm:p-4 mb-6">
            <p className="text-xs sm:text-sm text-purple-600 mb-1">Logged in as</p>
            <p className="font-semibold text-gray-900 text-sm sm:text-base">{user.username} (Contestant)</p>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center leading-tight">
            Join Auction Room
          </h1>
          <p className="text-gray-600 mb-8 text-center text-sm sm:text-base">
            Enter the Room ID provided by the auctioneer
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Room ID */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Room ID *
              </label>
              <input
                type="text"
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                required
                maxLength="6"
                className="w-full px-4 py-3 text-center text-lg sm:text-xl font-mono font-bold uppercase tracking-wider border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[52px]"
                placeholder="ABC123"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                6-character code from the auctioneer
              </p>
            </div>

            {/* Team Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Your Team Name *
              </label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleTeamNameChange}
                required
                minLength="3"
                maxLength="30"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm min-h-[44px]"
                placeholder="e.g., Mumbai Indians"
              />
              <p className="text-xs text-gray-500 mt-2">
                Choose a unique team name (3-30 characters)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 sm:py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[52px]"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Don't have a Room ID?{' '}
              <span className="text-purple-600 font-medium">
                Contact the auctioneer
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
