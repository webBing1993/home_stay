const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44
import utils from '../../utils/util';
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
    },
    logOut:{
      type: Boolean,
      value: true
    },
    leftBack:{
      type: Boolean,
      value: true
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
      this.triggerEvent('back');
      console.log('getCurrentPages()', getCurrentPages());
      if (getCurrentPages().length === 1) {
        if(this.data.logOut){
          utils.requestFun('/auth/logout', '', '', '', 'GET', function (res) {
            wx.removeStorageSync('xAutoToken');
            wx.reLaunch({
              url: '../login1/index'
            });
          })
        }else{
          wx.redirectTo({
            url: '/page/index/index'
          })
        }
        
      } else {
        let pages = getCurrentPages(); //页面栈
        if (pages.length == 2 || pages[1].route == "pages/pending/index") {
          let beforePage = pages[pages.length - 2];
          wx.navigateBack({
            delta: 1,    // 返回上一级页面。
            success: function() {
              beforePage.onLoad()
            }
          })
        }else {
          wx.navigateBack()
        }
      }
    }
  }
})