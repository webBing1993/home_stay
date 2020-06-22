// pages/login1/index.js
const app = getApp();
import utils from '../../utils/util'
var app_id = 'wx598d731244d7f337';
Page({

  /**
   * 页面的初始数据
   */
  data: {

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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setStorageSync('app_id', app_id);
    let that = this;
      wx.login({
        success: res => {
          console.log(res, 333);
          let data = {
            appId: app_id,
            jscode: res.code
          };
          utils.requestFun('/auth/wx/jscode/login', '', '', data, 'POST', function(res) {
            wx.setStorageSync('xAuthToken', res.header['X-auth-token']);
            app.globalData.authorities = res.data.data.authorities;
            if (res.data.data.loginStatus == 'NAMED') {
              if (res.data.data.owner) {
                if(res.data.data.auditStatus == null || res.data.data.auditStatus == 'NONE' || res.data.data.auditStatus == 'PENDING' ) {
                  wx.redirectTo({
                    url: '/pages/logon/index?id='+res.data.data.userId
                  })
                }else {
                  wx.redirectTo({
                    url: '/pages/index/index',
                  })
                }
              }else {
                wx.redirectTo({
                  url: '/pages/index/index',
                })
              }
            }else {
              wx.redirectTo({
                url: '/pages/login/index',
              })
            }
          })
        }
      })
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