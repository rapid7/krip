import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';

export default [
  {
    input: 'src/index.js',
    output: {
      exports: 'named',
      file: 'index.js',
      format: 'umd',
      name: 'krip',
      sourcemap: true,
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
      commonjs({
        include: ['node_modules/**'],
      }),
      resolve({
        browser: true,
        jsnext: true,
        main: true,
        module: true,
      }),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      exports: 'named',
      file: 'node.js',
      format: 'umd',
      name: 'krip',
      sourcemap: true,
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
      commonjs({
        include: ['node_modules/**'],
      }),
      replace({
        'GLOBAL.TextDecoder': "require('util').TextDecoder",
        'GLOBAL.TextEncoder': "require('util').TextEncoder",
        'GLOBAL.crypto || GLOBAL.msCrypto': "require('@trust/webcrypto')",
      }),
      resolve({
        browser: true,
        jsnext: true,
        main: true,
        module: true,
      }),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      exports: 'named',
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'krip',
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
        presets: ['minify'],
      }),
      commonjs({
        include: ['node_modules/**'],
      }),
      resolve({
        browser: true,
        jsnext: true,
        main: true,
        module: true,
      }),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      exports: 'named',
      file: 'dist/node.min.js',
      format: 'umd',
      name: 'krip',
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
        presets: ['minify'],
      }),
      commonjs({
        include: ['node_modules/**'],
      }),
      replace({
        'GLOBAL.TextDecoder': "require('util').TextDecoder",
        'GLOBAL.TextEncoder': "require('util').TextEncoder",
        'GLOBAL.crypto || GLOBAL.msCrypto': "require('@trust/webcrypto')",
      }),
      resolve({
        browser: true,
        jsnext: true,
        main: true,
        module: true,
      }),
    ],
  },
];
