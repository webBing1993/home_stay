// pages/orderDetail/index.js
const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;
import utils from '../../utils/util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight,
    headerHeight: '',
    containerHeight: '',
    active: 1,
    detail: {
      roomName: '',
      roomGroupName: '',
      ownerName: '',
      ownerMobile: '',
      idCard: '',
      predictCheckinTime: '',
      predictCheckoutTime: '',
      day: '',
      text: ''
    },
    recordList: [],
    id: null,
    page: 1,
  },

  // tab
  handleTabClick: function (e) {
    console.log(e)
    var index = e.currentTarget.id;
    let selectName = '';
    let that = this;
    if(index == 1) {
      selectName = '.swiperItem'
    }else {
      selectName = '.openLists'
    }
    setTimeout(() => {
      //创建节点选择器
      var query = wx.createSelectorQuery();
      //选择id
      query.select(selectName).boundingClientRect(function (rect) {
      console.log(111, rect);
      that.setData({
        containerHeight: rect.height+'px'
      })
    }).exec();
    }, 100);
    that.setData({ 
      active: index 
    });
  },

  // 触底事件
  scrollbot: function () {
    console.log('到达底部了,加载更多电影文件内容')
  },

  // 获取详情接口
  getDetail: function (e) {
    let that = this;
    let data = {
      needGuest: true
    };
    utils.requestFun('/order/'+that.data.id, ' ', ' ', data, 'GET', function(res) {
      res.data.data.text = utils.isToday(res.data.data.predictCheckinTime);
      res.data.data.day = Math.floor((res.data.data.predictCheckoutTime - res.data.data.predictCheckinTime) / (24*60*60*1000));
      res.data.data.predictCheckinTime = utils.datetimeparse(res.data.data.predictCheckinTime, 'MM/dd');
      res.data.data.predictCheckoutTime = utils.datetimeparse(res.data.data.predictCheckoutTime, 'MM/dd');
      console.log(res.data.data);
      that.getOpenList();
      that.setData({
        detail: res.data.data
      });
      //创建节点选择器
      var query = wx.createSelectorQuery();
      //选择id
      query.select('.swiperItem').boundingClientRect(function (rect) {
        console.log(111, rect);
        that.setData({
          containerHeight: rect.height+'px'
        })
      });
    })
  },

  // 获取开门记录
  getOpenList: function () {
    let that = this;
    let data = {
      roomId: that.data.detail.roomId,
      orderNo: that.data.detail.orderNo
    };
    utils.requestFun('/room/lock/record', 200, that.data.page, data, 'POST', function(res) {
      res.data.data.forEach(item => {
        item.openTime = utils.datetimeparse(item.openTime, 'yy/MM/dd hh:mm:ss');
      });
      that.setData({ recordList: res.data.data })
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({ id: options.id })
    that.getDetail();
    
    //创建节点选择器
    var query = wx.createSelectorQuery();
    //选择id
    query.select('.header_tabs').boundingClientRect(function (rect) {
      console.log(111, rect);
      that.setData({
        headerHeight: rect.height
      })
    }).exec();
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