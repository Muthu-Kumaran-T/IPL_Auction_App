// frontend/src/store/roomStore.js
import { create } from 'zustand';
import { roomAPI } from '../services/api';

const useRoomStore = create((set, get) => ({
  currentRoom: null,
  teams: [],
  loading: false,
  error: null,

  // Set current room
  setCurrentRoom: (room) => set({ currentRoom: room }),

  // Fetch room details
  fetchRoomDetails: async (roomId) => {
    set({ loading: true, error: null });
    try {
      const response = await roomAPI.getRoomDetails(roomId);
      set({
        currentRoom: response.data.room,
        loading: false
      });
      return { success: true, room: response.data.room };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch room details';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Fetch teams in room
  fetchTeams: async (roomId) => {
    try {
      const response = await roomAPI.getTeams(roomId);
      set({ teams: response.data.teams });
      return { success: true, teams: response.data.teams };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch teams';
      return { success: false, error: errorMessage };
    }
  },

  // Update room state from socket
  updateRoomFromSocket: (roomData) => {
    set({ currentRoom: roomData });
  },

  // Clear room data
  clearRoom: () => set({ currentRoom: null, teams: [], error: null }),

  // Clear error
  clearError: () => set({ error: null })
}));

export default useRoomStore;