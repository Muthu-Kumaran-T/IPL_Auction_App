// frontend/src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Users } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4">
            <span className="text-white font-semibold text-xs sm:text-sm">
              🏏 Welcome to IPL Auction
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
            IPL Auction Arena
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto px-2">
            Experience the thrill of IPL auctions with your friends. 
            Create rooms, bid on players, and build your dream team!
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Auctioneer Card */}
          <div 
            onClick={() => navigate('/login?role=auctioneer')}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all cursor-pointer group"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gavel className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 text-center">
              Auctioneer
            </h2>
            <p className="text-gray-600 text-center mb-6 text-sm sm:text-base leading-relaxed px-2">
              Create and manage auction rooms, upload player lists, and control the bidding process
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start text-sm text-gray-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                Create auction rooms
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                Upload player database
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                Control bidding flow
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                Monitor all teams
              </li>
            </ul>
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-sm sm:text-base min-h-[48px]">
              Start as Auctioneer
            </button>
          </div>

          {/* Contestant Card */}
          <div 
            onClick={() => navigate('/login?role=contestant')}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all cursor-pointer group"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 text-center">
              Contestant
            </h2>
            <p className="text-gray-600 text-center mb-6 text-sm sm:text-base leading-relaxed px-2">
              Join auction rooms, place strategic bids, and build your ultimate cricket team
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start text-sm text-gray-700">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                Join with Room ID
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                Place competitive bids
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                Build dream squad
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                Chat with teams
              </li>
            </ul>
            <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all text-sm sm:text-base min-h-[48px]">
              Join as Contestant
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 pt-8 sm:pt-12">
          <p className="text-white/80 text-xs sm:text-sm">
            Built with ❤️ for cricket enthusiasts
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
