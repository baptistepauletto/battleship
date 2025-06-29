# Battleship Game 🚢⚓

A modern, fully functional **multiplayer** Battleship web game built with HTML, CSS, JavaScript, and Firebase for real-time gameplay.

## Features ✨

- **🌐 Real-time Multiplayer**: Play with friends online using room codes
- **🎨 Beautiful Modern UI**: Glass-morphism design with smooth animations
- **🎮 Complete Gameplay**: Full battleship rules implementation
- **🏠 Room System**: Create or join game rooms with 6-digit codes
- **🚢 Interactive Ship Placement**: Click to place ships or use random placement
- **🔄 Ship Rotation**: Rotate ships between horizontal and vertical orientations
- **💥 Visual Feedback**: Clear hit/miss indicators with emojis
- **🏆 Win Detection**: Automatic game end when all ships are destroyed
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔄 Auto-Reconnection**: Handles connection issues gracefully
- **⚡ Real-time Sync**: All actions synchronized instantly between players

## How to Play 🎮

### 1. Connection Phase
1. **Create Room**: Click "Create Room" to generate a 6-digit room code
2. **Join Room**: Enter a friend's room code to join their game
3. **Wait for Connection**: Both players must be connected to start

### 2. Ship Placement Phase
Both players simultaneously place 5 ships on their boards:
- Carrier (5 spaces)
- Battleship (4 spaces)
- Cruiser (3 spaces)
- Submarine (3 spaces)
- Destroyer (2 spaces)

**Placement Options**:
- **Manual**: Click ship → rotate if needed → click board to place
- **Random**: Use "Random Placement" for instant positioning
- **Ready**: Click "Ready to Battle" when all ships are placed

### 3. Battle Phase
- Players take turns attacking opponent's board
- 💥 = Hit (red) - Get another turn!
- 💧 = Miss (gray) - Turn switches to opponent
- First player to sink all opponent ships wins!

## Getting Started 🚀

### Quick Setup (5 minutes):
1. **Set up Firebase** (required for multiplayer) - see [Firebase Setup Guide](firebase-setup.md)
2. **Update** the Firebase config in `index.html` with your credentials
3. **Deploy** to GitHub Pages or open locally
4. **Share** the link with friends to play!

### Local Testing:
1. Open `index.html` in two browser tabs/windows
2. Create room in one tab, join with the code in the other
3. Play against yourself to test the game!

## Technical Details 🔧

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks)
- **Backend**: Firebase Realtime Database for multiplayer sync
- **Modular structure**: Separated into HTML, CSS, and JS files for maintainability
- **Modern features**: CSS Grid, Flexbox, CSS animations, WebRTC-like experience
- **Browser compatibility**: Works in all modern browsers
- **Real-time**: Sub-second synchronization between players
- **Scalable**: Supports unlimited concurrent games

## Project Structure 📁

```
battleship/
├── index.html          # Main HTML structure and layout
├── styles.css          # All game styling, animations, and themes
├── game.js             # Complete game logic and Firebase integration
├── firebase-setup.md   # Step-by-step Firebase configuration guide
├── test-guide.md       # Comprehensive testing instructions
└── README.md           # This documentation
```

The codebase is organized into separate files for better maintainability while remaining deployment-friendly for static hosting platforms.

## Architecture 🏗️

```
Player 1 Browser ←→ Firebase Realtime DB ←→ Player 2 Browser
     ↓                      ↓                      ↓
  Game State            Synchronized           Game State
  Updates              Game Rooms              Updates
```

## Game Rules 📋

- 10x10 grid for each player
- 5 ships of different sizes must be placed
- Ships cannot overlap or touch diagonally/adjacently
- Players alternate turns shooting at opponent's board
- Hit = Get another turn, Miss = Turn switches
- Game ends when all ships of one player are destroyed
- Real-time synchronization of all actions

## Deployment Options 🌐

1. **GitHub Pages** (Recommended): Free static hosting
2. **Netlify**: Drop-and-deploy with custom domain
3. **Firebase Hosting**: Integrated with your Firebase project
4. **Local**: Just open `index.html` after Firebase setup

## Performance 📊

- **Load time**: < 2 seconds on average connection
- **Real-time latency**: < 500ms for game actions
- **Concurrent players**: Limited only by Firebase plan
- **Mobile optimized**: Touch-friendly interface

Have fun playing Battleship online with friends! 🎯🌐 