const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
      fallback: {
        path: require.resolve('path-browserify'),
      },
    },
    module: {
      rules: [
        // Aquí es donde agregarías tus reglas de carga para transpilar tu código, manejar imágenes, etc.
      ],
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            // Puedes agregar opciones específicas de Terser aquí
          },
        }),
      ],
    },
    plugins: isProduction
      ? [
          new JavaScriptObfuscator({
            // Puedes agregar opciones específicas de JavaScriptObfuscator aquí
          }),
        ]
      : [],
    devtool: isProduction ? false : 'source-map',
  };
};