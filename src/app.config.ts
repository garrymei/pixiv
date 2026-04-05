export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/discover/index',
    'pages/publish/index',
    'pages/events/index',
    'pages/profile/index',
    'pages/post-detail/index',
    'pages/publish-post/index',
    'pages/publish-demand/index',
    'pages/demand-detail/index',
    'pages/event-detail/index',
    'pages/my-posts/index',
    'pages/my-events/index',
    'pages/my-demands/index',
    'pages/my-applied-demands/index',
    'pages/edit-profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#121212',
    navigationBarTitleText: '粤次元君',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#FFFFFF',
    selectedColor: '#7B61FF',
    backgroundColor: '#1E1E1E',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/discover/index',
        text: '发现'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布'
      },
      {
        pagePath: 'pages/events/index',
        text: '活动'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
