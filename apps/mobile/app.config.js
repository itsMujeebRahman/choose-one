const { resolve } = require('node:path');
const { readEnv, selectedApiUrl, root } = require('../../env.config.mjs');

module.exports = ({ config }) => {
  const env = { ...readEnv(resolve(root, 'apps/mobile')), ...process.env };
  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl: selectedApiUrl(env, 'mobile').value,
    },
  };
};
