import { create } from 'zustand';
import { BoardState, BlockData, BOARD_SIZE, BLOCK_COLORS } from '../game/constants';
import {
  createEmptyBoard,
  canPlace,
  placeBlock,
  clearLines,
  canAnyBlockBePlaced,
  countCells,
  calcScore,
  getLevelFromScore,
} from '../utils/boardLogic';
import { generateBlockSet, generateSolvableBlockSet } from '../utils/shapeFactory';
import { loadHighScore, saveHighScore, saveScoreRecord } from '../utils/storage';

export type GameMode = 'classic' | 'crazy' | 'time-trial' | 'daily';

// Special cell color for sabotage blocks
const SABOTAGE_COLOR = 'bg-slate-500';

type PreviousState = {
  board: BoardState;
  score: number;
  blocks: BlockData[];
  comboCount: number;
  specialCells: Map<string, number>;
};

function blockCountForMode(mode: GameMode, level: number = 1): number {
  if (mode === 'crazy') return level >= 2 ? 2 : 1;
  return 3;
}

// Classic mode guarantees the spawned set has a winning placement order, so the
// player can never be handed a dead set. Other modes use the plain random set.
function generateBlocksForMode(
  mode: GameMode,
  board: BoardState,
  level: number,
  rng: () => number,
  count: number
): BlockData[] {
  if (mode === 'classic' || mode === 'time-trial') {
    return generateSolvableBlockSet(board, level, rng, count);
  }
  return generateBlockSet(level, rng, count);
}

type GameState = {
  board: BoardState;
  score: number;
  highScore: number;
  blocks: BlockData[];
  gameOver: boolean;
  comboCount: number;
  level: number;
  mode: GameMode;
  started: boolean;
  undosRemaining: number;
  previousState: PreviousState | null;
  clearingCells: Set<string>;
  isAnimating: boolean;
  justPlacedCells: Set<string>;
  sabotageCells: Set<string>;
  // Special cells with durability: key = "row,col", value = durability (1 or 2)
  specialCells: Map<string, number>;
  lastAction: 'place' | 'clear' | 'gameover' | null;
  boardEffect: 'mirror' | 'rotate' | null;
  linesClearedThisTurn: number;
  // Time trial
  turnDeadline: number | null;

  // Actions
  init: () => Promise<void>;
  dropBlock: (blockId: number, row: number, col: number) => boolean;
  finishClearing: () => void;
  restart: () => void;
  startClassic: () => void;
  startCrazy: () => void;
  startTimeTrial: () => void;
  startDaily: (rng: () => number) => void;
  backToMenu: () => void;
  timeUp: () => void;
  spawnSabotageBlock: () => void;
  mirrorBoard: () => void;
  rotateBoard: () => void;
  undo: () => void;
};

function onGameOver(score: number, mode: GameMode, level: number) {
  saveScoreRecord({ score, mode, level });
}

