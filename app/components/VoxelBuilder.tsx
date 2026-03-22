'use client';

import { useEffect, useRef, useState } from 'react';
import DownloadButton from './DownloadButton';

type BlockType = 'grass' | 'stone' | 'wood' | 'water' | 'sand' | 'brick';
interface Block { x: number; y: number; z: number; type: BlockType }

const BLOCK_NAMES: Record<BlockType, string> = {
  grass: 'Grass', stone: 'Stone', wood: 'Wood',
  water: 'Water', sand: 'Sand', brick: 'Brick',
};
const PALETTE_COLOR: Record<BlockType, string> = {
  grass: '#5a9e1e', stone: '#808080', wood: '#8B6914',
  water: '#1e88e5', sand: '#e8c84a', brick: '#b34030',
};

const GRID = 10;
const MAX_Z = 8;
const BW = 40; // base iso width
const BH = 20; // base iso height
const BD = 20; // base depth

// 4x4 Minecraft-style pixel textures per face
type TG = string[][];
const TX: Record<BlockType, { top: TG; left: TG; right: TG }> = {
  grass: {
    top: [['#5a9e1e','#6db82e','#4e8e16','#6db82e'],['#4e8e16','#5a9e1e','#78c83a','#5a9e1e'],['#6db82e','#4e8e16','#5a9e1e','#78c83a'],['#5a9e1e','#78c83a','#4e8e16','#6db82e']],
    left: [['#4e8e16','#5a9e1e','#4e8e16','#5a9e1e'],['#8B6914','#7A5C0A','#9B7424','#8B6914'],['#7A5C0A','#8B6914','#7A5C0A','#9B7424'],['#9B7424','#7A5C0A','#8B6914','#7A5C0A']],
    right: [['#5a9e1e','#4e8e16','#5a9e1e','#4e8e16'],['#9B7424','#8B6914','#7A5C0A','#9B7424'],['#8B6914','#9B7424','#8B6914','#7A5C0A'],['#7A5C0A','#8B6914','#9B7424','#8B6914']],
  },
  stone: {
    top: [['#909090','#a0a0a0','#808080','#a0a0a0'],['#808080','#909090','#707070','#909090'],['#a0a0a0','#707070','#909090','#808080'],['#909090','#808080','#a0a0a0','#909090']],
    left: [['#707070','#808080','#606060','#808080'],['#606060','#707070','#505050','#707070'],['#808080','#505050','#707070','#606060'],['#707070','#606060','#808080','#707070']],
    right: [['#787878','#888888','#686868','#888888'],['#686868','#787878','#585858','#787878'],['#888888','#585858','#787878','#686868'],['#787878','#686868','#888888','#787878']],
  },
  wood: {
    top: [['#9B7424','#8B6914','#9B7424','#A08030'],['#8B6914','#B08840','#A08030','#9B7424'],['#9B7424','#A08030','#B08840','#8B6914'],['#A08030','#9B7424','#8B6914','#9B7424']],
    left: [['#5C3A1E','#7A5638','#5C3A1E','#6B4828'],['#5C3A1E','#7A5638','#5C3A1E','#6B4828'],['#5C3A1E','#7A5638','#5C3A1E','#6B4828'],['#5C3A1E','#7A5638','#5C3A1E','#6B4828']],
    right: [['#6B4828','#5C3A1E','#7A5638','#6B4828'],['#6B4828','#5C3A1E','#7A5638','#6B4828'],['#6B4828','#5C3A1E','#7A5638','#6B4828'],['#6B4828','#5C3A1E','#7A5638','#6B4828']],
  },
  water: {
    top: [['#1565c0','#1e88e5','#1976d2','#42a5f5'],['#1976d2','#64b5f6','#1e88e5','#1976d2'],['#42a5f5','#1976d2','#1e88e5','#64b5f6'],['#1e88e5','#1565c0','#42a5f5','#1976d2']],
    left: [['#0d47a1','#1565c0','#0d47a1','#1565c0'],['#1565c0','#0d47a1','#1565c0','#0d47a1'],['#0d47a1','#1565c0','#0d47a1','#1565c0'],['#1565c0','#0d47a1','#1565c0','#0d47a1']],
    right: [['#1256a0','#0d47a1','#1256a0','#0d47a1'],['#0d47a1','#1256a0','#0d47a1','#1256a0'],['#1256a0','#0d47a1','#1256a0','#0d47a1'],['#0d47a1','#1256a0','#0d47a1','#1256a0']],
  },
  sand: {
    top: [['#e8c84a','#dbb63a','#e8c84a','#f0d860'],['#dbb63a','#f0d860','#dbb63a','#e8c84a'],['#f0d860','#e8c84a','#d0a830','#e8c84a'],['#e8c84a','#d0a830','#f0d860','#dbb63a']],
    left: [['#c4a030','#d4b040','#c4a030','#d4b040'],['#d4b040','#c4a030','#b89028','#c4a030'],['#c4a030','#b89028','#c4a030','#d4b040'],['#b89028','#c4a030','#d4b040','#c4a030']],
    right: [['#c8a838','#b89028','#c8a838','#b89028'],['#b89028','#c8a838','#b89028','#c8a838'],['#c8a838','#b89028','#c8a838','#b89028'],['#b89028','#c8a838','#b89028','#c8a838']],
  },
  brick: {
    top: [['#b34030','#c04838','#b34030','#a03828'],['#a03828','#b34030','#c04838','#b34030'],['#c04838','#a03828','#b34030','#c04838'],['#b34030','#c04838','#a03828','#b34030']],
    left: [['#b34030','#b34030','#d0c8b8','#a03828'],['#d0c8b8','#d0c8b8','#d0c8b8','#d0c8b8'],['#a03828','#d0c8b8','#b34030','#b34030'],['#d0c8b8','#d0c8b8','#d0c8b8','#d0c8b8']],
    right: [['#a03828','#d0c8b8','#b34030','#b34030'],['#d0c8b8','#d0c8b8','#d0c8b8','#d0c8b8'],['#b34030','#b34030','#d0c8b8','#a03828'],['#d0c8b8','#d0c8b8','#d0c8b8','#d0c8b8']],
  },
};

