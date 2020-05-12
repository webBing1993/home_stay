const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44

Component({

  properties: {
    back: {
      type: Boolean,
      value: true
    },
    title: {
      type: String,
      value: 'Wechat'
    },
    titleColor: {
      type: String,
      value: '#ffffff'
    },
    background: {
      type: String,
      value: '#4378BA'
    }
  },

  data: {
    navBarHeight
  },

  methods: {
    home() {
      this.triggerEvent('home')
      wx.reLaunch({
        url: '/index/index'
      })
    },

    back() {
      this.triggerEvent('back')
      if (getCurrentPages().length === 1) {
        wx.redirectTo({
          url: '/page/index/index'
        })
      } else {
        wx.navigateBack()
        // let pages = getCurrentPages(); //页面栈
        // let beforePage = pages[pages.length - 2];
        // wx.navigateBack({
        //   delta: 1,    // 返回上一级页面。
        //   success: function() {
        //     beforePage.onLoad()
        //   }
        // })
      }
    }
  }
})