import { Container, Text, TextStyle } from 'pixi.js';
import { createApp, centerStage } from './game/ui/app';
import { loadPieceTextures } from './game/ui/assets';
import { TILE } from './game/config';
import { GameController } from './game/controllers/gameController';
import { BoardView } from './game/ui/boardView';
import { GameUI } from './game/ui/gameUI';
import { GameBoard } from './game/game_board/gameBoard';

async function start(): Promise<void> {
  const app = await createApp();

  const root = new Container();
  app.stage.addChild(root);
  centerStage(app, root);

  const textures = await loadPieceTextures();

  // Create game title
  const gameTitle = new Text('SURVIVAL CHESS', new TextStyle({
    fontFamily: 'Arial',
    fontSize: 32,
    fill: 0xffffff,
    fontWeight: 'bold',
    align: 'center'
  }));
  gameTitle.anchor.set(0.5, 0);
  gameTitle.x = (TILE * 5) / 2; // Center above the 5x5 board
  gameTitle.y = -60;

  // Create objective subtitle
  const objective = new Text('Survive the waves by saving the targeted pieces!', new TextStyle({
    fontFamily: 'Arial',
    fontSize: 16,
    fill: 0xcccccc,
    fontWeight: 'normal',
    align: 'center',
    wordWrap: true,
    wordWrapWidth: TILE * 5 + 200 // Allow wrapping across board + UI width
  }));
  objective.anchor.set(0.5, 0);
  objective.x = (TILE * 5) / 2;
  objective.y = -25;

  const game = new GameBoard();
  const controller = new GameController(game);
  const view = new BoardView(controller, textures);
  const gameUI = new GameUI();

  // Position the UI to the right of the board
  const boardSize = TILE * 5; // 5x5 board
  gameUI.position(boardSize + 20, 20);

  root.addChild(gameTitle);
  root.addChild(objective);
  root.addChild(view.root);
  root.addChild(gameUI.root);

  // Create "How To Play" section below the board
  const howToPlayTitle = new Text('HOW TO PLAY', new TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffffff,
    fontWeight: 'bold',
    align: 'left'
  }));
  howToPlayTitle.x = 0;
  howToPlayTitle.y = boardSize + 40;

  const instructions = new Text(`OBJECTIVE:
Save targeted pieces (red tinted) from danger zones (flashing red tiles) by 
maneuvering the pieces using the empty square before time runs out!

CONTROLS:
• Click a piece to select it (yellow highlight)
• Green dots show valid moves
• Click a green dot to move the piece
• Hover over tiles for blue outline

GAMEPLAY:
• Each wave targets 2-4 random pieces
• Move ALL targeted pieces off danger tiles to survive
• You have 3 lives (hearts) - lose one each time you fail
• Wave times: 2 targets = 25s, 3 targets = 35s, 4 targets = 45s

PIECE MOVEMENTS:
• Queen (Q): Any adjacent empty tile
• Rook (R): Adjacent Horizontal/vertical empty tile
• Bishop (B): Adjacent Diagonal empty tile  
• Knight (N): L-shape (2+1 squares)
• Trident (T): Diagonally jumping over pieces to empty tile 
• Stag (S): Horizontal/vertical jumping over pieces to empty tile

STRATEGY TIPS:
• Plan multiple moves ahead
• Use the restart button anytime to try again
• Remember: pieces can't move onto occupied squares
• Focus on the most difficult pieces to save first`, new TextStyle({
    fontFamily: 'Arial',
    fontSize: 14,
    fill: 0xcccccc,
    fontWeight: 'normal',
    align: 'left',
    wordWrap: true,
    wordWrapWidth: boardSize + 320, // Span across board + UI width
    lineHeight: 18
  }));
  instructions.x = 0;
  instructions.y = boardSize + 75;

  root.addChild(howToPlayTitle);
  root.addChild(instructions);

  view.drawTiles();
  view.updatePieces();

  // Set up wave manager callbacks
  const waveManager = controller.getWaveManager();
  waveManager.setCallbacks({
    onWaveStart: (wave) => {
      gameUI.showWaveStart(wave.waveNumber, wave.targets.length, wave.totalTime);
      gameUI.updateLives(wave.livesRemaining); // Show current lives
      view.updatePieces(); // Refresh to show danger tiles and targeted pieces
    },
    onWaveEnd: (success, wave) => {
      if (success) {
        gameUI.showWaveSuccess(wave.waveNumber);
      } else {
        gameUI.showWaveFailure(wave.waveNumber);
      }
      view.updatePieces(); // Refresh to clear danger tiles
    },
    onLifeLost: (livesRemaining) => {
      gameUI.showLifeLost(livesRemaining);
    },
    onGameOver: (finalWave) => {
      gameUI.showGameOver(finalWave);
    },
    onTimerUpdate: (timeRemaining) => {
      gameUI.updateTimer(timeRemaining);
    }
  });

  // Set up start button callback
  gameUI.onStartButtonClick(() => {
    // Stop current game if running
    waveManager.stopGame();
    
    // Regenerate board for new game
    game.regenerate();
    view.updatePieces();
    
    // Start the wave system
    waveManager.startGame();
  });
}

start();
