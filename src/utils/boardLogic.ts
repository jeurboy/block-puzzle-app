import { BOARD_SIZE, BoardState, CellValue, Shape } from '../game/constants';

// Score needed to reach each level: lv1→2: 150, lv2→3: 200, lv3→4: 250, lv4+: 250 each
function scoreForLevel(lv: number): number {
  if (lv <= 1) return 0;
  if (lv === 2) return 150;
  if (lv === 3) return 350;
  return 600 + (lv - 4) * 250;
}

export function getLevelFromScore(score: number): number {
  let lv = 1;
  while (score >= scoreForLevel(lv + 1)) lv++;
  return lv;
}

export function getLevelProgress(score: number): number {
  const lv = getLevelFromScore(score);
  const current = scoreForLevel(lv);
  const next = scoreForLevel(lv + 1);
  return (score - current) / (next - current);
}

export function createEmptyBoard(): BoardState {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 0 as CellValue)
  );
}

export function canPlace(board: BoardState, shape: Shape, row: number, col: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        const br = row + r;
        const bc = col + c;
        if (br < 0 || br >= BOARD_SIZE || bc < 0 || bc >= BOARD_SIZE) return false;
        if (board[br][bc] !== 0) return false;
      }
    }
  }
  return true;
}

export function placeBlock(
  board: BoardState,
  shape: Shape,
  row: number,
  col: number,
  color: string
): BoardState {
  const newBoard = board.map((r) => [...r]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        newBoard[row + r][col + c] = color;
      }
    }
  }
  return newBoard;
}

export type ClearResult = {
  board: BoardState;
  linesCleared: number;
  clearedCells: Set<string>; // "row,col" format
};

export function clearLines(board: BoardState): ClearResult {
  const newBoard = board.map((r) => [...r]);
  const clearedCells = new Set<string>();

  // Find full rows
  const fullRows: number[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (newBoard[r].every((cell) => cell !== 0)) fullRows.push(r);
  }

  // Find full columns
  const fullCols: number[] = [];
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (newBoard[r][c] === 0) { full = false; break; }
    }
    if (full) fullCols.push(c);
  }

  // Collect cells to clear
  for (const r of fullRows) {
    for (let c = 0; c < BOARD_SIZE; c++) clearedCells.add(`${r},${c}`);
  }
  for (const c of fullCols) {
    for (let r = 0; r < BOARD_SIZE; r++) clearedCells.add(`${r},${c}`);
  }

  // Clear them
  for (const key of clearedCells) {
    const [r, c] = key.split(',').map(Number);
    newBoard[r][c] = 0;
  }

  return {
    board: newBoard,
    linesCleared: fullRows.length + fullCols.length,
    clearedCells,
  };
}

export function canAnyBlockBePlaced(
  board: BoardState,
  blocks: { shape: Shape }[]
): boolean {
  for (const block of blocks) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlace(board, block.shape, r, c)) return true;
      }
    }
  }
  return false;
}

export function countCells(shape: Shape): number {
  return shape.reduce((sum, row) => sum + row.reduce((s, c) => s + c, 0), 0);
}

export function calcScore(
  blockCells: number,
  linesCleared: number,
  comboCount: number
): number {
  let score = blockCells;
  if (linesCleared > 0) {
    score += linesCleared * 10 + (linesCleared > 1 ? linesCleared * 5 : 0);
  }
  // Combo multiplier
  if (comboCount > 1) {
    score = Math.floor(score * (1 + (comboCount - 1) * 0.5));
  }
  return score;
}
