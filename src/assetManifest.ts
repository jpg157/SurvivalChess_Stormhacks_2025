import { AssetsManifest } from "pixi.js";

// To ensure that valid alias is entered when indexing an asset in pieceTextures bundle
export type PieceAlias = 'B' | 'R' | 'Q' | 'N' | 'S' | 'T';

export const assetManifest: AssetsManifest = {
  bundles: [
    {
      name: 'pieceTextures',
      assets: [
        // Leading slash ensures it looks in the public folder root 
        { alias: 'B', src: '/assets/pieces/bishop-coloured.png'},
        { alias: 'R', src: '/assets/pieces/rook-coloured.png'},
        { alias: 'Q', src: '/assets/pieces/queen-coloured.png'},
        { alias: 'N', src: '/assets/pieces/knight-coloured.png'},
        { alias: 'S', src: '/assets/pieces/stag-coloured.png'},
        { alias: 'T', src: '/assets/pieces/trident-coloured.png'},
      ]
    }
  ]
}
