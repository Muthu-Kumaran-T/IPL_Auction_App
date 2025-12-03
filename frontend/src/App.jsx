// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Landing from './pages/Landing';
import Login from './pages/Login';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import GameSelection from './pages/GameSelection';
import AuctioneerDashboard from './pages/AuctioneerDashboard';
import ContestantDashboard from './pages/ContestantDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { fetchUser, isLoading } = useAuthStore();

  // Fetch user on app initialization
  useEffect(() => {
    fetchUser();
  }, []);

  // Show loading screen while checking authentication on initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/game-selection"
          element={
            <ProtectedRoute>
              <GameSelection />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/create-room"
          element={
            <ProtectedRoute>
              <CreateRoom />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/join-room"
          element={
            <ProtectedRoute>
              <JoinRoom />
            </ProtectedRoute>
          }
        />
        
        {/* Updated routes to match your dashboard components */}
        <Route
          path="/auction/:roomId/auctioneer"
          element={
            <ProtectedRoute>
              <AuctioneerDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/auction/:roomId/contestant"
          element={
            <ProtectedRoute>
              <ContestantDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Legacy routes - redirect to new format */}
        <Route
          path="/auctioneer-dashboard/:roomId"
          element={<Navigate to="/auction/:roomId/auctioneer" replace />}
        />
        
        <Route
          path="/contestant-dashboard/:roomId"
          element={<Navigate to="/auction/:roomId/contestant" replace />}
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;