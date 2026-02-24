import { PieceAlias } from '../../assetManifest';
import { Piece } from './piece';

/**
 * The Rook class represents a chess-like piece in the SurviChess game.
 * The Rook can move exactly one step horizontally or vertically to an empty square.
 */
export class Rook extends Piece {
    private static readonly DIFF = 1;
    private static readonly NO_DIFF = 0;

    constructor(row: number, col: number) {
        super(row, col);
    }

    /**
     * Determines whether a move to the specified position is valid for the Rook.
     * The Rook can move horizontally or vertically, but only one step at a time.
     */
    public override isValidMove(newRow: number, newCol: number, board: Piece[][]): boolean {
        // Check bounds
        if (!this.isWithinBounds(newRow, newCol, board)) {
            return false;
        }

        // Calculate the difference in rows and columns
        const rowDiff = Math.abs(newRow - this.getRow());
        const colDiff = Math.abs(newCol - this.getCol());

        // Check if the move is exactly one step horizontally or vertically
        if (
            (rowDiff === Rook.DIFF && colDiff === Rook.NO_DIFF) ||
            (rowDiff === Rook.NO_DIFF && colDiff === Rook.DIFF)
        ) {
            return board[newRow][newCol] === null; // must move into empty tile
        }

        return false; // Any other move is invalid
    }

    /**
     * Returns the type of the Rook as a single-character string.
     */
    public override getType(): PieceAlias {
        return "R";
    }
}
