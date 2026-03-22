import {
  Shape,
  BlockData,
  BLOCK_COLORS,
  SHAPES_TIER_1,
  SHAPES_TIER_2,
  SHAPES_TIER_3,
  ALL_SHAPES,
} from '../game/constants';

type RngFn = () => number;

function getShapesForLevel(level: number): Shape[] {
  if (level <= 2) return [...SHAPES_TIER_1, ...SHAPES_TIER_2];
  return ALL_SHAPES;
}

export function randomShape(
  level: number = 1,
  rng: RngFn = Math.random
): { shape: Shape; color: string } {
  const shapes = getShapesForLevel(level);
  const shape = shapes[Math.floor(rng() * shapes.length)];
  const color = BLOCK_COLORS[Math.floor(rng() * BLOCK_COLORS.length)];
  return { shape, color };
}

export function generateBlockSet(
  level: number = 1,
  rng: RngFn = Math.random,
  count: number = 3
): BlockData[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    ...randomShape(level, rng),
    id: now + i,
  }));
}
