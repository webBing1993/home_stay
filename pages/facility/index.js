// pages/facility/index.js
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
    houseList: [],
    houseVal: '',
    roomNo: '',
    dataList: [],
    page: 1,
    onReachBottomDisabled: false
  },

  // 房源选择
  bindPickerChange: function(e) {
    console.log(e)
    this.setData({ page: 1, houseVal: e.detail.value });
    this.getList();
  },

  // 房号
  inputChange: function(e) {
    let that = this;
    that.setData({ roomNo: e.detail.value })
  },

  // 搜搜
  searchInput: function(e) {
    this.setData({ page: 1 });
    this.getList();
  },

  // 获取所有房源列表
  getRoomGroup: function(res) {
    let that = this;
    utils.requestFun('/roomGroup/device/all', ' ', ' ', ' ', 'GET', function(res) {
      console.log(res, 55444)
      if (res.data.data.length != 0) {
        that.setData({ 
          houseList: res.data.data,
          houseVal: 0 
        });
        that.getList();
      }else {
        wx.showToast({
          title: '暂无可用房源，请先去门店设置中增加可用房源',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  // 获取列表
  getList: function () {
    let that = this;
    let data = {
      likeRoomName: that.data.roomNo,
      roomGroupId: that.data.houseList[that.data.houseVal].id
    };
    utils.requestFun('/room/lock', 10, that.data.page, data, 'GET', function(res) {
      wx.stopPullDownRefresh();
      res.data.data.forEach(item => {
        item.updateTime = utils.datetimeparse(item.updateTime, 'yy/MM/dd hh:mm:ss');
        if(item.battery <= 20) {
          item.status = 0;
        }else {
          item.status = 1;
        }
      })
      let dataList = res.data.data;
      
      if (dataList.length < 10) {
        that.setData({ onReachBottomDisabled: true });
      }else {
        that.setData({ onReachBottomDisabled: false });
      }
      if(that.data.page > 1) {
        dataList = [...that.data.dataList, ...dataList];
      }
      that.setData({ dataList: dataList });
      //创建节点选择器
      var query = wx.createSelectorQuery();
      //选择id
      query.select('.lists').boundingClientRect(function (rect) {
        console.log(111, rect);
        that.setData({
          containerHeight: rect.height + 'px'
        })
      }).exec();
    })
  },

  scrollbot: function(e) {
    console.log(e);
    if (this.data.onReachBottomDisabled) {
      return;
    }else {
      this.setData({
        page: this.data.page++
      })
      this.getList();
    }
  },

  // 上拉加载
  onReachBottom: function (e) {
    console.log('到底啦！！！')
    if (this.data.onReachBottomDisabled) {
      return;
    }else {
      this.setData({
        page: ++this.data.page
      })
      this.getList();
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //创建节点选择器
    var query = wx.createSelectorQuery();
    //选择id
    query.select('.header_search').boundingClientRect(function (rect) {
      console.log(111, rect);
      that.setData({
        headerHeight: rect.height
      })
    }).exec();

    that.getRoomGroup();
  },

  // 进详情
  handleDetail: function (e) {
    let that = this;
    let id = e.currentTarget.id;
    console.log(e);
    let roomNo = e.currentTarget.dataset.roomno;
    let roomId = e.currentTarget.dataset.roomid;
    console.log(id+'&'+roomNo+'&'+roomId);
    wx.navigateTo({
      url: '../facilityDetail/index?id='+id+'&roomNo='+roomNo+'&roomId='+roomId,
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (e) {
    console.log('到底啦！！', e)
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
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})