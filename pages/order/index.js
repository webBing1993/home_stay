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
    positionFixed: 'fixed',  // 处理头部ios下拉刷新下推情况
    dialogShow: false,
    buttons: [{text: '取消'}, {text: '确定'}],
    changeItemId: null,
  },

  // 事件
  // tab
  handleTabClick: function (e) {
    wx.stopPullDownRefresh();
    this.setData({ positionFixed: 'fixed', navBarHeightTop: navBarHeight });
    var index = e.currentTarget.id;
    this.setData({ 
      active: index,
      page: 1 
    });
    this.getHeaderHeight();
    this.getList();
  },

  handleSwiperChange: function (e) {
    var index = e.detail.current;
    this.setData({ active: index, page: 1 });
  },

  // input
  searchInput: function(e) {
    let val = e.detail.value;
    this.setData({ searchVal: val });
  },

  // 搜索
  searchBtn: function(e) {
    this.setData({ page: 1 });
    this.getList();
  },

  // 拨打电话
  phoneCall: function (e) {
    console.log('拨打：', e);
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.replyPhone,
      success: function () {
        console.log("成功拨打电话")
      },
    })
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
    let that = this;
    utils.requestFun('/roomGroup/active', ' ', ' ', ' ', 'GET', function(res) {
      if (res.data.data && res.data.data.length == 0) {
        wx.showToast({
          title: '请先设置房源',
          icon: 'none',
          duration: 2000
        });
      }else {
        wx.navigateTo({
          url: '../addOrder/index',
        })
      }
    })
   
  },

  // 预订单取消
  orderCancle: function (e) {
    let id = e.currentTarget.id;
    let that = this;
    that.setData({ changeItemId: id, dialogShow: true })
  },

   // 弹框
   tapDialogButton: function (e) {
    console.log(e);
    let index = e.detail.index;   // 0取消，1确定
    let that = this;
    if(index == 1) {
      utils.requestFun('/order/'+that.data.changeItemId+'/cancel', ' ', ' ', ' ', 'PUT', function(res) {
        wx.showToast({
          title: '订单取消成功',
          icon: 'none',
          duration: 2000
        });
        that.setData({ page: 1 });
        that.getList();
      })
    }
    that.setData({
      changeItemId: null,
      dialogShow: false
    })
   },

  // 退房
  checkOut: function (e) {
    let id = e.currentTarget.id;
    let that = this;
    utils.requestFun('/order/'+id+'/checkout', ' ', ' ', ' ', 'PUT', function(res) {
      wx.showToast({
        title: '退房成功',
        icon: 'none',
        duration: 2000
      });
      that.setData({
        page: 1
      })
      that.getList();
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
    console.log(2221, data)
    if(that.data.active == 1) {
      utils.requestFun('/order/booking', 10, that.data.page, data, 'GET', function(res) {
        wx.stopPullDownRefresh();
        that.getHeaderHeight();
        that.setData({ positionFixed: 'fixed', navBarHeightTop: navBarHeight });
        let dataList = res.data.data;
        for (var item in dataList) {
          dataList[item].text = utils.isToday(dataList[item].predictCheckinTime);
          dataList[item].day = Math.floor((new Date(utils.datetimeparse(dataList[item].predictCheckoutTime, 'yy/MM/dd') + ' 00:00:00').getTime() - (new Date(utils.datetimeparse(dataList[item].predictCheckinTime, 'yy/MM/dd') + ' 00:00:00').getTime())) / (24*60*60*1000));
          dataList[item].startTime = utils.datetimeparse(dataList[item].predictCheckinTime, 'MM/dd');
          dataList[item].endTime = utils.datetimeparse(dataList[item].predictCheckoutTime, 'MM/dd');
        };
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
        wx.stopPullDownRefresh();
        that.getHeaderHeight();
        that.setData({ positionFixed: 'fixed', navBarHeightTop: navBarHeight });
        let dataList = res.data.data;
        for (var item in dataList) {
          dataList[item].text = utils.isToday(dataList[item].predictCheckinTime);
          dataList[item].day = Math.floor((new Date(utils.datetimeparse(dataList[item].predictCheckoutTime, 'yy/MM/dd') + ' 00:00:00').getTime() - (new Date(utils.datetimeparse(dataList[item].predictCheckinTime, 'yy/MM/dd') + ' 00:00:00').getTime())) / (24*60*60*1000));
          dataList[item].startTime = utils.datetimeparse(dataList[item].predictCheckinTime, 'MM/dd');
          dataList[item].endTime = utils.datetimeparse(dataList[item].predictCheckoutTime, 'MM/dd');
        };
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
        query.select('.order_lists').boundingClientRect(function (rect) {
          console.log(111, rect);
          that.setData({
            containerHeight: rect.height + 'px'
          })
        }).exec();
        that.setData({ 'orderNum.liveNum': res.header['X-Total-Count']})
        utils.requestFun('/order/booking/count', ' ', ' ', ' ', 'GET', function(res) {
          that.setData({ 'orderNum.preNum': res.data.data })
        });
      })
    }else {
      utils.requestFun('/order/checkout', 10, that.data.page, data, 'GET', function(res) {
        wx.stopPullDownRefresh();
        that.getHeaderHeight();
        let dataList = res.data.data;
        that.setData({ positionFixed: 'fixed', navBarHeightTop: navBarHeight });
        for (var item in dataList) {
          dataList[item].text = utils.isToday(dataList[item].predictCheckinTime);
          dataList[item].day = Math.floor((new Date(utils.datetimeparse(dataList[item].predictCheckoutTime, 'yy/MM/dd') + ' 00:00:00').getTime() - (new Date(utils.datetimeparse(dataList[item].predictCheckinTime, 'yy/MM/dd') + ' 00:00:00').getTime())) / (24*60*60*1000));
          dataList[item].startTime = utils.datetimeparse(dataList[item].predictCheckinTime, 'MM/dd');
          dataList[item].endTime = utils.datetimeparse(dataList[item].predictCheckoutTime, 'MM/dd');
        };
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
      page: 1,
      positionFixed: 'relative',
      navBarHeightTop: 0,
      headerHeight: 0
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
        page: ++this.data.page
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

  // 获取头部定位高度
  getHeaderHeight: function () {
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHeaderHeight();
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
    this.setData({ navBarHeightTop: navBarHeight })
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