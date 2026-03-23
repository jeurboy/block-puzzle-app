import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAnimatedRef } from 'react-native-reanimated';
import { View, ImageBackground, Pressable, Text, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { canPlace } from '../utils/boardLogic';
import { Shape, SCREEN_WIDTH, CELL_SIZE, CELL_GAP } from './constants';
import { hapticPlace, hapticLineClear, hapticGameOver } from '../hooks/useHaptics';
import GameBoard from './GameBoard';
import BlockSource from './BlockSource';
import ScoreHeader from './ScoreHeader';
import Mascot from './Mascot';

import GameOverOverlay from './GameOverOverlay';
import ModeSelect from './ModeSelect';
import TimerBar from './TimerBar';
import LevelUpOverlay from './LevelUpOverlay';

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
  const level = useGameStore((s) => s.level);
  const spawnSabotageBlock = useGameStore((s) => s.spawnSabotageBlock);
  const mirrorBoard = useGameStore((s) => s.mirrorBoard);
  const rotateBoard = useGameStore((s) => s.rotateBoard);
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

  // Sabotage: spawn a random 1x1 block every 10 seconds
  // Time-trial: always active; Crazy: from level 2+
  useEffect(() => {
    if (mode === 'time-trial' && started && !gameOver) {
      const interval = setInterval(spawnSabotageBlock, 10000);
      return () => clearInterval(interval);
    }
    if (mode === 'crazy' && started && !gameOver && level >= 2) {
      const interval = setInterval(spawnSabotageBlock, 10000);
      return () => clearInterval(interval);
    }
  }, [mode, started, gameOver, level, spawnSabotageBlock]);

  // Crazy mode: mirror board every 30 seconds (level 3+)
  useEffect(() => {
    if (mode !== 'crazy' || !started || gameOver || level < 3) return;
    const interval = setInterval(mirrorBoard, 30000);
    return () => clearInterval(interval);
  }, [mode, started, gameOver, level, mirrorBoard]);

  // Crazy mode: rotate board every 60 seconds (level 4+)
  useEffect(() => {
    if (mode !== 'crazy' || !started || gameOver || level < 4) return;
    const interval = setInterval(rotateBoard, 60000);
    return () => clearInterval(interval);
  }, [mode, started, gameOver, level, rotateBoard]);

  const boardAnimatedRef = useAnimatedRef<View>();

  const measureBoard = useCallback(() => {
    if (boardAnimatedRef.current) {
      (boardAnimatedRef.current as any).measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          if (typeof x === 'number' && typeof y === 'number' && x + y > 0) {
            boardLayoutRef.current = { x, y, width, height };
          }
        }
      );
    }
  }, [boardAnimatedRef]);

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
      <ScrollView
        scrollEnabled={false}
        bounces={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 130, paddingHorizontal: 16 }}
      >
        <Pressable
          onPress={backToMenu}
          className="absolute top-14 left-4 z-30 bg-white/80 rounded-full px-4 py-2 border border-white shadow-sm active:opacity-70"
        >
          <Text className="text-indigo-900 text-sm font-bold">← Menu</Text>
        </Pressable>

        <View className="relative z-10">
          <ScoreHeader />
          <View
            className="absolute z-20 pointer-events-none"
            style={{
              top: SCREEN_WIDTH > 600 ? -20 : -10,
              right: SCREEN_WIDTH > 600 ? 8 : 4,
            }}
          >
            <Mascot size={SCREEN_WIDTH > 600 ? 140 : 100} />
          </View>
        </View>

        {mode === 'time-trial' && turnDeadline && !gameOver && (
          <TimerBar deadline={turnDeadline} />
        )}

        <GameBoard
          ref={boardAnimatedRef}
          ghost={ghost}
          onLayout={measureBoard}
        />

        {!gameOver && (
          <View style={{ minHeight: 5 * (CELL_SIZE * 0.8) + 4 * CELL_GAP + 40 }}>
            <BlockSource
              blocks={blocks}
              boardAnimatedRef={boardAnimatedRef}
              boardLayout={boardLayoutRef}
              onDrop={handleDrop}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onDragStart={measureBoard}
            />
          </View>
        )}

        {gameOver && <GameOverOverlay />}

        <LevelUpOverlay />
      </ScrollView>
    </ImageBackground>
  );
}
