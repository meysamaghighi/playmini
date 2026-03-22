'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type BlockType = 'grass' | 'stone' | 'wood' | 'water' | 'sand' | 'brick';

interface Block {
  x: number;
  y: number;
  z: number;
  type: BlockType;
}

const BLOCK_COLORS: Record<BlockType, { top: string; left: string; right: string }> = {
  grass: { top: '#7cb342', left: '#558b2f', right: '#689f38' },
  stone: { top: '#78909c', left: '#546e7a', right: '#607d8b' },
  wood: { top: '#8d6e63', left: '#6d4c41', right: '#795548' },
  water: { top: '#29b6f6', left: '#0288d1', right: '#039be5' },
  sand: { top: '#ffca28', left: '#ffa000', right: '#ffb300' },
  brick: { top: '#e57373', left: '#c62828', right: '#d32f2f' },
};

const BLOCK_NAMES: Record<BlockType, string> = {
  grass: 'Grass',
  stone: 'Stone',
  wood: 'Wood',
  water: 'Water',
  sand: 'Sand',
  brick: 'Brick',
};

const GRID_SIZE = 10;
const MAX_HEIGHT = 8;
const BLOCK_W = 40;
const BLOCK_H = 20;
const BLOCK_D = 20;

export default function VoxelBuilder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blocksRef = useRef<Block[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('grass');
  const [eraseMode, setEraseMode] = useState(false);
  const [blockCount, setBlockCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('voxel-world');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        blocksRef.current = parsed;
        setBlocks(parsed);
        setBlockCount(parsed.length);
      } catch {}
    }
  }, []);

  const gridToScreen = useCallback((gx: number, gy: number, gz: number, cw: number, ch: number) => {
    const cx = cw / 2;
    const cy = ch * 0.45;
    const sx = cx + (gx - gy) * (BLOCK_W / 2);
    const sy = cy + (gx + gy) * (BLOCK_H / 2) - gz * BLOCK_D;
    return { x: sx, y: sy };
  }, []);

  const screenToGrid = useCallback((sx: number, sy: number, cw: number, ch: number) => {
    const cx = cw / 2;
    const cy = ch * 0.45;
    const rx = sx - cx;
    const ry = sy - cy;
    const gx = Math.floor((rx / (BLOCK_W / 2) + ry / (BLOCK_H / 2)) / 2);
    const gy = Math.floor((ry / (BLOCK_H / 2) - rx / (BLOCK_W / 2)) / 2);
    return { x: gx, y: gy };
  }, []);

  const drawBlock = useCallback((ctx: CanvasRenderingContext2D, sx: number, sy: number, colors: { top: string; left: string; right: string }) => {
    const w2 = BLOCK_W / 2;
    const h2 = BLOCK_H / 2;

    // Top face
    ctx.fillStyle = colors.top;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + w2, sy + h2);
    ctx.lineTo(sx, sy + BLOCK_H);
    ctx.lineTo(sx - w2, sy + h2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#00000030';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Left face
    ctx.fillStyle = colors.left;
    ctx.beginPath();
    ctx.moveTo(sx - w2, sy + h2);
    ctx.lineTo(sx, sy + BLOCK_H);
    ctx.lineTo(sx, sy + BLOCK_H + BLOCK_D);
    ctx.lineTo(sx - w2, sy + h2 + BLOCK_D);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right face
    ctx.fillStyle = colors.right;
    ctx.beginPath();
    ctx.moveTo(sx + w2, sy + h2);
    ctx.lineTo(sx, sy + BLOCK_H);
    ctx.lineTo(sx, sy + BLOCK_H + BLOCK_D);
    ctx.lineTo(sx + w2, sy + h2 + BLOCK_D);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;

    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, cw, ch);

    // Draw grid (ground plane)
    ctx.strokeStyle = '#ffffff15';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      const a = gridToScreen(i, 0, 0, cw, ch);
      const b = gridToScreen(i, GRID_SIZE, 0, cw, ch);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y + BLOCK_H);
      ctx.lineTo(b.x, b.y + BLOCK_H);
      ctx.stroke();

      const c = gridToScreen(0, i, 0, cw, ch);
      const d = gridToScreen(GRID_SIZE, i, 0, cw, ch);
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + BLOCK_H);
      ctx.lineTo(d.x, d.y + BLOCK_H);
      ctx.stroke();
    }

    // Sort blocks: painter's algorithm (back to front)
    const sorted = [...blocksRef.current].sort((a, b) => {
      const depthA = a.x + a.y;
      const depthB = b.x + b.y;
      if (depthA !== depthB) return depthA - depthB;
      return a.z - b.z;
    });

    for (const block of sorted) {
      const pos = gridToScreen(block.x, block.y, block.z, cw, ch);
      drawBlock(ctx, pos.x, pos.y, BLOCK_COLORS[block.type]);
    }
  }, [gridToScreen, drawBlock]);

  useEffect(() => {
    render();
    const onResize = () => render();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [render, blocks]);

  const getHeightAt = (x: number, y: number): number => {
    let maxZ = -1;
    for (const b of blocksRef.current) {
      if (b.x === x && b.y === y && b.z > maxZ) maxZ = b.z;
    }
    return maxZ + 1;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { x, y } = screenToGrid(sx, sy, canvas.offsetWidth, canvas.offsetHeight);

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    if (eraseMode) {
      const z = getHeightAt(x, y) - 1;
      if (z < 0) return;
      blocksRef.current = blocksRef.current.filter(
        (b) => !(b.x === x && b.y === y && b.z === z)
      );
    } else {
      const z = getHeightAt(x, y);
      if (z >= MAX_HEIGHT) return;
      blocksRef.current = [...blocksRef.current, { x, y, z, type: selectedBlock }];
    }

    setBlocks([...blocksRef.current]);
    setBlockCount(blocksRef.current.length);
    localStorage.setItem('voxel-world', JSON.stringify(blocksRef.current));
    render();
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { x, y } = screenToGrid(e.clientX - rect.left, e.clientY - rect.top, canvas.offsetWidth, canvas.offsetHeight);
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    const z = getHeightAt(x, y) - 1;
    if (z < 0) return;
    blocksRef.current = blocksRef.current.filter(
      (b) => !(b.x === x && b.y === y && b.z === z)
    );
    setBlocks([...blocksRef.current]);
    setBlockCount(blocksRef.current.length);
    localStorage.setItem('voxel-world', JSON.stringify(blocksRef.current));
    render();
  };

  const clearAll = () => {
    if (confirm('Clear all blocks?')) {
      blocksRef.current = [];
      setBlocks([]);
      setBlockCount(0);
      localStorage.removeItem('voxel-world');
      render();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-4 bg-slate-800 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          className="w-full cursor-crosshair"
          style={{ height: '450px', touchAction: 'none' }}
        />
      </div>

      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setEraseMode(false)}
              className={`px-4 py-2 rounded font-bold text-sm transition-colors ${
                !eraseMode ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Build
            </button>
            <button
              onClick={() => setEraseMode(true)}
              className={`px-4 py-2 rounded font-bold text-sm transition-colors ${
                eraseMode ? 'bg-red-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Erase
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-slate-400">{blockCount} blocks</span>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-sm font-bold transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Click to place/erase. Right-click always removes the top block.
        </p>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(BLOCK_COLORS) as BlockType[]).map((bt) => (
            <button
              key={bt}
              onClick={() => { setSelectedBlock(bt); setEraseMode(false); }}
              className={`px-4 py-2 rounded transition-all text-sm font-bold ${
                selectedBlock === bt && !eraseMode ? 'ring-2 ring-white scale-105' : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: BLOCK_COLORS[bt].top,
                color: bt === 'sand' ? '#000' : '#fff',
              }}
            >
              {BLOCK_NAMES[bt]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
