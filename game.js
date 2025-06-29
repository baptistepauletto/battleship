// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBO87pxL-XpGERh_GBSS_Xd8lQKeEKqZ9A",
    authDomain: "battleship-807ff.firebaseapp.com",
    databaseURL: "https://battleship-807ff-default-rtdb.firebaseio.com",
    projectId: "battleship-807ff",
    storageBucket: "battleship-807ff.firebasestorage.app",
    messagingSenderId: "407386930564",
    appId: "1:407386930564:web:cfd10fcaf2e20fba57f1d1",
    measurementId: "G-3HN995NF5T"
};

// Map Layout Definitions
const MAP_LAYOUTS = {
    classic: {
        name: "🏛️ Classic",
        description: "Traditional 10x10 square",
        width: 10,
        height: 10,
        validCells: null, // null means all cells are valid
        preview: "⬜⬜⬜⬜⬜<br>⬜⬜⬜⬜⬜<br>⬜⬜⬜⬜⬜<br>⬜⬜⬜⬜⬜<br>⬜⬜⬜⬜⬜"
    },
    rectangle: {
        name: "📐 Rectangle",
        description: "Wide 12x8 battlefield", 
        width: 12,
        height: 8,
        validCells: null,
        preview: "⬜⬜⬜⬜⬜⬜<br>⬜⬜⬜⬜⬜⬜<br>⬜⬜⬜⬜⬜⬜<br>⬜⬜⬜⬜⬜⬜"
    },
    ring: {
        name: "💍 Ring",
        description: "Hollow center battlefield",
        width: 10,
        height: 10,
        validCells: new Set(),
        preview: "⬜⬜⬜⬜⬜<br>⬜⬛⬛⬛⬜<br>⬜⬛⬛⬛⬜<br>⬜⬛⬛⬛⬜<br>⬜⬜⬜⬜⬜"
    },
    cross: {
        name: "✝️ Cross",
        description: "Plus-shaped arena",
        width: 10,
        height: 10,
        validCells: new Set(),
        preview: "⬛⬛⬜⬜⬜<br>⬛⬛⬜⬜⬜<br>⬜⬜⬜⬜⬜<br>⬛⬛⬜⬜⬜<br>⬛⬛⬜⬜⬜"
    },
    diamond: {
        name: "💎 Diamond",
        description: "Diamond-shaped field",
        width: 11,
        height: 11,
        validCells: new Set(),
        preview: "⬛⬛⬜⬛⬛<br>⬛⬜⬜⬜⬛<br>⬜⬜⬜⬜⬜<br>⬛⬜⬜⬜⬛<br>⬛⬛⬜⬛⬛"
    },
    fortress: {
        name: "🏰 Fortress",
        description: "Castle walls layout",
        width: 10,
        height: 10,
        validCells: new Set(),
        preview: "⬜⬜⬜⬜⬜<br>⬜⬛⬛⬛⬜<br>⬜⬛⬜⬛⬜<br>⬜⬛⬛⬛⬜<br>⬜⬜⬜⬜⬜"
    }
};

// Initialize valid cells for complex layouts
function initializeMapLayouts() {
    // Ring layout - hollow center
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            if (!(row >= 3 && row <= 6 && col >= 3 && col <= 6)) {
                MAP_LAYOUTS.ring.validCells.add(`${row},${col}`);
            }
        }
    }

    // Cross layout
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            if ((row >= 3 && row <= 6) || (col >= 3 && col <= 6)) {
                MAP_LAYOUTS.cross.validCells.add(`${row},${col}`);
            }
        }
    }

    // Diamond layout
    const center = 5;
    for (let row = 0; row < 11; row++) {
        for (let col = 0; col < 11; col++) {
            const distance = Math.abs(row - center) + Math.abs(col - center);
            if (distance <= 5) {
                MAP_LAYOUTS.diamond.validCells.add(`${row},${col}`);
            }
        }
    }

    // Fortress layout - outer ring with corner bastions
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            // Outer border
            if (row === 0 || row === 9 || col === 0 || col === 9) {
                MAP_LAYOUTS.fortress.validCells.add(`${row},${col}`);
            }
            // Inner safe zone corners
            else if ((row >= 2 && row <= 3 && col >= 2 && col <= 3) ||
                     (row >= 2 && row <= 3 && col >= 6 && col <= 7) ||
                     (row >= 6 && row <= 7 && col >= 2 && col <= 3) ||
                     (row >= 6 && row <= 7 && col >= 6 && col <= 7)) {
                MAP_LAYOUTS.fortress.validCells.add(`${row},${col}`);
            }
            // Center corridor
            else if ((row >= 4 && row <= 5 && col >= 1 && col <= 8) ||
                     (col >= 4 && col <= 5 && row >= 1 && row <= 8)) {
                MAP_LAYOUTS.fortress.validCells.add(`${row},${col}`);
            }
        }
    }
}

