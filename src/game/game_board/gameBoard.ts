import { BoardManager, BOARD_SIZE, type Board } from './boardManager';

export class GameBoard {
  private manager: BoardManager;

  constructor() {
    this.manager = new BoardManager();
  }

  public getBoard(): Board {
    return this.manager.getBoard();
  }

  public regenerate(): void {
    this.manager.regenerate();
  }

  public static size(): number {
    return BOARD_SIZE;
  }
}
