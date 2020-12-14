// eslint-disable-next-line no-unused-vars
const webpack = require('webpack')
const path = require('path')
const { makeTextureAtlas } = require('./lib/atlas')
const { prepareBlocksStates } = require('./lib/models')
const mcAssets = require('minecraft-assets')
const fs = require('fs')

const indexConfig = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './public'),
    filename: './index.js'
  }
}

const workerConfig = {
  entry: './src/worker.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './public'),
    filename: './worker.js'
  }
}

const texturesPath = path.resolve(__dirname, './public/textures')
if (!fs.existsSync(texturesPath)) {
  fs.mkdirSync(texturesPath)
}

const blockStatesPath = path.resolve(__dirname, './public/blocksStates')
if (!fs.existsSync(blockStatesPath)) {
  fs.mkdirSync(blockStatesPath)
}

for (const version of mcAssets.versions) {
  const assets = mcAssets(version)
  const atlas = makeTextureAtlas(assets)
  const out = fs.createWriteStream(path.resolve(texturesPath, version + '.png'))
  const stream = atlas.canvas.pngStream()
  stream.on('data', (chunk) => out.write(chunk))
  stream.on('end', () => console.log('Generated textures/' + version + '.png'))

  const blocksStates = JSON.stringify(prepareBlocksStates(assets, atlas))
  fs.writeFileSync(path.resolve(blockStatesPath, version + '.json'), blocksStates)
}

module.exports = [indexConfig, workerConfig]