export default {
  expo: {
    name: 'PigeonAI',
    slug: 'pigeonai-week-2',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    plugins: [
      'expo-asset',
      'expo-font',
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#3B82F6',
          sounds: [],
        }
      ]
    ],
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#060C1D',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pigeonai.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#060C1D',
      },
      package: 'com.pigeonai.app',
      permissions: [
        'RECEIVE_BOOT_COMPLETED',
        'VIBRATE',
        'android.permission.POST_NOTIFICATIONS'
      ],
    },
    extra: {
      eas: {
        // projectId will be auto-generated on first build
      },
    },
  },
};

