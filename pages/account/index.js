// pages/account/index.js
const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;
import utils from '../../utils/util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight,
    dataList: [],
  },


  /**
   * 事件
   */
  // 编辑
  edithandle: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../addAccount/index?id='+id,
    })
  },

  // 设置权限
  installhandle: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../power/index?id='+id,
    })
  },

  // 添加账号
  addAccount: function (e) {
    wx.navigateTo({
      url: '../addAccount/index',
    })
  },

  // 获取数据列表
  getList: function () {
    let that = this;
    utils.requestFun('/provider/user/sub', ' ', ' ', ' ', 'GET', function(res) {
      console.log(333232323, res.data);
      that.setData({ dataList: res.data.data })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList();
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
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
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