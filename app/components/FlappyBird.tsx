'use client';

import { useRef, useEffect, useState } from 'react';
import DownloadButton from './DownloadButton';

interface Pipe {
  x: number;
  gapY: number;
  gapSize: number;
  passed: boolean;
  speedMultiplier?: number;
  verticalVelocity?: number; // For moving pipes
  obstacleY?: number; // For floating obstacles
}

interface PowerUp {
  x: number;
  y: number;
  type: 'shield' | 'slowmo' | 'tiny' | 'life';
  collected: boolean;
}

interface ActivePowerUp {
  type: 'shield' | 'slowmo' | 'tiny';
  endTime: number;
}

type BirdType = 'classic' | 'blueJay' | 'cardinal' | 'parrot' | 'penguin' | 'phoenix';
type GameMode = 'campaign' | 'endless' | 'freeplay';
type FreeDifficulty = 'easy' | 'medium' | 'hard';

interface BirdTheme {
  label: string;
  body: string;
  belly: string;
  outline: string;
  wing: string;
  wingOutline: string;
  beak: string;
  beakLine: string;
}

interface LevelConfig {
  name: string;
  gapSize: number;
  pipeSpeed: number;
  pipesRequired: number;
  movingPipes: boolean;
  obstacles: boolean;
  darkMode: boolean;
  turboMode: boolean;
  skyColor: string;
  skyColor2?: string; // For gradient
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { name: 'Open Sky', gapSize: 250, pipeSpeed: 1.2, pipesRequired: 5, movingPipes: false, obstacles: false, darkMode: false, turboMode: false, skyColor: '#87CEEB', skyColor2: '#B0E0E6' },
  { name: 'First Flight', gapSize: 220, pipeSpeed: 1.4, pipesRequired: 8, movingPipes: false, obstacles: false, darkMode: false, turboMode: false, skyColor: '#87CEEB', skyColor2: '#FAFAD2' },
  { name: 'Wind Currents', gapSize: 220, pipeSpeed: 1.6, pipesRequired: 10, movingPipes: false, obstacles: false, darkMode: false, turboMode: false, skyColor: '#87CEEB', skyColor2: '#D3D3D3' },
  { name: 'Narrow Passage', gapSize: 190, pipeSpeed: 1.6, pipesRequired: 12, movingPipes: false, obstacles: false, darkMode: false, turboMode: false, skyColor: '#FFB347', skyColor2: '#FFCC99' },
  { name: 'Moving Pipes', gapSize: 200, pipeSpeed: 1.7, pipesRequired: 15, movingPipes: true, obstacles: false, darkMode: false, turboMode: false, skyColor: '#FFA07A', skyColor2: '#FA8072' },
  { name: 'Storm Clouds', gapSize: 200, pipeSpeed: 1.8, pipesRequired: 15, movingPipes: false, obstacles: true, darkMode: false, turboMode: false, skyColor: '#778899', skyColor2: '#B0C4DE' },
  { name: 'Night Flight', gapSize: 200, pipeSpeed: 1.8, pipesRequired: 18, movingPipes: false, obstacles: false, darkMode: true, turboMode: false, skyColor: '#191970', skyColor2: '#483D8B' },
  { name: 'Turbo Mode', gapSize: 230, pipeSpeed: 2.6, pipesRequired: 20, movingPipes: false, obstacles: false, darkMode: false, turboMode: true, skyColor: '#FF6347', skyColor2: '#FF7F50' },
  { name: 'Gauntlet', gapSize: 150, pipeSpeed: 2.2, pipesRequired: 22, movingPipes: true, obstacles: true, darkMode: false, turboMode: false, skyColor: '#DC143C', skyColor2: '#8B0000' },
  { name: 'Impossible Sky', gapSize: 130, pipeSpeed: 2.4, pipesRequired: 25, movingPipes: true, obstacles: true, darkMode: true, turboMode: false, skyColor: '#000000', skyColor2: '#2F4F4F' },
];

