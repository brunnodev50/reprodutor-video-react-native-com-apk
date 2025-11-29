module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Obrigatório para animações funcionarem no Android/iOS
      'react-native-reanimated/plugin',
    ],
  };
};