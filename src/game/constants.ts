import { Dimensions } from 'react-native';

export const BOARD_SIZE = 10;
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const BOARD_PADDING = 8;
export const CELL_GAP = 2;

// Reserve space for header (~160), block tray (~120), tab bar (~80), and padding
const MAX_BOARD_HEIGHT = SCREEN_HEIGHT - 360;
export const BOARD_WIDTH = Math.min(SCREEN_WIDTH - 32, MAX_BOARD_HEIGHT);
export const CELL_SIZE = Math.floor(
  (BOARD_WIDTH - BOARD_PADDING * 2 - CELL_GAP * (BOARD_SIZE - 1)) / BOARD_SIZE
);
export const CELL_STEP = CELL_SIZE + CELL_GAP;

export type Shape = number[][];
export type CellValue = 0 | string; // 0 = empty, string = NativeWind color class
export type BoardState = CellValue[][];

export type BlockData = {
  shape: Shape;
  color: string;
  id: number;
};

// Shapes grouped by difficulty tier
export const SHAPES_TIER_1: Shape[] = [
  [[1, 1]],
  [[1, 1, 1]],
  [[1], [1]],
  [[1], [1], [1]],
  [[1, 1], [1, 1]],
];

export const SHAPES_TIER_2: Shape[] = [
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 0], [1, 0], [1, 1]],
  [[1, 1], [1, 0], [1, 0]],
  [[0, 1], [0, 1], [1, 1]],
  [[1, 1], [0, 1], [0, 1]],
  [[1, 1, 1], [0, 1, 0]],
];

export const SHAPES_TIER_3: Shape[] = [
  [[1, 1, 1, 1, 1]],
  [[1], [1], [1], [1], [1]],
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[1, 1], [1, 1], [1, 1]],
  [[1, 1, 1], [1, 1, 1]],
];

export const ALL_SHAPES: Shape[] = [
  ...SHAPES_TIER_1,
  ...SHAPES_TIER_2,
  ...SHAPES_TIER_3,
];

export const BLOCK_COLORS = [
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
];