export const useGameStore = create<GameState>((set, get) => ({
  board: createEmptyBoard(),
  score: 0,
  highScore: 0,
  blocks: [],
  gameOver: false,
  comboCount: 0,
  level: 1,
  mode: 'classic',
  started: false,
  undosRemaining: 3,
  previousState: null,
  clearingCells: new Set(),
  isAnimating: false,
  justPlacedCells: new Set(),
  sabotageCells: new Set(),
  specialCells: new Map(),
  lastAction: null,
  boardEffect: null,
  linesClearedThisTurn: 0,
  turnDeadline: null,

  init: async () => {
    const hs = await loadHighScore();
    set({ highScore: hs });
  },

  dropBlock: (blockId, row, col) => {
    const state = get();
    if (state.isAnimating || state.gameOver) return false;

    const blockIndex = state.blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) return false;

    const block = state.blocks[blockIndex];
    if (!canPlace(state.board, block.shape, row, col)) return false;

    // Save previous state for undo
    const prevState: PreviousState = {
      board: state.board.map((r) => [...r]),
      score: state.score,
      blocks: [...state.blocks],
      comboCount: state.comboCount,
      specialCells: new Map(state.specialCells),
    };

    // Place block
    const boardAfterPlace = placeBlock(state.board, block.shape, row, col, block.color);

    // Track placed cells
    const placed = new Set<string>();
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 1) placed.add(`${row + r},${col + c}`);
      }
    }

    // Check for line clears
    const { board: clearedBoard, linesCleared, clearedCells } = clearLines(boardAfterPlace);

    // Handle special cells with durability
    const newSpecialCells = new Map(state.specialCells);
    const finalBoard = clearedBoard.map((r) => [...r]);

    if (linesCleared > 0) {
      for (const cellKey of clearedCells) {
        const durability = newSpecialCells.get(cellKey);
        if (durability !== undefined) {
          if (durability >= 2) {
            // Reduce durability, restore the cell on the board
            newSpecialCells.set(cellKey, durability - 1);
            const [r, c] = cellKey.split(',').map(Number);
            finalBoard[r][c] = SABOTAGE_COLOR;
          } else {
            // durability 1 — fully destroyed
            newSpecialCells.delete(cellKey);
          }
        }
      }
    }

    // Combo
    const newCombo = linesCleared > 0 ? state.comboCount + 1 : 0;

    // Score
    const points = calcScore(countCells(block.shape), linesCleared, newCombo);
    const newScore = state.score + points;
    const newLevel = getLevelFromScore(newScore);

    // Remove used block — refill based on mode
    const remainingBlocks = state.blocks.filter((b) => b.id !== blockId);
    const count = blockCountForMode(state.mode, newLevel);

    // Reset turn deadline for time-trial
    const turnDeadline = state.mode === 'time-trial' ? Date.now() + 6000 : null;

    if (linesCleared > 0) {
      // Immediately show board + clearing effect — no heavy work before this set()
      set({
        board: boardAfterPlace,
        score: newScore,
        highScore: Math.max(state.highScore, newScore),
        comboCount: newCombo,
        level: newLevel,
        previousState: prevState,
        clearingCells: clearedCells,
        isAnimating: true,
        justPlacedCells: new Set(),
        sabotageCells: new Set(),
        lastAction: 'clear',
        linesClearedThisTurn: linesCleared,
        gameOver: false,
        turnDeadline,
      });

      // Defer heavy work (block generation, game-over check, high score save) to after animation
      setTimeout(() => {
        const s = get();
        if (!s.isAnimating) return;

        // Crazy: top up to count every turn; others: refill only when all used
        const needRefill = state.mode === 'crazy'
          ? count - remainingBlocks.length
          : remainingBlocks.length === 0 ? count : 0;
        const nextBlocks = needRefill > 0
          ? [...remainingBlocks, ...generateBlocksForMode(state.mode, finalBoard, newLevel, Math.random, needRefill)]
          : remainingBlocks;
        const newHighScore = Math.max(s.highScore, newScore);
        if (newHighScore > state.highScore) saveHighScore(newHighScore);

        const gameOver = !canAnyBlockBePlaced(finalBoard, nextBlocks);
        if (gameOver) onGameOver(s.score, s.mode, s.level);
        set({
          board: finalBoard,
          blocks: nextBlocks,
          highScore: newHighScore,
          clearingCells: new Set(),
          isAnimating: false,
          specialCells: newSpecialCells,
          lastAction: gameOver ? 'gameover' : null,
          gameOver,
        });
      }, 550);
    } else {
      // Crazy: top up to count every turn; others: refill only when all used
      const needRefill = state.mode === 'crazy'
        ? count - remainingBlocks.length
        : remainingBlocks.length === 0 ? count : 0;
      const nextBlocks = needRefill > 0
        ? [...remainingBlocks, ...generateBlocksForMode(state.mode, finalBoard, newLevel, Math.random, needRefill)]
        : remainingBlocks;
      const newHighScore = Math.max(state.highScore, newScore);
      if (newHighScore > state.highScore) saveHighScore(newHighScore);

      const isGameOver = !canAnyBlockBePlaced(finalBoard, nextBlocks);
      if (isGameOver) onGameOver(newScore, state.mode, newLevel);
      set({
        board: finalBoard,
        score: newScore,
        highScore: newHighScore,
        blocks: nextBlocks,
        comboCount: newCombo,
        level: newLevel,
        previousState: prevState,
        clearingCells: new Set(),
        isAnimating: false,
        justPlacedCells: new Set(),
        sabotageCells: new Set(),
        specialCells: newSpecialCells,
        lastAction: isGameOver ? 'gameover' : 'place',
        linesClearedThisTurn: 0,
        gameOver: isGameOver,
        turnDeadline,
      });
    }

    return true;
  },

  finishClearing: () => {
    set({ clearingCells: new Set(), isAnimating: false });
  },

  restart: () => {
    const state = get();
    const count = blockCountForMode(state.mode, 1);
    const freshBoard = createEmptyBoard();
    set({
      board: freshBoard,
      score: 0,
      blocks: generateBlocksForMode(state.mode, freshBoard, 1, Math.random, count),
      gameOver: false,
      comboCount: 0,
      level: 1,
      undosRemaining: 3,
      previousState: null,
      clearingCells: new Set(),
      isAnimating: false,
      justPlacedCells: new Set(),
      sabotageCells: new Set(),
      specialCells: new Map(),
      lastAction: null,
      linesClearedThisTurn: 0,
      turnDeadline: state.mode === 'time-trial' ? Date.now() + 6000 : null,
    });
  },

  startClassic: () => {
    const freshBoard = createEmptyBoard();
    set({
      board: freshBoard,
      score: 0,
      blocks: generateSolvableBlockSet(freshBoard, 1, Math.random, 3),
      gameOver: false,
      comboCount: 0,
      level: 1,
      undosRemaining: 3,
      previousState: null,
      clearingCells: new Set(),
      isAnimating: false,
      justPlacedCells: new Set(),
      sabotageCells: new Set(),
      specialCells: new Map(),
      lastAction: null,
      linesClearedThisTurn: 0,
      mode: 'classic',
      started: true,
      turnDeadline: null,
    });
  },

  startCrazy: () => {
    set({
      board: createEmptyBoard(),
      score: 0,
      blocks: generateBlockSet(1, Math.random, 1),
      gameOver: false,
      comboCount: 0,
      level: 1,
      undosRemaining: 3,
      previousState: null,
      clearingCells: new Set(),
      isAnimating: false,
      justPlacedCells: new Set(),
      sabotageCells: new Set(),
      specialCells: new Map(),
      lastAction: null,
      linesClearedThisTurn: 0,
      mode: 'crazy',
      started: true,
      turnDeadline: null,
    });
  },

  startTimeTrial: () => {
    const freshBoard = createEmptyBoard();
    set({
      board: freshBoard,
      score: 0,
      blocks: generateSolvableBlockSet(freshBoard, 1, Math.random, 3),
      gameOver: false,
      comboCount: 0,
      level: 1,
      undosRemaining: 3,
      previousState: null,
      clearingCells: new Set(),
      isAnimating: false,
      justPlacedCells: new Set(),
      sabotageCells: new Set(),
      specialCells: new Map(),
      lastAction: null,
      linesClearedThisTurn: 0,
      mode: 'time-trial',
      started: true,
      turnDeadline: Date.now() + 6000,
    });
  },

  startDaily: (rng) => {
    set({
      board: createEmptyBoard(),
      score: 0,
      blocks: generateBlockSet(1, rng, 3),
      gameOver: false,
      comboCount: 0,
      level: 1,
      undosRemaining: 3,
      previousState: null,
      clearingCells: new Set(),
      isAnimating: false,
      justPlacedCells: new Set(),
      sabotageCells: new Set(),
      specialCells: new Map(),
      lastAction: null,
      linesClearedThisTurn: 0,
      mode: 'daily',
      started: true,
      turnDeadline: null,
    });
  },

  backToMenu: () => {
    set({
      board: createEmptyBoard(),
      score: 0,
      blocks: [],
      gameOver: false,
      comboCount: 0,
      level: 1,
      undosRemaining: 3,
      previousState: null,
      clearingCells: new Set(),
      isAnimating: false,
      justPlacedCells: new Set(),
      sabotageCells: new Set(),
      specialCells: new Map(),
      lastAction: null,
      linesClearedThisTurn: 0,
      mode: 'classic',
      started: false,
      turnDeadline: null,
    });
  },

  timeUp: () => {
    const state = get();
    if (state.mode !== 'time-trial' || state.gameOver || state.isAnimating) return;
    onGameOver(state.score, state.mode, state.level);
    set({
      gameOver: true,
      lastAction: 'gameover',
      turnDeadline: null,
    });
  },

  spawnSabotageBlock: () => {
    const state = get();
    if (state.gameOver || state.isAnimating) return;
    // Only spawn in crazy and time-trial modes
    if (state.mode !== 'time-trial' && state.mode !== 'crazy') return;

    // Collect all empty cells
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (state.board[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return;

    // Pick a random empty cell
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = state.board.map((r) => [...r]);
    const sabotageKey = `${row},${col}`;

    // In crazy mode: randomly assign durability 1 or 2
    // In time-trial: always durability 1 (normal sabotage)
    const newSpecialCells = new Map(state.specialCells);
    if (state.mode === 'crazy') {
      const durability = Math.random() < 0.4 ? 2 : 1;
      newBoard[row][col] = SABOTAGE_COLOR;
      newSpecialCells.set(sabotageKey, durability);
    } else {
      // time-trial: regular colored sabotage
      const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
      newBoard[row][col] = color;
    }

    // Check if game is now over
    const isGameOver = !canAnyBlockBePlaced(newBoard, state.blocks);
    if (isGameOver) onGameOver(state.score, state.mode, state.level);

    set({
      board: newBoard,
      specialCells: newSpecialCells,
      gameOver: isGameOver,
      lastAction: isGameOver ? 'gameover' : null,
      sabotageCells: new Set([sabotageKey]),
    });

    // Clear sabotage animation marker after animation
    setTimeout(() => {
      set({ sabotageCells: new Set() });
    }, 600);
  },

  mirrorBoard: () => {
    const state = get();
    if (state.mode !== 'crazy' || state.gameOver || state.isAnimating) return;

    // Flip board left-to-right
    const newBoard = state.board.map((row) => [...row].reverse());

    // Remap special cells
    const newSpecialCells = new Map<string, number>();
    for (const [key, dur] of state.specialCells) {
      const [r, c] = key.split(',').map(Number);
      newSpecialCells.set(`${r},${BOARD_SIZE - 1 - c}`, dur);
    }

    const isGameOver = !canAnyBlockBePlaced(newBoard, state.blocks);
    if (isGameOver) onGameOver(state.score, state.mode, state.level);

    set({
      board: newBoard,
      specialCells: newSpecialCells,
      gameOver: isGameOver,
      lastAction: isGameOver ? 'gameover' : null,
      boardEffect: 'mirror',
    });

    setTimeout(() => {
      set({ boardEffect: null });
    }, 600);
  },

  rotateBoard: () => {
    const state = get();
    if (state.mode !== 'crazy' || state.gameOver || state.isAnimating) return;

    // Rotate 90° clockwise: new[c][BOARD_SIZE-1-r] = old[r][c]
    const newBoard = createEmptyBoard();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        newBoard[c][BOARD_SIZE - 1 - r] = state.board[r][c];
      }
    }

    // Remap special cells
    const newSpecialCells = new Map<string, number>();
    for (const [key, dur] of state.specialCells) {
      const [r, c] = key.split(',').map(Number);
      newSpecialCells.set(`${c},${BOARD_SIZE - 1 - r}`, dur);
    }

    const isGameOver = !canAnyBlockBePlaced(newBoard, state.blocks);
    if (isGameOver) onGameOver(state.score, state.mode, state.level);

    set({
      board: newBoard,
      specialCells: newSpecialCells,
      gameOver: isGameOver,
      lastAction: isGameOver ? 'gameover' : null,
      boardEffect: 'rotate',
    });

    setTimeout(() => {
      set({ boardEffect: null });
    }, 600);
  },

  undo: () => {
    const state = get();
    if (!state.previousState || state.undosRemaining <= 0 || state.isAnimating) return;

    set({
      board: state.previousState.board,
      score: state.previousState.score,
      blocks: state.previousState.blocks,
      comboCount: state.previousState.comboCount,
      specialCells: state.previousState.specialCells,
      undosRemaining: state.undosRemaining - 1,
      previousState: null,
      gameOver: false,
      clearingCells: new Set(),
      justPlacedCells: new Set(),
      sabotageCells: new Set(),
      lastAction: null,
      turnDeadline: state.mode === 'time-trial' ? Date.now() + 6000 : null,
    });
  },
}));
