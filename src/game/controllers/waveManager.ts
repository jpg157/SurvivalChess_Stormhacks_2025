import { GameBoard } from "../game_board/gameBoard";
import { Piece } from "../pieces/piece";


export interface TargetedPiece {
  row: number;
  col: number;
  piece: Piece;
}

export interface WaveData {
  waveNumber: number;
  targets: TargetedPiece[];
  timeRemaining: number;
  totalTime: number;
  livesRemaining: number;
}

export class WaveManager {
  private gameBoard: GameBoard;
  private currentWave: number = 0;
  private isActive: boolean = false;
  private targets: TargetedPiece[] = [];
  private timeRemaining: number = 0;
  private totalTime: number = 10; // 10 seconds per wave initially
  private timer: number | null = null;
  private livesRemaining: number = 3; // Player starts with 3 lives
  
  // Callbacks for game events
  private onWaveStartCallback?: (wave: WaveData) => void;
  private onWaveEndCallback?: (success: boolean, wave: WaveData) => void;
  private onGameOverCallback?: (finalWave: number) => void;
  private onTimerUpdateCallback?: (timeRemaining: number) => void;
  private onLifeLostCallback?: (livesRemaining: number) => void;

  constructor(gameBoard: GameBoard) {
    this.gameBoard = gameBoard;
  }

  public setCallbacks(callbacks: {
    onWaveStart?: (wave: WaveData) => void;
    onWaveEnd?: (success: boolean, wave: WaveData) => void;
    onGameOver?: (finalWave: number) => void;
    onTimerUpdate?: (timeRemaining: number) => void;
    onLifeLost?: (livesRemaining: number) => void;
  }): void {
    this.onWaveStartCallback = callbacks.onWaveStart;
    this.onWaveEndCallback = callbacks.onWaveEnd;
    this.onGameOverCallback = callbacks.onGameOver;
    this.onTimerUpdateCallback = callbacks.onTimerUpdate;
    this.onLifeLostCallback = callbacks.onLifeLost;
  }

  public startGame(): void {
    this.currentWave = 0;
    this.livesRemaining = 3;
    this.isActive = true;
    this.startNextWave();
  }

  public getCurrentWave(): WaveData {
    return {
      waveNumber: this.currentWave,
      targets: [...this.targets],
      timeRemaining: this.timeRemaining,
      totalTime: this.totalTime,
      livesRemaining: this.livesRemaining
    };
  }

  public getTargets(): TargetedPiece[] {
    return [...this.targets];
  }

  public getLivesRemaining(): number {
    return this.livesRemaining;
  }

  public isWaveActive(): boolean {
    return this.isActive;
  }

  public stopGame(): void {
    this.isActive = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private startNextWave(): void {
    if (!this.isActive) return;

    this.currentWave++;
    this.selectRandomTargets();
    
    // Set time based on number of targets: 2 targets = 15s, 3 targets = 20s, 4 targets = 30s
    const baseTime = this.getTimeForTargets(this.targets.length);
    // Optional: slightly reduce time as waves progress for increased difficulty
    const difficultyReduction = Math.floor(this.currentWave / 3); // Reduce 1 second every 3 waves
    this.totalTime = Math.max(baseTime - difficultyReduction, Math.floor(baseTime * 0.6)); // Never go below 60% of base time
    this.timeRemaining = this.totalTime;

    const waveData = this.getCurrentWave();
    this.onWaveStartCallback?.(waveData);

    this.startTimer();
  }

  private getTimeForTargets(targetCount: number): number {
    switch (targetCount) {
      case 2: return 25;
      case 3: return 35;
      case 4: return 45;
      default: return 15; // fallback for edge cases
    }
  }

  private selectRandomTargets(): void {
    const board = this.gameBoard.getBoard();
    const pieces: TargetedPiece[] = [];

    // Collect all pieces on the board
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const piece = board[row][col];
        if (piece) {
          pieces.push({ row, col, piece });
        }
      }
    }

    // Select random number of targets (2-4 pieces, but not more than available)
    const maxTargets = Math.min(4, pieces.length);
    const minTargets = Math.min(2, pieces.length);
    const numTargets = Math.floor(Math.random() * (maxTargets - minTargets + 1)) + minTargets;

    // Randomly select targets
    this.targets = [];
    const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numTargets; i++) {
      this.targets.push(shuffledPieces[i]);
    }
  }

  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      this.timeRemaining--;
      this.onTimerUpdateCallback?.(this.timeRemaining);

      if (this.timeRemaining <= 0) {
        this.endWave(false); // Time's up - failure
      }
    }, 1000) as unknown as number;
  }

  public checkWaveCompletion(): void {
    if (!this.isActive || this.targets.length === 0) return;

    const board = this.gameBoard.getBoard();
    let allSaved = true;

    // Check if all targeted pieces are in safe positions (not on any danger tile)
    for (const target of this.targets) {
      // Find where this target piece is currently located
      let pieceFound = false;
      let pieceInDanger = false;

      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          const currentPiece = board[row][col];
          if (currentPiece === target.piece) {
            pieceFound = true;
            // Check if this piece is on any danger tile
            if (this.isDangerTile(row, col)) {
              pieceInDanger = true;
            }
            break;
          }
        }
        if (pieceFound) break;
      }

      // If any targeted piece is still on a danger tile, not all are saved
      if (pieceInDanger) {
        allSaved = false;
        break;
      }
    }

    if (allSaved) {
      this.endWave(true); // Success - all pieces moved to safety
    }
  }

  private endWave(success: boolean): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    const waveData = this.getCurrentWave();
    this.onWaveEndCallback?.(success, waveData);

    if (success) {
      // Wait a moment before starting next wave
      setTimeout(() => {
        if (this.isActive) {
          this.startNextWave();
        }
      }, 2000);
    } else {
      // Lose a life
      this.livesRemaining--;
      this.onLifeLostCallback?.(this.livesRemaining);
      
      if (this.livesRemaining <= 0) {
        // Game over - no lives left
        this.isActive = false;
        this.onGameOverCallback?.(this.currentWave);
      } else {
        // Still have lives - continue with next wave after a delay
        setTimeout(() => {
          if (this.isActive) {
            this.startNextWave();
          }
        }, 2000);
      }
    }
  }

  public isDangerTile(row: number, col: number): boolean {
    return this.targets.some(target => target.row === row && target.col === col);
  }

  public isTargetedPiece(piece: Piece): boolean {
    return this.targets.some(target => target.piece === piece);
  }
}