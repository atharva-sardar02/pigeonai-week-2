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
      'expo-font'
    ],
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pigeonai.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#000000',
      },
      package: 'com.pigeonai.app',
    },
    extra: {
      eas: {
        projectId: 'your-eas-project-id',
      },
    },
  },
};

