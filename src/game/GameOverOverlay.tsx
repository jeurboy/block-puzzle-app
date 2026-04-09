import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { getScoreRank, loadScoreHistory, ScoreRecord } from '../utils/storage';

const TROPHY_IMG = require('../../assets/images/gameover-trophy.png');

type RankBadgeProps = { rank: number; size?: number };
function RankBadge({ rank, size = 28 }: RankBadgeProps) {
  const palette =
    rank === 1
      ? { bg: '#FBBF24', ring: '#F59E0B', text: '#78350F' } // gold
      : rank === 2
      ? { bg: '#E5E7EB', ring: '#9CA3AF', text: '#374151' } // silver
      : rank === 3
      ? { bg: '#FCA17D', ring: '#C2410C', text: '#7C2D12' } // bronze
      : { bg: '#E0E7FF', ring: '#A5B4FC', text: '#4338CA' }; // default indigo

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette.bg,
        borderWidth: 2,
        borderColor: palette.ring,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: palette.text,
          fontSize: size * 0.45,
          fontWeight: '900',
        }}
      >
        {rank}
      </Text>
    </View>
  );
}

export default function GameOverOverlay() {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const mode = useGameStore((s) => s.mode);
  const level = useGameStore((s) => s.level);
  const restart = useGameStore((s) => s.restart);
  const backToMenu = useGameStore((s) => s.backToMenu);

  const [rank, setRank] = useState<number | null>(null);
  const [recentScores, setRecentScores] = useState<ScoreRecord[]>([]);
  const [viewingBoard, setViewingBoard] = useState(false);

  const isTimeTrial = mode === 'time-trial';
  const isNewHighScore = score >= highScore && score > 0;

  useEffect(() => {
    (async () => {
      const r = await getScoreRank(score, mode);
      setRank(r);
      const history = await loadScoreHistory();
      const modeHistory = history
        .filter((rec) => rec.mode === mode)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setRecentScores(modeHistory);
    })();
  }, [score, mode]);

  const modeLabel: Record<string, string> = {
    classic: 'Classic',
    crazy: 'Crazy',
    'time-trial': 'Time Trial',
    daily: 'Daily',
  };

  if (viewingBoard) {
    return (
      <View className="absolute inset-0 z-50" pointerEvents="box-none">
        <Pressable
          onPress={() => setViewingBoard(false)}
          className="absolute bottom-10 self-center bg-white/95 px-8 py-4 rounded-2xl border-2 border-white shadow-lg active:opacity-80"
        >
          <Text className="text-indigo-900 text-lg font-fredoka text-center">
            Back to Results
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-black/50 px-5">
      <View
        className="bg-white rounded-[28px] w-full max-w-sm shadow-2xl"
        style={{ overflow: 'visible' }}
      >
        {/* Hero banner — curved bottom via large radius */}
        <View
          className="bg-indigo-600 items-center pt-8 pb-10"
          style={{
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderBottomLeftRadius: 60,
            borderBottomRightRadius: 60,
          }}
        >
          <Image
            source={TROPHY_IMG}
            style={{ width: 96, height: 96 }}
            resizeMode="contain"
          />
          <Text className="text-white text-3xl font-fredoka mt-2 tracking-wide">
            {isTimeTrial ? "Time's Up" : 'Game Over'}
          </Text>
        </View>

        {/* Ribbon — NEW HIGH SCORE */}
        {isNewHighScore && (
          <View className="items-center" style={{ marginTop: -16 }}>
            <View className="flex-row items-center">
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderTopWidth: 14,
                  borderBottomWidth: 14,
                  borderRightWidth: 10,
                  borderTopColor: 'transparent',
                  borderBottomColor: 'transparent',
                  borderRightColor: '#B45309',
                }}
              />
              <View className="bg-amber-400 px-5 py-2 shadow-md">
                <Text className="text-amber-900 text-xs font-extrabold tracking-widest">
                  NEW HIGH SCORE
                </Text>
              </View>
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderTopWidth: 14,
                  borderBottomWidth: 14,
                  borderLeftWidth: 10,
                  borderTopColor: 'transparent',
                  borderBottomColor: 'transparent',
                  borderLeftColor: '#B45309',
                }}
              />
            </View>
          </View>
        )}

        {/* Score */}
        <View className="items-center pt-6 pb-2 px-6">
          <Text className="text-slate-400 text-[11px] font-bold tracking-[2px] uppercase">
            Final Score
          </Text>
          <Text className="text-indigo-900 text-6xl font-fredoka mt-1">
            {score.toLocaleString()}
          </Text>
        </View>

        {/* Stat row */}
        <View
          className="flex-row items-center justify-center px-6 pb-4"
          style={{ gap: 14 }}
        >
          <View className="items-center flex-1">
            <Text className="text-slate-400 text-[10px] uppercase tracking-wider">
              Level
            </Text>
            <Text className="text-indigo-700 text-xl font-fredoka mt-0.5">
              {level}
            </Text>
          </View>
          <View className="w-px h-8 bg-slate-200" />
          <View className="items-center flex-1">
            <Text className="text-slate-400 text-[10px] uppercase tracking-wider">
              Mode
            </Text>
            <Text className="text-indigo-700 text-base font-fredoka mt-0.5">
              {modeLabel[mode] || mode}
            </Text>
          </View>
          {rank !== null && (
            <>
              <View className="w-px h-8 bg-slate-200" />
              <View className="items-center flex-1">
                <Text className="text-slate-400 text-[10px] uppercase tracking-wider">
                  Rank
                </Text>
                <View style={{ marginTop: 2 }}>
                  <RankBadge rank={rank} size={24} />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Top scores */}
        {recentScores.length > 0 && (
          <View className="px-5 pb-4">
            <View className="bg-indigo-50 rounded-2xl p-3 border border-indigo-100">
              <Text className="text-indigo-600 text-[11px] font-extrabold mb-2 text-center uppercase tracking-[2px]">
                Top 5 — {modeLabel[mode] || mode}
              </Text>
              {recentScores.map((rec, idx) => {
                const isCurrentScore = rec.score === score;
                return (
                  <View
                    key={rec.id}
                    className={`flex-row items-center py-2 px-2 rounded-xl ${
                      isCurrentScore ? 'bg-amber-100' : ''
                    } ${
                      idx < recentScores.length - 1
                        ? 'border-b border-indigo-100'
                        : ''
                    }`}
                  >
                    <View style={{ width: 32, alignItems: 'flex-start' }}>
                      <RankBadge rank={idx + 1} size={22} />
                    </View>
                    <Text
                      className={`flex-1 text-base font-fredoka ${
                        isCurrentScore ? 'text-amber-700' : 'text-indigo-900'
                      }`}
                    >
                      {rec.score.toLocaleString()}
                    </Text>
                    <Text className="text-slate-400 text-xs font-semibold">
                      Lv.{rec.level}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Buttons */}
        <View className="px-5 pb-6" style={{ gap: 10 }}>
          <Pressable
            onPress={restart}
            className="bg-sky-500 py-4 rounded-2xl active:bg-sky-600 shadow-sm"
          >
            <Text className="text-white text-xl font-fredoka text-center tracking-wide">
              Play Again
            </Text>
          </Pressable>
          <View className="flex-row" style={{ gap: 10 }}>
            <Pressable
              onPress={() => setViewingBoard(true)}
              className="flex-1 bg-indigo-50 py-3.5 rounded-2xl active:bg-indigo-100 border border-indigo-100"
            >
              <Text className="text-indigo-600 text-base font-fredoka text-center">
                View Board
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                backToMenu();
                router.push('/(tabs)/leaderboard');
              }}
              className="flex-1 bg-indigo-600 py-3.5 rounded-2xl active:bg-indigo-700"
            >
              <Text className="text-white text-base font-fredoka text-center">
                Leaderboard
              </Text>
            </Pressable>
          </View>
          <Pressable
            onPress={backToMenu}
            className="py-3 active:opacity-60"
          >
            <Text className="text-slate-500 text-sm font-fredoka text-center">
              Change Mode
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
