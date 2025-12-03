// frontend/src/pages/AuctioneerDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Users, DollarSign, Play, X, LogOut, CheckCircle, Search, Eye } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useRoomStore from '../store/roomStore';
import { playerAPI } from '../services/api';
import socketService from '../services/socket';

const AuctioneerDashboard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  const { currentRoom, fetchRoomDetails, fetchTeams } = useRoomStore();
  
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const fileInputRef = useRef(null);

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
  }, [roomId, user, isLoading]);

  const loadRoomData = async () => {
    await fetchRoomDetails(roomId);
    const teamsResult = await fetchTeams(roomId);
    if (teamsResult.success) {
      setTeams(teamsResult.teams);
    }
    loadPlayers();
  };

  const loadPlayers = async () => {
    try {
      const response = await playerAPI.getPlayers(roomId);
      setPlayers(response.data.players);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const connectSocket = () => {
    if (!user) return;
    
    socketService.connect();
    socketService.joinRoom(roomId, user.id, user.username, user.role);

    socketService.on('room-state', (room) => {
      console.log('Room state:', room);
      if (room && room.teams) {
        setTeams(room.teams);
      }
    });

    socketService.on('user-joined', (data) => {
      console.log('User joined:', data);
      loadRoomData();
    });

    socketService.on('new-bid', (data) => {
      setCurrentBid(data.bidAmount);
      setHighestBidder(data.teamName);
    });

    socketService.on('player-sold', (data) => {
      console.log('🎯 Player sold event received:', data);
      console.log('📊 Teams in event:', data.teams);
      
      if (data.teams) {
        console.log('💰 Team purses after sale:');
        data.teams.forEach(team => {
          console.log(`  ${team.teamName}: ₹${team.purseRemaining} Cr (${team.players?.length || 0} players)`);
        });
        setTeams(data.teams);
      } else {
        console.log('⚠️ No teams data in player-sold event');
      }
      loadPlayers();
    });

    socketService.on('teams-updated', (data) => {
      console.log('🔄 Teams updated event received:', data);
      console.log('📋 Updated team data:');
      if (data.teams) {
        data.teams.forEach(team => {
          console.log(`  ${team.teamName}: ₹${team.purseRemaining} Cr (${team.players?.length || 0} players)`);
        });
        setTeams(data.teams);
      } else {
        console.log('⚠️ No teams data in teams-updated event');
      }
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await playerAPI.uploadPlayers(roomId, formData);
      setUploadSuccess(true);
      loadPlayers();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      alert('Failed to upload players: ' + error.response?.data?.message);
    }
  };

  const startBidding = (player) => {
    setCurrentPlayer(player);
    setCurrentBid(player.basePrice);
    setHighestBidder(null);
    socketService.startBidding(roomId, player._id);
  };

  const sellPlayer = () => {
    if (!highestBidder) {
      alert('No bids placed for this player');
      return;
    }

    const team = teams.find(t => t.teamName === highestBidder);
    
    if (!team) {
      alert('Team not found');
      return;
    }
    
    const teamUserId = team.userId._id || team.userId;
    
    console.log('🎯 Selling player:', currentPlayer.name, 'to team:', highestBidder);
    console.log('💰 Price:', currentBid, 'Team ID:', teamUserId);
    
    setPlayers(players.map(p => 
      p._id === currentPlayer._id ? { ...p, status: 'sold', soldPrice: currentBid, soldTo: highestBidder } : p
    ));
    
    setTeams(teams.map(t => {
      if (t.teamName === highestBidder) {
        return {
          ...t,
          purseRemaining: t.purseRemaining - currentBid,
          players: [...(t.players || []), currentPlayer._id]
        };
      }
      return t;
    }));
    
    socketService.sellPlayer(roomId, currentPlayer._id, currentBid, teamUserId, highestBidder);
    
    setCurrentPlayer(null);
    setCurrentBid(0);
    setHighestBidder(null);
  };

  const markUnsold = () => {
    socketService.unsoldPlayer(roomId, currentPlayer._id);
    
    setPlayers(players.map(p => 
      p._id === currentPlayer._id ? { ...p, status: 'unsold' } : p
    ));
    
    setCurrentPlayer(null);
    setCurrentBid(0);
    setHighestBidder(null);
  };

  const unsoldPlayers = players.filter(p => p.status === 'unsold');
  const soldPlayers = players.filter(p => p.status === 'sold');

  const filteredPlayers = players.filter(player => {
    const query = searchQuery.toLowerCase();
    return (
      player.name.toLowerCase().includes(query) ||
      player.role.toLowerCase().includes(query) ||
      player.country.toLowerCase().includes(query) ||
      (player.soldTo && player.soldTo.toLowerCase().includes(query))
    );
  });

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading auction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Responsive */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{currentRoom?.name || 'Auction Room'}</h1>
              <p className="text-blue-100 text-xs sm:text-sm">Room ID: {roomId}</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm text-blue-100">Auctioneer</p>
                <p className="font-semibold text-sm">{user?.username}</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Upload & Stats */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            {/* Upload Players */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Upload Players</h2>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm min-h-[44px]"
              >
                <Upload size={18} className="sm:w-5 sm:h-5" />
                Upload Excel File
              </button>
              {uploadSuccess && (
                <div className="mt-2 sm:mt-3 bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-2">
                  <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Players uploaded successfully!</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Statistics</h2>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Players</span>
                  <span className="font-bold text-gray-900">{players.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Sold</span>
                  <span className="font-bold text-green-600">{soldPlayers.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Unsold</span>
                  <span className="font-bold text-gray-600">{unsoldPlayers.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Teams</span>
                  <span className="font-bold text-blue-600">{teams.length}</span>
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Users size={16} className="sm:w-5 sm:h-5" />
                Teams
              </h2>
              <div className="space-y-2 sm:space-y-3 max-h-[300px] lg:max-h-none overflow-y-auto">
                {teams.map((team) => (
                  <div key={team._id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{team.teamName}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                          {team.players?.length || 0} players
                        </span>
                        <button
                          onClick={() => setSelectedTeam(team)}
                          className="p-1.5 hover:bg-blue-100 rounded transition-colors min-w-[36px] h-[36px] flex items-center justify-center"
                          title="View Squad"
                        >
                          <Eye size={14} className="text-blue-600" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <DollarSign size={12} className="text-green-600 sm:w-3.5 sm:h-3.5" />
                      <span className="text-gray-600">
                        Purse: <span className="font-semibold text-green-600">
                          ₹{getTeamPurse(team)} Cr
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
                {teams.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Waiting for teams to join...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Current Bidding & Players */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Current Bidding */}
            {currentPlayer && (
              <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold">Current Player</h2>
                  <button
                    onClick={() => setCurrentPlayer(null)}
                    className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors ml-2 min-w-[36px] h-[36px] flex items-center justify-center"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 mb-3 sm:mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{currentPlayer.name}</h3>
                  <div className="flex gap-2 flex-wrap text-xs sm:text-sm mb-3 sm:mb-4">
                    <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full">{currentPlayer.role}</span>
                    <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full">{currentPlayer.country}</span>
                  </div>
                  
                  {currentPlayer.stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 bg-white/10 rounded-lg p-2 sm:p-3">
                      {currentPlayer.stats.matches > 0 && (
                        <div>
                          <p className="text-white/70 text-xs">Matches</p>
                          <p className="text-base sm:text-lg font-bold">{currentPlayer.stats.matches}</p>
                        </div>
                      )}
                      {currentPlayer.stats.runs !== undefined && currentPlayer.stats.runs > 0 && (
                        <div>
                          <p className="text-white/70 text-xs">Runs</p>
                          <p className="text-base sm:text-lg font-bold">{currentPlayer.stats.runs}</p>
                        </div>
                      )}
                      {currentPlayer.stats.wickets !== undefined && currentPlayer.stats.wickets > 0 && (
                        <div>
                          <p className="text-white/70 text-xs">Wickets</p>
                          <p className="text-base sm:text-lg font-bold">{currentPlayer.stats.wickets}</p>
                        </div>
                      )}
                      {currentPlayer.stats.average !== undefined && currentPlayer.stats.average > 0 && (
                        <div>
                          <p className="text-white/70 text-xs">Average</p>
                          <p className="text-base sm:text-lg font-bold">{currentPlayer.stats.average}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 sm:mb-4">
                    <div>
                      <p className="text-white/70 text-xs sm:text-sm">Base Price</p>
                      <p className="text-lg sm:text-xl font-bold">₹{currentPlayer.basePrice} Cr</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs sm:text-sm">Current Bid</p>
                      <p className="text-xl sm:text-2xl font-bold">₹{currentBid} Cr</p>
                    </div>
                  </div>

                  {highestBidder && (
                    <div className="bg-green-500/30 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                      <p className="text-xs sm:text-sm text-white/80">Highest Bidder</p>
                      <p className="text-base sm:text-lg font-bold">{highestBidder}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={sellPlayer}
                    disabled={!highestBidder}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-colors text-sm min-h-[44px]"
                  >
                    Sold!
                  </button>
                  <button
                    onClick={markUnsold}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-colors text-sm min-h-[44px]"
                  >
                    Unsold
                  </button>
                </div>
              </div>
            )}

            {/* Players List */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Players Database</h2>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {filteredPlayers.length} of {players.length} players
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by name, role, country, or team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 sm:pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[44px]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 min-w-[36px] h-[36px] flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-[50vh] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
                {players.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 text-sm">No players uploaded yet.</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">Upload an Excel file to get started</p>
                  </div>
                ) : filteredPlayers.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 text-sm">No players found matching "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 min-h-[36px]"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  filteredPlayers.map((player) => (
                    <div key={player._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{player.name}</h3>
                          <div className="flex flex-wrap gap-1 mt-1 text-xs sm:text-sm text-gray-600">
                            <span>{player.role}</span>
                            <span>•</span>
                            <span>{player.country}</span>
                            {player.stats?.matches > 0 && (
                              <>
                                <span>•</span>
                                <span>Mat: {player.stats.matches}</span>
                              </>
                            )}
                            {player.stats?.runs !== undefined && player.stats.runs > 0 && (
                              <>
                                <span>•</span>
                                <span>Runs: {player.stats.runs}</span>
                              </>
                            )}
                            {player.stats?.wickets !== undefined && player.stats.wickets > 0 && (
                              <>
                                <span>•</span>
                                <span>Wkt: {player.stats.wickets}</span>
                              </>
                            )}
                            {player.stats?.average !== undefined && player.stats.average > 0 && (
                              <>
                                <span>•</span>
                                <span>Avg: {player.stats.average}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>Base: ₹{player.basePrice} Cr</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                          {player.status === 'sold' && (
                            <div className="text-right flex-shrink-0">
                              <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                                Sold to {player.soldTo}
                              </span>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">₹{player.soldPrice} Cr</p>
                            </div>
                          )}
                          
                          {player.status === 'unsold' && (
                            <button
                              onClick={() => startBidding(player)}
                              disabled={currentPlayer !== null}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors text-xs sm:text-sm min-h-[44px]"
                            >
                              <Play size={14} className="sm:w-4 sm:h-4" />
                              Start Bidding
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Squad Modal - Mobile Responsive */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">{selectedTeam.teamName}</h2>
                  <p className="text-blue-100 text-xs sm:text-sm mt-1">Squad Overview</p>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors min-w-[44px] h-[44px] flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-blue-100 text-xs">Players</p>
                  <p className="text-lg sm:text-2xl font-bold">{selectedTeam.players?.length || 0}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-blue-100 text-xs">Purse Remaining</p>
                  <p className="text-lg sm:text-2xl font-bold">₹{getTeamPurse(selectedTeam)} Cr</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-blue-100 text-xs">Total Spent</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    ₹{((currentRoom?.rules?.totalPurse || 100) - getTeamPurse(selectedTeam)).toFixed(2)} Cr
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-250px)]">
              {selectedTeam.players && selectedTeam.players.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {selectedTeam.players.map((player, index) => (
                    <div key={player._id || index} className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-lg">{player.name}</h3>
                          <div className="flex gap-2 mt-2 text-xs sm:text-sm text-gray-600 flex-wrap">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 sm:py-1 rounded">{player.role}</span>
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 sm:py-1 rounded">{player.country}</span>
                          </div>
                          
                          {player.stats && (
                            <div className="flex flex-wrap gap-3 mt-2 sm:mt-3 text-xs sm:text-sm">
                              {player.stats.matches > 0 && (
                                <div>
                                  <span className="text-gray-500">Matches:</span>
                                  <span className="font-semibold text-gray-700 ml-1">{player.stats.matches}</span>
                                </div>
                              )}
                              {player.stats.runs !== undefined && player.stats.runs > 0 && (
                                <div>
                                  <span className="text-gray-500">Runs:</span>
                                  <span className="font-semibold text-gray-700 ml-1">{player.stats.runs}</span>
                                </div>
                              )}
                              {player.stats.wickets !== undefined && player.stats.wickets > 0 && (
                                <div>
                                  <span className="text-gray-500">Wickets:</span>
                                  <span className="font-semibold text-gray-700 ml-1">{player.stats.wickets}</span>
                                </div>
                              )}
                              {player.stats.average !== undefined && player.stats.average > 0 && (
                                <div>
                                  <span className="text-gray-500">Average:</span>
                                  <span className="font-semibold text-gray-700 ml-1">{player.stats.average}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right sm:ml-4">
                          <p className="text-xs text-gray-500">Bought for</p>
                          <p className="text-lg sm:text-xl font-bold text-green-600">₹{player.soldPrice} Cr</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Users size={40} className="mx-auto text-gray-300 mb-4 sm:mb-4" />
                  <p className="text-gray-500 text-sm">No players in this squad yet</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2">Players will appear here once they are bought</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedTeam(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-colors text-sm min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctioneerDashboard;