class BattleshipGame {
    constructor() {
        this.isMultiplayer = true;
        this.roomCode = null;
        this.playerId = null;
        this.playerNumber = null;
        this.opponentConnected = false;
        this.gamePhase = 'connection'; // 'connection', 'setup', 'game', 'over'
        this.selectedShip = null;
        this.shipOrientation = 'horizontal';
        this.selectedLayout = 'classic'; // Default layout
        this.rocksEnabled = false;
        this.rockDensity = 1; // 0=none, 1=few, 2=many, 3=lot
        this.rockPositions = new Set();
        
        this.ships = {
            carrier: { size: 5, placed: false },
            battleship: { size: 4, placed: false },
            cruiser: { size: 3, placed: false },
            submarine: { size: 3, placed: false },
            destroyer: { size: 2, placed: false }
        };

        this.gameState = {
            players: {
                1: {
                    board: this.createEmptyBoard(),
                    ships: JSON.parse(JSON.stringify(this.ships)),
                    shipsReady: false,
                    connected: false
                },
                2: {
                    board: this.createEmptyBoard(),
                    ships: JSON.parse(JSON.stringify(this.ships)),
                    shipsReady: false,
                    connected: false
                }
            },
            currentPlayer: 1,
            gameStarted: false,
            gameOver: false,
            winner: null,
            layout: 'classic', // Default layout
            rocksEnabled: false,
            rockDensity: 1,
            rockPositions: []
        };

        initializeMapLayouts();
        this.initializeFirebase();
        this.initializeDOM();
        this.bindEvents();
        this.showConnectionScreen();
    }

    updateGamePhaseClasses() {
        const gameContainer = document.querySelector('.game-container');
        // Remove all phase classes
        gameContainer.classList.remove('setup-phase', 'game-phase', 'connection-phase');
        
        // Add current phase class
        if (this.gamePhase === 'setup') {
            gameContainer.classList.add('setup-phase');
        } else if (this.gamePhase === 'game') {
            gameContainer.classList.add('game-phase');
        } else if (this.gamePhase === 'connection') {
            gameContainer.classList.add('connection-phase');
        }
    }

    createEmptyBoard(layout = 'classic', rocks = null) {
        const layoutConfig = MAP_LAYOUTS[layout];
        const board = Array(layoutConfig.height).fill().map(() => Array(layoutConfig.width).fill(0));
        
        // Mark invalid cells as -2 (blocked)
        if (layoutConfig.validCells) {
            for (let row = 0; row < layoutConfig.height; row++) {
                for (let col = 0; col < layoutConfig.width; col++) {
                    if (!layoutConfig.validCells.has(`${row},${col}`)) {
                        board[row][col] = -2; // Blocked cell
                    }
                }
            }
        }
        
        // Add rocks as -3 (rock cells)
        if (rocks) {
            rocks.forEach(position => {
                const [row, col] = position.split(',').map(Number);
                if (row >= 0 && row < layoutConfig.height && col >= 0 && col < layoutConfig.width) {
                    board[row][col] = -3; // Rock cell
                }
            });
        }
        
        return board;
    }

