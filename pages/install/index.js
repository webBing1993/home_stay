// pages/install/index.js
import utils from '../../utils/util';
const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight,
    headerHeight: null,
    dataList: [],
    inputVal: '',
    page: 1,
    onReachBottomDisabled: false,     // 判断是否满足上拉加载
  },

  // input
  inputChange: function (e) {
    console.log(e);
    this.setData({
      inputVal: e.detail.value
    })
  },

  // 房源搜索
  searchBtn: function () {
    this.setData({ page: 1 })
    this.getList();
  },

  // 房源添加
  creatHouse: function (e) {
    if(e.currentTarget.id) {
      wx.navigateTo({
        url: '../installDetail/index?id='+e.currentTarget.id
      });
    }else {
       wx.navigateTo({
        url: '../installDetail/index'
      });
    }
  }, 

  // 再次提交
  agenApply: function (e) {
    let that = this;
    let id = e.currentTarget.id;
    let data = {
      id: id
    };
    utils.requestFun('/roomGroup/apply', ' ', ' ', data, 'POST', function(res) {
      wx.showToast({
        title: '提交成功',
        icon: 'none',
        duration: 2000
      });
    });
  },

  // 上拉加载
  onReachBottom: function (e) {
    let that = this;
    console.log('触发了上拉加载')
    if(that.data.onReachBottomDisabled) {
      return
    }else {
      that.setData({ page: ++that.data.page });
      that.getList();
    }
  },

  // 获取数据接口
  getList: function () {
    let that = this;
    let data = {
      keyWords: that.data.inputVal
    };
    console.log('that.data.page', that.data.page)
    utils.requestFun('/roomGroup/search', 10, that.data.page, data, 'GET', function(res) {
      wx.stopPullDownRefresh();
      let dataList = res.data.data;
      if (dataList.length != 0) {
        dataList.forEach(item => {
          item.auditTime = utils.datetimeparse(item.auditTime, 'yy/MM/dd hh:mm');
          item.address = item.address.split('#');
        });
      }
      if(dataList.length < 10) {
        that.setData({ onReachBottomDisabled: true })
      }else {
        that.setData({ onReachBottomDisabled: false })
      }
      if(that.data.page > 1) {
        dataList = [...that.data.dataList, ...dataList];
      }
      console.log(dataList)
      that.setData({
        dataList: dataList
      });
      that.getHeaderHeight();
    })
  },

  // 头部高度获取
  getHeaderHeight: function (e) {
    let that = this;
    //创建节点选择器
    var query = wx.createSelectorQuery();
    //选择id
    query.select('.searchBar').boundingClientRect(function (rect) {
       console.log(111, rect);
       that.setData({
          headerHeight: rect.height
       })
    }).exec();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
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
  onPullDownRefresh: function(e) {
    console.log('触发了下拉加载', e)
    this.setData({
      page: 1
    })
    this.getList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})