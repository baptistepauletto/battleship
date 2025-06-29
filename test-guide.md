# Multiplayer Battleship Testing Guide 🧪

Use this guide to test your multiplayer Battleship game functionality.

## Pre-Testing Setup ✅

1. **Firebase Configuration**: Ensure you've set up Firebase and updated the config in `index.html`
2. **Internet Connection**: Both testing instances need internet access
3. **Modern Browser**: Use Chrome, Firefox, Safari, or Edge (latest versions)

## Test Scenarios

### 1. Basic Connectivity Test

**Objective**: Verify Firebase connection works

**Steps**:
1. Open `index.html` in your browser
2. Check browser console (F12) for any Firebase errors
3. ✅ **Expected**: Connection screen appears without error alerts
4. ❌ **If failed**: Check Firebase config and internet connection

---

### 2. Room Creation Test

**Objective**: Test room creation functionality

**Steps**:
1. Click "🎯 Create Room"
2. Note the 6-digit room code displayed
3. ✅ **Expected**: Room code appears (e.g., "ABC123")
4. ❌ **If failed**: Check Firebase database permissions

---

### 3. Room Joining Test

**Objective**: Test room joining from another browser

**Steps**:
1. Open `index.html` in a **second browser tab/window**
2. Click "🔗 Join Room"
3. Enter the room code from Test 2
4. Click "Join Game"
5. ✅ **Expected**: Both tabs show "Both players connected!"
6. ❌ **If failed**: Verify room code is correct and Firebase rules allow access

---

### 4. Game Start Test

**Objective**: Verify game initialization

**Steps**:
1. In the host tab (first player), click "Start Game!"
2. ✅ **Expected**: Both tabs transition to ship placement phase
3. Check that both players see their own empty boards
4. ❌ **If failed**: Check browser console for JavaScript errors

---

### 5. Ship Placement Test

**Objective**: Test synchronized ship placement

**Steps**:
1. In **Player 1 tab**: Place all ships (manually or random)
2. Click "✅ Ready to Battle"
3. In **Player 2 tab**: Place all ships
4. Click "✅ Ready to Battle"
5. ✅ **Expected**: Both tabs transition to battle phase
6. ❌ **If failed**: Check that all ships are placed before clicking ready

---

### 6. Real-time Attack Test

**Objective**: Test turn-based attacking

**Steps**:
1. **Player 1** (should have first turn): Click on Player 2's board
2. Observe the result (hit/miss)
3. Check that **Player 2** tab updates immediately
4. If miss: verify turn switches to Player 2
5. If hit: verify Player 1 gets another turn
6. ✅ **Expected**: Actions sync in real-time between tabs
7. ❌ **If failed**: Check Firebase database rules and network connection

---

### 7. Win Condition Test

**Objective**: Test game end detection

**Steps**:
1. Continue attacking until one player's ships are all sunk
2. ✅ **Expected**: Victory/defeat modal appears in both tabs
3. Winner sees "🎉 VICTORY! 🎉"
4. Loser sees "💀 DEFEAT 💀"
5. ❌ **If failed**: Check win condition logic in browser console

---

### 8. Disconnection Test

**Objective**: Test handling of player disconnection

**Steps**:
1. During gameplay, close one browser tab
2. ✅ **Expected**: Other player should see connection status change
3. Reopen the closed tab and rejoin the same room
4. ✅ **Expected**: Game state should sync and continue
5. ❌ **If failed**: Check Firebase onDisconnect handlers

---

## Performance Benchmarks

### Acceptable Response Times:
- **Room creation**: < 2 seconds
- **Room joining**: < 3 seconds  
- **Ship placement sync**: < 1 second
- **Attack sync**: < 500ms
- **Game state updates**: < 1 second

### Browser Console Checks:
- No JavaScript errors
- No Firebase permission errors
- No network timeout errors

## Troubleshooting Common Issues

### Issue: "Firebase failed to load"
- **Solution**: Check internet connection and Firebase CDN accessibility

### Issue: "Room not found"
- **Solution**: Verify room code is entered correctly (case sensitive)

### Issue: "Permission denied"
- **Solution**: Check Firebase database rules allow read/write access

### Issue: Game doesn't sync
- **Solution**: Check Firebase configuration and browser console for errors

### Issue: Slow performance
- **Solution**: Check internet speed and Firebase region selection

## Mobile Testing 📱

1. Open game on mobile device
2. Test touch interactions for ship placement
3. Verify responsive design works
4. Test both portrait and landscape modes

## Multiple Game Rooms Test

1. Create Room A in tab 1
2. Create Room B in tab 2  
3. Join Room A in tab 3
4. Join Room B in tab 4
5. ✅ **Expected**: Both games run independently

---

## Success Criteria ✅

Your multiplayer Battleship game is working correctly if:

- [x] Players can create and join rooms with codes
- [x] Ship placement synchronizes between players
- [x] Attacks update in real-time
- [x] Turn management works correctly
- [x] Win/loss detection functions
- [x] Game handles disconnections gracefully
- [x] Multiple concurrent games are supported

**Happy Testing!** 🎮🎯 