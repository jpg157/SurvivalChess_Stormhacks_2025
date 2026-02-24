import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { BOARD_SIZE, TILE, PIECE_SCALE } from '../config';
import { GameController } from '../controllers/gameController';
import { PieceAlias } from '../../assetManifest';

export class BoardView {
  public root = new Container();
  private tilesLayer = new Container();
  private piecesLayer = new Container();
  private effectsLayer = new Container();
  private highlightLayer = new Container();
  private selection: Graphics | null = null;
  private hoverHighlight: Graphics | null = null;
  private dangerTiles: Graphics[] = [];
  private tiles: Graphics[][] = [];

  constructor(
    private controller: GameController,
    private pieceTexturesBundle: Record<PieceAlias, Texture>
  ) {
    this.root.addChild(this.tilesLayer, this.highlightLayer, this.piecesLayer, this.effectsLayer);
  }

  drawTiles(): void {
    this.tilesLayer.removeChildren();
    this.highlightLayer.removeChildren();
    this.tiles = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < BOARD_SIZE; c++) {
        const dark = ((r + c) % 2) === 0;
        const g = new Graphics();
        g.beginFill(dark ? 0x739552 : 0xebecd0);
        g.drawRect(0, 0, TILE, TILE);
        g.endFill();
        g.x = c * TILE;
        g.y = r * TILE;

        g.eventMode = 'static';
        g.cursor = 'pointer';
        g.on('pointertap', () => this.onTileClick(r, c));
        g.on('pointerover', () => this.onTileHover(r, c));
        g.on('pointerout', () => this.onTileHoverOut());

        this.tilesLayer.addChild(g);
        this.tiles[r][c] = g;
      }
    }

    // Create selection highlight
    this.selection = new Graphics();
    this.selection.lineStyle(4, 0xffcc33, 1.0); // Bright yellow, full opacity
    this.selection.beginFill(0xffcc33, 0.2); // Add a subtle yellow fill
    this.selection.drawRect(2, 2, TILE - 4, TILE - 4);
    this.selection.endFill();
    this.selection.visible = false;
    this.highlightLayer.addChild(this.selection);

    // Create hover highlight
    this.hoverHighlight = new Graphics();
    this.hoverHighlight.lineStyle(2, 0x88ccff, 0.8);
    this.hoverHighlight.drawRect(1, 1, TILE - 2, TILE - 2);
    this.hoverHighlight.visible = false;
    this.highlightLayer.addChild(this.hoverHighlight);
  }

  updatePieces(): void {
    this.piecesLayer.removeChildren();
    this.updateDangerTiles();

    const board = this.controller.getBoard();
    const waveManager = this.controller.getWaveManager();
    
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const pieceTexture = this.pieceTexturesBundle[piece.getType()];

        if (!pieceTexture) continue;

        const sp = new Sprite(pieceTexture);
        sp.anchor.set(0.5);
        sp.scale.set(PIECE_SCALE);
        sp.x = c * TILE + TILE / 2;
        sp.y = r * TILE + TILE / 2;

        // Add red tint to targeted pieces
        if (waveManager.isWaveActive() && waveManager.isTargetedPiece(piece)) {
          sp.tint = 0xff6666; // Red tint for targeted pieces
        } else {
          sp.tint = 0xffffff; // Normal color
        }

        sp.eventMode = 'static';
        sp.cursor = 'pointer';
        sp.on('pointertap', () => this.onTileClick(r, c));
        sp.on('pointerover', () => this.onTileHover(r, c));
        sp.on('pointerout', () => this.onTileHoverOut());

        this.piecesLayer.addChild(sp);
      }
    }

    const sel = this.controller.getSelection();
    if (this.selection) {
      if (sel) {
        this.selection.visible = true;
        this.selection.x = sel.col * TILE;
        this.selection.y = sel.row * TILE;
        
        // Make sure the selection is on top by bringing it to front
        this.highlightLayer.setChildIndex(this.selection, this.highlightLayer.children.length - 1);
        
        this.showValidMoves(); // Show valid moves for selected piece
      } else {
        this.selection.visible = false;
        this.clearValidMoves(); // Clear valid moves when nothing is selected
      }
    }
  }

  private updateDangerTiles(): void {
    // Clear existing danger tiles
    this.effectsLayer.removeChildren();
    this.dangerTiles = [];

    const waveManager = this.controller.getWaveManager();
    if (!waveManager.isWaveActive()) return;

    const targets = waveManager.getTargets();
    
    for (const target of targets) {
      // Create pulsing red overlay for danger tiles
      const dangerTile = new Graphics();
      dangerTile.beginFill(0xff2222, 1.0); // Bright red, full opacity
      dangerTile.drawRect(0, 0, TILE, TILE);
      dangerTile.endFill();
      dangerTile.x = target.col * TILE;
      dangerTile.y = target.row * TILE;

      // Add stronger pulsing animation
      const pulseSpeed = 0.08; // Faster pulsing
      const minAlpha = 0.1; // More dramatic fade out
      const maxAlpha = 0.8; // Much brighter peak
      let increasing = true;
      
      const animate = () => {
        if (increasing) {
          dangerTile.alpha += pulseSpeed;
          if (dangerTile.alpha >= maxAlpha) increasing = false;
        } else {
          dangerTile.alpha -= pulseSpeed;
          if (dangerTile.alpha <= minAlpha) increasing = true;
        }
        requestAnimationFrame(animate);
      };
      animate();

      this.effectsLayer.addChild(dangerTile);
      this.dangerTiles.push(dangerTile);
    }
  }

  private onTileClick(row: number, col: number): void {
    const board = this.controller.getBoard();
    const sel = this.controller.getSelection();

    if (!sel) {
      // no selection yet → try to select this tile if it has a piece
      this.controller.select(row, col);
      this.updatePieces();
      return;
    }

    // Clicking selected tile toggles off
    if (sel.row === row && sel.col === col) {
      this.controller.clearSelection();
      this.updatePieces();
      return;
    }

    // Try move; if it fails and clicked has a piece, switch selection
    const moved = this.controller.tryMove(row, col);
    if (!moved && board[row][col]) {
      // Switch selection to the clicked piece
      this.controller.select(row, col);
    }
    this.updatePieces(); // Always update to refresh danger tiles and piece positions
  }

  private onTileHover(row: number, col: number): void {
    if (this.hoverHighlight) {
      this.hoverHighlight.visible = true;
      this.hoverHighlight.x = col * TILE;
      this.hoverHighlight.y = row * TILE;
    }
  }

  private onTileHoverOut(): void {
    if (this.hoverHighlight) {
      this.hoverHighlight.visible = false;
    }
  }

  private showValidMoves(): void {
    // Clear any existing valid move indicators
    this.clearValidMoves();

    const selection = this.controller.getSelection();
    if (!selection) return;

    const board = this.controller.getBoard();
    const selectedPiece = board[selection.row][selection.col];
    if (!selectedPiece) return;

    // Check all tiles for valid moves
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        // Skip the selected piece's current position
        if (r === selection.row && c === selection.col) continue;

        // Only show moves to empty tiles
        if (board[r][c] !== null) continue;

        // Check if this is a valid move
        const boardAsPieces = board as unknown as import('../pieces/piece').Piece[][];
        if (selectedPiece.isValidMove(r, c, boardAsPieces)) {
          // Create a valid move indicator
          const moveIndicator = new Graphics();
          moveIndicator.beginFill(0x44ff44, 0.4); // Semi-transparent green
          moveIndicator.drawCircle(TILE / 2, TILE / 2, 12);
          moveIndicator.endFill();
          moveIndicator.x = c * TILE;
          moveIndicator.y = r * TILE;
          
          this.highlightLayer.addChild(moveIndicator);
        }
      }
    }
  }

  private clearValidMoves(): void {
    // Remove all valid move indicators (keep selection and hover highlights)
    const children = this.highlightLayer.children.slice();
    for (const child of children) {
      if (child !== this.selection && child !== this.hoverHighlight) {
        this.highlightLayer.removeChild(child);
      }
    }
  }
}
