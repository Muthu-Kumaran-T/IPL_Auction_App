// frontend/src/App.js
import React from 'react';
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
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
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
        
        <Route
          path="/auctioneer-dashboard/:roomId"
          element={
            <ProtectedRoute>
              <AuctioneerDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/contestant-dashboard/:roomId"
          element={
            <ProtectedRoute>
              <ContestantDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;