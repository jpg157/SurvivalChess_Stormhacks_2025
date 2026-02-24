import { Assets, Texture } from 'pixi.js';

export const PIECE_ASSET: Record<string, string> = {
  Q: '/src/assets/Q_coloured.png',
  R: '/src/assets/R_coloured.png',
  B: '/src/assets/B_coloured.png',
  N: '/src/assets/N_coloured.png',
  T: '/src/assets/T_coloured.png',
  S: '/src/assets/S_coloured.png',
};

export async function loadPieceTextures(): Promise<Map<string, Texture>> {
  const textures = new Map<string, Texture>();
  await Promise.all(
    Object.entries(PIECE_ASSET).map(async ([key, url]) => {
      const tex = (await Assets.load(url)) as Texture;
      textures.set(key, tex);
    })
  );
  return textures;
}
