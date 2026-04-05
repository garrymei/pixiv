module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {
    'process.env.API_MODE': '"real"',
    'process.env.APP_ENV': '"test"',
    'process.env.LOCAL_API_BASE_URL': '"http://43.167.164.162:3000"',
    'process.env.TEST_API_BASE_URL': '"http://43.167.164.162:3000"',
    'process.env.LOCAL_UPLOAD_BASE_URL': '"http://43.167.164.162:3000"',
    'process.env.TEST_UPLOAD_BASE_URL': '"http://43.167.164.162:3000"'
  },
  mini: {},
  h5: {
    /**
     * WebpackChain 插件配置
     * @docs https://github.com/neutrinojs/webpack-chain
     */
    // webpackChain (chain) {
    //   chain.plugin('analyzer')
    //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
    // }
  }
}
