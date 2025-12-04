// frontend/src/components/PlayingXIModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, Star, Shield, AlertCircle, Move } from 'lucide-react';
import { roomAPI } from '../services/api';

const PlayingXIModal = ({ isOpen, onClose, myTeam, roomId, onSuccess }) => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playingXI, setPlayingXI] = useState(Array(11).fill(null));
  const [captain, setCaptain] = useState(null);
  const [viceCaptain, setViceCaptain] = useState(null);
  const [wicketKeeper, setWicketKeeper] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [draggedPlayer, setDraggedPlayer] = useState(null);

  const getPlayerById = useCallback(
    (playerId) => {
      return myTeam?.players?.find((p) => (p._id || p) === playerId);
    },
    [myTeam?.players]
  );

  useEffect(() => {
    if (myTeam?.playingXI) {
      const savedPlayers =
        myTeam.playingXI.players?.map((p) => p._id || p) || [];
      setSelectedPlayers(savedPlayers);

      const savedXI = Array(11).fill(null);
      savedPlayers.slice(0, 11).forEach((playerId, index) => {
        savedXI[index] = playerId;
      });
      setPlayingXI(savedXI);

      setCaptain(
        myTeam.playingXI.captain?._id || myTeam.playingXI.captain
      );
      setViceCaptain(
        myTeam.playingXI.viceCaptain?._id || myTeam.playingXI.viceCaptain
      );
      setWicketKeeper(
        myTeam.playingXI.wicketKeeper?._id || myTeam.playingXI.wicketKeeper
      );
    }
  }, [myTeam]);

  if (!isOpen || !myTeam) return null;

  const togglePlayer = (playerId) => {
    const player = getPlayerById(playerId);
    if (!player) return;

    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
      setPlayingXI(playingXI.map((id) => (id === playerId ? null : id)));

      if (captain === playerId) setCaptain(null);
      if (viceCaptain === playerId) setViceCaptain(null);
      if (wicketKeeper === playerId) setWicketKeeper(null);
    } else if (selectedPlayers.length < 15) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const handleDragStart = (e, playerId) => {
    setDraggedPlayer(playerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedPlayer) {
      const newXI = [...playingXI];
      const currentIndex = newXI.indexOf(draggedPlayer);

      if (currentIndex >= 0) {
        newXI.splice(currentIndex, 1);
        newXI.splice(targetIndex, 0, draggedPlayer);
      } else {
        newXI[targetIndex] = draggedPlayer;
        if (!selectedPlayers.includes(draggedPlayer)) {
          setSelectedPlayers([...selectedPlayers, draggedPlayer]);
        }
      }

      setPlayingXI(newXI);
      setDraggedPlayer(null);
    }
  };

  const removeFromXI = (index) => {
    const newXI = [...playingXI];
    const playerId = newXI[index];
    newXI[index] = null;
    setPlayingXI(newXI);

    if (playerId && !selectedPlayers.includes(playerId)) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const validateSelection = () => {
    const validationErrors = [];

    if (playingXI.filter((p) => p !== null).length !== 11) {
      validationErrors.push('Select exactly 11 players for Playing XI');
    }

    if (!captain) {
      validationErrors.push('Select a captain');
    }

    if (!viceCaptain) {
      validationErrors.push('Select a vice captain');
    }

    if (!wicketKeeper) {
      validationErrors.push('Select a wicket keeper');
    }

    if (captain === viceCaptain) {
      validationErrors.push('Captain and vice captain must be different');
    }

    const xiPlayers = playingXI
      .map((id) => getPlayerById(id))
      .filter(Boolean);
    const foreignPlayerCount = xiPlayers.filter(
      (p) => p.country && p.country.toLowerCase() !== 'india'
    ).length;

    if (foreignPlayerCount > 4) {
      validationErrors.push(
        `Only 4 foreign players allowed in XI (you have ${foreignPlayerCount})`
      );
    }

    const wkPlayer = getPlayerById(wicketKeeper);
    if (
      wicketKeeper &&
      wkPlayer &&
      wkPlayer.role !== 'Wicket-Keeper'
    ) {
      validationErrors.push(
        'Selected wicket keeper must have Wicket-Keeper role'
      );
    }

    return validationErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateSelection();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors([]);

    try {
      await roomAPI.updatePlayingXI(roomId, {
        players: playingXI.filter((p) => p !== null),
        captain,
        viceCaptain,
        wicketKeeper,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      setErrors([
        error.response?.data?.message || 'Failed to save Playing XI',
      ]);
    } finally {
      setSaving(false);
    }
  };

  const isSelected = (playerId) => selectedPlayers.includes(playerId);
  const isInXI = (playerId) => playingXI.includes(playerId);
  const isForeign = (player) =>
    player.country && player.country.toLowerCase() !== 'india';

  const foreignCount = playingXI.filter((id) => {
    const player = getPlayerById(id);
    return player && isForeign(player);
  }).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold truncate">
                Select Playing XI
              </h2>
              <p className="text-purple-100 text-xs sm:text-sm mt-1">
                {myTeam.teamName} •{' '}
                {playingXI.filter((p) => p !== null).length}/11 players
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-3 min-w-[40px] h-[40px] flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>

          {/* Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
            <div
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center ${
                playingXI.filter((p) => p !== null).length === 11
                  ? 'ring-2 ring-green-300'
                  : ''
              }`}
            >
              <p className="text-white/70 text-xs">Players</p>
              <p className="text-lg sm:text-xl font-bold">
                {playingXI.filter((p) => p !== null).length}/11
              </p>
            </div>
            <div
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center ${
                foreignCount <= 4 ? '' : 'ring-2 ring-red-300'
              }`}
            >
              <p className="text-white/70 text-xs">Foreign</p>
              <p className="text-lg sm:text-xl font-bold">
                {foreignCount}/4
              </p>
            </div>
            <div
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center ${
                captain ? 'ring-2 ring-yellow-300' : ''
              }`}
            >
              <p className="text-white/70 text-xs">Captain</p>
              <p className="text-sm font-bold">
                {captain ? '✓' : 'Not Set'}
              </p>
            </div>
            <div
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center ${
                wicketKeeper ? 'ring-2 ring-blue-300' : ''
              }`}
            >
              <p className="text-white/70 text-xs">Wicket Keeper</p>
              <p className="text-sm font-bold">
                {wicketKeeper ? '✓' : 'Not Set'}
              </p>
            </div>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-b-2 border-red-200 p-3 sm:p-4 max-h-20 overflow-y-auto">
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-red-700 text-xs sm:text-sm mb-2 last:mb-0"
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          {/* Mobile: Tabbed scrollable sections */}
          <div className="block sm:hidden flex flex-col h-full max-h-[calc(100vh-300px)]">
            {/* Playing XI Tab */}
            <div className="flex-1 min-h-0 overflow-y-auto mb-4 pb-4 -mr-4 pr-4">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 sticky top-0 bg-white pt-4 pb-2 z-10">
                <Star size={16} className="text-purple-600" />
                Playing XI Positions
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {playingXI.map((playerId, index) => {
                  const player = getPlayerById(playerId);
                  const isC = captain === playerId;
                  const isVC = viceCaptain === playerId;
                  const isWK = wicketKeeper === playerId;

                  return (
                    <div
                      key={`slot-${index}`}
                      className={`group relative p-3 rounded-lg border-2 min-h-[100px] transition-all flex flex-col ${
                        playerId
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-md'
                          : 'bg-gray-50 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-25'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      {playerId ? (
                        <>
                          <div className="absolute top-2 right-2 flex gap-1">
                            <div
                              className="p-1 cursor-move opacity-50 hover:opacity-100 transition-all"
                              draggable
                              onDragStart={(e) =>
                                handleDragStart(e, playerId)
                              }
                            >
                              <Move
                                size={14}
                                className="text-gray-500 hover:text-gray-700"
                              />
                            </div>
                            <button
                              className="p-1 rounded-full bg-red-500/10 hover:bg-red-500/20 min-w-[28px] h-[28px] flex items-center justify-center"
                              onClick={() => removeFromXI(index)}
                            >
                              <X size={12} className="text-red-500" />
                            </button>
                          </div>

                          <div className="flex flex-col items-center text-center mb-2 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
                              <span className="text-white font-bold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <p className="font-semibold text-gray-900 text-xs truncate max-w-[120px]">
                              {player?.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {player?.role}
                            </p>
                            {player?.soldPrice && (
                              <p className="text-xs text-green-600 font-semibold">
                                ₹{player.soldPrice} Cr
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-1 mt-auto">
                            <button
                              onClick={() => setCaptain(playerId)}
                              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all w-full ${
                                isC
                                  ? 'bg-yellow-500 text-white shadow-sm'
                                  : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                              }`}
                            >
                              <Star size={10} />
                              {isC ? 'Captain' : 'C'}
                            </button>

                            <button
                              onClick={() => setViceCaptain(playerId)}
                              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all w-full ${
                                isVC
                                  ? 'bg-orange-500 text-white shadow-sm'
                                  : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                              }`}
                            >
                              <Star size={10} />
                              {isVC ? 'VC' : 'VC'}
                            </button>
                          </div>

                          {player?.role === 'Wicket-Keeper' && (
                            <button
                              onClick={() => setWicketKeeper(playerId)}
                              className={`mt-2 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all w-full ${
                                isWK
                                  ? 'bg-blue-500 text-white shadow-sm'
                                  : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                              }`}
                            >
                              <Shield size={12} />
                              {isWK ? 'Keeper' : 'Keeper'}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                            <Check size={18} className="opacity-50" />
                          </div>
                          <p className="text-xs font-medium">
                            Drop player here
                          </p>
                          <p className="text-xs">Slot {index + 1}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Available Players Tab */}
            <div className="flex-1 min-h-0 overflow-y-auto -mr-4 pr-4">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 sticky top-0 bg-white pt-4 pb-2 z-10">
                Available Players
              </h3>
              <div className="space-y-2">
                {myTeam.players.map((player) => {
                  const playerId = player._id || player;
                  if (isInXI(playerId)) return null;

                  return (
                    <div
                      key={playerId}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, playerId)
                      }
                      className={`p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md min-h-[80px] ${
                        isSelected(playerId)
                          ? 'bg-green-50 border-green-500'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePlayer(playerId)}
                    >
                      <div className="flex flex-col gap-2 h-full">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1 mb-1 truncate">
                            {player.name}
                            {isForeign(player) && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded whitespace-nowrap">
                                Foreign
                              </span>
                            )}
                          </h4>
                          <div className="flex flex-wrap gap-1 text-xs">
                            <span className="bg-gray-200 px-2 py-0.5 rounded">
                              {player.role}
                            </span>
                            <span className="bg-gray-200 px-2 py-0.5 rounded truncate max-w-[80px]">
                              {player.country}
                            </span>
                          </div>
                        </div>
                        <div className="text-right mt-1">
                          <p className="text-sm font-bold text-green-600">
                            ₹{player.soldPrice} Cr
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Drag to add →
                        </span>
                        <div
                          className={`w-7 h-7 rounded border-2 flex items-center justify-center ${
                            isSelected(playerId)
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {isSelected(playerId) ? (
                            <Check
                              size={14}
                              className="text-white"
                            />
                          ) : (
                            <span className="text-xs font-bold text-gray-400">
                              +
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop: Side-by-side layout */}
          <div className="hidden sm:flex flex-row gap-4 h-full max-h-[calc(100vh-300px)]">
            {/* Playing XI Slots */}
            <div className="w-1/2 pr-2 max-h-full overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 sticky top-0 bg-white pt-4 pb-2 z-10">
                <Star size={16} className="text-purple-600" />
                Playing XI Positions
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {playingXI.map((playerId, index) => {
                  const player = getPlayerById(playerId);
                  const isC = captain === playerId;
                  const isVC = viceCaptain === playerId;
                  const isWK = wicketKeeper === playerId;

                  return (
                    <div
                      key={`slot-${index}`}
                      className={`group relative p-4 rounded-lg border-2 min-h-[120px] transition-all flex flex-col ${
                        playerId
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-md'
                          : 'bg-gray-50 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-25'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      {/* Same content as mobile but with sm sizes restored */}
                      {playerId ? (
                        <>
                          <div className="absolute top-2 right-2 flex gap-1">
                            <div
                              className="p-1 cursor-move opacity-50 hover:opacity-100 transition-all"
                              draggable
                              onDragStart={(e) =>
                                handleDragStart(e, playerId)
                              }
                            >
                              <Move
                                size={14}
                                className="text-gray-500 hover:text-gray-700"
                              />
                            </div>
                            <button
                              className="p-1 rounded-full bg-red-500/10 hover:bg-red-500/20 min-w-[28px] h-[28px] flex items-center justify-center"
                              onClick={() => removeFromXI(index)}
                            >
                              <X size={12} className="text-red-500" />
                            </button>
                          </div>

                          <div className="flex flex-col items-center text-center mb-3 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
                              <span className="text-white font-bold text-base">
                                {index + 1}
                              </span>
                            </div>
                            <p className="font-semibold text-gray-900 text-sm truncate max-w-[120px]">
                              {player?.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {player?.role}
                            </p>
                            {player?.soldPrice && (
                              <p className="text-xs text-green-600 font-semibold">
                                ₹{player.soldPrice} Cr
                              </p>
                            )}
                          </div>

                          <div className="flex flex-row gap-2 mt-auto">
                            <button
                              onClick={() => setCaptain(playerId)}
                              className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-1 min-h-[32px] ${
                                isC
                                  ? 'bg-yellow-500 text-white shadow-sm'
                                  : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                              }`}
                            >
                              <Star size={10} />
                              {isC ? 'Captain' : 'C'}
                            </button>

                            <button
                              onClick={() => setViceCaptain(playerId)}
                              className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-1 min-h-[32px] ${
                                isVC
                                  ? 'bg-orange-500 text-white shadow-sm'
                                  : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                              }`}
                            >
                              <Star size={10} />
                              {isVC ? 'VC' : 'VC'}
                            </button>
                          </div>

                          {player?.role === 'Wicket-Keeper' && (
                            <button
                              onClick={() => setWicketKeeper(playerId)}
                              className={`mt-2 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[32px] ${
                                isWK
                                  ? 'bg-blue-500 text-white shadow-sm'
                                  : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                              }`}
                            >
                              <Shield size={12} />
                              {isWK ? 'Keeper' : 'Keeper'}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                            <Check size={18} className="opacity-50" />
                          </div>
                          <p className="text-sm font-medium">
                            Drop player here
                          </p>
                          <p className="text-xs">Slot {index + 1}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Available Players */}
            <div className="w-1/2 pl-2 max-h-full overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4 sticky top-0 bg-white pt-4 pb-2 z-10">
                Available Players
              </h3>
              <div className="space-y-3">
                {myTeam.players.map((player) => {
                  const playerId = player._id || player;
                  if (isInXI(playerId)) return null;

                  return (
                    <div
                      key={playerId}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, playerId)
                      }
                      className={`p-4 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md min-h-[80px] ${
                        isSelected(playerId)
                          ? 'bg-green-50 border-green-500'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePlayer(playerId)}
                    >
                      <div className="flex flex-row items-start justify-between gap-4 h-full">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-base flex items-center gap-1 mb-1 truncate">
                            {player.name}
                            {isForeign(player) && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded whitespace-nowrap">
                                Foreign
                              </span>
                            )}
                          </h4>
                          <div className="flex flex-wrap gap-1 text-xs">
                            <span className="bg-gray-200 px-2 py-0.5 rounded">
                              {player.role}
                            </span>
                            <span className="bg-gray-200 px-2 py-0.5 rounded truncate max-w-[80px]">
                              {player.country}
                            </span>
                          </div>
                        </div>
                        <div className="text-right mt-1 flex-shrink-0">
                          <p className="text-sm font-bold text-green-600">
                            ₹{player.soldPrice} Cr
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Drag to add →
                        </span>
                        <div
                          className={`w-7 h-7 rounded border-2 flex items-center justify-center ${
                            isSelected(playerId)
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {isSelected(playerId) ? (
                            <Check
                              size={14}
                              className="text-white"
                            />
                          ) : (
                            <span className="text-xs font-bold text-gray-400">
                              +
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              saving ||
              playingXI.filter((p) => p !== null).length !== 11
            }
            className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm min-h-[44px]"
          >
            {saving ? 'Saving...' : 'Save Playing XI'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayingXIModal;
