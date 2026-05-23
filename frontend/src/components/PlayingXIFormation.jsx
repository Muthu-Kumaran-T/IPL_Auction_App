// frontend/src/components/PlayingXIFormation.jsx
import React from 'react';
import { Star, Shield } from 'lucide-react';

const PlayingXIFormation = ({ playingXI, players, teamName }) => {
  if (!playingXI || !players) return null;

  // Get player objects from IDs
  const getPlayer = (playerId) => {
    return players.find(p => (p._id || p) === playerId);
  };

  const captain = getPlayer(playingXI.captain);
  const viceCaptain = getPlayer(playingXI.viceCaptain);
  const wicketKeeper = getPlayer(playingXI.wicketKeeper);
  
  const selectedPlayers = playingXI.players
    .map(playerId => getPlayer(playerId))
    .filter(p => p);

  // Categorize players by role
  const batsmen = selectedPlayers.filter(p => p.role === 'Batsman');
  const allRounders = selectedPlayers.filter(p => p.role === 'All-Rounder');
  const bowlers = selectedPlayers.filter(p => p.role === 'Bowler');
  const keepers = selectedPlayers.filter(p => p.role === 'Wicket-Keeper');

  // Player card component
  const PlayerCard = ({ player, position }) => {
    const isCaptain = captain?._id === player._id;
    const isViceCaptain = viceCaptain?._id === player._id;
    const isWK = wicketKeeper?._id === player._id;

    return (
      <div className="flex flex-col items-center" style={{ position: 'relative' }}>
        <div className="relative">
          {/* Player circle with jersey */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-700 border-4 border-white shadow-lg flex items-center justify-center relative">
            <div className="text-white font-bold text-lg">
              {player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            
            {/* Captain/VC badge */}
            {isCaptain && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900">C</span>
              </div>
            )}
            {isViceCaptain && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-bold text-white">VC</span>
              </div>
            )}
            {isWK && !isCaptain && !isViceCaptain && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
            )}
          </div>
        </div>
        
        {/* Player name tag */}
        <div className="mt-2 bg-white rounded-lg px-3 py-1 shadow-md border border-gray-200">
          <p className="text-xs font-bold text-gray-900 text-center whitespace-nowrap">
            {player.name.split(' ').pop()}
          </p>
          <p className="text-xs text-green-600 text-center font-semibold">
            ₹{player.soldPrice}Cr
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-gradient-to-b from-green-600 via-green-500 to-green-600 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 text-center">
        <h2 className="text-xl font-bold">{teamName}</h2>
        <p className="text-sm text-purple-100">Playing XI</p>
      </div>

      {/* Football field pattern */}
      <div className="relative p-8" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.1) 60px, rgba(255,255,255,0.1) 61px),
          repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.1) 60px, rgba(255,255,255,0.1) 61px)
        `
      }}>
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/40 rounded-full"></div>

        {/* Formation Layout */}
        <div className="space-y-8">
          {/* Wicket Keepers */}
          {keepers.length > 0 && (
            <div className="flex justify-center gap-4">
              {keepers.map((player, idx) => (
                <PlayerCard key={player._id} player={player} position={`WK-${idx + 1}`} />
              ))}
            </div>
          )}

          {/* Batsmen */}
          {batsmen.length > 0 && (
            <div className="flex justify-center gap-4 flex-wrap">
              {batsmen.map((player, idx) => (
                <PlayerCard key={player._id} player={player} position={`BAT-${idx + 1}`} />
              ))}
            </div>
          )}

          {/* All-Rounders */}
          {allRounders.length > 0 && (
            <div className="flex justify-center gap-4 flex-wrap">
              {allRounders.map((player, idx) => (
                <PlayerCard key={player._id} player={player} position={`AR-${idx + 1}`} />
              ))}
            </div>
          )}

          {/* Bowlers */}
          {bowlers.length > 0 && (
            <div className="flex justify-center gap-4 flex-wrap">
              {bowlers.map((player, idx) => (
                <PlayerCard key={player._id} player={player} position={`BOWL-${idx + 1}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Team stats */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-4">
        <div className="grid grid-cols-4 gap-4 text-white text-center">
          <div>
            <p className="text-xs text-white/70">WK</p>
            <p className="text-lg font-bold">{keepers.length}</p>
          </div>
          <div>
            <p className="text-xs text-white/70">BAT</p>
            <p className="text-lg font-bold">{batsmen.length}</p>
          </div>
          <div>
            <p className="text-xs text-white/70">AR</p>
            <p className="text-lg font-bold">{allRounders.length}</p>
          </div>
          <div>
            <p className="text-xs text-white/70">BOWL</p>
            <p className="text-lg font-bold">{bowlers.length}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-3 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-900">C</span>
          </div>
          <span className="text-gray-600">Captain</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">VC</span>
          </div>
          <span className="text-gray-600">Vice Captain</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <Shield size={10} className="text-white" />
          </div>
          <span className="text-gray-600">Wicket Keeper</span>
        </div>
      </div>
    </div>
  );
};

export default PlayingXIFormation;