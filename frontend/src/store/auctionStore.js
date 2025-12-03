// frontend/src/store/auctionStore.js
import { create } from 'zustand';

const useAuctionStore = create((set) => ({
  currentPlayer: null,
  currentBid: 0,
  highestBidder: null,
  biddingActive: false,
  players: [],
  teams: [],

  // Set current player being auctioned
  setCurrentPlayer: (player) => set({ 
    currentPlayer: player,
    currentBid: player?.basePrice || 0,
    highestBidder: null,
    biddingActive: true
  }),

  // Update current bid
  updateBid: (bidAmount, bidder) => set({
    currentBid: bidAmount,
    highestBidder: bidder
  }),

  // End bidding
  endBidding: () => set({
    currentPlayer: null,
    currentBid: 0,
    highestBidder: null,
    biddingActive: false
  }),

  // Set players list
  setPlayers: (players) => set({ players }),

  // Set teams list
  setTeams: (teams) => set({ teams }),

  // Update player status
  updatePlayerStatus: (playerId, status, soldPrice, soldTo) => set((state) => ({
    players: state.players.map(p => 
      p._id === playerId 
        ? { ...p, status, soldPrice, soldTo }
        : p
    )
  })),

  // Clear all auction data
  clearAuction: () => set({
    currentPlayer: null,
    currentBid: 0,
    highestBidder: null,
    biddingActive: false,
    players: [],
    teams: []
  })
}));

export default useAuctionStore;