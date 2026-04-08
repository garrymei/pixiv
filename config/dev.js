module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
    'process.env.API_MODE': '"mock"',
    'process.env.APP_ENV': '"local"',
    'process.env.LOCAL_API_BASE_URL': '"http://43.167.164.162:3000"',
    'process.env.TEST_API_BASE_URL': '"http://43.167.164.162:3000"',
    'process.env.LOCAL_UPLOAD_BASE_URL': '"http://43.167.164.162:3000"',
    'process.env.TEST_UPLOAD_BASE_URL': '"http://43.167.164.162:3000"'
  },
  mini: {},
  h5: {}
}
