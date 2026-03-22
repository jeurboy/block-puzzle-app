import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, ImageBackground } from 'react-native';
import { getLeaderboard, LeaderboardEntry } from '../utils/api';

type TabType = 'all' | 'daily';

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = {
    1: 'bg-amber-500',
    2: 'bg-zinc-400',
    3: 'bg-amber-700',
  };
  const bgColor = colors[rank] || 'bg-slate-200';

  return (
    <View className={`w-8 h-8 rounded-full items-center justify-center ${bgColor}`}>
      <Text className="text-slate-800 text-sm font-bold">{rank}</Text>
    </View>
  );
}

function LeaderboardItem({ item }: { item: LeaderboardEntry }) {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-slate-200">
      <RankBadge rank={item.rank} />
      <Text className="text-slate-800 text-base font-medium ml-4 flex-1">
        {item.playerName}
      </Text>
      <Text className="text-amber-400 text-base font-bold">
        {item.score.toLocaleString()}
      </Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<TabType>('all');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const entries = await getLeaderboard(tab, 50, tab === 'daily' ? today : undefined);
    setData(entries);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <ImageBackground source={require('../../assets/images/cute_bg.png')} style={{ flex: 1 }}>
      {/* Header */}
      <View className="items-center pt-8 pb-4">
        <Text className="text-indigo-900 text-3xl font-fredoka">Leaderboard</Text>
      </View>

      {/* Tab Selector */}
      <View className="flex-row mx-4 mb-4 bg-white shadow-sm border border-slate-200 rounded-xl p-1">
        {(['all', 'daily'] as TabType[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg items-center ${
              tab === t ? 'bg-indigo-600' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                tab === t ? 'text-white' : 'text-slate-500'
              }`}
            >
              {t === 'all' ? 'All Time' : 'Daily'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      {data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(item) => `${item.rank}-${item.playerName}`}
          renderItem={({ item }) => <LeaderboardItem item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchData}
              tintColor="#a1a1aa"
            />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500 text-base">
            {loading ? 'Loading...' : 'No scores yet. Play a game!'}
          </Text>
        </View>
      )}
    </ImageBackground>
  );
}
