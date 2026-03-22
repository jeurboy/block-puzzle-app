import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ImageBackground } from 'react-native';
import { loadScoreHistory, loadHighScore, ScoreRecord } from '../utils/storage';

type TabType = 'all' | 'classic' | 'crazy' | 'time-trial';

const TAB_CONFIG: { key: TabType; label: string; icon: string }[] = [
  { key: 'classic', label: 'Classic', icon: '🎯' },
  { key: 'crazy', label: 'Crazy', icon: '⚡' },
  { key: 'time-trial', label: 'Time Trial', icon: '⏱️' },
];

const TAB_LABELS: Record<string, string> = {
  all: 'All',
  classic: 'Classic',
  crazy: 'Crazy',
  'time-trial': 'Time Trial',
};

function TopThreeCard({ item, rank }: { item: ScoreRecord; rank: number }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
  const isFirst = rank === 1;

  const dateStr = new Date(item.date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <View
      className={`items-center ${isFirst ? 'mx-2' : 'mx-1'}`}
      style={{ width: isFirst ? 120 : 100 }}
    >
      <Text style={{ fontSize: isFirst ? 44 : 36 }}>{medal}</Text>
      <View
        className={`w-full items-center rounded-2xl py-3 px-2 mt-1 ${
          isFirst
            ? 'bg-amber-400/90 border-2 border-amber-300'
            : 'bg-white/80 border border-white/60'
        }`}
      >
        <Text
          className={`text-2xl font-fredoka ${
            isFirst ? 'text-amber-900' : 'text-indigo-900'
          }`}
        >
          {item.score.toLocaleString()}
        </Text>
        <Text className="text-xs text-slate-500 mt-0.5">Lv.{item.level}</Text>
        <Text className="text-[10px] text-slate-400">{dateStr}</Text>
      </View>
    </View>
  );
}

function ScoreItem({ item, rank }: { item: ScoreRecord; rank: number }) {
  const dateStr = new Date(item.date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <View className="flex-row items-center mx-4 mb-2 px-5 py-4 bg-white/90 rounded-2xl border border-white/60">
      <View className="w-9 h-9 rounded-full bg-indigo-100 items-center justify-center">
        <Text className="text-indigo-600 text-sm font-fredoka">{rank}</Text>
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-indigo-900 text-lg font-fredoka">
          {item.score.toLocaleString()}
        </Text>
        <Text className="text-slate-400 text-xs">
          Lv.{item.level} · {TAB_LABELS[item.mode] || item.mode} · {dateStr}
        </Text>
      </View>
      <Text className="text-indigo-300 text-2xl font-fredoka">#{rank}</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<TabType>('classic');
  const [data, setData] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [history, hs] = await Promise.all([loadScoreHistory(), loadHighScore()]);
    setHighScore(hs);
    const filtered =
      tab === 'all' ? history : history.filter((r) => r.mode === tab);
    const sorted = filtered.sort((a, b) => b.score - a.score);
    setData(sorted);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const topThree = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <ImageBackground source={require('../../assets/images/cute_bg.png')} style={{ flex: 1 }}>
      {/* Header */}
      <View className="items-center pt-8 pb-2">
        <Text className="text-5xl mb-1">🏆</Text>
        <Text className="text-indigo-900 text-4xl font-fredoka">Leaderboard</Text>
        <Text className="text-indigo-400 text-sm font-semibold mt-1">
          Best: {highScore.toLocaleString()}
        </Text>
      </View>

      {/* Tab Selector */}
      <View className="flex-row mx-4 mb-4 bg-white/80 border border-white/60 rounded-2xl p-1.5">
        {TAB_CONFIG.map((t) => {
          const isActive = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: isActive ? '#4f46e5' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 14 }}>{t.icon}</Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  marginTop: 2,
                  color: isActive ? '#ffffff' : '#64748b',
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {data.length > 0 ? (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ScoreItem item={item} rank={index + 4} />
          )}
          ListHeaderComponent={
            topThree.length > 0 ? (
              <View className="flex-row justify-center items-end mb-4 px-2">
                {/* 2nd place */}
                {topThree[1] && <TopThreeCard item={topThree[1]} rank={2} />}
                {/* 1st place */}
                {topThree[0] && <TopThreeCard item={topThree[0]} rank={1} />}
                {/* 3rd place */}
                {topThree[2] && <TopThreeCard item={topThree[2]} rank={3} />}
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchData}
              tintColor="#a1a1aa"
            />
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text style={{ fontSize: 48 }}>🎮</Text>
          <Text className="text-indigo-900 text-lg font-fredoka mt-3">
            No scores yet
          </Text>
          <Text className="text-slate-400 text-sm mt-1">
            Play a game to see your ranking!
          </Text>
        </View>
      )}
    </ImageBackground>
  );
}
