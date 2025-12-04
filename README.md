# 🏏 IPL Auction Web App

Build your dream cricket team with friends in this real-time IPL-style auction platform. Host auctions as an auctioneer or compete as a team owner to bid on players and create the ultimate squad.

## ✨ Features

### For Auctioneers 🎤
- **Room Management**: Create auction rooms with unique IDs
- **Player Database**: Upload player lists via Excel files
- **Auction Control**: Start, pause, and manage the bidding process
- **Live Monitoring**: Track all teams, budgets, and player acquisitions
- **Real-time Updates**: See all bids as they happen

### For Team Owners 🏆
- **Easy Access**: Join rooms with a simple Room ID
- **Competitive Bidding**: Place bids and compete with other teams
- **Squad Management**: Track your roster and remaining budget
- **Live Chat**: Communicate with other participants
- **Player Stats**: View detailed player information during auctions

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io for live bidding
- **Security**: JWT-based authentication
- **File Handling**: Multer for Excel uploads

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io-client
- **State**: Zustand for state management
- **Routing**: React Router

## 📥 Installation Guide

### Requirements
- Node.js v14 or higher
- MongoDB (local or Atlas)
- npm or yarn package manager

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd ipl-auction-app
```

### Step 2: Backend Configuration

```bash
cd backend
npm install

# Create environment variables
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/ipl-auction
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000" > .env

# Set up directory structure
mkdir -p src/{config,models,routes,controllers,middleware,socket} uploads
```

### Step 3: Frontend Configuration

```bash
cd ../frontend
npm install

# Create environment variables
echo "REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000" > .env
```

## 🚀 Running the Application

### Start Database
```bash
# Local MongoDB
mongod

# Or configure MongoDB Atlas URI in backend .env
```

### Launch Backend
```bash
cd backend
npm run dev
# Server runs at http://localhost:5000
```

### Launch Frontend
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

## 📁 Project Architecture

```
ipl-auction-app/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database connection
│   │   ├── models/
│   │   │   ├── User.js               # User data model
│   │   │   ├── Room.js               # Auction room model
│   │   │   └── Player.js             # Player data model
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # Auth endpoints
│   │   │   ├── room.routes.js        # Room endpoints
│   │   │   ├── player.routes.js      # Player endpoints
│   │   │   └── auction.routes.js     # Auction endpoints
│   │   ├── controllers/
│   │   │   ├── authController.js     # Auth business logic
│   │   │   ├── roomController.js     # Room business logic
│   │   │   └── playerController.js   # Player business logic
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT middleware
│   │   │   └── upload.js             # File upload middleware
│   │   ├── socket/
│   │   │   └── auctionHandler.js     # WebSocket handlers
│   │   └── server.js                 # Application entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/               # Reusable UI components
    │   ├── pages/
    │   │   ├── Landing.jsx           # Home page
    │   │   ├── Login.jsx             # Authentication page
    │   │   ├── AuctioneerDashboard.jsx
    │   │   └── ContestantDashboard.jsx
    │   ├── services/
    │   │   ├── api.js                # HTTP API client
    │   │   └── socket.js             # WebSocket client
    │   ├── store/
    │   │   └── authStore.js          # Auth state management
    │   └── App.jsx                   # Root component
    └── package.json
