import { Application, Container } from 'pixi.js';
import { BACKGROUND_COLOR, BOARD_SIZE, TILE } from '../config';

export async function createApp(): Promise<Application> {
  const app = new Application();
  
  // Calculate required width: board (480) + UI (320) + padding (200) = 1000px minimum
  const minRequiredWidth = BOARD_SIZE * TILE + 320 + 200; // Board + UI + extra padding
  const appWidth = Math.max(minRequiredWidth, window.innerWidth * 0.95); // Use 95% of screen or minimum
  const appHeight = 1200; // Fixed height to accommodate all content
  
  await app.init({
    background: BACKGROUND_COLOR,
    antialias: true,
    width: appWidth,
    height: appHeight,
  });

  const mount = document.getElementById('pixi-container') ?? document.body;
  mount.appendChild(app.canvas);

  // Update the CSS to allow scrolling
  document.body.style.margin = '0';
  document.body.style.padding = '20px';
  document.body.style.overflowY = 'auto';
  document.body.style.minHeight = '100vh';
  
  // Style the container to center the canvas and allow scrolling
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.style.height = 'auto';
    appContainer.style.overflow = 'visible';
    appContainer.style.display = 'flex';
    appContainer.style.flexDirection = 'column';
    appContainer.style.alignItems = 'center';
    appContainer.style.minHeight = '100vh';
  }

  // Style the pixi container
  const pixiContainer = document.getElementById('pixi-container');
  if (pixiContainer) {
    pixiContainer.style.width = 'auto';
    pixiContainer.style.height = 'auto';
  }

  return app;
}

export function centerStage(app: Application, root: Container): void {
  const center = () => {
    // Calculate the actual content dimensions
    const boardSize = BOARD_SIZE * TILE; // 5 * 96 = 480px
    const uiWidth = 320; // UI panel width (300 + 20 padding)
    const totalContentWidth = boardSize + uiWidth; // Total width needed
    
    // Center the content horizontally within the canvas
    const canvasWidth = app.renderer.width;
    root.x = (canvasWidth - totalContentWidth) / 2;
    root.y = 80; // Fixed top padding for title space
  };
  center();
  
  // Re-center when window resizes
  window.addEventListener('resize', () => {
    setTimeout(center, 100); // Small delay to ensure resize is complete
  });
}
