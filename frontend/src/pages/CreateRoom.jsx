// frontend/src/pages/CreateRoom.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { ArrowLeft, Copy, Check, Settings } from 'lucide-react';

const CreateRoom = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    totalPurse: 100,
    maxSquadSize: 15,
    minBatsmen: 5,
    minBowlers: 5,
    minAllRounders: 2,
    minWicketKeepers: 1
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomCreated, setRoomCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await roomAPI.createRoom({
        name: formData.name,
        rules: {
          totalPurse: parseFloat(formData.totalPurse),
          maxSquadSize: parseInt(formData.maxSquadSize),
          minBatsmen: parseInt(formData.minBatsmen),
          minBowlers: parseInt(formData.minBowlers),
          minAllRounders: parseInt(formData.minAllRounders),
          minWicketKeepers: parseInt(formData.minWicketKeepers)
        }
      });

      if (response.data.success) {
        setRoomCreated(response.data.room);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomCreated.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToDashboard = () => {
    navigate(`/auctioneer-dashboard/${roomCreated.roomId}`);
  };

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white text-base sm:text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (roomCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl w-full max-w-[95vw] sm:max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Success Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              Room Created Successfully! 🎉
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Share this Room ID with contestants to join
            </p>
          </div>

          {/* Room Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Room Name</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">{roomCreated.name}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Purse</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">₹{roomCreated.rules.totalPurse} Cr</p>
              </div>
            </div>

            {/* Room ID */}
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Room ID</p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1 bg-white rounded-lg px-3 sm:px-4 py-3 border-2 border-gray-200 min-h-[48px] flex items-center justify-center">
                  <p className="text-lg sm:text-2xl font-bold text-center text-blue-600 tracking-wider">
                    {roomCreated.roomId}
                  </p>
                </div>
                <button
                  onClick={copyRoomId}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors min-w-[48px] h-[48px] flex items-center justify-center"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Squad Rules */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Settings size={18} />
              Squad Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-xs sm:text-sm text-gray-600">Max Squad Size:</span>
                <span className="font-semibold text-sm sm:text-base">{roomCreated.rules.maxSquadSize}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-xs sm:text-sm text-gray-600">Min Batsmen:</span>
                <span className="font-semibold text-sm sm:text-base">{roomCreated.rules.minBatsmen}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-xs sm:text-sm text-gray-600">Min Bowlers:</span>
                <span className="font-semibold text-sm sm:text-base">{roomCreated.rules.minBowlers}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-xs sm:text-sm text-gray-600">Min All-Rounders:</span>
                <span className="font-semibold text-sm sm:text-base">{roomCreated.rules.minAllRounders}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs sm:text-sm text-gray-600">Min Wicket-Keepers:</span>
                <span className="font-semibold text-sm sm:text-base">{roomCreated.rules.minWicketKeepers}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-3 text-sm sm:text-base">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
              <li>Share the Room ID with all contestants</li>
              <li>Upload player database from the dashboard</li>
              <li>Wait for all teams to join</li>
              <li>Start the auction!</li>
            </ol>
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
              className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-sm sm:text-base min-h-[48px]"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full max-w-[95vw] sm:max-w-2xl">
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
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-xs sm:text-sm text-blue-600 mb-1">Logged in as</p>
            <p className="font-semibold text-gray-900 text-sm sm:text-base">{user.username} (Auctioneer)</p>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            Create Auction Room
          </h1>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">
            Set up your auction with custom rules and squad requirements
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Room Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Room Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                placeholder="e.g., IPL 2024 Auction"
              />
            </div>

            {/* Purse Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Total Purse (Crores) *
                </label>
                <input
                  type="number"
                  name="totalPurse"
                  value={formData.totalPurse}
                  onChange={handleChange}
                  required
                  min="50"
                  max="200"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Max Squad Size *
                </label>
                <input
                  type="number"
                  name="maxSquadSize"
                  value={formData.maxSquadSize}
                  onChange={handleChange}
                  required
                  min="11"
                  max="25"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                />
              </div>
            </div>

            {/* Role Requirements */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Minimum Role Requirements</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1.5">
                    Batsmen
                  </label>
                  <input
                    type="number"
                    name="minBatsmen"
                    value={formData.minBatsmen}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1.5">
                    Bowlers
                  </label>
                  <input
                    type="number"
                    name="minBowlers"
                    value={formData.minBowlers}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1.5">
                    All-Rounders
                  </label>
                  <input
                    type="number"
                    name="minAllRounders"
                    value={formData.minAllRounders}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1.5">
                    Wicket-Keepers
                  </label>
                  <input
                    type="number"
                    name="minWicketKeepers"
                    value={formData.minWicketKeepers}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[48px]"
            >
              {loading ? 'Creating Room...' : 'Create Room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
