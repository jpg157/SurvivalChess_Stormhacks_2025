import { PieceAlias } from "../../assetManifest";

const EVEN_DIVISOR = 2;

/**
 * Abstract Piece class: base for all pieces.
 */
export abstract class Piece {
    private row: number;
    private col: number;
    private isOnDarkSquare: boolean;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
        this.isOnDarkSquare = ((row + col) % EVEN_DIVISOR) === 0;
    }

    // Getters
    public getRow(): number { return this.row; }
    public getCol(): number { return this.col; }
    public getIsOnDarkSquare(): boolean { return this.isOnDarkSquare; }

    /**
     * Must be implemented by subclasses to define movement rules.
     */
    public abstract isValidMove(newRow: number, newCol: number, board: Piece[][]): boolean;

    /**
     * Move piece to a new position (no validation here).
     * Note: does NOT recompute isOnDarkSquare to match the Java behavior.
     */
    public moveTo(newRow: number, newCol: number): void {
        this.row = newRow;
        this.col = newCol;
    }

    /**
     * Bounds check helper.
     */
    public isWithinBounds(row: number, col: number, board: Piece[][]): boolean {
        return row >= 0 &&
            row < board.length &&
            col >= 0 &&
            col < board[0].length;
    }

    /**
     * Unique identifier for the piece type (e.g., "Q", "R", "B", "N", "S", "T").
     */
    public abstract getType(): PieceAlias;


}
