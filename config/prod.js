module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {
    'process.env.API_MODE': '"real"',
    'process.env.APP_ENV': '"test"',
    'process.env.LOCAL_API_BASE_URL': '"https://www.pivix.top"',
    'process.env.TEST_API_BASE_URL': '"https://www.pivix.top"',
    'process.env.LOCAL_UPLOAD_BASE_URL': '"https://www.pivix.top"',
    'process.env.TEST_UPLOAD_BASE_URL': '"https://www.pivix.top"'
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
