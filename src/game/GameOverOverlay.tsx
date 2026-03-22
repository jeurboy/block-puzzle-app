import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { getScoreRank, loadScoreHistory, ScoreRecord } from '../utils/storage';

export default function GameOverOverlay() {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const mode = useGameStore((s) => s.mode);
  const level = useGameStore((s) => s.level);
  const restart = useGameStore((s) => s.restart);
  const backToMenu = useGameStore((s) => s.backToMenu);

  const [rank, setRank] = useState<number | null>(null);
  const [recentScores, setRecentScores] = useState<ScoreRecord[]>([]);

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

  const rankMedal =
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-black/40">
      <View className="bg-white/95 rounded-3xl items-center shadow-2xl border-2 border-white w-[88%] max-w-sm overflow-hidden">
        {/* Top banner */}
        <View className="w-full bg-indigo-600 pt-6 pb-5 items-center">
          <Text style={{ fontSize: isNewHighScore ? 48 : 40 }}>
            {isNewHighScore ? '🎉' : isTimeTrial ? '⏱️' : '💎'}
          </Text>
          <Text className="text-white text-3xl font-fredoka mt-1">
            {isTimeTrial ? "Time's Up!" : 'Game Over!'}
          </Text>
          {isNewHighScore && (
            <View className="bg-amber-400 px-4 py-1 rounded-full mt-2">
              <Text className="text-amber-900 text-xs font-bold">
                ✨ NEW HIGH SCORE ✨
              </Text>
            </View>
          )}
        </View>

        {/* Score section */}
        <View className="items-center pt-5 pb-3 px-6">
          <Text className="text-slate-400 text-sm font-semibold tracking-wider uppercase">
            Final Score
          </Text>
          <Text className="text-indigo-900 text-5xl font-fredoka mt-1">
            {score.toLocaleString()}
          </Text>

          <View className="flex-row items-center mt-2" style={{ gap: 16 }}>
            <View className="items-center">
              <Text className="text-slate-400 text-[10px] uppercase">Level</Text>
              <Text className="text-indigo-700 text-lg font-fredoka">{level}</Text>
            </View>
            <View className="w-px h-6 bg-slate-200" />
            <View className="items-center">
              <Text className="text-slate-400 text-[10px] uppercase">Mode</Text>
              <Text className="text-indigo-700 text-sm font-fredoka">
                {modeLabel[mode] || mode}
              </Text>
            </View>
            {rank !== null && (
              <>
                <View className="w-px h-6 bg-slate-200" />
                <View className="items-center">
                  <Text className="text-slate-400 text-[10px] uppercase">Rank</Text>
                  <View className="flex-row items-center">
                    {rankMedal ? (
                      <Text style={{ fontSize: 20 }}>{rankMedal}</Text>
                    ) : (
                      <Text className="text-indigo-700 text-lg font-fredoka">
                        #{rank}
                      </Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Top scores list */}
        {recentScores.length > 0 && (
          <View className="w-full px-5 pb-4">
            <View className="bg-indigo-50/80 rounded-2xl p-3 border border-indigo-100">
              <Text className="text-indigo-600 text-xs font-bold mb-2 text-center uppercase tracking-wider">
                🏆 Top 5 — {modeLabel[mode] || mode}
              </Text>
              {recentScores.map((rec, idx) => {
                const isCurrentScore = rec.score === score;
                const medal =
                  idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                return (
                  <View
                    key={rec.id}
                    className={`flex-row items-center py-2 px-2 rounded-xl ${
                      isCurrentScore ? 'bg-amber-100/80' : ''
                    } ${idx < recentScores.length - 1 ? 'border-b border-indigo-100' : ''}`}
                  >
                    {medal ? (
                      <Text style={{ fontSize: 16, width: 28 }}>{medal}</Text>
                    ) : (
                      <Text className="text-indigo-300 text-sm font-bold" style={{ width: 28 }}>
                        #{idx + 1}
                      </Text>
                    )}
                    <Text
                      className={`flex-1 text-base font-fredoka ${
                        isCurrentScore ? 'text-amber-600' : 'text-indigo-900'
                      }`}
                    >
                      {rec.score.toLocaleString()}
                    </Text>
                    <Text className="text-slate-400 text-xs">Lv.{rec.level}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Buttons */}
        <View className="w-full px-5 pb-6" style={{ gap: 10 }}>
          <Pressable
            onPress={restart}
            className="bg-sky-500 py-4 rounded-2xl active:bg-sky-600 w-full shadow-sm"
          >
            <Text className="text-white text-xl font-fredoka text-center">
              🔄 Play Again
            </Text>
          </Pressable>
          <Pressable
            onPress={backToMenu}
            className="bg-indigo-100 py-3.5 rounded-2xl active:bg-indigo-200 w-full"
          >
            <Text className="text-indigo-900 text-lg font-fredoka text-center">
              Change Mode
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
