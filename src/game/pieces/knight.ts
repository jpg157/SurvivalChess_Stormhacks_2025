import { PieceAlias } from '../../../assetManifest';
import { Piece } from './piece';

/**
 * The Knight class represents a chess-like piece in the SurviChess game.
 * The Knight moves in an "L" shape: two squares in one direction and one square
 * in a perpendicular direction, landing on an empty square.
 */
export class Knight extends Piece {
    private static readonly JUMP = 2;
    private static readonly MOVE = 1;

    constructor(row: number, col: number) {
        super(row, col);
    }

    /**
     * Determines whether the Knight's move to the specified row and column is valid.
     * The Knight moves in an "L" shape (two squares in one direction and one square in another),
     * and must land on an empty square.
     */
    public override isValidMove(newRow: number, newCol: number, board: Piece[][]): boolean {
        // Check bounds
        if (!this.isWithinBounds(newRow, newCol, board)) {
            return false;
        }

        // Calculate the difference in rows and columns
        const rowDiff = Math.abs(newRow - this.getRow());
        const colDiff = Math.abs(newCol - this.getCol());

        // Check if the move is in an "L" shape
        if (
            (rowDiff === Knight.JUMP && colDiff === Knight.MOVE) ||
            (rowDiff === Knight.MOVE && colDiff === Knight.JUMP)
        ) {
            return board[newRow][newCol] === null; // must move into empty tile
        }

        return false; // Any other move is invalid
    }

    /**
     * Returns the type of the piece as a single-character string.
     */
    public override getType(): PieceAlias {
        return "N"; // Short name for Knight
    }
}
