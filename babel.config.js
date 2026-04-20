module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // react-native-reanimated v4 does not use the v3 Babel plugin.
          // The plugin tries to require('react-native-worklets/plugin'), which is a
          // missing peer dep and crashes the Babel transform for every file.
          // Disable it here. Re-enable in Milestone 2 after:
          //   npx expo install react-native-worklets
          reanimated: false,
        },
      ],
    ],
  };
};
