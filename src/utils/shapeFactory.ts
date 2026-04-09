import {
  Shape,
  BlockData,
  BoardState,
  BOARD_SIZE,
  BLOCK_COLORS,
  SHAPES_TIER_1,
  SHAPES_TIER_2,
  SHAPES_TIER_3,
  SHAPES_TIER_4,
  ALL_SHAPES,
} from '../game/constants';
import { canPlace, placeBlock, clearLines } from './boardLogic';

type RngFn = () => number;

function getShapesForLevel(level: number): Shape[] {
  if (level <= 2) return [...SHAPES_TIER_1, ...SHAPES_TIER_2];
  if (level === 3) return [...SHAPES_TIER_1, ...SHAPES_TIER_2, ...SHAPES_TIER_3];
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

// Returns true if there exists some ordering of `blocks` that can all be placed
// on `board` (considering line clears between placements).
function isSetSolvable(board: BoardState, blocks: BlockData[]): boolean {
  if (blocks.length === 0) return true;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!canPlace(board, block.shape, r, c)) continue;
        const placed = placeBlock(board, block.shape, r, c, block.color);
        const { board: cleared } = clearLines(placed);
        const rest = blocks.filter((_, j) => j !== i);
        if (isSetSolvable(cleared, rest)) return true;
      }
    }
  }
  return false;
}

// Generates a block set guaranteed (best-effort) to have at least one ordering
// that can be placed on `board` without ending the game. Falls back to a plain
// random set after `maxAttempts` if no solvable set is found.
export function generateSolvableBlockSet(
  board: BoardState,
  level: number = 1,
  rng: RngFn = Math.random,
  count: number = 3,
  maxAttempts: number = 60
): BlockData[] {
  let lastSet: BlockData[] = generateBlockSet(level, rng, count);
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const set = attempt === 0 ? lastSet : generateBlockSet(level, rng, count);
    if (isSetSolvable(board, set)) return set;
    lastSet = set;
  }
  return lastSet;
}
