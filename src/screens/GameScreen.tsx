import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import mobileAds, {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import { ENV } from '../utils/env';

export default function GameScreen() {
  const [isAdSdkInitialized, setIsAdSdkInitialized] = useState(false);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        setIsAdSdkInitialized(true);
        console.log('[AdMob] SDK initialized successfully');
      })
      .catch((error: unknown) => {
        console.warn('[AdMob] SDK initialization failed:', error);
      });
  }, []);

  return (
    <View className="flex-1 bg-black">
      {/* Main Game Area — takes all available space above the ad */}
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg font-bold">
          2D Board and Draggable Blocks Area
        </Text>
      </View>

      {/* Bottom Ad Banner — anchored to bottom */}
      <View className="w-full items-center bg-black">
        {isAdSdkInitialized && (
          <BannerAd
            unitId={ENV.ADMOB_BANNER_ID}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            onAdLoaded={() => console.log('[AdMob] Banner ad loaded')}
            onAdFailedToLoad={(error) =>
              console.warn('[AdMob] Banner ad failed to load:', error)
            }
          />
        )}
      </View>
    </View>
  );
}