```

## 🎮 How to Use

### As an Auctioneer:
1. Register or log in with an Auctioneer account
2. Create a new auction room
3. Upload your player database (Excel format)
4. Share the Room ID with team owners
5. Control the auction flow and start bidding for players
6. Monitor all teams' budgets and squads in real-time
7. Declare players sold or unsold based on bids

### As a Team Owner:
1. Register or log in as a Contestant
2. Join an auction using the provided Room ID
3. Set your team name and budget
4. View player details and statistics
5. Place bids when players go up for auction
6. Build your squad within budget constraints
7. Use the chat to interact with other owners

## 📊 Player Database Format

Your Excel file should contain these columns:

| Name | Country | Role | Base Price | Matches | Runs | Wickets | Average |
|------|---------|------|------------|---------|------|---------|---------|
| Virat Kohli | India | Batsman | 2.0 | 223 | 7263 | 4 | 49.9 |
| Jasprit Bumrah | India | Bowler | 2.0 | 120 | 56 | 165 | 24.4 |
| Hardik Pandya | India | All-Rounder | 2.0 | 107 | 1500 | 60 | 28.5 |
| MS Dhoni | India | Wicket-Keeper | 2.0 | 234 | 5082 | 0 | 39.1 |

**Mandatory Fields**: Name, Country, Role, Base Price  
**Optional Fields**: Matches, Runs, Wickets, Average

**Valid Roles**: Batsman, Bowler, All-Rounder, Wicket-Keeper

## 🔌 WebSocket Events

### Client Events (Outgoing):
- `join-room` - Connect to an auction room
- `start-bidding` - Begin bidding on a player (Auctioneer)
- `place-bid` - Submit a bid amount
- `sell-player` - Finalize player sale (Auctioneer)
- `unsold-player` - Mark player as unsold (Auctioneer)
- `send-message` - Send chat message

### Server Events (Incoming):
- `room-state` - Complete room status update
- `user-joined` - New participant notification
- `bidding-started` - Bidding initiated for a player
- `new-bid` - Bid placed by a team
- `player-sold` - Player successfully sold
- `player-unsold` - Player went unsold
- `new-message` - Chat message received
- `error` - Error notifications

## 🔐 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Authenticate user
GET    /api/auth/me           Get current user profile
```

### Room Endpoints
```
POST   /api/room/create       Create auction room (Auctioneer only)
POST   /api/room/join         Join existing room
GET    /api/room/:roomId      Fetch room details
GET    /api/room/:roomId/teams   Get all teams in room
```

### Player Endpoints
```
POST   /api/player/upload/:roomId      Upload player database
GET    /api/player/:roomId             Get all players in room
GET    /api/player/details/:playerId   Get specific player details
```

### Auction Endpoints
```
GET    /api/auction/:roomId/status     Get current auction status
POST   /api/auction/:roomId/start      Start auction (Auctioneer)
POST   /api/auction/:roomId/end        End auction (Auctioneer)
```

## 🗺️ Development Roadmap

### Phase 1: Foundation ✅
- [x] User authentication system
- [x] Room creation and joining
- [x] Player database upload
- [x] Socket.io integration
- [ ] Complete auctioneer dashboard
- [ ] Complete contestant dashboard
- [ ] Real-time bidding interface

### Phase 2: Enhanced Features
- [ ] Bid countdown timer (30 seconds)
- [ ] Live leaderboard display
- [ ] In-app chat system
- [ ] Squad composition rules (max players per role)
- [ ] Budget constraint validation
- [ ] Auction history and analytics

### Phase 3: Refinement
- [ ] Audio notifications for bids
- [ ] Custom team themes and colors
- [ ] Export auction results (PDF/Excel)
- [ ] Mobile-responsive design
- [ ] Dark mode support
- [ ] Player search and filters

### Phase 4: Advanced
- [ ] Multi-currency support
- [ ] Automated bidding bots
- [ ] Player comparison tools
- [ ] Historical auction data analysis
- [ ] Email notifications
- [ ] Admin panel for platform management

## ⚙️ Configuration Options

### Environment Variables

**Backend (.env)**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ipl-auction
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Frontend (.env)**:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_MAX_BID_AMOUNT=20
REACT_APP_MIN_BID_INCREMENT=0.5
```

## 🐛 Troubleshooting

**MongoDB Connection Issues**:
- Verify MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Ensure MongoDB port (27017) is not blocked

**Socket.io Connection Failures**:
- Verify backend server is running
- Check CORS configuration in `server.js`
- Ensure `REACT_APP_SOCKET_URL` matches backend URL

**File Upload Errors**:
- Check file size (max 5MB by default)
- Verify Excel file format (.xlsx or .xls)
- Ensure correct column names in Excel

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the IPL auction format
- Built for cricket enthusiasts worldwide
- Community-driven development

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Join our community Discord (coming soon)

---

**Happy Auctioning! May the best team win! 🏆**

*Built with ❤️ by cricket fans, for cricket fans*
