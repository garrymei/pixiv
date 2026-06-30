export default {
  lazyCodeLoading: 'requiredComponents',
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/profile/index',
    'pages/discover/index',
    'pages/events/index',
    'pages/event-detail/index',
    'pages/post-detail/index',
    'pages/demand-detail/index',
    'pages/publish-hub/index',
    'pages/publish-post/index',
    'pages/publish-demand/index',
    'pages/edit-profile/index',
    'pages/settings/index',
    'pages/my-posts/index',
    'pages/my-demands/index',
    'pages/my-events/index',
    'pages/my-applied-demands/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarTitleText: '就酱次元区',
    navigationBarBackgroundColor: '#0E1018',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/discover/index',
        text: '发现',
        iconPath: 'assets/tabbar/discover.png',
        selectedIconPath: 'assets/tabbar/discover-active.png'
      },
      {
        pagePath: 'pages/publish-hub/index',
        text: '发布',
        iconPath: 'assets/tabbar/publish.png',
        selectedIconPath: 'assets/tabbar/publish-active.png'
      },
      {
        pagePath: 'pages/events/index',
        text: '活动',
        iconPath: 'assets/tabbar/events.png',
        selectedIconPath: 'assets/tabbar/events-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tabbar/profile.png',
        selectedIconPath: 'assets/tabbar/profile-active.png'
      }
    ],
    selectedColor: '#F43F7F',
    color: '#9CA3AF',
    backgroundColor: '#0E1018',
    borderStyle: 'black'
  }
}
