const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withNaverMapRepository(config) {
  return withProjectBuildGradle(config, (config) => {
    const naverRepo = "maven { url 'https://repository.map.naver.com/archive/maven' }";
    if (config.modResults.contents.includes(naverRepo)) {
      return config;
    }

    config.modResults.contents = config.modResults.contents.replace(
      /allprojects\s*\{\s*repositories\s*\{/,
      `allprojects {\n    repositories {\n      ${naverRepo}`
    );

    return config;
  });
};
