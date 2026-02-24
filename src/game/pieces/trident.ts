import { PieceAlias } from '../../../assetManifest';
import { Piece } from './piece';

/**
 * The Trident class represents a unique type of chess-like piece in the SurviChess game.
 * The Trident can only move diagonally but must skip at least one square in its path.
 */
export class Trident extends Piece {
    private static readonly MIN_SQUARE_JUMP = 1;

    constructor(row: number, col: number) {
        super(row, col);
    }

    /**
     * Determines whether the Trident's move to the specified row and column is valid.
     * The Trident can only move diagonally but must skip at least one square.
     * The destination square must also be empty.
     */
    public override isValidMove(newRow: number, newCol: number, board: Piece[][]): boolean {
        // Check bounds
        if (!this.isWithinBounds(newRow, newCol, board)) {
            return false;
        }

        const currentRow = this.getRow();
        const currentCol = this.getCol();

        // Check if the move is diagonal
        if (Math.abs(newRow - currentRow) !== Math.abs(newCol - currentCol)) {
            return false; // must move diagonally
        }

        // Calculate the difference in rows and columns
        const rowDiff = Math.abs(newRow - currentRow);
        const colDiff = Math.abs(newCol - currentCol);

        // Cannot move to the immediately adjacent diagonal square
        if (rowDiff === Trident.MIN_SQUARE_JUMP && colDiff === Trident.MIN_SQUARE_JUMP) {
            return false;
        }

        // Must move diagonally and skip at least one square
        if (rowDiff > Trident.MIN_SQUARE_JUMP && colDiff > Trident.MIN_SQUARE_JUMP) {
            return board[newRow][newCol] === null; // must land on empty tile
        }

        return false; // any other move invalid
    }

    /**
     * Returns the type of the piece as a single-character string.
     */
    public override getType(): PieceAlias {
        return "T"; // Short name for Trident
    }
}
