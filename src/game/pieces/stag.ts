import { PieceAlias } from '../../../assetManifest';
import { Piece } from './piece';

/**
 * The Stag class represents a chess-like piece in the SurviChess game.
 * The Stag can move any number of squares horizontally or vertically,
 * skipping adjacent squares, and must land on an empty square.
 */
export class Stag extends Piece {
    private static readonly SAME_ROW_OR_COL = 0;
    private static readonly MIN_SQUARE_JUMP = 1;

    constructor(row: number, col: number) {
        super(row, col);
    }

    /**
     * Determines whether the Stag's move to the specified row and column is valid.
     * The Stag moves horizontally or vertically, skipping the adjacent square,
     * and must land on an empty square.
     */
    public override isValidMove(newRow: number, newCol: number, board: Piece[][]): boolean {
        // Check bounds
        if (!this.isWithinBounds(newRow, newCol, board)) {
            return false;
        }

        const currentRow = this.getRow();
        const currentCol = this.getCol();

        // Must move horizontally or vertically
        if (!(currentRow === newRow || currentCol === newCol)) {
            return false;
        }

        // Calculate the difference in rows and columns
        const rowDiff = Math.abs(newRow - currentRow);
        const colDiff = Math.abs(newCol - currentCol);

        // Cannot move to immediately adjacent square
        if (
            (colDiff === Stag.SAME_ROW_OR_COL && rowDiff === Stag.MIN_SQUARE_JUMP) ||
            (rowDiff === Stag.SAME_ROW_OR_COL && colDiff === Stag.MIN_SQUARE_JUMP)
        ) {
            return false;
        }

        // Must skip at least one square horizontally or vertically
        if (
            (colDiff === Stag.SAME_ROW_OR_COL && rowDiff > Stag.MIN_SQUARE_JUMP) ||
            (rowDiff === Stag.SAME_ROW_OR_COL && colDiff > Stag.MIN_SQUARE_JUMP)
        ) {
            return board[newRow][newCol] === null; // must land on empty tile
        }

        return false; // any other move invalid
    }

    /**
     * Returns the type of the piece as a single-character string.
     */
    public override getType(): PieceAlias {
        return "S"; // Short name for Stag
    }
}
