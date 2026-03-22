import { create } from 'zustand';
import { BoardState, BlockData } from '../game/constants';
import {
  createEmptyBoard,
  canPlace,
  placeBlock,
  clearLines,
  canAnyBlockBePlaced,
  countCells,
  calcScore,
} from '../utils/boardLogic';
import { generateBlockSet } from '../utils/shapeFactory';
import { loadHighScore, saveHighScore } from '../utils/storage';

export type GameMode = 'classic' | 'challenge' | 'time-trial' | 'daily';

type PreviousState = {
  board: BoardState;
  score: number;
  blocks: BlockData[];
  comboCount: number;
};

function blockCountForMode(mode: GameMode): number {
  return mode === 'challenge' ? 1 : 3;
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
  lastAction: 'place' | 'clear' | 'gameover' | null;
  linesClearedThisTurn: number;
  // Time trial
  turnDeadline: number | null;

  // Actions
  init: () => Promise<void>;
  dropBlock: (blockId: number, row: number, col: number) => boolean;
  finishClearing: () => void;
  restart: () => void;
  startClassic: () => void;
  startChallenge: () => void;
  startTimeTrial: () => void;
  startDaily: (rng: () => number) => void;
  backToMenu: () => void;
  timeUp: () => void;
  undo: () => void;
};

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
  lastAction: null,
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

    // Combo
    const newCombo = linesCleared > 0 ? state.comboCount + 1 : 0;

    // Score
    const points = calcScore(countCells(block.shape), linesCleared, newCombo);
    const newScore = state.score + points;
    const newLevel = Math.floor(newScore / 200) + 1;

    // Remove used block — refill based on mode
    const remainingBlocks = state.blocks.filter((b) => b.id !== blockId);
    const count = blockCountForMode(state.mode);
    const nextBlocks = remainingBlocks.length === 0
      ? generateBlockSet(newLevel, Math.random, count)
      : remainingBlocks;

    // Update high score
    const newHighScore = Math.max(state.highScore, newScore);
    if (newHighScore > state.highScore) {
      saveHighScore(newHighScore);
    }

    // Reset turn deadline for time-trial
    const turnDeadline = state.mode === 'time-trial' ? Date.now() + 5000 : null;

    if (linesCleared > 0) {
      set({
        board: boardAfterPlace,
        score: newScore,
        highScore: newHighScore,
        blocks: nextBlocks,
        comboCount: newCombo,
        level: newLevel,
        previousState: prevState,
        clearingCells: clearedCells,
        isAnimating: true,
        justPlacedCells: new Set(),
        lastAction: 'clear',
        linesClearedThisTurn: linesCleared,
        gameOver: false,
        turnDeadline,
      });

      setTimeout(() => {
        const s = get();
        if (!s.isAnimating) return;
        const gameOver = !canAnyBlockBePlaced(clearedBoard, s.blocks);
        set({
          board: clearedBoard,
          clearingCells: new Set(),
          isAnimating: false,
          lastAction: gameOver ? 'gameover' : null,
          gameOver,
        });
      }, 350);
    } else {
      const isGameOver = !canAnyBlockBePlaced(clearedBoard, nextBlocks);
      set({
        board: clearedBoard,
        score: newScore,
        highScore: newHighScore,
        blocks: nextBlocks,
        comboCount: newCombo,
        level: newLevel,
        previousState: prevState,
        clearingCells: new Set(),
        isAnimating: false,
        justPlacedCells: new Set(),
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
    const count = blockCountForMode(state.mode);
    set({
      board: createEmptyBoard(),
      score: 0,
      blocks: generateBlockSet(1, Math.random, count),
      gameOver: false,
      comboCount: 0,
      level: 1,
      undosRemaining: 3,
      previousState: null,
      clearingCells: new Set(),
      isAnimating: false,
      justPlacedCells: new Set(),
      lastAction: null,
      linesClearedThisTurn: 0,
      turnDeadline: state.mode === 'time-trial' ? Date.now() + 5000 : null,
    });
  },

  startClassic: () => {
    set({
      board: createEmptyBoard(),
      score: 0,
      blocks: generateBlockSet(1, Math.random, 3),
      gameOver: false,
      comboCount: 0,
      level: 1,
      undosRemaining: 3,
      previousState: null,
      clearingCells: new Set(),
      isAnimating: false,
      justPlacedCells: new Set(),
      lastAction: null,
      linesClearedThisTurn: 0,
      mode: 'classic',
      started: true,
      turnDeadline: null,
    });
  },

  startChallenge: () => {
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
      lastAction: null,
      linesClearedThisTurn: 0,
      mode: 'challenge',
      started: true,
      turnDeadline: null,
    });
  },

  startTimeTrial: () => {
    set({
      board: createEmptyBoard(),
      score: 0,
      blocks: generateBlockSet(1, Math.random, 3),
      gameOver: false,
      comboCount: 0,
      level: 1,
      undosRemaining: 3,
      previousState: null,
      clearingCells: new Set(),
      isAnimating: false,
      justPlacedCells: new Set(),
      lastAction: null,
      linesClearedThisTurn: 0,
      mode: 'time-trial',
      started: true,
      turnDeadline: Date.now() + 5000,
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
    set({
      gameOver: true,
      lastAction: 'gameover',
      turnDeadline: null,
    });
  },

  undo: () => {
    const state = get();
    if (!state.previousState || state.undosRemaining <= 0 || state.isAnimating) return;

    set({
      board: state.previousState.board,
      score: state.previousState.score,
      blocks: state.previousState.blocks,
      comboCount: state.previousState.comboCount,
      undosRemaining: state.undosRemaining - 1,
      previousState: null,
      gameOver: false,
      clearingCells: new Set(),
      justPlacedCells: new Set(),
      lastAction: null,
      turnDeadline: state.mode === 'time-trial' ? Date.now() + 5000 : null,
    });
  },
}));
