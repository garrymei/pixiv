export default {
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/profile/index',
    'pages/discover/index',
    'pages/explore/index',
    'pages/events/index',
    'pages/event-detail/index',
    'pages/post-detail/index',
    'pages/demand-detail/index',
    'pages/publish/index',
    'pages/publish-post/index',
    'pages/publish-demand/index',
    'pages/edit-profile/index',
    'pages/my-posts/index',
    'pages/my-demands/index',
    'pages/my-events/index',
    'pages/my-applied-demands/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarTitleText: '粤次元君',
    navigationBarBackgroundColor: '#4a0080',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: ''
      },
      {
        pagePath: 'pages/discover/index',
        text: '发现',
        iconPath: ''
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布',
        iconPath: ''
      },
      {
        pagePath: 'pages/events/index',
        text: '活动',
        iconPath: ''
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: ''
      }
    ],
    selectedColor: '#4a0080',
    color: '#999999',
    backgroundColor: '#ffffff'
  }
}
