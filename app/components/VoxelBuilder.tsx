'use client';

import { useEffect, useRef, useState } from 'react';

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

const GRID_SIZE = 16;
const MAX_HEIGHT = 8;
const BLOCK_WIDTH = 32; // Isometric block width
const BLOCK_HEIGHT = 16; // Isometric block height
const BLOCK_DEPTH = 16; // Vertical height of block

export default function VoxelBuilder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('grass');
  const [zoom, setZoom] = useState(1);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('voxel-world');
    if (saved) {
      try {
        setBlocks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load voxel world', e);
      }
    }
  }, []);

  // Save to localStorage whenever blocks change
  useEffect(() => {
    if (blocks.length > 0) {
      localStorage.setItem('voxel-world', JSON.stringify(blocks));
    }
  }, [blocks]);

  // Convert grid coordinates to isometric screen position
  const gridToIso = (x: number, y: number, z: number, canvasWidth: number, canvasHeight: number) => {
    const isoX = (x - y) * (BLOCK_WIDTH / 2) * zoom;
    const isoY = (x + y) * (BLOCK_HEIGHT / 2) * zoom - z * BLOCK_DEPTH * zoom;

    // Center on canvas
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2 + 50;

    return {
      x: centerX + isoX,
      y: centerY + isoY,
    };
  };

  // Convert screen position to grid coordinates (for placement)
  const screenToGrid = (screenX: number, screenY: number, canvasWidth: number, canvasHeight: number) => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2 + 50;

    const relX = (screenX - centerX) / zoom;
    const relY = (screenY - centerY) / zoom;

    // Inverse isometric transformation (z=0 for ground level)
    const x = Math.floor((relX / (BLOCK_WIDTH / 2) + relY / (BLOCK_HEIGHT / 2)) / 2);
    const y = Math.floor((relY / (BLOCK_HEIGHT / 2) - relX / (BLOCK_WIDTH / 2)) / 2);

    return { x, y };
  };

  // Draw a single isometric block
  const drawBlock = (ctx: CanvasRenderingContext2D, block: Block, canvasWidth: number, canvasHeight: number) => {
    const pos = gridToIso(block.x, block.y, block.z, canvasWidth, canvasHeight);
    const colors = BLOCK_COLORS[block.type];
    const w = BLOCK_WIDTH * zoom;
    const h = BLOCK_HEIGHT * zoom;
    const d = BLOCK_DEPTH * zoom;

    // Draw top face
    ctx.fillStyle = colors.top;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + w / 2, pos.y + h / 2);
    ctx.lineTo(pos.x, pos.y + h);
    ctx.lineTo(pos.x - w / 2, pos.y + h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#00000040';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw left face
    ctx.fillStyle = colors.left;
    ctx.beginPath();
    ctx.moveTo(pos.x - w / 2, pos.y + h / 2);
    ctx.lineTo(pos.x, pos.y + h);
    ctx.lineTo(pos.x, pos.y + h + d);
    ctx.lineTo(pos.x - w / 2, pos.y + h / 2 + d);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw right face
    ctx.fillStyle = colors.right;
    ctx.beginPath();
    ctx.moveTo(pos.x + w / 2, pos.y + h / 2);
    ctx.lineTo(pos.x, pos.y + h);
    ctx.lineTo(pos.x, pos.y + h + d);
    ctx.lineTo(pos.x + w / 2, pos.y + h / 2 + d);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Render all blocks
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort blocks for painter's algorithm (back to front, bottom to top)
    const sorted = [...blocks].sort((a, b) => {
      if (a.z !== b.z) return a.z - b.z;
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    // Draw all blocks
    sorted.forEach(block => drawBlock(ctx, block, canvas.width, canvas.height));
  };

  // Re-render whenever blocks or zoom changes
  useEffect(() => {
    render();
  }, [blocks, zoom]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
      render();
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [blocks, zoom]);

  // Get height at grid position
  const getHeightAt = (x: number, y: number): number => {
    const blocksAtPos = blocks.filter(b => b.x === x && b.y === y);
    return blocksAtPos.length > 0 ? Math.max(...blocksAtPos.map(b => b.z)) + 1 : 0;
  };

  // Handle click to place block
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const { x, y } = screenToGrid(screenX, screenY, canvas.offsetWidth, canvas.offsetHeight);

    // Check bounds
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    const z = getHeightAt(x, y);

    // Check max height
    if (z >= MAX_HEIGHT) return;

    // Add block
    setBlocks(prev => [...prev, { x, y, z, type: selectedBlock }]);
  };

  // Handle right-click to remove block
  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const { x, y } = screenToGrid(screenX, screenY, canvas.offsetWidth, canvas.offsetHeight);

    // Remove top block at this position
    const z = getHeightAt(x, y) - 1;
    if (z < 0) return;

    setBlocks(prev => {
      const idx = prev.findIndex(b => b.x === x && b.y === y && b.z === z);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  // Touch handling for mobile
  const [touchStart, setTouchStart] = useState<number>(0);

  const handleTouchStart = () => {
    setTouchStart(Date.now());
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touchDuration = Date.now() - touchStart;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const screenX = touch.clientX - rect.left;
    const screenY = touch.clientY - rect.top;

    const { x, y } = screenToGrid(screenX, screenY, canvas.offsetWidth, canvas.offsetHeight);

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    // Long press (>500ms) = remove, tap = place
    if (touchDuration > 500) {
      // Remove block
      const z = getHeightAt(x, y) - 1;
      if (z >= 0) {
        setBlocks(prev => {
          const idx = prev.findIndex(b => b.x === x && b.y === y && b.z === z);
          if (idx === -1) return prev;
          return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
        });
      }
    } else {
      // Place block
      const z = getHeightAt(x, y);
      if (z < MAX_HEIGHT) {
        setBlocks(prev => [...prev, { x, y, z, type: selectedBlock }]);
      }
    }
  };

  const clearAll = () => {
    if (confirm('Clear all blocks?')) {
      setBlocks([]);
      localStorage.removeItem('voxel-world');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Canvas */}
      <div className="mb-4 bg-slate-800 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onContextMenu={handleCanvasContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full cursor-crosshair"
          style={{ height: '500px', touchAction: 'none' }}
        />
      </div>

      {/* Controls */}
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              Zoom Out
            </button>
            <button
              onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              Zoom In
            </button>
            <span className="px-3 py-1 bg-slate-900 rounded text-sm">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <button
            onClick={clearAll}
            className="px-4 py-1 bg-red-600 hover:bg-red-500 rounded transition-colors"
          >
            Clear All
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-3">
          <strong>Desktop:</strong> Left click to place, right click to remove. <strong>Mobile:</strong> Tap to place, long press to remove.
        </p>

        {/* Block palette */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BLOCK_COLORS) as BlockType[]).map(blockType => (
            <button
              key={blockType}
              onClick={() => setSelectedBlock(blockType)}
              className={`px-4 py-2 rounded transition-all ${
                selectedBlock === blockType
                  ? 'ring-2 ring-white scale-105'
                  : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: BLOCK_COLORS[blockType].top,
                color: blockType === 'sand' ? '#000' : '#fff',
              }}
            >
              {BLOCK_NAMES[blockType]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 text-sm text-slate-300">
        <p className="mb-2">
          <strong className="text-white">Blocks:</strong> {blocks.length} / {GRID_SIZE * GRID_SIZE * MAX_HEIGHT}
        </p>
        <p>
          <strong className="text-white">Grid:</strong> {GRID_SIZE}×{GRID_SIZE}, Max height: {MAX_HEIGHT}
        </p>
      </div>
    </div>
  );
}
