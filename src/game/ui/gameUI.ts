import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class GameUI {
  public root = new Container();
  private background!: Graphics;
  private waveText!: Text;
  private timerText!: Text;
  private statusText!: Text;
  private startButton!: Graphics;
  private startButtonText!: Text;
  private livesContainer!: Container;
  private hearts: Graphics[] = [];

  constructor() {
    this.setupUI();
  }

  private setupUI(): void {
    // Create background panel - increased height for better layout
    this.background = new Graphics();
    this.background.beginFill(0x1a1a1a, 0.9);
    this.background.drawRoundedRect(0, 0, 300, 190, 10); // Increased from 180 to 190
    this.background.endFill();
    this.root.addChild(this.background);

    // Wave counter text
    this.waveText = new Text('Wave: 0', new TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: 'bold'
    }));
    this.waveText.x = 20;
    this.waveText.y = 20;
    this.root.addChild(this.waveText);

    // Timer text
    this.timerText = new Text('Time: --', new TextStyle({
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffcc33,
      fontWeight: 'bold'
    }));
    this.timerText.x = 20;
    this.timerText.y = 50;
    this.root.addChild(this.timerText);

    // Lives container - positioned below timer with proper spacing
    this.livesContainer = new Container();
    this.livesContainer.x = 35; // Align with timer text
    this.livesContainer.y = 95; // Below timer with spacing
    this.root.addChild(this.livesContainer);

    // Create 3 hearts
    this.createHearts();

    // Status text - moved further down to accommodate lives
    this.statusText = new Text('Click Start to begin!', new TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xcccccc,
      wordWrap: true,
      wordWrapWidth: 260
    }));
    this.statusText.x = 20;
    this.statusText.y = 120; // Moved down from 110 to 120
    this.root.addChild(this.statusText);

    // Start button - moved down to accommodate new layout
    this.startButton = new Graphics();
    this.startButton.beginFill(0x4CAF50);
    this.startButton.drawRoundedRect(0, 0, 100, 30, 5);
    this.startButton.endFill();
    this.startButton.x = 180;
    this.startButton.y = 150; // Moved down from 140 to 150
    this.startButton.eventMode = 'static';
    this.startButton.cursor = 'pointer';
    this.root.addChild(this.startButton);

    this.startButtonText = new Text('Start Game', new TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xffffff,
      fontWeight: 'bold'
    }));
    this.startButtonText.anchor.set(0.5);
    this.startButtonText.x = 50;
    this.startButtonText.y = 15;
    this.startButton.addChild(this.startButtonText);
  }

  private createHearts(): void {
    this.hearts = [];
    for (let i = 0; i < 3; i++) {
      const heart = new Graphics();
      
      // Draw a simple heart shape using two circles and a triangle
      heart.beginFill(0xff4444);
      
      // Left circle
      heart.drawCircle(-6, -4, 8);
      // Right circle  
      heart.drawCircle(6, -4, 8);
      // Bottom triangle point
      heart.moveTo(-12, 2);
      heart.lineTo(0, 16);
      heart.lineTo(12, 2);
      heart.closePath();
      
      heart.endFill();
      heart.x = i * 30;
      heart.y = 0;
      
      this.livesContainer.addChild(heart);
      this.hearts.push(heart);
    }
  }

  public updateWave(waveNumber: number): void {
    this.waveText.text = `Wave: ${waveNumber}`;
  }

  public updateTimer(timeRemaining: number): void {
    if (timeRemaining > 0) {
      this.timerText.text = `Time: ${timeRemaining}s`;
      
      // Change color based on urgency
      if (timeRemaining <= 3) {
        this.timerText.style.fill = 0xff4444; // Red for urgent
      } else if (timeRemaining <= 5) {
        this.timerText.style.fill = 0xffaa44; // Orange for warning
      } else {
        this.timerText.style.fill = 0xffcc33; // Yellow for normal
      }
    } else {
      this.timerText.text = 'Time: 0s';
      this.timerText.style.fill = 0xff4444;
    }
  }

  public updateStatus(status: string): void {
    this.statusText.text = status;
  }

  public showStartButton(show: boolean): void {
    this.startButton.visible = show;
  }

  public setStartButtonText(text: string): void {
    this.startButtonText.text = text;
  }

  public onStartButtonClick(callback: () => void): void {
    this.startButton.on('pointertap', callback);
  }

  public showWaveStart(waveNumber: number, targetsCount: number, timeLimit: number): void {
    this.updateWave(waveNumber);
    this.updateTimer(timeLimit);
    this.updateStatus(`Wave ${waveNumber} started! Save ${targetsCount} pieces from danger!`);
    this.setStartButtonText('Restart Game');
    this.showStartButton(true); // Keep button visible during gameplay
  }

  public showWaveSuccess(waveNumber: number): void {
    this.updateStatus(`Wave ${waveNumber} completed! Next wave incoming...`);
    this.setStartButtonText('Restart Game');
    this.showStartButton(true); // Keep button visible
  }

  public showWaveFailure(waveNumber: number): void {
    this.updateStatus(`Wave ${waveNumber} failed! Game Over.`);
    this.setStartButtonText('Play Again');
    this.showStartButton(true);
  }

  public showGameOver(finalWave: number): void {
    this.updateStatus(`Game Over! You survived ${finalWave} waves.`);
    this.setStartButtonText('Play Again');
    this.showStartButton(true);
  }

  public updateLives(livesRemaining: number): void {
    for (let i = 0; i < this.hearts.length; i++) {
      if (i < livesRemaining) {
        this.hearts[i].tint = 0xffffff; // Red color for remaining lives
        this.hearts[i].alpha = 1.0;
      } else {
        this.hearts[i].tint = 0x666666; // Gray color for lost lives
        this.hearts[i].alpha = 0.5;
      }
    }
  }

  public showLifeLost(livesRemaining: number): void {
    this.updateLives(livesRemaining);
    if (livesRemaining > 0) {
      this.updateStatus(`Life lost! ${livesRemaining} lives remaining. Next wave incoming...`);
    } else {
      this.updateStatus('All lives lost! Game Over.');
    }
  }

  public position(x: number, y: number): void {
    this.root.x = x;
    this.root.y = y;
  }
}