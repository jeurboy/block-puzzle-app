import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { BOARD_PADDING, CELL_GAP, Shape } from './constants';
import { useGameStore } from '../store/gameStore';
import Cell from './Cell';
import SquirrelBreakOverlay from './SquirrelBreakOverlay';

type GhostPosition = {
  row: number;
  col: number;
  shape: Shape;
  color?: string;
  valid: boolean;
} | null;

type GameBoardProps = {
  ghost: GhostPosition;
  onLayout?: () => void;
};

const GameBoard = forwardRef<View, GameBoardProps>(({ ghost, onLayout }, ref) => {
  const board = useGameStore((s) => s.board);
  const clearingCells = useGameStore((s) => s.clearingCells);

  // Build ghost overlay map: stores { valid, color } for each ghost cell
  const ghostCells = new Map<string, { valid: boolean; color?: string }>();
  if (ghost) {
    for (let r = 0; r < ghost.shape.length; r++) {
      for (let c = 0; c < ghost.shape[r].length; c++) {
        if (ghost.shape[r][c] === 1) {
          ghostCells.set(`${ghost.row + r},${ghost.col + c}`, {
            valid: ghost.valid,
            color: ghost.color,
          });
        }
      }
    }
  }

  return (
    <View
      ref={ref}
      onLayout={onLayout}
      collapsable={false}
      className="self-center rounded-xl bg-white/70 border-4 border-white"
      style={{
        padding: BOARD_PADDING,
      }}
    >
      <View collapsable={false}>
        {board.map((row, rowIndex) => (
          <View
            key={rowIndex}
            className="flex-row"
            style={{ gap: CELL_GAP, marginTop: rowIndex > 0 ? CELL_GAP : 0 }}
          >
            {row.map((cell, colIndex) => {
              const key = `${rowIndex},${colIndex}`;
              const ghostInfo = ghostCells.get(key);
              const hasGhost = ghostInfo !== undefined;

              let colorClass: string;
              let isGhostCell = false;
              if (cell !== 0) {
                colorClass = cell as string;
              } else if (hasGhost) {
                isGhostCell = true;
                if (ghostInfo.valid && ghostInfo.color) {
                  colorClass = ghostInfo.color;
                } else if (ghostInfo.valid) {
                  colorClass = 'bg-indigo-400/40';
                } else {
                  colorClass = 'bg-red-400/40';
                }
              } else {
                colorClass = 'bg-indigo-900/10';
              }

              const isClearing = clearingCells.has(key);

              return (
                <Cell
                  key={colIndex}
                  colorClass={colorClass}
                  isClearing={isClearing}
                  isGhost={isGhostCell}
                />
              );
            })}
          </View>
        ))}
      </View>

      <SquirrelBreakOverlay clearingCells={clearingCells} />
    </View>
  );
});

GameBoard.displayName = 'GameBoard';

export default React.memo(GameBoard);
