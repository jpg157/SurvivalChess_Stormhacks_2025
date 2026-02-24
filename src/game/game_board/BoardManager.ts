import { Bishop } from '../pieces/bishop';
import { Knight } from '../pieces/knight';
import { Queen } from '../pieces/queen';
import { Rook } from '../pieces/rook';
import { Trident } from '../pieces/trident';
import { Stag } from '../pieces/stag';
import { Piece } from '../pieces/piece';

// The board holds either a Piece or null (empty)
export type Board = (Piece | null)[][];
// Constructor type for "new Piece(row, col)"
type PieceCtor = new (row: number, col: number) => Piece;

export const BOARD_SIZE = 5;   // Fixed 5x5 board
export const CENTER = 2;       // Middle tile index (2,2) on a 0..4 grid
const EVEN_DIVISOR = 2; // Helper for dark/light calculation

// Fisher–Yates shuffle (in-place randomization)
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class BoardManager {
  public readonly board: Board;

  constructor() {
    // Create a 5x5 array prefilled with nulls
    this.board = Array.from({ length: BOARD_SIZE }, () => Array<Piece | null>(BOARD_SIZE).fill(null));
    // Generate initial layout
    this.initializeBoard();
  }

  /**
   * Returns true for "dark" squares in a checker pattern.
   * We treat squares where (row + col) is even as dark.
   */
  private isDarkSquare(row: number, col: number): boolean {
    return ((row + col) % EVEN_DIVISOR) === 0;
  }

  /**
   * Special rule for placing *dark* Tridents:
   * Do NOT allow the four mid-edge tiles:
   *   (2,0) west, (0,2) north, (2,4) east, (4,2) south
   * These coordinates form a cross around the center.
   */
  private isValidTridentDarkSquare(row: number, col: number): boolean {
    if (
      (row === 2 && col === 0) || // west
      (row === 0 && col === 2) || // north
      (row === 2 && col === 4) || // east
      (row === 4 && col === 2)    // south
    ) {
      return false;
    }
    return true;
  }

  /**
   * Collect a list of all currently empty coordinates as [row, col] pairs.
   * - Skips the center tile (2,2) permanently (design rule).
   * - Skips any non-empty squares.
   * - Optionally applies a filter predicate for additional constraints
   *   (e.g., "only dark squares", "only light squares", etc).
   */
  private emptyCoords(filter?: (r: number, c: number) => boolean): Array<[number, number]> {
    const out: Array<[number, number]> = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (r === CENTER && c === CENTER) continue;   // keep center empty
        if (this.board[r][c] !== null) continue;      // only collect empties
        if (filter && !filter(r, c)) continue;        // respect optional filter
        out.push([r, c]);
      }
    }
    return out;
  }

  /**
   * Randomly pick exactly N distinct items from an array.
   * Throws if there aren’t enough candidates (helps catch logic errors early).
   * We copy & shuffle so the original input order isn't modified.
   */
  private pickN<T>(arr: T[], n: number): T[] {
    if (arr.length < n) {
      throw new Error(`Not enough candidates (need ${n}, have ${arr.length}).`);
    }
    const copy = arr.slice();
    shuffle(copy);
    return copy.slice(0, n);
  }

  /**
   * Main layout generation:
   * 1) Clear the board; center (2,2) stays empty.
   * 2) Place 2 dark Tridents on valid dark squares (excludes cross tiles).
   * 3) Place 2 light Tridents on any light squares.
   * 4) Place 2 dark Bishops.
   * 5) Place 2 light Bishops.
   * 6) Fill the remaining 16 squares with an even “bag”:
   *    4× Queen, 4× Knight, 4× Rook, 4× Stag — randomized.
   *
   * Why this order?
   * - Tridents/Bishops have color (and Trident has position) constraints,
   *   so we reserve good spots for them first.
   * - The remaining pieces have no color limits, so a simple bag fill works.
   */
  public initializeBoard(): void {
    // --- Step 0: Clear board & reserve center ---
    for (let r = 0; r < BOARD_SIZE; r++) this.board[r].fill(null);
    this.board[CENTER][CENTER] = null;

    // --- Step 1: Two dark Tridents (dark squares, but not cross tiles) ---
    const darkTridentSpots = this.emptyCoords(
      (r, c) => this.isDarkSquare(r, c) && this.isValidTridentDarkSquare(r, c)
    );
    for (const [r, c] of this.pickN(darkTridentSpots, 2)) {
      this.board[r][c] = new Trident(r, c);
    }

    // --- Step 2: Two light Tridents (any light squares) ---
    const lightTridentSpots = this.emptyCoords((r, c) => !this.isDarkSquare(r, c));
    for (const [r, c] of this.pickN(lightTridentSpots, 2)) {
      this.board[r][c] = new Trident(r, c);
    }

    // --- Step 3: Two dark Bishops ---
    const darkBishopSpots = this.emptyCoords((r, c) => this.isDarkSquare(r, c));
    for (const [r, c] of this.pickN(darkBishopSpots, 2)) {
      this.board[r][c] = new Bishop(r, c);
    }

    // --- Step 4: Two light Bishops ---
    const lightBishopSpots = this.emptyCoords((r, c) => !this.isDarkSquare(r, c));
    for (const [r, c] of this.pickN(lightBishopSpots, 2)) {
      this.board[r][c] = new Bishop(r, c);
    }

    // --- Step 5: Fill remaining cells with an even “bag” ---
    // After placing 8 constrained pieces, there should be 16 empty squares left.
    // Build a fair bag with 4 of each remaining type and randomize it.
    const bag: PieceCtor[] = [
      Queen, Queen, Queen, Queen,
      Knight, Knight, Knight, Knight,
      Rook, Rook, Rook, Rook,
      Stag, Stag, Stag, Stag,
    ];
    shuffle(bag);

    // Collect all remaining empty coordinates and shuffle them too.
    const empties = shuffle(this.emptyCoords());

    // Safety check: ensure bag size matches empty-cell count.
    if (empties.length !== bag.length) {
      // If this ever fires, it indicates a bug in counts/placement earlier.
      throw new Error(`Bag/empty mismatch: empties=${empties.length}, bag=${bag.length}`);
    }

    // One-to-one place: the i-th bag piece goes to the i-th empty square.
    for (let i = 0; i < bag.length; i++) {
      const [r, c] = empties[i];
      const Ctor = bag[i];
      this.board[r][c] = new Ctor(r, c);
    }
  }

  // Accessor for the current board state
  public getBoard(): Board {
    return this.board;
  }

  // Optional: regenerate on demand
  public regenerate(): void {
    this.initializeBoard();
  }

  // Static helper if you need the configured size outside
  public static size(): number {
    return BOARD_SIZE;
  }
}
