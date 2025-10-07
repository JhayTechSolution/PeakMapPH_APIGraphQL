const path = require('path');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.tsx',       // your main TSX file
  target: 'node',                 // Node.js environment
  mode: 'production',             // or 'development'
  externals: [nodeExternals()],   // exclude node_modules from bundle
  resolve: {
    extensions: ['.ts', '.tsx', '.js'], // resolve these extensions
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',          // optional, for debugging
  plugins: [
    new Dotenv({
      path: './.env.development',             // load this file (default is .env)
      safe: false,                // set true if you want to load .env.example to verify
      systemvars: true,           // allow system environment variables
    }),
  ],
};