const BIRDS: Record<BirdType, BirdTheme> = {
  classic: {
    label: 'Classic',
    body: '#FFD700',
    belly: '#FFE44D',
    outline: '#FFA500',
    wing: '#E5B800',
    wingOutline: '#CC9900',
    beak: '#FF6347',
    beakLine: '#CC4030',
  },
  blueJay: {
    label: 'Blue Jay',
    body: '#4A90D9',
    belly: '#6BB3F0',
    outline: '#2E6DB4',
    wing: '#3A7AC4',
    wingOutline: '#2B5F9E',
    beak: '#F5A623',
    beakLine: '#D4891A',
  },
  cardinal: {
    label: 'Cardinal',
    body: '#D42C2C',
    belly: '#E85555',
    outline: '#A31F1F',
    wing: '#B82525',
    wingOutline: '#8A1A1A',
    beak: '#F0A030',
    beakLine: '#C88020',
  },
  parrot: {
    label: 'Parrot',
    body: '#2ECC40',
    belly: '#5FE870',
    outline: '#1FA030',
    wing: '#28B038',
    wingOutline: '#1A8A28',
    beak: '#F5C542',
    beakLine: '#D4A830',
  },
  penguin: {
    label: 'Penguin',
    body: '#2C2C2C',
    belly: '#E8E8E8',
    outline: '#111111',
    wing: '#1A1A1A',
    wingOutline: '#000000',
    beak: '#F5A623',
    beakLine: '#D4891A',
  },
  phoenix: {
    label: 'Phoenix',
    body: '#FF6B00',
    belly: '#FFD93D',
    outline: '#CC4400',
    wing: '#FF4500',
    wingOutline: '#CC2200',
    beak: '#FFE066',
    beakLine: '#DDBB33',
  },
};

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'modeselect' | 'birdselect' | 'playing' | 'gameover' | 'levelcomplete'>('modeselect');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [selectedBird, setSelectedBird] = useState<BirdType>('classic');
  const [selectedMode, setSelectedMode] = useState<GameMode>('campaign');
  const [freeDifficulty, setFreeDifficulty] = useState<FreeDifficulty>('medium');
  const [campaignProgress, setCampaignProgress] = useState(0);

  // Game state refs
  const birdRef = useRef({ y: 250, velocity: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const activePowerUpsRef = useRef<ActivePowerUp[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const invincibleUntilRef = useRef(0);
  const frameCountRef = useRef(0);
  const currentLevelRef = useRef(0);
  const levelPipesPassedRef = useRef(0);
  const levelCompleteTimeRef = useRef(0);
  const levelCompleteOpacityRef = useRef(0);
  const gameStateRef = useRef<'modeselect' | 'birdselect' | 'playing' | 'gameover' | 'levelcomplete'>('modeselect');
  const animationIdRef = useRef<number | null>(null);
  const birdTypeRef = useRef<BirdType>('classic');
  const gameModeRef = useRef<GameMode>('campaign');
  const freeDifficultyRef = useRef<FreeDifficulty>('medium');

  // Constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const BIRD_SIZE = 30;
  const PIPE_WIDTH = 60;
  const GROUND_HEIGHT = 80;
  const GRAVITY = 0.35;
  const FLAP_STRENGTH = -7.5;
  const PIPE_SPACING = 280;

  useEffect(() => {
    const saved = localStorage.getItem('pb-flappy');
    if (saved) setBestScore(parseInt(saved));
    const savedBird = localStorage.getItem('flappy-bird-type');
    if (savedBird && savedBird in BIRDS) {
      setSelectedBird(savedBird as BirdType);
      birdTypeRef.current = savedBird as BirdType;
    }
    const savedProgress = localStorage.getItem('pb-flappy-campaign');
    if (savedProgress) setCampaignProgress(parseInt(savedProgress));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBird = (ctx: CanvasRenderingContext2D) => {
      const birdX = CANVAS_WIDTH / 2;
      const birdY = birdRef.current.y;
      const rotation = Math.min(Math.max(birdRef.current.velocity * 0.05, -0.5), 0.5);
      const t = BIRDS[birdTypeRef.current];

      // Check if tiny power-up is active
      const tinyActive = activePowerUpsRef.current.some(p => p.type === 'tiny');
      const sizeMultiplier = tinyActive ? 0.6 : 1;
      const currentBirdSize = BIRD_SIZE * sizeMultiplier;

      // Check if invincible (flashing after hit)
      const invincible = frameCountRef.current < invincibleUntilRef.current;
      if (invincible && Math.floor(frameCountRef.current / 5) % 2 === 0) {
        return; // Flash by skipping draw every other 5 frames
      }

      ctx.save();
      ctx.translate(birdX, birdY);
      ctx.rotate(rotation);
      ctx.scale(sizeMultiplier, sizeMultiplier);

      // Shield power-up (glowing bubble)
      const hasShield = activePowerUpsRef.current.some(p => p.type === 'shield');
      if (hasShield) {
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, currentBirdSize / sizeMultiplier / 2 + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(150, 220, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, currentBirdSize / sizeMultiplier / 2 + 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Wing (behind body)
      const wingFlap = Math.floor(frameCountRef.current / 4) % 3;
      const wingAngle = wingFlap === 0 ? -0.4 : wingFlap === 1 ? 0.1 : 0.3;
      ctx.fillStyle = t.wing;
      ctx.save();
      ctx.translate(-4, 2);
      ctx.rotate(wingAngle);
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 14, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = t.wingOutline;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Body
      ctx.fillStyle = t.body;
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Belly
      ctx.fillStyle = t.belly;
      ctx.beginPath();
      ctx.ellipse(-1, 3, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outline
      ctx.strokeStyle = t.outline;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Eye white
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(8, -5, 4, 0, Math.PI * 2);
      ctx.fill();

      // Eye pupil
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(9, -5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Penguin special: white face patch
      if (birdTypeRef.current === 'penguin') {
        ctx.fillStyle = '#E8E8E8';
        ctx.beginPath();
        ctx.ellipse(5, -2, 5, 7, 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Re-draw eye on top
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(8, -5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(9, -5, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Phoenix special: flame tail
      if (birdTypeRef.current === 'phoenix') {
        const flicker = Math.sin(frameCountRef.current * 0.3) * 2;
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(-BIRD_SIZE / 2, -2);
        ctx.quadraticCurveTo(-BIRD_SIZE - 4 + flicker, -6, -BIRD_SIZE - 8, -3 + flicker);
        ctx.quadraticCurveTo(-BIRD_SIZE - 2, 0, -BIRD_SIZE - 6, 5 - flicker);
        ctx.quadraticCurveTo(-BIRD_SIZE - 2 + flicker, 2, -BIRD_SIZE / 2, 4);
        ctx.fill();
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        ctx.moveTo(-BIRD_SIZE / 2, -1);
        ctx.quadraticCurveTo(-BIRD_SIZE + 2 + flicker, -3, -BIRD_SIZE - 2, 0);
        ctx.quadraticCurveTo(-BIRD_SIZE + 2, 2, -BIRD_SIZE / 2, 3);
        ctx.fill();
      }

      // Cardinal special: crest
      if (birdTypeRef.current === 'cardinal') {
        ctx.fillStyle = t.body;
        ctx.beginPath();
        ctx.moveTo(0, -BIRD_SIZE / 2);
        ctx.lineTo(-3, -BIRD_SIZE / 2 - 10);
        ctx.lineTo(5, -BIRD_SIZE / 2 - 2);
        ctx.closePath();
        ctx.fill();
      }

      // Beak
      ctx.fillStyle = t.beak;
      ctx.beginPath();
      ctx.moveTo(BIRD_SIZE / 2, -2);
      ctx.lineTo(BIRD_SIZE / 2 + 10, 0);
      ctx.lineTo(BIRD_SIZE / 2, 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = t.beakLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(BIRD_SIZE / 2, 1);
      ctx.lineTo(BIRD_SIZE / 2 + 8, 1);
      ctx.stroke();

      ctx.restore();
    };

    const drawPowerUp = (ctx: CanvasRenderingContext2D, powerUp: PowerUp) => {
      if (powerUp.collected) return;

      ctx.save();
      const pulse = Math.sin(frameCountRef.current * 0.1) * 2;

      if (powerUp.type === 'shield') {
        // Blue glowing circle
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 12 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
        ctx.fill();
      } else if (powerUp.type === 'slowmo') {
        // Blue clock icon
        ctx.fillStyle = 'rgba(50, 150, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 12 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(powerUp.x, powerUp.y);
        ctx.lineTo(powerUp.x, powerUp.y - 8);
        ctx.moveTo(powerUp.x, powerUp.y);
        ctx.lineTo(powerUp.x + 6, powerUp.y);
        ctx.stroke();
      } else if (powerUp.type === 'tiny') {
        // Orange down arrow
        ctx.fillStyle = 'rgba(255, 150, 50, 0.9)';
        ctx.beginPath();
        ctx.moveTo(powerUp.x, powerUp.y + 10 + pulse);
        ctx.lineTo(powerUp.x - 8, powerUp.y - 5);
        ctx.lineTo(powerUp.x + 8, powerUp.y - 5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (powerUp.type === 'life') {
        // Red heart
        ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
        ctx.beginPath();
        ctx.moveTo(powerUp.x, powerUp.y + 8 + pulse);
        ctx.bezierCurveTo(powerUp.x, powerUp.y + 5, powerUp.x - 10, powerUp.y - 5, powerUp.x, powerUp.y - 10);
        ctx.bezierCurveTo(powerUp.x + 10, powerUp.y - 5, powerUp.x, powerUp.y + 5, powerUp.x, powerUp.y + 8 + pulse);
        ctx.fill();
      }

      ctx.restore();
    };

    const gameLoop = () => {
      if (gameStateRef.current !== 'playing') return;

      frameCountRef.current++;

      // Current level config
      const levelConfig = gameModeRef.current === 'campaign'
        ? LEVEL_CONFIGS[currentLevelRef.current]
        : gameModeRef.current === 'endless'
        ? getEndlessDifficulty()
        : getFreeDifficulty();

      const slowMoActive = activePowerUpsRef.current.some(p => p.type === 'slowmo');
      const speedMultiplier = slowMoActive ? 0.5 : 1;

      // Update bird
      birdRef.current.velocity += GRAVITY;
      birdRef.current.y += birdRef.current.velocity;

      // Generate pipes
      if (frameCountRef.current % Math.floor(PIPE_SPACING / (levelConfig.pipeSpeed * speedMultiplier)) === 0) {
        const minGapY = 100;
        const maxGapY = CANVAS_HEIGHT - GROUND_HEIGHT - levelConfig.gapSize - 100;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
        const newPipe: Pipe = {
          x: CANVAS_WIDTH,
          gapY,
          gapSize: levelConfig.gapSize,
          passed: false,
          speedMultiplier: levelConfig.name === 'Wind Currents' ? 0.8 + Math.random() * 0.6 : 1,
          verticalVelocity: levelConfig.movingPipes ? (Math.random() > 0.5 ? 0.3 : -0.3) : 0,
        };

        // Add floating obstacle
        if (levelConfig.obstacles && Math.random() > 0.5) {
          newPipe.obstacleY = gapY + levelConfig.gapSize / 2;
        }

        pipesRef.current.push(newPipe);

        // Spawn power-up (15% chance, 5% for life)
        if (Math.random() < 0.15) {
          const types: PowerUp['type'][] = Math.random() < 0.05 ? ['life'] : ['shield', 'slowmo', 'tiny'];
          const type = types[Math.floor(Math.random() * types.length)];
          const powerUpY = gapY + levelConfig.gapSize / 2;
          powerUpsRef.current.push({
            x: CANVAS_WIDTH + PIPE_WIDTH / 2,
            y: powerUpY,
            type,
            collected: false,
          });
        }
      }

      // Update pipes
      pipesRef.current = pipesRef.current.filter(pipe => {
        pipe.x -= levelConfig.pipeSpeed * (pipe.speedMultiplier || 1) * speedMultiplier;

        // Moving pipes
        if (pipe.verticalVelocity) {
          pipe.gapY += pipe.verticalVelocity;
          const minGapY = 50;
          const maxGapY = CANVAS_HEIGHT - GROUND_HEIGHT - levelConfig.gapSize - 50;
          if (pipe.gapY <= minGapY || pipe.gapY >= maxGapY) {
            pipe.verticalVelocity *= -1;
          }
        }

        if (!pipe.passed && pipe.x + PIPE_WIDTH < CANVAS_WIDTH / 2 - BIRD_SIZE / 2) {
          pipe.passed = true;
          scoreRef.current++;
          levelPipesPassedRef.current++;
          setScore(scoreRef.current);

          // Check level complete (campaign mode)
          if (gameModeRef.current === 'campaign' && levelPipesPassedRef.current >= levelConfig.pipesRequired) {
            if (currentLevelRef.current < LEVEL_CONFIGS.length - 1) {
              levelComplete();
            }
          }
        }
        return pipe.x > -PIPE_WIDTH;
      });

      // Update power-ups
      powerUpsRef.current = powerUpsRef.current.filter(powerUp => {
        powerUp.x -= levelConfig.pipeSpeed * speedMultiplier;

        // Check collection
        const birdX = CANVAS_WIDTH / 2;
        const birdY = birdRef.current.y;
        const dist = Math.sqrt((powerUp.x - birdX) ** 2 + (powerUp.y - birdY) ** 2);
        if (dist < 30 && !powerUp.collected) {
          powerUp.collected = true;
          collectPowerUp(powerUp.type);
        }

        return powerUp.x > -20;
      });

      // Update active power-ups
      const now = Date.now();
      activePowerUpsRef.current = activePowerUpsRef.current.filter(p => p.endTime > now);

      // Collision detection
      const tinyActive = activePowerUpsRef.current.some(p => p.type === 'tiny');
      const currentBirdSize = BIRD_SIZE * (tinyActive ? 0.6 : 1);
      const birdLeft = CANVAS_WIDTH / 2 - currentBirdSize / 2 + 4;
      const birdRight = CANVAS_WIDTH / 2 + currentBirdSize / 2 - 4;
      const birdTop = birdRef.current.y - currentBirdSize / 2 + 4;
      const birdBottom = birdRef.current.y + currentBirdSize / 2 - 4;

      const invincible = frameCountRef.current < invincibleUntilRef.current;

      if ((birdBottom >= CANVAS_HEIGHT - GROUND_HEIGHT || birdTop <= 0) && !invincible) {
        loseLife(true); // Ground/ceiling = instant death
        return;
      }

      if (!invincible) {
        for (const pipe of pipesRef.current) {
          if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
            // Pipe collision
            if (birdTop < pipe.gapY || birdBottom > pipe.gapY + levelConfig.gapSize) {
              loseLife();
              return;
            }
            // Obstacle collision
            if (pipe.obstacleY) {
              const obstacleDist = Math.sqrt((birdLeft + currentBirdSize / 2 - (pipe.x + PIPE_WIDTH / 2)) ** 2 + (birdTop + currentBirdSize / 2 - pipe.obstacleY) ** 2);
              if (obstacleDist < currentBirdSize / 2 + 15) {
                loseLife();
                return;
              }
            }
          }
        }
      }

      draw(ctx, levelConfig);
      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    const getEndlessDifficulty = (): LevelConfig => {
      const pipesCount = scoreRef.current;
      const difficulty = Math.floor(pipesCount / 10);
      const baseGap = 220 - difficulty * 10;
      const baseSpeed = 1.2 + difficulty * 0.15;
      return {
        name: 'Endless',
        gapSize: Math.max(baseGap, 120),
        pipeSpeed: Math.min(baseSpeed, 2.8),
        pipesRequired: 999,
        movingPipes: difficulty >= 3,
        obstacles: difficulty >= 5,
        darkMode: difficulty >= 7,
        turboMode: false,
        skyColor: difficulty >= 7 ? '#191970' : difficulty >= 4 ? '#778899' : '#87CEEB',
      };
    };

    const getFreeDifficulty = (): LevelConfig => {
      const diff = freeDifficultyRef.current;
      return {
        name: `Free Play (${diff.charAt(0).toUpperCase() + diff.slice(1)})`,
        gapSize: diff === 'easy' ? 250 : diff === 'medium' ? 200 : 150,
        pipeSpeed: diff === 'easy' ? 1.2 : diff === 'medium' ? 1.6 : 2.2,
        pipesRequired: 999,
        movingPipes: false,
        obstacles: false,
        darkMode: false,
        turboMode: false,
        skyColor: '#87CEEB',
      };
    };

    const collectPowerUp = (type: PowerUp['type']) => {
      if (type === 'life') {
        livesRef.current = Math.min(livesRef.current + 1, 5);
      } else if (type === 'shield') {
        activePowerUpsRef.current.push({ type: 'shield', endTime: Date.now() + 999999 }); // Until used
      } else if (type === 'slowmo') {
        activePowerUpsRef.current.push({ type: 'slowmo', endTime: Date.now() + 5000 });
      } else if (type === 'tiny') {
        activePowerUpsRef.current.push({ type: 'tiny', endTime: Date.now() + 5000 });
      }
    };

    const loseLife = (instant = false) => {
      // Check shield first
      const shieldIndex = activePowerUpsRef.current.findIndex(p => p.type === 'shield');
      if (shieldIndex !== -1) {
        activePowerUpsRef.current.splice(shieldIndex, 1);
        return; // Shield absorbed hit
      }

      livesRef.current--;
      if (livesRef.current <= 0 || instant) {
        endGame();
      } else {
        // Respawn with brief invincibility
        birdRef.current.y = CANVAS_HEIGHT / 2;
        birdRef.current.velocity = 0;
        invincibleUntilRef.current = frameCountRef.current + 60; // 1 second at 60fps
      }
    };

    const levelComplete = () => {
      levelCompleteTimeRef.current = frameCountRef.current;
      levelCompleteOpacityRef.current = 1;
      currentLevelRef.current++;
      levelPipesPassedRef.current = 0;

      // Save campaign progress
      if (currentLevelRef.current > campaignProgress) {
        localStorage.setItem('pb-flappy-campaign', currentLevelRef.current.toString());
        setCampaignProgress(currentLevelRef.current);
      }
    };

    const draw = (ctx: CanvasRenderingContext2D, levelConfig: LevelConfig) => {
      // Sky (gradient or solid)
      if (levelConfig.skyColor2) {
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
        gradient.addColorStop(0, levelConfig.skyColor);
        gradient.addColorStop(1, levelConfig.skyColor2);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = levelConfig.skyColor;
      }
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT);

      // Slow-mo tint
      const slowMoActive = activePowerUpsRef.current.some(p => p.type === 'slowmo');
      if (slowMoActive) {
        ctx.fillStyle = 'rgba(100, 150, 255, 0.15)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // Ground
      ctx.fillStyle = '#DED895';
      ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

      // Pipes
      const pipeColor = levelConfig.darkMode ? '#3A5F3A' : '#5CB85C';
      const pipeOutline = levelConfig.darkMode ? '#2A4A2A' : '#4A934A';
      ctx.fillStyle = pipeColor;
      for (const pipe of pipesRef.current) {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.fillRect(pipe.x, pipe.gapY + levelConfig.gapSize, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - levelConfig.gapSize - GROUND_HEIGHT);
        ctx.strokeStyle = pipeOutline;
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.strokeRect(pipe.x, pipe.gapY + levelConfig.gapSize, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - levelConfig.gapSize - GROUND_HEIGHT);

        // Draw obstacle
        if (pipe.obstacleY) {
          ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
          ctx.beginPath();
          ctx.arc(pipe.x + PIPE_WIDTH / 2, pipe.obstacleY, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#666';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Power-ups
      for (const powerUp of powerUpsRef.current) {
        drawPowerUp(ctx, powerUp);
      }

      drawBird(ctx);

      // Score
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(scoreRef.current.toString(), CANVAS_WIDTH / 2, 80);
      ctx.fillText(scoreRef.current.toString(), CANVAS_WIDTH / 2, 80);

      // Level indicator
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      const levelText = gameModeRef.current === 'campaign'
        ? `Level ${currentLevelRef.current + 1}: ${levelConfig.name}`
        : levelConfig.name;
      ctx.strokeText(levelText, 10, 25);
      ctx.fillText(levelText, 10, 25);

      // Progress bar (campaign mode)
      if (gameModeRef.current === 'campaign') {
        const progress = levelPipesPassedRef.current / levelConfig.pipesRequired;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 35, 200, 8);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(10, 35, 200 * progress, 8);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 35, 200, 8);
      }

      // Lives (hearts)
      for (let i = 0; i < livesRef.current; i++) {
        const x = CANVAS_WIDTH - 30 - i * 25;
        const y = 30;
        ctx.fillStyle = '#FF3333';
        ctx.beginPath();
        ctx.moveTo(x, y + 5);
        ctx.bezierCurveTo(x, y + 2, x - 6, y - 3, x, y - 6);
        ctx.bezierCurveTo(x + 6, y - 3, x, y + 2, x, y + 5);
        ctx.fill();
      }

      // Active power-up icons
      let iconX = 10;
      for (const powerUp of activePowerUpsRef.current) {
        if (powerUp.type === 'shield') {
          ctx.strokeStyle = 'rgba(100, 200, 255, 0.9)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(iconX + 10, 60, 8, 0, Math.PI * 2);
          ctx.stroke();
        } else if (powerUp.type === 'slowmo') {
          ctx.fillStyle = 'rgba(50, 150, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(iconX + 10, 60, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(iconX + 10, 60);
          ctx.lineTo(iconX + 10, 54);
          ctx.moveTo(iconX + 10, 60);
          ctx.lineTo(iconX + 15, 60);
          ctx.stroke();
        } else if (powerUp.type === 'tiny') {
          ctx.fillStyle = 'rgba(255, 150, 50, 0.9)';
          ctx.beginPath();
          ctx.moveTo(iconX + 10, 66);
          ctx.lineTo(iconX + 5, 56);
          ctx.lineTo(iconX + 15, 56);
          ctx.closePath();
          ctx.fill();
        }
        iconX += 25;
      }

      // Level complete flash
      if (levelCompleteTimeRef.current > 0 && frameCountRef.current - levelCompleteTimeRef.current < 120) {
        const age = frameCountRef.current - levelCompleteTimeRef.current;
        const opacity = Math.max(0, 1 - age / 120);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        const text = `Level ${currentLevelRef.current} Complete!`;
        ctx.strokeText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }
    };

    const endGame = () => {
      gameStateRef.current = 'gameover';
      if (scoreRef.current > bestScore) {
        setBestScore(scoreRef.current);
        localStorage.setItem('pb-flappy', scoreRef.current.toString());
      }
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }

      // Draw final frame with game-over screen
      const levelConfig = gameModeRef.current === 'campaign'
        ? LEVEL_CONFIGS[currentLevelRef.current]
        : gameModeRef.current === 'endless'
        ? getEndlessDifficulty()
        : getFreeDifficulty();
      draw(ctx, levelConfig);

      // Update state to show game-over UI
      setGameState('gameover');
    };

    if (gameStateRef.current === 'playing') {
      animationIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      const levelConfig = gameModeRef.current === 'campaign'
        ? LEVEL_CONFIGS[currentLevelRef.current]
        : { name: '', gapSize: 200, pipeSpeed: 1.5, pipesRequired: 0, movingPipes: false, obstacles: false, darkMode: false, turboMode: false, skyColor: '#87CEEB' };
      draw(ctx, levelConfig);
    }

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [gameState, bestScore, selectedBird, campaignProgress, selectedMode, freeDifficulty]);

  const flap = () => {
    if (gameStateRef.current === 'playing') {
      birdRef.current.velocity = FLAP_STRENGTH;
    }
  };

  const startGame = () => {
    birdRef.current = { y: CANVAS_HEIGHT / 2, velocity: 0 };
    pipesRef.current = [];
    powerUpsRef.current = [];
    activePowerUpsRef.current = [];
    scoreRef.current = 0;
    livesRef.current = 3;
    frameCountRef.current = 0;
    invincibleUntilRef.current = 0;
    levelPipesPassedRef.current = 0;
    levelCompleteTimeRef.current = 0;
    if (gameModeRef.current === 'campaign') {
      currentLevelRef.current = 0;
    }
    setScore(0);
    gameStateRef.current = 'playing';
    setGameState('playing');
  };

  const selectBird = (type: BirdType) => {
    setSelectedBird(type);
    birdTypeRef.current = type;
    localStorage.setItem('flappy-bird-type', type);
  };

  const selectMode = (mode: GameMode) => {
    setSelectedMode(mode);
    gameModeRef.current = mode;
    setGameState('birdselect');
  };

  const selectFreeDifficulty = (diff: FreeDifficulty) => {
    setFreeDifficulty(diff);
    freeDifficultyRef.current = diff;
  };

  const handleShare = async () => {
    const modeText = selectedMode === 'campaign' ? `Campaign Level ${currentLevelRef.current + 1}` : selectedMode === 'endless' ? 'Endless Mode' : 'Free Play';
    const text = `I scored ${score} in Flappy Bird (${modeText})! Can you beat it? ${window.location.href}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {
        navigator.clipboard.writeText(text);
        alert('Score copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (gameStateRef.current === 'playing') e.preventDefault();
    };
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, []);

  // Mini bird preview for selection buttons
  const BirdPreview = ({ type, size = 24 }: { type: BirdType; size?: number }) => {
    const t = BIRDS[type];
    const r = size / 2;
    return (
      <svg width={size + 12} height={size + 4} viewBox={`0 0 ${size + 12} ${size + 4}`}>
        {/* Wing */}
        <ellipse cx={r - 2} cy={r + 3} rx={r * 0.4} ry={r * 0.7} fill={t.wing} stroke={t.wingOutline} strokeWidth="0.5" />
        {/* Body */}
        <circle cx={r + 2} cy={r + 2} r={r} fill={t.body} stroke={t.outline} strokeWidth="1.5" />
        {/* Belly */}
        <ellipse cx={r + 1} cy={r + 4} rx={r * 0.5} ry={r * 0.35} fill={t.belly} />
        {/* Cardinal crest */}
        {type === 'cardinal' && <polygon points={`${r + 2},2 ${r - 1},-4 ${r + 5},1`} fill={t.body} />}
        {/* Penguin face */}
        {type === 'penguin' && <ellipse cx={r + 5} cy={r} rx={r * 0.35} ry={r * 0.5} fill="#E8E8E8" />}
        {/* Phoenix tail */}
        {type === 'phoenix' && <path d={`M${r - r + 2},${r + 1} Q${-3},${r - 2} ${-2},${r + 1} Q${-3},${r + 4} ${r - r + 2},${r + 3}`} fill="#FF4500" />}
        {/* Eye */}
        <circle cx={r + 6} cy={r - 1} r={2.5} fill="#fff" />
        <circle cx={r + 6.5} cy={r - 1} r={1.2} fill="#000" />
        {/* Beak */}
        <polygon points={`${r + r},${r} ${r + r + 6},${r + 2} ${r + r},${r + 4}`} fill={t.beak} />
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-gray-700 rounded-lg max-w-full h-auto cursor-pointer touch-none"
          onClick={flap}
          onTouchStart={(e) => { e.preventDefault(); flap(); }}
        />

        {gameState === 'modeselect' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-4xl font-bold text-white mb-2">Flappy Bird</h2>
            <p className="text-sm text-gray-300 mb-6">Choose your mode</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => selectMode('campaign')}
                className="px-8 py-4 rounded-xl text-left transition-all min-w-[280px] bg-white/10 hover:bg-white/20"
              >
                <span className="text-white font-bold text-lg">Campaign</span>
                <p className="text-gray-300 text-xs mt-1">10 unique levels with increasing difficulty</p>
                {campaignProgress > 0 && (
                  <p className="text-yellow-400 text-xs mt-1">Progress: Level {campaignProgress + 1}</p>
                )}
              </button>

              <button
                onClick={() => selectMode('endless')}
                className="px-8 py-4 rounded-xl text-left transition-all min-w-[280px] bg-white/10 hover:bg-white/20"
              >
                <span className="text-white font-bold text-lg">Endless</span>
                <p className="text-gray-300 text-xs mt-1">Progressive difficulty, how far can you go?</p>
              </button>

              <button
                onClick={() => selectMode('freeplay')}
                className="px-8 py-4 rounded-xl text-left transition-all min-w-[280px] bg-white/10 hover:bg-white/20"
              >
                <span className="text-white font-bold text-lg">Free Play</span>
                <p className="text-gray-300 text-xs mt-1">Classic mode with adjustable difficulty</p>
              </button>
            </div>

            {bestScore > 0 && (
              <p className="text-yellow-400 text-sm mt-4">Best Score: {bestScore}</p>
            )}
          </div>
        )}

        {gameState === 'birdselect' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-bold text-white mb-1">Choose Your Bird</h2>
            <p className="text-xs text-gray-400 mb-4">{selectedMode === 'campaign' ? 'Campaign Mode' : selectedMode === 'endless' ? 'Endless Mode' : 'Free Play'}</p>

            <div className="flex flex-wrap gap-2 justify-center max-w-[340px] mb-4">
              {(Object.keys(BIRDS) as BirdType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => selectBird(type)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedBird === type
                      ? 'bg-white/25 ring-2 ring-white scale-105 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <BirdPreview type={type} size={18} />
                  {BIRDS[type].label}
                </button>
              ))}
            </div>

            {selectedMode === 'freeplay' && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 text-center mb-2">Difficulty</p>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as FreeDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => selectFreeDifficulty(diff)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        freeDifficulty === diff
                          ? 'bg-white/25 ring-2 ring-white text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setGameState('modeselect')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold text-sm rounded-2xl transition-all hover:scale-105 active:scale-95"
              >
                Back
              </button>
              <button
                onClick={startGame}
                className="px-10 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-2xl transition-all hover:scale-105 active:scale-95"
              >
                Start
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">or tap anywhere / press Space</p>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-4xl font-bold text-white mb-6">Game Over!</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-300 mb-2">
                Mode: <span className="font-bold text-yellow-400">
                  {selectedMode === 'campaign' ? `Campaign (Level ${currentLevelRef.current + 1})` : selectedMode === 'endless' ? 'Endless' : 'Free Play'}
                </span>
              </p>
              <p className="text-2xl text-white mb-2">Score: <span className="font-bold text-yellow-400">{score}</span></p>
              <p className="text-xl text-white">Best: <span className="font-bold text-yellow-400">{bestScore}</span></p>
            </div>
            <div className="flex gap-3 mb-3">
              <button
                onClick={startGame}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Share
              </button>
              <DownloadButton canvasRef={canvasRef} filename="flappy-score" label="Save" />
            </div>
            <button
              onClick={() => setGameState('modeselect')}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold text-sm rounded-lg transition-colors"
            >
              Change Mode
            </button>
          </div>
        )}
      </div>

      {gameState === 'playing' && (
        <p className="text-gray-400 text-sm">Tap or press Space to flap</p>
      )}
    </div>
  );
}
