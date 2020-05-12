//index.js
//获取应用实例
const app = getApp();
import utils from '../../utils/util.js';

Page({
  data: {
    navList: [
      {
        src: '../../utils/images/dingdanguanli.png',
        name: '订单管理',
        show: true,
        nav: '../order/index'
      },
      {
        src: '../../utils/images/shebeiguanli.png',
        name: '设备管理',
        show: true,
        nav: '../facility/index'
      },
      {
        src: '../../utils/images/zhanghaoguanli.png',
        name: '账号管理',
        show: true,
        nav: '../account/index'
      },
      {
        src: '../../utils/images/mendianshezhi.png',
        name: '门店设置',
        show: true,
        nav: '../install/index'
      }
    ],      // nav list
    pendingList: [
      {
        type: 1,          // 1住客登记，2退房，3设备电量不足，4住客未登记
        num: 0,
      },
      {
        type: 2,          // 1住客登记，2退房，3设备电量不足，4住客未登记
        num: 0,
      },
      {
        type: 3,          // 1住客登记，2退房，3设备电量不足，4住客未登记
        num: 0,
      },
      {
        type: 4,          // 1住客登记，2退房，3设备电量不足，4住客未登记
        num: 0,
      }
    ],    // pending list 待办
    navlist: [
      {
        "text": "菜单",
        "iconPath": "/utils/images/caidanhui.png",
        "selectedIconPath": "/utils/images/caidanlan.png",
      },
      {
        "text": "我的",
        "iconPath": "/utils/images/wohui.png",
        "selectedIconPath": "/utils/images/wolan.png",
      }
    ],        // navlist
    current: 0,   // nav current
  },
  //事件处理函数
 // 路由跳转
 navTab: function (e) {
   var nav_tab = e.currentTarget.id;
   wx.navigateTo({
    url: nav_tab
  })
 },

 // 待办事项跳转列表
 pandingTap: function (e) {
  wx.navigateTo({
    url: '../pending/index?type='+e.currentTarget.id
  })
 },

 // nav 
 tabChange(e) {
   if (e.detail.index == 0) {
    wx.navigateTo({
      url: '../index/index'
    })
   }else {
    wx.navigateTo({
      url: '../my/index'
    });
   }
    console.log('tab change', e)
},

// 待办接口
getCount: function () {
  let that = this;
  utils.requestFun('/news/count', '', '', '', 'GET', function(res) {
    console.log(111, res);
    let pendingList = that.data.pendingList;
    pendingList.forEach(item => {
      if(item.type == 1) {
        item.num = res.data.data.tenantRegister
      }else if(item.type == 2) {
        item.num = res.data.data.checkoutApply
      }else if(item.type == 3) {
        item.num = res.data.data.lowBattery
      }else {
        item.num = res.data.data.noneRegisterGuest
      }
    })
    that.setData({
      pendingList: pendingList
    })
  }) 
},

// 获取权限
getInfo: function (e) {
  let that = this;
  utils.requestFun('/auth/info', ' ', ' ', ' ', 'GET', function (res) {
    let navList = that.data.navList;
    if (res.data.data.owner != null && res.data.data.owner) {
      navList.forEach(item => {
        item.show = true;
      })
    }else {
      navList.forEach((item, index) => {
        if (index == 1) {
          item.show = true;
        }else {
          item.show = false;
        }
      })
    }
    that.setData({ navList: navList })
    that.getCount();
  })
},

  onLoad: function () {
    
    let value = wx.getStorageSync('xAuthToken');
    if (value) {
      this.getInfo();
    }else {
      let that = this;
      wx.login({
        success: res => {
          console.log(res, 333);
          let data = {
            appId: wx.getStorageSync('app_id'),
            jscode: res.code,
            iv: wx.getStorageSync('iv'),
            encodeData: wx.getStorageSync('encodeData')
          };
          utils.requestFun('/auth/wx/jscode/login', '', '', data, 'POST', function(res) {
            wx.setStorageSync('xAuthToken', res.header['X-auth-token']);
            this.getInfo();
          })
        }
      })
    }
  },

   /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   let value =  wx.getStorage('phone');
   if (value == undefined) {
    wx.redirectTo({
      url: '/pages/login/index',
    })
   }
  },

  /**
   * 页面显示
   */
  onShow: function () {
    wx.hideHomeButton();
  },

  /**
   * 界面隐藏事件
   */
  onHide: function () {
    this.setData({
      current: 0
    })
  },
  
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
})