    initializeFirebase() {
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            this.database = firebase.database();
            this.playerId = this.generatePlayerId();
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            alert('Connection failed. Please check your internet connection.');
        }
    }

    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    generateRoomCode() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    initializeDOM() {
        // Connection screen elements
        this.connectionScreen = document.getElementById('connectionScreen');
        this.createRoomBtn = document.getElementById('createRoomBtn');
        this.joinRoomBtn = document.getElementById('joinRoomBtn');
        this.joinRoomSection = document.getElementById('joinRoomSection');
        this.roomCodeInput = document.getElementById('roomCodeInput');
        this.joinGameBtn = document.getElementById('joinGameBtn');
        this.backBtn = document.getElementById('backBtn');
        this.roomWaiting = document.getElementById('roomWaiting');
        this.displayRoomCode = document.getElementById('displayRoomCode');
        this.cancelRoomBtn = document.getElementById('cancelRoomBtn');
        this.gameReady = document.getElementById('gameReady');
        this.startMultiplayerBtn = document.getElementById('startMultiplayerBtn');
        this.connectionMenu = document.getElementById('connectionMenu');
        this.layoutSelection = document.getElementById('layoutSelection');
        this.layoutGrid = document.getElementById('layoutGrid');
        this.backToMenuBtn = document.getElementById('backToMenuBtn');
        this.confirmLayoutBtn = document.getElementById('confirmLayoutBtn');
        this.rocksEnabledCheckbox = document.getElementById('rocksEnabled');
        this.rockControlsDiv = document.getElementById('rockControls');
        this.rockDensitySlider = document.getElementById('rockDensity');
        this.rockPreviewText = document.getElementById('rockPreview');

        // Game elements
        this.gameStatus = document.getElementById('gameStatus');
        this.setupPhase = document.getElementById('setupPhase');
        this.shipList = document.getElementById('shipList');
        this.rotateBtn = document.getElementById('rotateBtn');
        this.randomBtn = document.getElementById('randomBtn');
        this.readyBtn = document.getElementById('readyBtn');
        this.player1Board = document.getElementById('player1Board');
        this.player2Board = document.getElementById('player2Board');
        this.player1Section = document.getElementById('player1Section');
        this.player2Section = document.getElementById('player2Section');
    }

    bindEvents() {
        // Connection events
        this.createRoomBtn.addEventListener('click', () => this.showLayoutSelection());
        this.joinRoomBtn.addEventListener('click', () => this.showJoinRoom());
        this.joinGameBtn.addEventListener('click', () => this.joinRoom());
        this.backBtn.addEventListener('click', () => this.showConnectionMenu());
        this.backToMenuBtn.addEventListener('click', () => this.showConnectionMenu());
        this.confirmLayoutBtn.addEventListener('click', () => this.createRoom());
        this.cancelRoomBtn.addEventListener('click', () => this.cancelRoom());
        this.startMultiplayerBtn.addEventListener('click', () => this.startMultiplayerGame());

        // Game events
        this.shipList.addEventListener('click', (e) => {
            if (e.target.classList.contains('ship-item') && !e.target.classList.contains('placed')) {
                this.selectShip(e.target);
            }
        });

        this.rotateBtn.addEventListener('click', () => {
            this.shipOrientation = this.shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
            this.rotateBtn.textContent = `🔄 Rotate Ship (${this.shipOrientation})`;
        });

        this.randomBtn.addEventListener('click', () => {
            this.randomPlacement();
        });

        this.readyBtn.addEventListener('click', () => {
            this.confirmShipPlacement();
        });

        // Rock controls events
        this.rocksEnabledCheckbox.addEventListener('change', () => this.handleRockToggle());
        this.rockDensitySlider.addEventListener('input', () => this.handleRockDensityChange());

        // Room code input enter key
        this.roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinRoom();
            }
        });
    }

    // Connection methods
    showConnectionScreen() {
        this.connectionScreen.style.display = 'flex';
    }

    hideConnectionScreen() {
        this.connectionScreen.style.display = 'none';
    }

    showConnectionMenu() {
        this.connectionMenu.style.display = 'block';
        this.joinRoomSection.style.display = 'none';
        this.layoutSelection.style.display = 'none';
        this.roomWaiting.style.display = 'none';
        this.gameReady.style.display = 'none';
        this.roomCodeInput.value = '';
    }

    showLayoutSelection() {
        this.connectionMenu.style.display = 'none';
        this.layoutSelection.style.display = 'block';
        this.renderLayoutOptions();
        // Auto-enable the confirm button since classic is selected by default
        this.confirmLayoutBtn.disabled = false;
    }

    renderLayoutOptions() {
        this.layoutGrid.innerHTML = '';
        
        Object.entries(MAP_LAYOUTS).forEach(([key, layout]) => {
            const layoutOption = document.createElement('div');
            layoutOption.className = 'layout-option';
            layoutOption.dataset.layout = key;
            
            layoutOption.innerHTML = `
                <div class="layout-preview">${layout.preview}</div>
                <div class="layout-info">
                    <div class="layout-name">${layout.name}</div>
                    <div class="layout-description">${layout.description}</div>
                </div>
            `;
            
            if (key === this.selectedLayout) {
                layoutOption.classList.add('selected');
            }
            
            layoutOption.addEventListener('click', () => {
                document.querySelectorAll('.layout-option').forEach(opt => opt.classList.remove('selected'));
                layoutOption.classList.add('selected');
                this.selectedLayout = key;
                this.confirmLayoutBtn.disabled = false;
            });
            
            this.layoutGrid.appendChild(layoutOption);
        });
    }

    handleRockToggle() {
        this.rocksEnabled = this.rocksEnabledCheckbox.checked;
        this.rockControlsDiv.style.display = this.rocksEnabled ? 'block' : 'none';
    }

    handleRockDensityChange() {
        this.rockDensity = parseInt(this.rockDensitySlider.value);
        const densityLabels = ['No Rocks', 'A Few Rocks', 'Many Rocks', 'A Lot of Rocks'];
        this.rockPreviewText.textContent = densityLabels[this.rockDensity];
    }

    generateRockPositions(layout, density) {
        const rocks = new Set();
        if (density === 0) return rocks;

        const layoutConfig = MAP_LAYOUTS[layout];
        const totalCells = layoutConfig.validCells ? 
            layoutConfig.validCells.size : 
            layoutConfig.width * layoutConfig.height;

        // Rock density percentages: few=5%, many=10%, lot=15%
        const densityPercentages = [0, 0.05, 0.10, 0.15];
        const maxRocks = Math.floor(totalCells * densityPercentages[density]);

        let attempts = 0;
        while (rocks.size < maxRocks && attempts < maxRocks * 3) {
            const row = Math.floor(Math.random() * layoutConfig.height);
            const col = Math.floor(Math.random() * layoutConfig.width);
            const position = `${row},${col}`;

            // Check if position is valid for this layout
            if (layoutConfig.validCells && !layoutConfig.validCells.has(position)) {
                attempts++;
                continue;
            }

            rocks.add(position);
            attempts++;
        }

        return rocks;
    }

    showJoinRoom() {
        this.connectionMenu.style.display = 'none';
        this.joinRoomSection.style.display = 'block';
        this.roomCodeInput.focus();
    }

    showWaitingRoom() {
        this.connectionMenu.style.display = 'none';
        this.joinRoomSection.style.display = 'none';
        this.layoutSelection.style.display = 'none';
        this.roomWaiting.style.display = 'block';
        this.gameReady.style.display = 'none';
    }

    showGameReady() {
        this.connectionMenu.style.display = 'none';
        this.joinRoomSection.style.display = 'none';
        this.layoutSelection.style.display = 'none';
        this.roomWaiting.style.display = 'none';
        this.gameReady.style.display = 'block';
    }

    async createRoom() {
        this.roomCode = this.generateRoomCode();
        this.playerNumber = 1;

        // Generate rock positions for player 1 if enabled
        let player1RockPositions = [];
        if (this.rocksEnabled) {
            const rocks = this.generateRockPositions(this.selectedLayout, this.rockDensity);
            player1RockPositions = Array.from(rocks);
        }

        try {
            await this.database.ref(`rooms/${this.roomCode}`).set({
                players: {
                    1: {
                        connected: true,
                        board: this.createEmptyBoard(this.selectedLayout, new Set(player1RockPositions)),
                        ships: this.ships,
                        shipsReady: false,
                        rockPositions: player1RockPositions
                    }
                },
                gameState: {
                    gameStarted: false,
                    currentPlayer: 1,
                    gameOver: false,
                    winner: null,
                    layout: this.selectedLayout,
                    rocksEnabled: this.rocksEnabled,
                    rockDensity: this.rockDensity
                }
            });

            this.displayRoomCode.textContent = this.roomCode;
            this.showWaitingRoom();
            this.listenForRoomUpdates();
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room. Please try again.');
        }
    }

    async joinRoom() {
        const roomCode = this.roomCodeInput.value.trim().toUpperCase();
        if (!roomCode) {
            alert('Please enter a room code');
            return;
        }

        try {
            const roomRef = this.database.ref(`rooms/${roomCode}`);
            const snapshot = await roomRef.once('value');
            
            if (!snapshot.exists()) {
                alert('Room not found. Please check the room code.');
                return;
            }

            const roomData = snapshot.val();
            if (roomData.players && roomData.players[2]) {
                alert('Room is full');
                return;
            }

            this.roomCode = roomCode;
            this.playerNumber = 2;
            
            // Get the layout and rock configuration from the room
            const layout = roomData.gameState?.layout || 'classic';
            const rocksEnabled = roomData.gameState?.rocksEnabled || false;
            const rockDensity = roomData.gameState?.rockDensity || 1;
            this.selectedLayout = layout;

            // Generate unique rock positions for player 2
            let player2RockPositions = [];
            if (rocksEnabled) {
                const rocks = this.generateRockPositions(layout, rockDensity);
                player2RockPositions = Array.from(rocks);
            }

            await roomRef.child('players/2').set({
                connected: true,
                board: this.createEmptyBoard(layout, new Set(player2RockPositions)),
                ships: this.ships,
                shipsReady: false,
                rockPositions: player2RockPositions
            });

            // Keep connection screen visible until game starts
            this.listenForRoomUpdates();
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Failed to join room. Please try again.');
        }
    }

    listenForRoomUpdates() {
        this.database.ref(`rooms/${this.roomCode}`).on('value', (snapshot) => {
            if (snapshot.exists()) {
                this.handleRoomUpdate(snapshot.val());
            } else {
                this.handleRoomClosed();
            }
        });
    }

    handleRoomUpdate(roomData) {
        if (!roomData || !roomData.players) return;

        // Update layout if it exists in room data
        if (roomData.gameState && roomData.gameState.layout) {
            this.selectedLayout = roomData.gameState.layout;
        }

        // Check if both players are connected
        const players = roomData.players;
        const bothConnected = players[1] && players[2] && players[1].connected && players[2].connected;

        if (bothConnected && this.gamePhase === 'connection') {
            // Show "Both players connected" screen for both players
            this.showGameReady();
        } else if (this.gamePhase === 'connection' && this.playerNumber === 1) {
            this.showWaitingRoom();
        }

        // Update game state if game has started
        if (roomData.gameState && roomData.gameState.gameStarted && this.gamePhase !== 'game' && this.gamePhase !== 'over') {
            this.gameState = roomData;
            this.startGame();
        } else if (roomData.gameState && roomData.gameState.battlePhase && this.gamePhase === 'setup') {
            this.gameState = roomData;
            this.gamePhase = 'game';
            this.updateGamePhaseClasses();
            this.setupPhase.style.display = 'none';
            this.renderBoards();
            this.updatePlayerSections();
            this.updateStatus();
        } else if (this.gamePhase === 'game' || this.gamePhase === 'setup') {
            this.gameState = roomData;
            this.syncGameState();
        }
    }

    async cancelRoom() {
        if (this.roomCode) {
            try {
                await this.database.ref(`rooms/${this.roomCode}`).remove();
            } catch (error) {
                console.error('Error canceling room:', error);
            }
        }
        this.showConnectionMenu();
    }

    handleRoomClosed() {
        if (this.gamePhase !== 'over') {
            alert('The room has been closed by the host.');
            this.showConnectionMenu();
        }
    }

    async startMultiplayerGame() {
        if (this.playerNumber === 1) {
            try {
                await this.database.ref(`rooms/${this.roomCode}/gameState/gameStarted`).set(true);
            } catch (error) {
                console.error('Error starting game:', error);
            }
        }
    }

    startGame() {
        this.gamePhase = 'setup';
        this.updateGamePhaseClasses();
        this.hideConnectionScreen();
        this.renderBoards();
        this.updatePlayerSections();
        this.updateStatus();
    }

    selectShip(shipElement) {
        // Remove selection from all ships
        document.querySelectorAll('.ship-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Select the clicked ship
        shipElement.classList.add('selected');
        this.selectedShip = {
            type: shipElement.dataset.ship,
            size: parseInt(shipElement.dataset.size)
        };
    }

    renderBoards() {
        this.renderBoard(this.player1Board, 1);
        this.renderBoard(this.player2Board, 2);
    }

    renderBoard(boardElement, player) {
        if (!this.gameState || !this.gameState.players) return;
        
        const layout = MAP_LAYOUTS[this.gameState.gameState?.layout || this.selectedLayout];
        const board = this.gameState.players[player].board;

        // Set up the grid with the correct dimensions
        boardElement.style.gridTemplateColumns = `repeat(${layout.width}, 35px)`;
        boardElement.style.gridTemplateRows = `repeat(${layout.height}, 35px)`;
        
        boardElement.innerHTML = '';

        for (let row = 0; row < layout.height; row++) {
            for (let col = 0; col < layout.width; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.player = player;

                const cellValue = board[row] && board[row][col] !== undefined ? board[row][col] : 0;
                
                // Handle blocked cells and rocks
                if (cellValue === -2) {
                    cell.classList.add('blocked');
                    cell.style.cursor = 'not-allowed';
                } else if (cellValue === -3) {
                    // Only show rocks on own board, never on opponent's board until discovered
                    if (player === this.playerNumber) {
                        cell.classList.add('rock');
                        cell.style.cursor = 'not-allowed';
                    }
                } else if (this.gamePhase === 'setup' && player === this.playerNumber) {
                    if (cellValue === 1) {
                        cell.classList.add('ship');
                        // Add consistent ship type class based on position for visual variety
                        const shipTypeClasses = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'];
                        const typeIndex = (row + col) % shipTypeClasses.length;
                        cell.classList.add(shipTypeClasses[typeIndex]);
                    }
                    if (cellValue !== -2) {
                        cell.addEventListener('click', (e) => this.handleCellClick(e));
                    }
                } else if (this.gamePhase === 'game') {
                    if (player !== this.playerNumber) {
                        // Opponent's board - show hits, misses, and discovered rocks
                        if (cellValue === 2) cell.classList.add('hit');
                        if (cellValue === -1) cell.classList.add('miss');
                        if (cellValue === -4) {
                            cell.classList.add('rock');
                            cell.classList.add('miss'); // Style as a miss since it was attacked
                        }
                        if ((cellValue === 0 || cellValue === 1 || cellValue === -3) && this.gameState.gameState && this.gameState.gameState.currentPlayer === this.playerNumber && !this.gameState.gameState.gameOver && cellValue !== -2) {
                            cell.addEventListener('click', (e) => this.handleAttack(e));
                        }
                    } else {
                        // Own board - show ships, hits, and misses
                        if (cellValue === 1) {
                            cell.classList.add('ship');
                            // Add consistent ship type class based on position for visual variety
                            const shipTypeClasses = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'];
                            const typeIndex = (row + col) % shipTypeClasses.length;
                            cell.classList.add(shipTypeClasses[typeIndex]);
                        }
                        if (cellValue === 2) {
                            cell.classList.add('hit');
                            cell.classList.add('ship'); // Keep ship class to show it was a ship hit
                        }
                        if (cellValue === -1) cell.classList.add('miss');
                    }
                }

                boardElement.appendChild(cell);
            }
        }
    }

    syncGameState() {
        // Check if we should be in battle phase but aren't
        if (this.gameState && this.gameState.gameState && this.gameState.gameState.battlePhase && this.gamePhase !== 'game') {
            this.gamePhase = 'game';
            this.updateGamePhaseClasses();
            this.setupPhase.style.display = 'none';
        }
        
        if (this.gamePhase === 'game') {
            this.renderBoards();
            this.updatePlayerSections();
            this.checkGameEnd();
        }
        this.updateStatus();
    }

    async handleCellClick(e) {
        if (!this.selectedShip || this.gamePhase !== 'setup') return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const player = parseInt(e.target.dataset.player);

        if (player !== this.playerNumber) return;

        if (this.canPlaceShip(row, col, this.selectedShip.size, this.shipOrientation, player)) {
            await this.placeShip(row, col, this.selectedShip.size, this.shipOrientation, player, this.selectedShip.type);
            await this.markShipAsPlaced(this.selectedShip.type);
            this.selectedShip = null;
            this.checkReadyState();
            this.renderBoards();
        }
    }

    canPlaceShip(row, col, size, orientation, player) {
        if (!this.gameState || !this.gameState.players) return false;
        const board = this.gameState.players[player].board;
        const layout = MAP_LAYOUTS[this.gameState.gameState?.layout || this.selectedLayout];

        for (let i = 0; i < size; i++) {
            const currentRow = orientation === 'horizontal' ? row : row + i;
            const currentCol = orientation === 'horizontal' ? col + i : col;

            // Check bounds
            if (currentRow >= layout.height || currentCol >= layout.width) return false;

            // Check if cell exists and is valid
            if (!board[currentRow] || board[currentRow][currentCol] === undefined) return false;
            
            // Check if cell is blocked or has a rock
            if (board[currentRow][currentCol] === -2 || board[currentRow][currentCol] === -3) return false;

            // Check if cell is already occupied
            if (board[currentRow][currentCol] !== 0) return false;

            // Check adjacent cells for other ships
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const adjRow = currentRow + dr;
                    const adjCol = currentCol + dc;
                    if (adjRow >= 0 && adjRow < layout.height && adjCol >= 0 && adjCol < layout.width) {
                        if (board[adjRow] && board[adjRow][adjCol] === 1) {
                            // Check if this adjacent ship cell is part of the current placement
                            let isPartOfCurrentShip = false;
                            for (let j = 0; j < size; j++) {
                                const shipRow = orientation === 'horizontal' ? row : row + j;
                                const shipCol = orientation === 'horizontal' ? col + j : col;
                                if (adjRow === shipRow && adjCol === shipCol) {
                                    isPartOfCurrentShip = true;
                                    break;
                                }
                            }
                            if (!isPartOfCurrentShip) return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    async placeShip(row, col, size, orientation, player, shipType = null) {
        if (!this.gameState || !this.gameState.players) return;
        
        const updates = {};
        for (let i = 0; i < size; i++) {
            const currentRow = orientation === 'horizontal' ? row : row + i;
            const currentCol = orientation === 'horizontal' ? col + i : col;
            updates[`rooms/${this.roomCode}/players/${player}/board/${currentRow}/${currentCol}`] = 1;
        }

        try {
            await this.database.ref().update(updates);
        } catch (error) {
            console.error('Error placing ship:', error);
        }
    }

    async markShipAsPlaced(shipType) {
        try {
            await this.database.ref(`rooms/${this.roomCode}/players/${this.playerNumber}/ships/${shipType}/placed`).set(true);
            
            const shipElement = document.querySelector(`[data-ship="${shipType}"]`);
            shipElement.classList.add('placed');
            shipElement.classList.remove('selected');
        } catch (error) {
            console.error('Error marking ship as placed:', error);
        }
    }

    checkReadyState() {
        if (!this.gameState || !this.gameState.players) return;
        
        const allShipsPlaced = Object.values(this.gameState.players[this.playerNumber].ships).every(ship => ship.placed);
        this.readyBtn.disabled = !allShipsPlaced;
        
        if (allShipsPlaced) {
            this.readyBtn.textContent = '✅ Ready to Battle';
        } else {
            this.readyBtn.textContent = `✅ Ready to Battle (${Object.values(this.gameState.players[this.playerNumber].ships).filter(s => !s.placed).length} ships left)`;
        }
    }

    async confirmShipPlacement() {
        try {
            await this.database.ref(`rooms/${this.roomCode}/players/${this.playerNumber}/shipsReady`).set(true);
            
            // Check if both players are ready
            const snapshot = await this.database.ref(`rooms/${this.roomCode}/players`).once('value');
            const players = snapshot.val();
            
            if (players && players[1] && players[2] && players[1].shipsReady && players[2].shipsReady) {
                // Start the battle phase - only host (player 1) sets this
                if (this.playerNumber === 1) {
                    await this.database.ref(`rooms/${this.roomCode}/gameState`).update({
                        currentPlayer: 1,
                        gameStarted: true,
                        battlePhase: true
                    });
                }
                
                this.gamePhase = 'game';
                this.updateGamePhaseClasses();
                this.setupPhase.style.display = 'none';
                this.renderBoards();
                this.updatePlayerSections();
                this.updateStatus();
            } else {
                this.gameStatus.textContent = 'Waiting for opponent to finish ship placement...';
                this.setupPhase.style.display = 'none';
            }
        } catch (error) {
            console.error('Error confirming ship placement:', error);
        }
    }

    resetShipSelection() {
        document.querySelectorAll('.ship-item').forEach(item => {
            item.classList.remove('placed', 'selected');
        });
        this.selectedShip = null;
        this.readyBtn.disabled = true;
        this.checkReadyState();
    }

    updatePlayerSections() {
        // Update titles based on player perspective
        const player1Title = this.player1Section.querySelector('.player-title');
        const player2Title = this.player2Section.querySelector('.player-title');
        
        if (this.playerNumber === 1) {
            player1Title.textContent = '🎯 Your Fleet';
            player2Title.textContent = '🎯 Enemy Fleet';
        } else {
            player1Title.textContent = '🎯 Enemy Fleet';
            player2Title.textContent = '🎯 Your Fleet';
        }

        if (this.gamePhase === 'setup') {
            // During setup, only show current player's board
            this.player1Section.classList.toggle('current-player', this.playerNumber === 1);
            this.player2Section.classList.toggle('current-player', this.playerNumber === 2);
        } else if (this.gamePhase === 'game' && this.gameState && this.gameState.gameState) {
            // Remove setup classes
            this.player1Section.classList.remove('current-player');
            this.player2Section.classList.remove('current-player');
            
            // Show both boards and highlight active player
            const currentPlayer = this.gameState.gameState.currentPlayer;
            this.player1Section.classList.toggle('active', currentPlayer === 1);
            this.player2Section.classList.toggle('active', currentPlayer === 2);
            
            // Add class to show which section is for the current user
            this.player1Section.classList.toggle('own-board', this.playerNumber === 1);
            this.player2Section.classList.toggle('own-board', this.playerNumber === 2);
        }
    }

    async handleAttack(e) {
        if (this.gamePhase !== 'game' || !this.gameState || !this.gameState.gameState) return;
        if (this.gameState.gameState.currentPlayer !== this.playerNumber) return;
        if (this.gameState.gameState.gameOver) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const targetPlayer = parseInt(e.target.dataset.player);

        if (targetPlayer === this.playerNumber) return; // Can't attack own board

        const board = this.gameState.players[targetPlayer].board;
        const cellValue = board[row] && board[row][col] !== undefined ? board[row][col] : 0;

        if (cellValue === 2 || cellValue === -1 || cellValue === -2 || cellValue === -4) return; // Already attacked, blocked, or discovered rock

        try {
            let nextPlayer = this.playerNumber;
            
            if (cellValue === 1) {
                // Hit!
                await this.database.ref(`rooms/${this.roomCode}/players/${targetPlayer}/board/${row}/${col}`).set(2);
                
                // Check win condition
                const updatedSnapshot = await this.database.ref(`rooms/${this.roomCode}/players/${targetPlayer}/board`).once('value');
                const updatedBoard = updatedSnapshot.val();
                
                if (this.checkWinConditionFromBoard(updatedBoard)) {
                    await this.database.ref(`rooms/${this.roomCode}/gameState`).update({
                        gameOver: true,
                        winner: this.playerNumber
                    });
                    return;
                }
                // Stay same player on hit
            } else if (cellValue === -3) {
                // Hit a rock - treat as miss but reveal the rock
                await this.database.ref(`rooms/${this.roomCode}/players/${targetPlayer}/board/${row}/${col}`).set(-4); // -4 = discovered rock
                nextPlayer = this.playerNumber === 1 ? 2 : 1;
            } else {
                // Miss (water)
                await this.database.ref(`rooms/${this.roomCode}/players/${targetPlayer}/board/${row}/${col}`).set(-1);
                nextPlayer = this.playerNumber === 1 ? 2 : 1;
            }

            // Update current player
            await this.database.ref(`rooms/${this.roomCode}/gameState/currentPlayer`).set(nextPlayer);
        } catch (error) {
            console.error('Error handling attack:', error);
        }
    }

    checkWinConditionFromBoard(board) {
        if (!board) return false;
        
        for (let row = 0; row < board.length; row++) {
            if (board[row]) {
                for (let col = 0; col < board[row].length; col++) {
                    if (board[row][col] === 1) {
                        return false; // Still has unhit ship cells
                    }
                }
            }
        }
        return true;
    }

    checkGameEnd() {
        if (!this.gameState || !this.gameState.gameState) return;
        
        if (this.gameState.gameState.gameOver) {
            this.endGame(this.gameState.gameState.winner);
        }
    }

    endGame(winner) {
        this.gamePhase = 'over';
        this.updateGamePhaseClasses();
        
        const gameOverModal = document.createElement('div');
        gameOverModal.className = 'game-over';
        const isWinner = winner === this.playerNumber;
        gameOverModal.innerHTML = `
            <div class="game-over-modal">
                <div class="game-over-title">${isWinner ? '🎉 VICTORY! 🎉' : '💀 DEFEAT 💀'}</div>
                <div class="game-over-message">${isWinner ? 'You Win!' : 'You Lose!'}</div>
                <button class="btn btn-primary" onclick="location.reload()">Play Again</button>
            </div>
        `;
        
        document.body.appendChild(gameOverModal);
    }

    async randomPlacement() {
        if (!this.gameState || !this.gameState.players) return;
        
        const player = this.playerNumber;
        const layout = MAP_LAYOUTS[this.gameState.gameState?.layout || this.selectedLayout];
        
        try {
            // Clear current ships but preserve blocked cells and rocks
            const clearUpdates = {};
            const currentBoard = this.gameState.players[player].board;
            for (let row = 0; row < layout.height; row++) {
                for (let col = 0; col < layout.width; col++) {
                    const currentValue = currentBoard[row] && currentBoard[row][col] !== undefined ? currentBoard[row][col] : 0;
                    // Only clear ship cells (1), preserve blocked (-2) and rock (-3) cells
                    if (currentValue === 1) {
                        clearUpdates[`rooms/${this.roomCode}/players/${player}/board/${row}/${col}`] = 0;
                    }
                }
            }
            
            // Reset ship states
            Object.keys(this.gameState.players[player].ships).forEach(shipType => {
                clearUpdates[`rooms/${this.roomCode}/players/${player}/ships/${shipType}/placed`] = false;
            });

            await this.database.ref().update(clearUpdates);

            // Place ships randomly
            const shipSizes = [5, 4, 3, 3, 2];
            const shipTypes = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'];
            
            for (let i = 0; i < shipSizes.length; i++) {
                let placed = false;
                let attempts = 0;
                
                while (!placed && attempts < 100) {
                    const row = Math.floor(Math.random() * layout.height);
                    const col = Math.floor(Math.random() * layout.width);
                    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                    
                    if (this.canPlaceShip(row, col, shipSizes[i], orientation, player)) {
                        await this.placeShip(row, col, shipSizes[i], orientation, player);
                        await this.database.ref(`rooms/${this.roomCode}/players/${player}/ships/${shipTypes[i]}/placed`).set(true);
                        placed = true;
                    }
                    attempts++;
                }
            }

            // Update UI
            document.querySelectorAll('.ship-item').forEach(item => {
                item.classList.add('placed');
                item.classList.remove('selected');
            });
            
            this.selectedShip = null;
            this.checkReadyState();
        } catch (error) {
            console.error('Error with random placement:', error);
        }
    }

    updateStatus() {
        // Auto-fix: if both players ready but no battle phase set, force it
        if (this.gamePhase === 'setup' && this.gameState && this.gameState.players && 
            this.gameState.players[1] && this.gameState.players[2] &&
            this.gameState.players[1].shipsReady && this.gameState.players[2].shipsReady &&
            (!this.gameState.gameState || !this.gameState.gameState.battlePhase)) {
            
            setTimeout(async () => {
                if (this.playerNumber === 1) {
                    await this.database.ref(`rooms/${this.roomCode}/gameState`).update({
                        battlePhase: true,
                        gameStarted: true,
                        currentPlayer: 1
                    });
                }
                this.gamePhase = 'game';
                this.updateGamePhaseClasses();
                this.setupPhase.style.display = 'none';
                this.renderBoards();
                this.updatePlayerSections();
                this.updateStatus();
            }, 1000);
        }
        
        if (this.gamePhase === 'setup') {
            const layoutName = MAP_LAYOUTS[this.gameState.gameState?.layout || this.selectedLayout].name;
            this.gameStatus.textContent = `Place your ships on the ${layoutName} battlefield`;
        } else if (this.gamePhase === 'game' && this.gameState && this.gameState.gameState) {
            const currentPlayer = this.gameState.gameState.currentPlayer;
            if (currentPlayer === this.playerNumber) {
                this.gameStatus.textContent = `Your turn - Click on opponent's board to attack!`;
            } else {
                this.gameStatus.textContent = `Opponent's turn - Wait for their move`;
            }
        } else if (this.gamePhase === 'connection') {
            this.gameStatus.textContent = `Connecting to multiplayer...`;
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        alert('Firebase failed to load. Please check your internet connection and refresh the page.');
        return;
    }
    
    try {
        new BattleshipGame();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        alert('Failed to initialize game. Please refresh the page and try again.');
    }
}); 