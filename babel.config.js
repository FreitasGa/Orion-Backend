module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['module-resolver', {
      alias: {
        '@controllers': './src/controllers',
        '@services': './src/services',
        '@interfaces': './src/interfaces',
        '@middlewares': './src/middlewares',
        '@validators': './src/validators',
        '@models': './src/models',
        '@database': './src/database',
        '@modules': './src/modules',
        '@config': './src/config',
        '@websocket': './src/websocket',
      },
    }],
  ],
  ignore: [
    '**/*.spec.ts',
    '*.json',
  ],
};
