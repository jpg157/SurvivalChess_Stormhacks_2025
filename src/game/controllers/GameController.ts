import { GameBoard } from "../game_board/gameBoard";
import { WaveManager } from "./waveManager";
import { Piece } from "../pieces/piece";


export class GameController {
  private game: GameBoard;
  private selected: { row: number; col: number } | null = null;
  private waveManager: WaveManager;

  constructor(game: GameBoard) {
    this.game = game;
    this.waveManager = new WaveManager(game);
  }

  public getBoard(): (Piece | null)[][] {
    return this.game.getBoard();
  }

  public getSelection(): { row: number; col: number } | null {
    return this.selected;
  }

  public clearSelection(): void {
    this.selected = null;
  }

  public select(row: number, col: number): void {
    const board = this.game.getBoard();
    const piece = board[row][col];
    this.selected = piece ? { row, col } : null;
  }

  /** Try moving into (row,col). Returns true if a move occurred. */
  public tryMove(row: number, col: number): boolean {
    const board = this.game.getBoard();
    if (!this.selected) return false;

    const from = this.selected;
    const fromPiece = board[from.row][from.col];
    if (!fromPiece) {
      this.selected = null;
      return false;
    }

    // Our pieces expect Piece[][]; the board has nulls, but runtime is fine.
    const boardAsPieces = board as unknown as Piece[][];

    const destEmpty = board[row][col] === null;
    const legal = destEmpty && fromPiece.isValidMove(row, col, boardAsPieces);

    if (!legal) return false;

    // Apply move
    board[row][col] = fromPiece;
    board[from.row][from.col] = null;
    fromPiece.moveTo(row, col);

    // Clear selection after a successful move
    this.selected = null;

    // Check if this move affects wave completion
    this.waveManager.checkWaveCompletion();

    return true;
  }

  public getWaveManager(): WaveManager {
    return this.waveManager;
  }
}
