import { PieceAlias } from "../../assetManifest";
import { Piece } from "./piece";

/**
 * The Bishop class represents a chess-like piece in the SurviChess game.
 * The Bishop can move exactly one step diagonally to an empty square.
 */
export class Bishop extends Piece {
    private static readonly MAX_SQUARE_MOVE = 1;

    constructor(row: number, col: number) {
        super(row, col);
    }

    /**
     * Determines whether the Bishop's move to the specified row and column is valid.
     * The Bishop can move exactly one step diagonally to an empty square.
     */
    public override isValidMove(newRow: number, newCol: number, board: Piece[][]): boolean {
        // Check bounds
        if (!this.isWithinBounds(newRow, newCol, board)) {
            return false;
        }

        // Calculate the difference in rows and columns
        const rowDiff = Math.abs(newRow - this.getRow());
        const colDiff = Math.abs(newCol - this.getCol());

        // Check if the move is exactly one step diagonally
        if (
            rowDiff === Bishop.MAX_SQUARE_MOVE &&
            colDiff === Bishop.MAX_SQUARE_MOVE
        ) {
            return board[newRow][newCol] === null; // must move into empty tile
        }

        return false; // Any other move is invalid
    }

    /**
     * Returns the type of the piece as a single-character string.
     */
    public override getType(): PieceAlias {
        return "B";
    }
}
