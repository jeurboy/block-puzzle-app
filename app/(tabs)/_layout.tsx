import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useGameStore } from '@/src/store/gameStore';

export default function TabLayout() {
  const started = useGameStore((s) => s.started);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ec4899', // Candy pink tint
        tabBarInactiveTintColor: '#cbd5e1', // Soft grayish blue
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: started
          ? { display: 'none' as const }
          : {
              backgroundColor: '#ffffff',
              position: 'absolute',
              bottom: Platform.OS === 'ios' ? 40 : 24,
              borderRadius: 20,
              height: 75,
              marginHorizontal: 16,
              paddingBottom: 0,
              paddingTop: 8,
              borderTopWidth: 0,
              elevation: 15,
              shadowColor: '#ec4899',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
            },
        tabBarLabelStyle: {
          fontFamily: 'Fredoka-Medium',
          fontSize: 13,
          marginTop: 2,
          marginBottom: 10,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Play',
          tabBarIcon: ({ focused }) => (
            <Image 
              source={require('@/assets/images/tab-play.png')} 
              style={{ 
                width: 36, 
                height: 36, 
                opacity: focused ? 1.0 : 0.4,
                transform: [{ scale: focused ? 1.15 : 1.0 }]
              }} 
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Ranks',
          tabBarIcon: ({ focused }) => (
            <Image 
              source={require('@/assets/images/tab-ranks.png')} 
              style={{ 
                width: 36, 
                height: 36, 
                opacity: focused ? 1.0 : 0.4,
                transform: [{ scale: focused ? 1.15 : 1.0 }]
              }} 
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
