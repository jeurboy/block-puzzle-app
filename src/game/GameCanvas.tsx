import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ImageBackground, Pressable, Text } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { canPlace } from '../utils/boardLogic';
import { Shape } from './constants';
import { hapticPlace, hapticLineClear, hapticGameOver } from '../hooks/useHaptics';
import GameBoard from './GameBoard';
import BlockSource from './BlockSource';
import ScoreHeader from './ScoreHeader';
import Mascot from './Mascot';

import GameOverOverlay from './GameOverOverlay';
import ModeSelect from './ModeSelect';
import TimerBar from './TimerBar';

type GhostPosition = {
  row: number;
  col: number;
  shape: Shape;
  color?: string;
  valid: boolean;
} | null;

export default function GameCanvas() {
  const boardLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [ghost, setGhost] = useState<GhostPosition>(null);

  const board = useGameStore((s) => s.board);
  const blocks = useGameStore((s) => s.blocks);
  const gameOver = useGameStore((s) => s.gameOver);
  const lastAction = useGameStore((s) => s.lastAction);
  const dropBlock = useGameStore((s) => s.dropBlock);
  const init = useGameStore((s) => s.init);
  const started = useGameStore((s) => s.started);
  const mode = useGameStore((s) => s.mode);
  const turnDeadline = useGameStore((s) => s.turnDeadline);
  const timeUp = useGameStore((s) => s.timeUp);
  const backToMenu = useGameStore((s) => s.backToMenu);

  // Load high score on mount
  useEffect(() => {
    init();
  }, [init]);

  // Haptic feedback
  useEffect(() => {
    if (lastAction === 'place') hapticPlace();
    if (lastAction === 'clear') hapticLineClear();
    if (lastAction === 'gameover') hapticGameOver();
  }, [lastAction]);

  // Time trial timer
  useEffect(() => {
    if (mode !== 'time-trial' || !turnDeadline || gameOver) return;
    const remaining = turnDeadline - Date.now();
    if (remaining <= 0) {
      timeUp();
      return;
    }
    const timer = setTimeout(() => {
      timeUp();
    }, remaining);
    return () => clearTimeout(timer);
  }, [mode, turnDeadline, gameOver, timeUp]);

  const boardViewRef = useRef<View>(null);

  const measureBoard = useCallback(() => {
    if (boardViewRef.current) {
      (boardViewRef.current as any).measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          if (typeof x === 'number' && typeof y === 'number' && x + y > 0) {
            boardLayoutRef.current = { x, y, width, height };
          }
        }
      );
    }
  }, []);

  // Re-measure periodically in case initial measurement was wrong
  useEffect(() => {
    const timer = setTimeout(measureBoard, 500);
    return () => clearTimeout(timer);
  }, [measureBoard]);

  const handleDrop = useCallback(
    (blockId: number, row: number, col: number): boolean => {
      setGhost(null);
      return dropBlock(blockId, row, col);
    },
    [dropBlock]
  );

  const prevGhostRef = useRef<string>('');
  const handleDragMove = useCallback(
    (row: number, col: number, shape: Shape, color?: string) => {
      const key = `${row},${col}`;
      if (prevGhostRef.current === key) return;
      prevGhostRef.current = key;

      const valid = canPlace(board, shape, row, col);
      setGhost({ row, col, shape, color, valid });
    },
    [board]
  );

  const handleDragEnd = useCallback(() => {
    prevGhostRef.current = '';
    setGhost(null);
  }, []);

  // Show mode selection if game hasn't started
  if (!started) {
    return <ModeSelect />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/cute_bg.png')}
      style={{ flex: 1 }}
    >
      <View className="flex-1 justify-center px-4">
        <Pressable
          onPress={backToMenu}
          className="absolute top-14 left-4 z-30 bg-white/80 rounded-full px-4 py-2 border border-white shadow-sm active:opacity-70"
        >
          <Text className="text-indigo-900 text-sm font-bold">← Menu</Text>
        </Pressable>

        <View className="relative z-10">
          <ScoreHeader />
          <View className="absolute -top-10 right-4 z-20 pointer-events-none">
            <Mascot />
          </View>
        </View>

        {mode === 'time-trial' && turnDeadline && !gameOver && (
          <TimerBar deadline={turnDeadline} />
        )}

        <GameBoard
          ref={boardViewRef}
          ghost={ghost}
          onLayout={measureBoard}
        />

        {!gameOver && (
          <View>
            <BlockSource
              blocks={blocks}
              boardLayout={boardLayoutRef}
              onDrop={handleDrop}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onDragStart={measureBoard}
            />
          </View>
        )}

        {gameOver && <GameOverOverlay />}
      </View>
    </ImageBackground>
  );
}