// Seeded random for deterministic stars
function srand(s: number) { const x = Math.sin(s) * 10000; return x - Math.floor(x); }
const STARS = Array.from({ length: 50 }, (_, i) => ({
  x: srand(i * 7 + 1), y: srand(i * 13 + 2) * 0.45,
  r: 0.6 + srand(i * 17 + 3) * 1.2, b: 0.3 + srand(i * 23 + 4) * 0.7,
}));

export default function VoxelBuilder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blocksRef = useRef<Block[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('grass');
  const [eraseMode, setEraseMode] = useState(false);
  const [blockCount, setBlockCount] = useState(0);
  const [rotation, setRotation] = useState(0);

  // Camera refs
  const panXRef = useRef(0);
  const panYRef = useRef(0);
  const zoomRef = useRef(1);
  const rotRef = useRef(0);

  // Drag state
  const isDragRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  // Pinch state
  const lastPinchDist = useRef(0);
  const lastPinchCenter = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('voxel-world');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        blocksRef.current = p;
        setBlocks(p);
        setBlockCount(p.length);
      } catch {}
    }
  }, []);

  // ---- Coordinate transforms ----
  const rotateFwd = (gx: number, gy: number) => {
    let rx = gx, ry = gy;
    for (let r = 0; r < rotRef.current; r++) {
      const t = rx; rx = GRID - 1 - ry; ry = t;
    }
    return { x: rx, y: ry };
  };
  const rotateInv = (rx: number, ry: number) => {
    let gx = rx, gy = ry;
    for (let r = 0; r < rotRef.current; r++) {
      const t = gx; gx = gy; gy = GRID - 1 - t;
    }
    return { x: gx, y: gy };
  };

  const g2s = (gx: number, gy: number, gz: number, cw: number, ch: number) => {
    const { x: rx, y: ry } = rotateFwd(gx, gy);
    const z = zoomRef.current;
    const w = BW * z, h = BH * z, d = BD * z;
    return {
      x: cw / 2 + panXRef.current + (rx - ry) * (w / 2),
      y: ch * 0.42 + panYRef.current + (rx + ry) * (h / 2) - gz * d,
    };
  };

  const s2g = (sx: number, sy: number, cw: number, ch: number) => {
    const z = zoomRef.current;
    const w = BW * z, h = BH * z;
    const relX = (sx - cw / 2 - panXRef.current) / (w / 2);
    const relY = (sy - ch * 0.42 - panYRef.current) / (h / 2);
    const rx = Math.floor((relX + relY) / 2);
    const ry = Math.floor((relY - relX) / 2);
    return rotateInv(rx, ry);
  };

  // ---- Drawing ----
  const drawSky = (ctx: CanvasRenderingContext2D, cw: number, ch: number) => {
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#0a1a30');
    grad.addColorStop(0.5, '#142840');
    grad.addColorStop(1, '#0d1520');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    // Stars
    for (const s of STARS) {
      ctx.globalAlpha = s.b;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x * cw, s.y * ch, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const drawSun = (ctx: CanvasRenderingContext2D, cw: number, ch: number) => {
    const sx = cw * 0.82, sy = ch * 0.1, r = 28;

    // Outer glow
    const glow = ctx.createRadialGradient(sx, sy, r * 0.5, sx, sy, r * 4);
    glow.addColorStop(0, 'rgba(255,200,50,0.25)');
    glow.addColorStop(0.5, 'rgba(255,160,30,0.08)');
    glow.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sx - r * 4, sy - r * 4, r * 8, r * 8);

    // Sun body
    const body = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    body.addColorStop(0, '#fff8e0');
    body.addColorStop(0.3, '#ffe066');
    body.addColorStop(0.7, '#ffb020');
    body.addColorStop(1, '#ff8800');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // Rays
    ctx.strokeStyle = 'rgba(255,200,50,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * (r + 6), sy + Math.sin(a) * (r + 6));
      ctx.lineTo(sx + Math.cos(a) * (r + 18), sy + Math.sin(a) * (r + 18));
      ctx.stroke();
    }
  };

  const drawTexFace = (
    ctx: CanvasRenderingContext2D, face: 'top' | 'left' | 'right',
    sx: number, sy: number, w2: number, h2: number, d: number, tex: TG
  ) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const u0 = i / 4, u1 = (i + 1) / 4, v0 = j / 4, v1 = (j + 1) / 4;
        ctx.fillStyle = tex[j][i];
        ctx.beginPath();
        if (face === 'top') {
          ctx.moveTo(sx + (u0 - v0) * w2, sy + (u0 + v0) * h2);
          ctx.lineTo(sx + (u1 - v0) * w2, sy + (u1 + v0) * h2);
          ctx.lineTo(sx + (u1 - v1) * w2, sy + (u1 + v1) * h2);
          ctx.lineTo(sx + (u0 - v1) * w2, sy + (u0 + v1) * h2);
        } else if (face === 'left') {
          const bx = sx - w2, by = sy + h2;
          ctx.moveTo(bx + u0 * w2, by + u0 * h2 + v0 * d);
          ctx.lineTo(bx + u1 * w2, by + u1 * h2 + v0 * d);
          ctx.lineTo(bx + u1 * w2, by + u1 * h2 + v1 * d);
          ctx.lineTo(bx + u0 * w2, by + u0 * h2 + v1 * d);
        } else {
          const bx = sx + w2, by = sy + h2;
          ctx.moveTo(bx - u0 * w2, by + u0 * h2 + v0 * d);
          ctx.lineTo(bx - u1 * w2, by + u1 * h2 + v0 * d);
          ctx.lineTo(bx - u1 * w2, by + u1 * h2 + v1 * d);
          ctx.lineTo(bx - u0 * w2, by + u0 * h2 + v1 * d);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  };

  const drawFaceOutline = (
    ctx: CanvasRenderingContext2D, face: 'top' | 'left' | 'right',
    sx: number, sy: number, w2: number, h2: number, d: number
  ) => {
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    if (face === 'top') {
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + w2, sy + h2);
      ctx.lineTo(sx, sy + h2 * 2);
      ctx.lineTo(sx - w2, sy + h2);
    } else if (face === 'left') {
      ctx.moveTo(sx - w2, sy + h2);
      ctx.lineTo(sx, sy + h2 * 2);
      ctx.lineTo(sx, sy + h2 * 2 + d);
      ctx.lineTo(sx - w2, sy + h2 + d);
    } else {
      ctx.moveTo(sx + w2, sy + h2);
      ctx.lineTo(sx, sy + h2 * 2);
      ctx.lineTo(sx, sy + h2 * 2 + d);
      ctx.lineTo(sx + w2, sy + h2 + d);
    }
    ctx.closePath();
    ctx.stroke();
  };

  const drawBlock = (ctx: CanvasRenderingContext2D, block: Block, cw: number, ch: number) => {
    const pos = g2s(block.x, block.y, block.z, cw, ch);
    const z = zoomRef.current;
    const w2 = (BW * z) / 2;
    const h2 = (BH * z) / 2;
    const d = BD * z;
    const tex = TX[block.type];

    drawTexFace(ctx, 'top', pos.x, pos.y, w2, h2, d, tex.top);
    drawTexFace(ctx, 'left', pos.x, pos.y, w2, h2, d, tex.left);
    drawTexFace(ctx, 'right', pos.x, pos.y, w2, h2, d, tex.right);
    drawFaceOutline(ctx, 'top', pos.x, pos.y, w2, h2, d);
    drawFaceOutline(ctx, 'left', pos.x, pos.y, w2, h2, d);
    drawFaceOutline(ctx, 'right', pos.x, pos.y, w2, h2, d);
  };

  const render = () => {
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
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Sky + sun
    drawSky(ctx, cw, ch);
    drawSun(ctx, cw, ch);

    // Ground grid
    const z = zoomRef.current;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      const a = g2s(i, 0, 0, cw, ch);
      const b = g2s(i, GRID, 0, cw, ch);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y + BH * z);
      ctx.lineTo(b.x, b.y + BH * z);
      ctx.stroke();
      const c = g2s(0, i, 0, cw, ch);
      const d = g2s(GRID, i, 0, cw, ch);
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + BH * z);
      ctx.lineTo(d.x, d.y + BH * z);
      ctx.stroke();
    }

    // Sort & draw blocks (painter's algorithm)
    const sorted = [...blocksRef.current].sort((a, b) => {
      const { x: ax, y: ay } = rotateFwd(a.x, a.y);
      const { x: bx, y: by } = rotateFwd(b.x, b.y);
      const da = ax + ay, db = bx + by;
      if (da !== db) return da - db;
      return a.z - b.z;
    });
    for (const block of sorted) drawBlock(ctx, block, cw, ch);
  };

  useEffect(() => {
    render();
    const onResize = () => render();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [blocks, rotation]);

  // ---- Helpers ----
  const getHeightAt = (x: number, y: number) => {
    let max = -1;
    for (const b of blocksRef.current) if (b.x === x && b.y === y && b.z > max) max = b.z;
    return max + 1;
  };

  const save = () => {
    setBlocks([...blocksRef.current]);
    setBlockCount(blocksRef.current.length);
    localStorage.setItem('voxel-world', JSON.stringify(blocksRef.current));
  };

  // ---- Mouse events ----
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.shiftKey) {
      // Middle click or shift+click -> start pan
      e.preventDefault();
      isDragRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY, px: panXRef.current, py: panYRef.current };
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragRef.current) return;
    panXRef.current = dragStartRef.current.px + (e.clientX - dragStartRef.current.x);
    panYRef.current = dragStartRef.current.py + (e.clientY - dragStartRef.current.y);
    render();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragRef.current) {
      isDragRef.current = false;
      return;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.shiftKey) return; // was a pan
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { x, y } = s2g(e.clientX - rect.left, e.clientY - rect.top, canvas.offsetWidth, canvas.offsetHeight);
    if (x < 0 || x >= GRID || y < 0 || y >= GRID) return;

    if (eraseMode || e.button === 2) {
      const z = getHeightAt(x, y) - 1;
      if (z < 0) return;
      blocksRef.current = blocksRef.current.filter(b => !(b.x === x && b.y === y && b.z === z));
    } else {
      const z = getHeightAt(x, y);
      if (z >= MAX_Z) return;
      blocksRef.current = [...blocksRef.current, { x, y, z, type: selectedBlock }];
    }
    save();
    render();
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { x, y } = s2g(e.clientX - rect.left, e.clientY - rect.top, canvas.offsetWidth, canvas.offsetHeight);
    if (x < 0 || x >= GRID || y < 0 || y >= GRID) return;
    const z = getHeightAt(x, y) - 1;
    if (z < 0) return;
    blocksRef.current = blocksRef.current.filter(b => !(b.x === x && b.y === y && b.z === z));
    save();
    render();
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoomRef.current = Math.max(0.4, Math.min(2.5, zoomRef.current + delta));
    render();
  };

  // ---- Touch events ----
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
        lastPinchCenter.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
        dragStartRef.current = { x: lastPinchCenter.current.x, y: lastPinchCenter.current.y, px: panXRef.current, py: panYRef.current };
      } else if (e.touches.length === 1) {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const center = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };

        // Zoom
        const scale = dist / lastPinchDist.current;
        zoomRef.current = Math.max(0.4, Math.min(2.5, zoomRef.current * scale));
        lastPinchDist.current = dist;

        // Pan
        panXRef.current = dragStartRef.current.px + (center.x - dragStartRef.current.x);
        panYRef.current = dragStartRef.current.py + (center.y - dragStartRef.current.y);

        render();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1 && e.touches.length === 0 && touchStartRef.current) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;
        const dt = Date.now() - touchStartRef.current.t;
        // Only place/erase on short taps without movement
        if (Math.abs(dx) < 15 && Math.abs(dy) < 15 && dt < 400) {
          const rect = canvas.getBoundingClientRect();
          const sx = touch.clientX - rect.left;
          const sy = touch.clientY - rect.top;
          const { x, y } = s2g(sx, sy, canvas.offsetWidth, canvas.offsetHeight);
          if (x >= 0 && x < GRID && y >= 0 && y < GRID) {
            if (eraseMode) {
              const z = getHeightAt(x, y) - 1;
              if (z >= 0) {
                blocksRef.current = blocksRef.current.filter(b => !(b.x === x && b.y === y && b.z === z));
                save(); render();
              }
            } else {
              const z = getHeightAt(x, y);
              if (z < MAX_Z) {
                blocksRef.current = [...blocksRef.current, { x, y, z, type: selectedBlock }];
                save(); render();
              }
            }
          }
        }
        touchStartRef.current = null;
      }
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [eraseMode, selectedBlock]);

  const rotate = (dir: number) => {
    rotRef.current = (rotRef.current + dir + 4) % 4;
    setRotation(rotRef.current);
    render();
  };

  const clearAll = () => {
    if (confirm('Clear all blocks?')) {
      blocksRef.current = [];
      save();
      localStorage.removeItem('voxel-world');
      render();
    }
  };

  const resetCamera = () => {
    panXRef.current = 0;
    panYRef.current = 0;
    zoomRef.current = 1;
    rotRef.current = 0;
    setRotation(0);
    render();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-3 rounded-lg overflow-hidden border border-slate-700">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { isDragRef.current = false; }}
          onWheel={handleWheel}
          className="w-full cursor-crosshair"
          style={{ height: 'min(500px, 70vh)', touchAction: 'none' }}
        />
      </div>

      {/* Camera controls */}
      <div className="bg-slate-800 rounded-lg p-2 sm:p-3 mb-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1 hidden sm:inline">Camera</span>
        <button onClick={() => rotate(-1)} className="px-2 sm:px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs sm:text-sm transition-colors" title="Rotate left">
          &#8634; Left
        </button>
        <button onClick={() => rotate(1)} className="px-2 sm:px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs sm:text-sm transition-colors" title="Rotate right">
          &#8635; Right
        </button>
        <button onClick={() => { zoomRef.current = Math.min(2.5, zoomRef.current + 0.2); render(); }} className="px-2 sm:px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs sm:text-sm transition-colors">
          + Zoom
        </button>
        <button onClick={() => { zoomRef.current = Math.max(0.4, zoomRef.current - 0.2); render(); }} className="px-2 sm:px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs sm:text-sm transition-colors">
          - Zoom
        </button>
        <button onClick={resetCamera} className="px-2 sm:px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs sm:text-sm transition-colors">
          Reset
        </button>
        <span className="text-xs text-slate-500 ml-auto hidden sm:inline">Shift+drag to pan | Scroll to zoom</span>
      </div>

      {/* Build controls */}
      <div className="bg-slate-800 rounded-lg p-2 sm:p-3 mb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={() => setEraseMode(false)}
              className={`px-3 sm:px-4 py-2 rounded font-bold text-xs sm:text-sm transition-colors ${
                !eraseMode ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Build
            </button>
            <button
              onClick={() => setEraseMode(true)}
              className={`px-3 sm:px-4 py-2 rounded font-bold text-xs sm:text-sm transition-colors ${
                eraseMode ? 'bg-red-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Erase
            </button>
          </div>
          <div className="flex gap-1.5 sm:gap-2 items-center">
            <span className="text-xs sm:text-sm text-slate-400">{blockCount} blocks</span>
            <DownloadButton canvasRef={canvasRef} filename="voxel-creation" label="Save" />
            <button onClick={clearAll} className="px-2 sm:px-3 py-2 bg-red-700 hover:bg-red-600 rounded text-xs sm:text-sm font-bold transition-colors">
              Clear
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {(Object.keys(TX) as BlockType[]).map((bt) => (
            <button
              key={bt}
              onClick={() => { setSelectedBlock(bt); setEraseMode(false); }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded transition-all text-xs sm:text-sm font-bold ${
                selectedBlock === bt && !eraseMode ? 'ring-2 ring-white scale-105' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: PALETTE_COLOR[bt], color: bt === 'sand' ? '#000' : '#fff' }}
            >
              {BLOCK_NAMES[bt]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
