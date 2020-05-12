// pages/order/index.js
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
    searchVal: '',
    orderNum: {
      preNum: 0,
      liveNum: 0,
    },
    active: 1,      // 1表示预定，2表示在住，3表示离店
    currentView: 0,
    dataList: [],
    page: 1,  // 当前页
    onReachBottomDisabled: false,   // 是否满足上拉加载条件
  },

  // 事件
  // tab
  handleTabClick: function (e) {
    var index = e.currentTarget.id;
    this.setData({ 
      active: index,
      page: 1 
    });

    this.getList();
  },

  handleSwiperChange: function (e) {
    var index = e.detail.current;
    this.setData({ active: index, page: 1 });
  },

  // 编辑
  edit: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../addOrder/index?id='+id,
    })
  },

  // 创建
  creatOrderBtn: function (e) {
    wx.navigateTo({
      url: '../addOrder/index',
    })
  },

  // 预订单取消
  orderCancle: function (e) {
    let id = e.currentTarget.id;
    utils.requestFun('/order/'+id+'/cancel', ' ', ' ', ' ', 'PUT', function(res) {
      wx.showToast({
        title: '订单取消成功',
        icon: 'none',
        duration: 2000
      });
    })
  },

  // 退房
  checkOut: function (e) {
    let id = e.currentTarget.id;
    utils.requestFun('/order/'+id+'/checkout', ' ', ' ', ' ', 'PUT', function(res) {
      wx.showToast({
        title: '退房成功',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        page: 1
      })
      this.getList();
    })
  },

  // 进入详情
  orederDetail: function(e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '../orderDetail/index?id='+id,
    })
  },

  // 获取数据接口
  getList: function () {
    let that = this;
    let data = {
      keyWords: that.data.searchVal
    };
    console.log(that.data.active);
    if(that.data.active == 1) {
      utils.requestFun('/order/booking', 10, that.data.page, data, 'GET', function(res) {
        wx.stopPullDownRefresh();
        let dataList = res.data.data;
        for (var item in dataList) {
          dataList[item].text = utils.isToday(dataList[item].predictCheckinTime);
          dataList[item].day = Math.floor((dataList[item].predictCheckoutTime - dataList[item].predictCheckinTime) / (24*60*60*1000));
          dataList[item].startTime = utils.datetimeparse(dataList[item].predictCheckinTime, 'MM/dd');
          dataList[item].endTime = utils.datetimeparse(dataList[item].predictCheckoutTime, 'MM/dd');
        };
        if(that.data.page > 1) {
          dataList = [...that.data.dataList, dataList];
        }
        if (dataList.length < 10) {
          that.setData({ onReachBottomDisabled: true });
        }else {
          that.setData({ onReachBottomDisabled: false });
        }
        that.setData({ dataList: dataList });
        //创建节点选择器
        var query = wx.createSelectorQuery();
        //选择id
        query.select('.order_lists').boundingClientRect(function (rect) {
          console.log(111, rect);
          that.setData({
            containerHeight: rect.height + 'px'
          })
        }).exec();
        that.setData({ 'orderNum.preNum': res.header['X-Total-Count']})
        utils.requestFun('/order/checkin/count', ' ', ' ', ' ', 'GET', function(res) {
          that.setData({ 'orderNum.liveNum': res.data.data })
        });
      })
    }else if (that.data.active == 2) {
      utils.requestFun('/order/checkin', 10, that.data.page, data, 'GET', function(res) {
        let dataList = res.data.data;
        for (var item in dataList) {
          dataList[item].text = utils.isToday(dataList[item].predictCheckinTime);
          dataList[item].day = Math.floor((dataList[item].predictCheckoutTime - dataList[item].predictCheckinTime) / (24*60*60*1000));
          dataList[item].startTime = utils.datetimeparse(dataList[item].predictCheckinTime, 'MM/dd');
          dataList[item].endTime = utils.datetimeparse(dataList[item].predictCheckoutTime, 'MM/dd');
        };
        if(that.data.page > 1) {
          dataList = [...that.data.dataList, dataList];
        }
        if (dataList.length < 10) {
          that.setData({ onReachBottomDisabled: true });
        }else {
          that.setData({ onReachBottomDisabled: false });
        }
        that.setData({ dataList: dataList });
        //创建节点选择器
        var query = wx.createSelectorQuery();
        //选择id
        query.select('.order_lists').boundingClientRect(function (rect) {
          console.log(111, rect);
          that.setData({
            containerHeight: rect.height + 'px'
          })
        }).exec();
        that.setData({ 'orderNum.preNum': res.header['X-Total-Count']})
        utils.requestFun('/order/booking/count', ' ', ' ', ' ', 'GET', function(res) {
          that.setData({ 'orderNum.preNum': res.data.data })
        });
      })
    }else {
      utils.requestFun('/order/checkout', 10, that.data.page, data, 'GET', function(res) {
        let dataList = res.data.data;
        for (var item in dataList) {
          dataList[item].text = utils.isToday(dataList[item].predictCheckinTime);
          dataList[item].day = Math.floor((dataList[item].predictCheckoutTime - dataList[item].predictCheckinTime) / (24*60*60*1000));
          dataList[item].startTime = utils.datetimeparse(dataList[item].predictCheckinTime, 'MM/dd');
          dataList[item].endTime = utils.datetimeparse(dataList[item].predictCheckoutTime, 'MM/dd');
        };
        if(that.data.page > 1) {
          dataList = [...that.data.dataList, dataList];
        }
        if (dataList.length < 10) {
          that.setData({ onReachBottomDisabled: true });
        }else {
          that.setData({ onReachBottomDisabled: false });
        }
        that.setData({ dataList: dataList });
        //创建节点选择器
        var query = wx.createSelectorQuery();
        //选择id
        query.select('.order_lists').boundingClientRect(function (rect) {
          console.log(111, rect);
          that.setData({
            containerHeight: rect.height + 'px'
          })
        }).exec();
      })
    }
  },

  // 下拉加载
  onPullDownRefresh: function(e) {
    console.log('触发了下拉加载', e)
    this.setData({
      page: 1
    })
    this.getList();
  },

  // 上拉加载
  onReachBottom: function (e) {
    console.log('到底啦')
    if (this.data.onReachBottomDisabled) {
      return;
    }else {
      this.setData({
        page: this.data.page++
      })
      this.getList();
    }
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let that = this;
    //创建节点选择器
    var query = wx.createSelectorQuery();
    //选择id
    query.select('.order_header').boundingClientRect(function (rect) {
       console.log(111, rect);
       that.setData({
          headerHeight: rect.height
       })
    }).exec();

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})