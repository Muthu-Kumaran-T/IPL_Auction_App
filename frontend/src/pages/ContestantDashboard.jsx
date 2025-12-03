// frontend/src/pages/ContestantDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, LogOut, Send, TrendingUp, Eye, X, Star } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useRoomStore from '../store/roomStore';
import socketService from '../services/socket';
import PlayingXIModal from '../components/PlayingXIModal';

const ContestantDashboard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  const { currentRoom, fetchRoomDetails, fetchTeams } = useRoomStore();

  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [lastBidder, setLastBidder] = useState(null); // Track last bidder to prevent consecutive bids
  const [myBidAmount, setMyBidAmount] = useState('');
  const [myTeam, setMyTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showPlayingXIModal, setShowPlayingXIModal] = useState(false);
  const chatEndRef = useRef(null);

  const loadRoomData = useCallback(async () => {
    if (!user) return;

    await fetchRoomDetails(roomId);
    const teamsResult = await fetchTeams(roomId);
    if (teamsResult.success) {
      setTeams(teamsResult.teams);
      const team = teamsResult.teams.find(t => {
        const teamUserId = t.userId?._id || t.userId;
        return teamUserId === user.id;
      });
      if (team) {
        console.log('My team loaded:', team);
        setMyTeam(team);
      }
    }
  }, [user, roomId, fetchRoomDetails, fetchTeams]);

  const connectSocket = useCallback(() => {
    if (!user) return;

    socketService.connect();
    socketService.joinRoom(roomId, user.id, user.username, user.role);

    socketService.on('room-state', (room) => {
      console.log('Room state:', room);
      if (room && room.teams) {
        setTeams(room.teams);
        const team = room.teams.find(t => {
          const teamUserId = t.userId?._id || t.userId;
          return teamUserId === user.id;
        });
        if (team) {
          setMyTeam(team);
        }
      }
    });

    socketService.on('user-joined', (data) => {
      setMessages(prev => [...prev, { 
        type: 'system',
        text: data.message,
        timestamp: new Date()
      }]);
      loadRoomData();
    });

    socketService.on('bidding-started', (data) => {
      setCurrentPlayer(data.player);
      setCurrentBid(data.currentBid);
      setHighestBidder(null);
      setLastBidder(null); // Reset last bidder on new bidding start
      setMyBidAmount('');
      setMessages(prev => [...prev, {
        type: 'system',
        text: `Bidding started for ${data.player.name}`,
        timestamp: new Date()
      }]);
    });

    socketService.on('new-bid', (data) => {
      setCurrentBid(data.bidAmount);
      setHighestBidder(data.teamName);
      setLastBidder(data.teamName); // Update last bidder here
      setMessages(prev => [...prev, {
        type: 'bid',
        text: `${data.teamName} bid ₹${data.bidAmount} Cr`,
        timestamp: new Date()
      }]);
    });

    socketService.on('player-sold', (data) => {
      console.log('Player sold event received:', data);

      setMessages(prev => [...prev, {
        type: 'sold',
        text: `${data.player.name} SOLD to ${data.teamName} for ₹${data.soldPrice} Cr!`,
        timestamp: new Date()
      }]);
      setCurrentPlayer(null);
      setCurrentBid(0);
      setHighestBidder(null);
      setLastBidder(null); // Reset last bidder after player sold

      if (data.teams) {
        console.log('Updating teams from player-sold:', data.teams);
        setTeams(data.teams);
        const updatedTeam = data.teams.find(t => {
          const teamUserId = t.userId?._id || t.userId;
          return teamUserId === user.id;
        });
        console.log('My updated team:', updatedTeam);
        if (updatedTeam) {
          setMyTeam(updatedTeam);
        }
      } else {
        console.log('No teams in player-sold, reloading data');
        loadRoomData();
      }
    });

    socketService.on('teams-updated', (data) => {
      console.log('Teams updated event received:', data);
      if (data.teams) {
        setTeams(data.teams);
        const updatedTeam = data.teams.find(t => {
          const teamUserId = t.userId?._id || t.userId;
          return teamUserId === user.id;
        });
        console.log('My team after teams-updated:', updatedTeam);
        if (updatedTeam) {
          setMyTeam(updatedTeam);
        }
      }
    });

    socketService.on('player-unsold', (data) => {
      setMessages(prev => [...prev, {
        type: 'unsold',
        text: `${data.player.name} went UNSOLD`,
        timestamp: new Date()
      }]);
      setCurrentPlayer(null);
      setCurrentBid(0);
      setHighestBidder(null);
      setLastBidder(null); // Reset last bidder on unsold player
    });

    socketService.on('new-message', (data) => {
      setMessages(prev => [...prev, {
        type: 'chat',
        username: data.username,
        text: data.message,
        timestamp: data.timestamp
      }]);
    });
  }, [user, roomId, loadRoomData]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    loadRoomData();
    connectSocket();

    return () => {
      socketService.disconnect();
    };
  }, [roomId, user, isLoading, navigate, loadRoomData, connectSocket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const placeBid = () => {
    const bidAmount = parseFloat(myBidAmount);

    if (!bidAmount || bidAmount <= currentBid) {
      alert('Bid must be higher than current bid');
      return;
    }

    // Prevent consecutive bids by the same team
    if (lastBidder === myTeam?.teamName) {
      alert('You must wait for another contestant to bid before bidding again.');
      return;
    }

    const purseRemaining = myTeam?.purseRemaining ?? (currentRoom?.rules?.totalPurse || 100);
    if (bidAmount > purseRemaining) {
      alert('Insufficient purse remaining');
      return;
    }

    socketService.placeBid(roomId, currentPlayer.id, bidAmount, myTeam.teamName, user.id);
    setMyBidAmount('');
  };

  const quickBid = (increment) => {
    const newBid = currentBid + increment;

    // Prevent consecutive bids by the same team
    if (lastBidder === myTeam?.teamName) {
      alert('You must wait for another contestant to bid before bidding again.');
      return;
    }

    const purseRemaining = myTeam?.purseRemaining ?? (currentRoom?.rules?.totalPurse || 100);
    if (newBid > purseRemaining) {
      alert('Insufficient purse remaining');
      return;
    }
    socketService.placeBid(roomId, currentPlayer.id, newBid, myTeam.teamName, user.id);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socketService.sendMessage(roomId, newMessage, myTeam?.teamName || user.username);
    setNewMessage('');
  };

  const getPurseRemaining = () => {
    if (myTeam?.purseRemaining !== undefined && myTeam?.purseRemaining !== null) {
      return myTeam.purseRemaining;
    }
    return currentRoom?.rules?.totalPurse || 100;
  };

  const isMyTeam = (team) => {
    const teamUserId = team.userId?._id || team.userId;
    return teamUserId === user.id;
  };

  const getTeamPurse = (team) => {
    if (team.purseRemaining !== undefined && team.purseRemaining !== null) {
      return team.purseRemaining;
    }
    return currentRoom?.rules?.totalPurse || 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading auction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Responsive */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">{currentRoom?.name || 'Auction Room'}</h1>
              <p className="text-purple-100 text-xs">Room: {roomId}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-purple-100">Team</p>
                <p className="font-semibold text-sm">{myTeam?.teamName || 'Loading...'}</p>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors min-w-[44px] h-[44px] flex items-center justify-center"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - My Team */}
          <div className="lg:col-span-1 space-y-3">
            {/* My Stats */}
            <div className="bg-white rounded-xl shadow p-3 sm:p-4">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-2">My Team Stats</h2>
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Purse Remaining</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    ₹{getPurseRemaining()} Cr
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600">Players</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{myTeam?.players?.length || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600">Max</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{currentRoom?.rules?.maxSquadSize || 15}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* My Squad - COMPACT */}
            <div className="bg-white rounded-xl shadow p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">My Squad</h2>
                <div className="flex gap-1">
                  {myTeam && myTeam.players && myTeam.players.length >= 11 && (
                    <button
                      onClick={() => setShowPlayingXIModal(true)}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md flex items-center gap-1 transition-colors min-h-[32px]"
                    >
                      <Star size={10} />
                      XI
                    </button>
                  )}
                  {myTeam && (
                    <button
                      onClick={() => setSelectedTeam(myTeam)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 min-h-[32px] px-1"
                    >
                      <Eye size={12} />
                      Full
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1 max-h-[180px] sm:max-h-[200px] overflow-y-auto">
                {myTeam?.players && myTeam.players.length > 0 ? (
                  myTeam.players.map((player, index) => (
                    <div key={player._id || index} className="bg-gray-50 rounded-md p-2 hover:bg-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-xs truncate">
                            {player.name || `Player ${index + 1}`}
                          </p>
                          <span className="text-xs text-gray-500">{player.role || 'Unknown'}</span>
                        </div>
                        {player.soldPrice && (
                          <span className="text-xs text-green-600 font-semibold ml-2 whitespace-nowrap">
                            ₹{player.soldPrice} Cr
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-xs">No players yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Other Teams - COMPACT */}
            <div className="bg-white rounded-xl shadow p-3 sm:p-4">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-2 flex items-center gap-1">
                <Users size={14} />
                Other Teams
              </h2>
              <div className="space-y-1 max-h-[180px] sm:max-h-[200px] overflow-y-auto">
                {teams.filter(t => !isMyTeam(t)).map((team) => (
                  <div key={team._id} className="bg-gray-50 rounded-md p-2 hover:bg-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs truncate">{team.teamName}</p>
                        <span className="text-xs text-gray-500">{team.players?.length || 0} players</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-green-600 font-semibold whitespace-nowrap">
                          ₹{team.purseRemaining ?? (currentRoom?.rules?.totalPurse || 100)} Cr
                        </span>
                        <button
                          onClick={() => setSelectedTeam(team)}
                          className="p-1 hover:bg-blue-100 rounded transition-colors min-w-[28px] h-[28px] flex items-center justify-center"
                        >
                          <Eye size={12} className="text-blue-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Bidding & Chat */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current Player Bidding */}
            {currentPlayer ? (
              <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl shadow-lg p-4 sm:p-5 text-white">
                <h2 className="text-base sm:text-lg font-bold mb-3">Current Player</h2>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-3">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{currentPlayer.name}</h3>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{currentPlayer.role}</span>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{currentPlayer.country}</span>
                  </div>

                  {currentPlayer.stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 bg-white/10 rounded-lg p-2">
                      {currentPlayer.stats.matches > 0 && (
                        <div>
                          <p className="text-white/70 text-xs">Matches</p>
                          <p className="text-sm sm:text-base font-bold">{currentPlayer.stats.matches}</p>
                        </div>
                      )}
                      {currentPlayer.stats.runs !== undefined && currentPlayer.stats.runs > 0 && (
                        <div>
                          <p className="text-white/70 text-xs">Runs</p>
                          <p className="text-sm sm:text-base font-bold">{currentPlayer.stats.runs}</p>
                        </div>
                      )}
                      {currentPlayer.stats.wickets !== undefined && currentPlayer.stats.wickets > 0 && (
                        <div>
                          <p className="text-white/70 text-xs">Wickets</p>
                          <p className="text-sm sm:text-base font-bold">{currentPlayer.stats.wickets}</p>
                        </div>
                      )}
                      {currentPlayer.stats.average !== undefined && currentPlayer.stats.average > 0 && (
                        <div>
                          <p className="text-white/70 text-xs">Average</p>
                          <p className="text-sm sm:text-base font-bold">{currentPlayer.stats.average}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-white/70 text-xs">Base Price</p>
                      <p className="text-base sm:text-lg font-bold">₹{currentPlayer.basePrice} Cr</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs">Current Bid</p>
                      <p className="text-lg sm:text-xl font-bold">₹{currentBid} Cr</p>
                    </div>
                  </div>

                  {highestBidder && (
                    <div className={`rounded-lg p-2 ${highestBidder === myTeam?.teamName ? 'bg-green-500/40' : 'bg-red-500/40'}`}>
                      <p className="text-xs text-white/90">
                        {highestBidder === myTeam?.teamName ? 'You are the highest bidder! 🎉' : `Highest: ${highestBidder}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bidding Controls */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={myBidAmount}
                      onChange={(e) => setMyBidAmount(e.target.value)}
                      placeholder="Enter bid"
                      className="flex-1 px-3 py-2 rounded-lg text-gray-900 font-semibold text-sm min-h-[44px]"
                      step="0.5"
                    />
                    <button
                      onClick={placeBid}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 text-sm min-h-[44px] min-w-[80px]"
                    >
                      <TrendingUp size={16} />
                      Bid
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => quickBid(0.5)}
                      className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition-colors text-sm min-h-[44px]"
                    >
                      +₹0.5
                    </button>
                    <button
                      onClick={() => quickBid(1)}
                      className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition-colors text-sm min-h-[44px]"
                    >
                      +₹1
                    </button>
                    <button
                      onClick={() => quickBid(2)}
                      className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition-colors text-sm min-h-[44px]"
                    >
                      +₹2
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={28} className="text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Waiting for Auction</h3>
                <p className="text-gray-600 text-sm">The auctioneer will start bidding soon...</p>
              </div>
            )}

            {/* Chat & Activity - COMPACT */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-3 border-b border-gray-200">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">Live Feed</h2>
              </div>

              <div className="h-[150px] sm:h-[200px] overflow-y-auto p-3 space-y-2">
                {messages.map((msg, index) => (
                  <div key={index} className={`${
                    msg.type === 'system' ? 'bg-blue-50 border-l-2 border-blue-500' :
                    msg.type === 'bid' ? 'bg-purple-50 border-l-2 border-purple-500' :
                    msg.type === 'sold' ? 'bg-green-50 border-l-2 border-green-500' :
                    msg.type === 'unsold' ? 'bg-red-50 border-l-2 border-red-500' :
                    'bg-gray-50'
                  } rounded-md p-2`}>
                    {msg.username && (
                      <p className="font-semibold text-xs text-gray-900">{msg.username}</p>
                    )}
                    <p className="text-xs text-gray-700">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[44px]"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors min-w-[44px] h-[44px] flex items-center justify-center"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Squad Modal - Mobile Responsive */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-3xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className={`${isMyTeam(selectedTeam) ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <span className="truncate">{selectedTeam.teamName}</span>
                    {isMyTeam(selectedTeam) && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded whitespace-nowrap">Your Team</span>
                    )}
                  </h2>
                  <p className="text-blue-100 text-xs mt-1">Squad Overview</p>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors min-w-[44px] h-[44px] flex items-center justify-center ml-2"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-white/70 text-xs">Players</p>
                  <p className="text-lg sm:text-xl font-bold">{selectedTeam.players?.length || 0}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-white/70 text-xs">Purse</p>
                  <p className="text-lg sm:text-xl font-bold">₹{getTeamPurse(selectedTeam)} Cr</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-white/70 text-xs">Spent</p>
                  <p className="text-lg sm:text-xl font-bold">
                    ₹{((currentRoom?.rules?.totalPurse || 100) - getTeamPurse(selectedTeam)).toFixed(1)} Cr
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(85vh-200px)]">
              {selectedTeam.players && selectedTeam.players.length > 0 ? (
                <div className="space-y-2">
                  {selectedTeam.players.map((player, index) => (
                    <div key={player._id || index} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{player.name}</h3>
                          <div className="flex gap-2 mt-1 text-xs flex-wrap">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{player.role}</span>
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded">{player.country}</span>
                          </div>

                          {player.stats && (
                            <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 text-xs text-gray-600">
                              {player.stats.matches > 0 && <span>M: {player.stats.matches}</span>}
                              {player.stats.runs > 0 && <span>R: {player.stats.runs}</span>}
                              {player.stats.wickets > 0 && <span>W: {player.stats.wickets}</span>}
                            </div>
                          )}
                        </div>
                        <div className="text-right sm:ml-3">
                          <p className="text-xs text-gray-500">Bought</p>
                          <p className="text-base sm:text-lg font-bold text-green-600">₹{player.soldPrice} Cr</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No players yet</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => setSelectedTeam(null)}
                className={`w-full ${isMyTeam(selectedTeam) ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-colors text-sm min-h-[44px]`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playing XI Modal */}
      <PlayingXIModal
        isOpen={showPlayingXIModal}
        onClose={() => setShowPlayingXIModal(false)}
        myTeam={myTeam}
        roomId={roomId}
        onSuccess={() => {
          loadRoomData();
        }}
      />
    </div>
  );
};

export default ContestantDashboard;
