// frontend/src/pages/GameSelection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, PlayCircle, Clock, Users, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { roomAPI } from '../services/api';

const GameSelection = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load rooms after auth is loaded and user exists
    if (!isLoading && user) {
      loadMyRooms();
    }
  }, [isLoading, user]);

  const loadMyRooms = async () => {
    setLoading(true);
    try {
      const response = await roomAPI.getMyRooms();
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewGame = () => {
    if (!user) return;
    
    if (user.role === 'auctioneer') {
      navigate('/create-room');
    } else {
      navigate('/join-room');
    }
  };

  const handleContinueGame = (roomId) => {
    if (!user) return;
    
    if (user.role === 'auctioneer') {
      navigate(`/auctioneer-dashboard/${roomId}`);
    } else {
      navigate(`/contestant-dashboard/${roomId}`);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'Paused';
      case 'completed': return 'Completed';
      default: return 'Waiting';
    }
  };

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white text-base sm:text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header - Mobile Responsive */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-white hover:text-white/80 transition-colors text-sm sm:text-base min-h-[40px]"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              Back
            </button>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-white/80">Logged in as</p>
                <p className="font-semibold text-white text-sm">{user.username}</p>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white min-w-[40px] h-[40px] flex items-center justify-center"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            {user.role === 'auctioneer' ? 'Manage Auctions' : 'My Auctions'}
          </h1>
          <p className="text-white/80 text-sm sm:text-lg max-w-2xl mx-auto">
            Start a new auction or continue from where you left off
          </p>
        </div>

        {/* New Game Button */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={handleNewGame}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 sm:py-6 rounded-2xl shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 min-h-[56px]"
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="text-base sm:text-xl">
              {user.role === 'auctioneer' ? 'Create New Auction' : 'Join New Auction'}
            </span>
          </button>
        </div>

        {/* Previous Games */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            Previous Auctions
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Loading your auctions...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-base sm:text-lg mb-2">No previous auctions</p>
              <p className="text-gray-500 text-xs sm:text-sm">
                {user.role === 'auctioneer' 
                  ? 'Create your first auction to get started!' 
                  : 'Join an auction to get started!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-[500px] overflow-y-auto">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleContinueGame(room.roomId)}
                  className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 sm:p-5 cursor-pointer transition-all transform hover:scale-[1.02] border-2 border-transparent hover:border-purple-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 truncate">
                        {room.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <span className="font-mono bg-white px-2 sm:px-3 py-1 rounded border border-gray-200 text-xs sm:text-sm">
                          {room.roomId}
                        </span>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                          {getStatusText(room.status)}
                        </span>
                      </div>
                    </div>
                    <PlayCircle className="text-purple-600 w-8 h-8 sm:w-7 sm:h-7 flex-shrink-0 ml-auto sm:ml-0" />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{room.teamsCount} teams</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">•</span>
                      <span>{room.playersCount} players</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(room.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameSelection;
