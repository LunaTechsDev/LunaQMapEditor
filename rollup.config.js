import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import pkg from './package.json'
import babel from '@rollup/plugin-babel'
import copy from 'rollup-plugin-copy'

const production = !process.env.ROLLUP_WATCH

const options = {
  external: [
    "react",
    "react-dom",
    "react-sortable-hoc",
    "pixi.js",
    "electron",
    "electron-updater",
    "fs",
    "path",
    "url"
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
      plugins: [
        ["@babel/plugin-proposal-decorators",
          {
            legacy: true
          }
        ],
        ["@babel/plugin-proposal-class-properties",
          {
            loose: true
          }]
      ],
      presets: ["@babel/preset-env", "@babel/preset-react"]
    }),
    resolve(),
    copy({
      targets: [
        { src: 'app/*.html', dest: 'dist/' },
        { src: 'app/imgs/**/*', dest: 'dist/imgs' },
        { src: 'app/css/**/*', dest: 'dist/css' },
      ]
    })
  ]
}

const fs = require('fs')
const path = require('path')
const {
  name, version, main, author, description, license, dependencies
} = require('./package.json')

const distPkg = {
  name,
  version,
  main: './js/main/main.js',
  author,
  description,
  license,
  dependencies
}

if (fs.existsSync('./dist/') === false) {
  fs.mkdirSync('./dist/')
}

fs.writeFileSync(path.resolve('./dist/', 'package.json'), JSON.stringify(distPkg, null, 2))

export default [
  {
    input: './app/js/main/main.js',
    output: [
      { file: 'dist/js/main/main.js', format: 'cjs', sourcemap: true, }
    ],
    ...options
  },
  {
    input: './app/js/renderer/app.js',
    output: [
      { file: 'dist/js/renderer/app.js', format: 'cjs', sourcemap: true, },
    ],
    ...options
  },
  // @todo Remove the need to bundle each new window created by electron
  {
    input: './app/js/renderer/selectFrame.js',
    output: [
      { file: 'dist/js/renderer/selectFrame.js', format: 'cjs', sourcemap: true, },
    ],
    ...options
  },
  {
    input: './app/js/renderer/selectCondition.js',
    output: [
      { file: 'dist/js/renderer/selectCondition.js', format: 'cjs', sourcemap: true, },
    ],
    ...options
  }
]