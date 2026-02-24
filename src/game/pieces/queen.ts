import { PieceAlias } from '../../assetManifest';
import { Piece } from './piece';

/**
 * The Queen class represents a chess-like piece in the SurviChess game.
 * The Queen can move exactly one square in any direction:
 * horizontally, vertically, or diagonally.
 */
export class Queen extends Piece {
    private static readonly DIFF = 1;
    private static readonly NO_DIFF = 0;

    constructor(row: number, col: number) {
        super(row, col);
    }

    /**
     * Determines whether a move to the specified position is valid for the Queen.
     * The Queen can move exactly one step in any direction: horizontally, vertically, or diagonally.
     */
    public override isValidMove(newRow: number, newCol: number, board: Piece[][]): boolean {
        // Check bounds
        if (!this.isWithinBounds(newRow, newCol, board)) {
            return false;
        }

        // Calculate the difference in rows and columns
        const rowDiff = Math.abs(newRow - this.getRow());
        const colDiff = Math.abs(newCol - this.getCol());

        // Check if the move is exactly one step in any direction
        if (
            (rowDiff === Queen.DIFF && colDiff === Queen.NO_DIFF) || // vertical
            (rowDiff === Queen.NO_DIFF && colDiff === Queen.DIFF) || // horizontal
            (rowDiff === Queen.DIFF && colDiff === Queen.DIFF)       // diagonal
        ) {
            return board[newRow][newCol] === null; // must move into empty tile
        }

        return false; // Any other move is invalid
    }

    /**
     * Returns the type of the Queen as a single-character string.
     */
    public override getType(): PieceAlias {
        return "Q";
    }
}
