// pages/pending/index.js
import utils from '../../utils/util'
const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight,
    dataList: [],     // list
    type: null,       // 判断哪种待办 tenantRegister 住客登记  checkoutApply 退房  lowBattery 电量不足 noneRegisterGuest 住客未登记
    page: 1,
    onReachBottomDisabled: false
  },

  // 获取数据列表
  getList: function (e) {
    let that = this;
    utils.requestFun('/news/'+that.data.type, 10, that.data.page, ' ', 'GET', function(res) {
      console.log(res, 999);
      wx.stopPullDownRefresh();
      let dataList = res.data.data;
      dataList.forEach(item => {
        item.time = utils.datetimeparse(item.createTime, 'MM/dd hh:mm');
      });
      if (dataList.length < 10) {
        that.setData({ onReachBottomDisabled: true })
      }else {
        that.setData({ onReachBottomDisabled: false })
      }
      that.setData({
        dataList: dataList
      });
    })
  },

  // 上拉加载
  onReachBottom: function (e) {
    if (this.data.onReachBottomDisabled) {
      return;
    }else {
      this.setData({
        page: this.data.page++
      })
      this.getList();
    }
  },

  // 进详情
  lookDetail: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.linkid;
    let newsId = e.currentTarget.id;
    utils.requestFun('/news/'+newsId+'/status/'+'READ', ' ', ' ', ' ', 'PUT', function(res) {
      if (that.data.type == 'TENANT_REGISTER') {
        wx.navigateTo({
          url: '../orderDetail/index?id='+id,
        })
      }else  if (that.data.type == 'CHECKOUT_APPLY') {
        wx.navigateTo({
          url: '../orderDetail/index?id='+id,
        })
      }else  if (that.data.type == 'LOW_BATTERY') {
        wx.navigateTo({
          url: '../orderDetail/index?id='+id,
        })
      }else {
        wx.navigateTo({
          url: '../facilityDetail/index?id='+id,
        })
      }
    });
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      let type = options.type;
      if (type == 1) {
        that.setData({ type: 'TENANT_REGISTER' })
      }else if (type == 2) {
        that.setData({ type: 'CHECKOUT_APPLY' })
      }else if (type == 3) {
        that.setData({ type: 'LOW_BATTERY' })
      }else {
        that.setData({ type: 'NONE_REGISTER_GUEST' })
      }
      that.getList();
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
    this.setData({ page:1 });
    this.getList();
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