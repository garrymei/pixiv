module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
    'process.env.API_MODE': '"real"',
    'process.env.APP_ENV': '"local"',
    'process.env.LOCAL_API_BASE_URL': '"http://127.0.0.1:3000"',
    'process.env.TEST_API_BASE_URL': '"https://test-api.yueciyuan.com"',
    'process.env.LOCAL_UPLOAD_BASE_URL': '"http://127.0.0.1:3000"',
    'process.env.TEST_UPLOAD_BASE_URL': '"https://test-api.yueciyuan.com"'
  },
  mini: {},
  h5: {}
}
