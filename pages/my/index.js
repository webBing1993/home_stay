// pages/my/index.js
const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;
import utils from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    dialogShow: false,
    buttons: [{text: '取消'}, {text: '确定'}],
    navBarHeight
  },

  /**
   * 
   * 事件
   */
  // 退出
  loginOut: function () {
    this.setData({
      dialogShow: true
    });
  },

  // 确认退出
  tapDialogButton: function (e) {
    console.log('dialog', e.detail.index)
    if (e.detail.index == 1) {
      console.log('点击确认按钮啦', '');
     
      utils.requestFun('/auth/logout', '', '', '', 'GET', function(res) {
        wx.showToast({
          title: '退出成功',
          icon: 'none',
          duration: 2000
        });
        wx.removeStorageSync('xAutoToken');
        wx.reLaunch({
          url: '../login1/index'
        });
      })
     
    } else {
      console.log('点击取消按钮啦', '')
    }
    this.setData({
      dialogShow: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    wx.getStorage({
      key: 'phone',
      success (res) {
        that.setData({
          phone: res.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})