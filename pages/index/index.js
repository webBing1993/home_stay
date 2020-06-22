//index.js
//获取应用实例
const app = getApp();
import utils from '../../utils/util.js';

Page({
  data: {
    navList: [{
        src: '../../utils/images/dingdanguanli.png',
        name: '订单管理',
        show: false,
        code: 1001,
        nav: '../order/index'
      },
      {
        src: '../../utils/images/shebeiguanli.png',
        name: '设备管理',
        show: false,
        code: 1002,
        nav: '../facility/index'
      },
      {
        src: '../../utils/images/zhanghaoguanli.png',
        name: '员工管理',
        show: false,
        code: 1003,
        nav: '../account/index'
      },
      {
        src: '../../utils/images/mendianshezhi.png',
        name: '房源管理',
        show: false,
        code: 1004,
        nav: '../install/index'
      }
    ], // nav list
    pendingList: [{
        type: 1, // 1住客登记，2退房，3设备电量不足，4住客未登记
        num: 0,
      },
      {
        type: 2, // 1住客登记，2退房，3设备电量不足，4住客未登记
        num: 0,
      },
      {
        type: 3, // 1住客登记，2退房，3设备电量不足，4住客未登记
        num: 0,
      },
      {
        type: 4, // 1住客登记，2退房，3设备电量不足，4住客未登记
        num: 0,
      }
    ], // pending list 待办
    navlist: [{
        "text": "首页",
        "iconPath": "/utils/images/caidanhui.png",
        "selectedIconPath": "/utils/images/caidanlan.png",
      },
      {
        "text": "我的",
        "iconPath": "/utils/images/wohui.png",
        "selectedIconPath": "/utils/images/wolan.png",
      }
    ], // navlist
    current: 0, // nav current
  },
  //事件处理函数
  // 路由跳转
  navTab: function(e) {
    var nav_tab = e.currentTarget.id;
    var code = e.currentTarget.dataset.code;
    if (code == 1001) {
      utils.requestFun('/roomGroup/roomOrder/active', ' ', ' ', ' ', 'GET', function(res) {
        if (res.data.data == null || res.data.data.length == 0) {
          wx.showToast({
            title: '暂无房源,请先添加房源或将房源上线',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        wx.navigateTo({
          url: nav_tab
        })
      })
    } else {
      wx.navigateTo({
        url: nav_tab
      })
    }
  },

  // 待办事项跳转列表
  pandingTap: function(e) {
    wx.navigateTo({
      url: '../pending/index?type=' + e.currentTarget.id
    })
  },

  // nav 
  tabChange(e) {
    if (e.detail.index == 0) {
      wx.navigateTo({
        url: '../index/index'
      })
    } else {
      wx.navigateTo({
        url: '../my/index'
      });
    }
    console.log('tab change', e)
  },

  // 待办接口
  getCount: function() {
    let that = this;
    utils.requestFun('/news/count', '', '', '', 'GET', function(res) {
      wx.stopPullDownRefresh();
      let pendingList = that.data.pendingList;
      pendingList.forEach(item => {
        if (item.type == 1) {
          item.num = res.data.data.tenantRegister
        } else if (item.type == 2) {
          item.num = res.data.data.checkoutApply
        } else if (item.type == 3) {
          item.num = res.data.data.lowBattery
        } else {
          item.num = res.data.data.noneRegisterGuest
        }
      })
      that.setData({
        pendingList: pendingList,
        notice:res.data.data
      })
    })
  },

  // 获取权限
  getInfo: function(e) {
    let that = this;
    // utils.requestFun('/auth/info', ' ', ' ', ' ', 'GET', function (res) {
    //   let navList = that.data.navList;
    //   if (res.data.data.owner != null && res.data.data.owner) {
    //     navList.forEach((item, index) => {
    //       item.show = true;
    //     })
    //   }else {
    //     navList.forEach((item, index) => {
    //       console.log(22211,item);
    //       item.show = false;
    //       if (index == 1) {
    //         item.show = true;
    //       }
    //     })
    //   }
    //   that.setData({ navList: navList })
    that.getCount();
    // })

    var orderPermission = false //订单管理
    var devicePermission = false //设备管理
    var userPermission = false //员工管理权限
    var roomGroupPermission = false //房源管理权限
    if (app.globalData.authorities != null) {
      for (var i = 0; i < app.globalData.authorities.length; i++) {
        if (app.globalData.authorities[i].authority == 'hs:roomOrder') {
          orderPermission = true
        }
        if (app.globalData.authorities[i].authority == 'hs:device') {
          devicePermission = true
        }
        if (app.globalData.authorities[i].authority == 'hs:subUser') {
          userPermission = true
        }
        if (app.globalData.authorities[i].authority == 'hs:roomGroup') {
          roomGroupPermission = true
        }
      }
    }
    //订单和设备默认全部有权限
    // orderPermission=true
    // devicePermission=true
    let navList = that.data.navList;
    navList.forEach((item, index) => {
      if (item.name == '订单管理') {
        item.show = orderPermission;
      }
      if (item.name == '设备管理') {
        item.show = devicePermission;
      }
      if (item.name == '员工管理') {
        item.show = userPermission;
      }
      if (item.name == '房源管理') {
        item.show = roomGroupPermission;
      }
    })
    that.setData({
      navList: navList
    })
  },

  onLoad: function() {
    let value = wx.getStorageSync('xAuthToken');
    if (value) {
      this.getInfo();
    } else {
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
  getRoomGroup: function() {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let value = wx.getStorage('phone');
    if (value == undefined) {
      wx.redirectTo({
        url: '/pages/login/index',
      })
    }
  },

  /**
   * 页面显示
   */
  onShow: function() {
    wx.hideHomeButton();
  },

  /**
   * 界面隐藏事件
   */
  onHide: function() {
    this.setData({
      current: 0
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getCount();
  },
})