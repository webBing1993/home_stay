const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;
import utils from '../../utils/util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight,
    roomInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    that.setData({
      id: options.id
    })
    that.getDetail();
  },
  // 获取详情接口
  getDetail: function(e) {
    let that = this;
    let data = {
      needGuest: false
    };
    utils.requestFun('/order/' + that.data.id, ' ', ' ', data, 'GET', function(res) {
      res.data.data.text = utils.isToday(res.data.data.predictCheckinTime);
      res.data.data.day = Math.floor((new Date(utils.datetimeparse(res.data.data.predictCheckoutTime, 'yy/MM/dd') + ' 00:00:00').getTime() - (new Date(utils.datetimeparse(res.data.data.predictCheckinTime, 'yy/MM/dd') + ' 00:00:00').getTime())) / (24 * 60 * 60 * 1000));
      res.data.data.predictExtendTime = utils.datetimeparse(res.data.data.predictCheckoutTime, 'yy-MM-dd');
      var endDate = new Date(res.data.data.predictExtendTime);
      endDate.setDate(endDate.getDate() + 　1);
      res.data.data.predictExtendTime = utils.formatDate(endDate);
      res.data.data.predictCurrentoutTime = res.data.data.predictCheckoutTime;
      res.data.data.outTime = utils.datetimeparse(res.data.data.predictCheckoutTime, 'hh:mm'),
        res.data.data.predictCheckinTime = utils.datetimeparse(res.data.data.predictCheckinTime, 'MM/dd');
      res.data.data.predictCheckoutTime = utils.datetimeparse(res.data.data.predictCheckoutTime, 'MM/dd');
    
      console.log(res.data.data);
      that.setData({
        roomInfo: res.data.data
      });
    })
  },
  // 日期选择
  bindDateChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    let id = e.currentTarget.id;
    this.setData({
      "roomInfo.predictExtendTime": e.detail.value.replace(/-/g, "/")
    })

  },
  // 入住离店时间选择
  bindTimeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    let id = e.currentTarget.id;
    this.setData({
      'roomInfo.outTime': e.detail.value
    })
  },
  
  bindSave: function() {
    var that = this;
    //时间转时间戳
    var dateStr = that.data.roomInfo.predictExtendTime + ' ' + that.data.roomInfo.outTime+':00';
    var date=new Date(dateStr).getTime();
    let data = {
      predictCheckoutTime: date
    };
    if (that.data.roomInfo.predictCurrentoutTime >= date) {
      wx.showModal({
        title: '提示',
        content: '续住时间必须大于离店时间',
        showCancel: false
      });
      return;
    }
    if(new Date().getTime()>=date){
      wx.showModal({
        title: '提示',
        content: '续住时间必须大于当前时间',
        showCancel: false
      });
      return;
    }
    let pages = getCurrentPages(); //页面栈
    let beforePage = pages[pages.length - 2];
    utils.requestFun('/order/' + that.data.id+'/renewal', ' ', ' ', data, 'PUT', function(res) {
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,    // 返回上一级页面。
          success: function () {
            if (beforePage.route == 'pages/order/index') {
              beforePage.onLoad() //这个函数式调用接口的函数
            }
          }
        })
      }, 1500);
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})