export default {
  expo: {
    name: 'PigeonAI',
    slug: 'pigeonai-week-2',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    updates: {
      url: 'https://u.expo.dev/1df9d352-7f2d-4127-b73c-c12fe1922269',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    plugins: [
      'expo-asset',
      'expo-font',
      'expo-dev-client', // Enables development builds with native features
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#3B82F6',
          sounds: [],
          mode: 'production', // Ensure production mode for proper permission handling
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
      googleServicesFile: './google-services.json',
      permissions: [
        'RECEIVE_BOOT_COMPLETED',
        'VIBRATE',
        'android.permission.POST_NOTIFICATIONS'
      ],
    },
    extra: {
      eas: {
        projectId: '1df9d352-7f2d-4127-b73c-c12fe1922269',
      },
      // Firebase config bundled into the app
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      // AWS Lambda endpoint for push notifications
      lambdaNotificationUrl: process.env.EXPO_PUBLIC_LAMBDA_NOTIFICATION_URL,
    },
  },
};

