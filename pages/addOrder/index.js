// pages/addOrder/index.js
const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;
import utils from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight,
    loading: false,
    detail: {
      region: 0,
      ownerName: '',
      ownerMobile: '',
      predictCheckinTime: utils.datetimeparse(new Date().getTime(), 'yy/MM/dd'),
      predictCheckoutTime: utils.datetimeparse(new Date().getTime()+(24*60*60*1000), 'yy/MM/dd'),
      roomNum: [0],
      id: null,
      inTime: '15:00',
      outTime: '12:00'
    },
    region: [],   // 房源
    roomList: [],  // 房间号
    roomId: null,
    editAdd: 0,     // 0表示新增1表示编辑
    id: null,       // 订单id
    roomGroupId: null,    // 房源id
    showTemplate: false,
  },

  // 日期选择
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    let id = e.currentTarget.id;
    if (id == 1) {
      this.setData({
        "detail.predictCheckinTime": e.detail.value.replace(/-/g,"/")
      })
    }else {
      this.setData({
        "detail.predictCheckoutTime": e.detail.value.replace(/-/g,"/")
      })
    }
  },

  // 入住离店时间选择
  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    let id = e.currentTarget.id;
    if (id == 1) {
      this.setData({
        'detail.inTime': e.detail.value
      })
    }else {
      this.setData({
        'detail.outTime': e.detail.value
      })
    }
  },

  // 选择
  bindRegionChange: function (e) {
    console.log(e);
    let id = e.currentTarget.id;
    let that = this;
    
    if(id == 1) {
      let region = that.data.region;
      region.forEach((item, index) => {
        if(index == e.detail.value) {
          that.setData({ 
            roomGroupId: item.id,
            'detail.inTime': item.inTime ? item.inTime : '15:00',
            'detail.outTime': item.outTime ? item.outTime : '12:00'
          });
          that.getroomList();
        }
      });
      that.setData({
        'detail.region': e.detail.value
      })
    }else {
      let index = e.currentTarget.dataset.index;
      let roomNum = that.data.detail.roomNum;
      roomNum.forEach((item, idx) => {
        if (idx == index) {
          roomNum.splice(idx, 1, e.detail.value);
        }
      });
      that.setData({
        'detail.roomNum': roomNum
      });
    }
  },

  // 添加房间号
  addRoom: function () {
    let roomList = this.data.detail.roomNum;
    if (roomList.length == this.data.roomList.length) {
      return;
    }else {
      roomList.push(0);
      console.log(roomList);
      this.setData({ 'detail.roomNum': roomList })
    }
  },

  // 删除房间号
  deleteRoom: function (e) {
    let index = e.currentTarget.id;
    let roomList = this.data.detail.roomNum;
    roomList.splice(index, 1);
    this.setData({ 'detail.roomNum': roomList })
  },

  // 获取详情数据
  getDetail: function () {
    let that = this;
    utils.requestFun('/order/'+that.data.id, ' ', ' ', ' ', 'GET', function(res) {
      console.log(res.data, 1122);
      let region = null;
      that.data.region.forEach((item, index) => {
        if (res.data.data.roomGroupId == item.id) {
          region = index;
        }
      });
      
      that.setData({
        roomGroupId: res.data.data.roomGroupId,
        'detail.region': region,
        'detail.ownerName': res.data.data.ownerName,
        'detail.ownerMobile': res.data.data.ownerMobile,
        roomId: res.data.data.roomId,
        'detail.predictCheckinTime': utils.datetimeparse(res.data.data.predictCheckinTime, 'yy/MM/dd'),
        'detail.predictCheckoutTime': utils.datetimeparse(res.data.data.predictCheckoutTime, 'yy/MM/dd'),
        'detail.inTime': utils.datetimeparse(res.data.data.predictCheckinTime, 'hh:mm'),
        'detail.outTime': utils.datetimeparse(res.data.data.predictCheckoutTime, 'hh:mm'),
        'detail.id': res.data.data.id,
        showTemplate: true
      });
      console.log('that.data.roomGroupId', that.data.roomGroupId)
      that.getroomList();
    });
    setTimeout(() => {
      that.setData({ showTemplate: true })
    }, 3000);
  },

  // 获取所有可用房源
  getRoomGroupList: function () {
    let that = this;
    utils.requestFun('/roomGroup/roomOrder/active', ' ', ' ', ' ', 'GET', function(res) {
      that.setData({ 
        region: res.data.data, 
      });
      if (that.data.editAdd == 0) {
        that.setData({
          'detail.region': 0,
          roomGroupId: res.data.data[0].id,
          'detail.inTime': res.data.data[0].inTime ? res.data.data[0].inTime : '15:00',
          'detail.outTime': res.data.data[0].outTime ? res.data.data[0].outTime : '12:00'
        });
        that.getroomList();
      }else {
        that.getDetail();
      }
    })
  },

  // 获取所有房间列表
  getroomList: function () {
    let that = this;
    utils.requestFun('/roomGroup/roomOrder/'+that.data.roomGroupId+'/room', ' ', ' ', ' ', 'GET', function(res) {
      if (that.data.roomId) {
        let roomNum = [];
        res.data.data.forEach((item, index) => {
          if (that.data.roomId == item.id) {
            roomNum.push(index);
          }
        });
        that.setData({
          'detail.roomNum': roomNum,
        });
      }
      that.setData({
        roomList: res.data.data,
        showTemplate: true
      });
    });
    setTimeout(() => {
      that.setData({ showTemplate: true })
    }, 3000);
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, 444);
    if (options.id) {
      this.setData({
        editAdd: 1,
        id: options.id
      });
    }else {
      this.setData({ editAdd: 0 });
    }
    this.getRoomGroupList();
  },

  // 保存事件
  saveBtn: function (e) {
    console.log(e);
    let that = this;
    let detail = e.detail.value;
    // if (detail.ownerName === '') {
    //   wx.showModal({
    //     title: '提示',
    //     content: '请输入预订人姓名',
    //     showCancel: false
    //   });
    //   return;
    // }
    if (detail.ownerMobile === '') {
      wx.showModal({
        title: '提示',
        content: '请输入手机号',
        showCancel: false
      });
      return;
    }
    if (new Date(that.data.detail.predictCheckinTime).getTime() >= new Date(that.data.detail.predictCheckoutTime).getTime()) {
      wx.showModal({
        title: '提示',
        content: '离店时间必须大于住店时间',
        showCancel: false
      });
      return;
    }
    console.log(new Date(utils.datetimeparse(new Date().getTime(), 'yy/MM/dd') + ' 00:00:00').getTime())
    let timestart = new Date(that.data.detail.predictCheckinTime).getTime();
    let startTime = new Date(utils.datetimeparse(new Date().getTime(), 'yy/MM/dd') +' 00:00:00').getTime();
    console.log(timestart < startTime);
    console.log(new Date(that.data.detail.predictCheckinTime).getTime() < new Date(utils.datetimeparse(new Date().getTime(), 'yy/MM/dd') + '00:00:00').getTime())
    if (timestart < startTime) {
      wx.showModal({
        title: '提示',
        content: '住店时间不可小于当天时间',
        showCancel: false
      });
      return;
    }
    let data = {
      ownerMobile: detail.ownerMobile,
      ownerName: detail.ownerName,
      predictCheckinTime: new Date(that.data.detail.predictCheckinTime + ' '+that.data.detail.inTime+':00').getTime(),
      predictCheckoutTime: new Date(that.data.detail.predictCheckoutTime + ' '+that.data.detail.outTime+':00').getTime(),
      roomGroupId: that.data.roomGroupId
    };
    data.rooms = [];
    that.data.roomList.forEach((item, index) => {
      that.data.detail.roomNum.forEach((i, j) => {
        if (index == i) {
          let obj = {};
          obj.id = item.id;
          data.rooms.push(obj)
        }
      })
    });

    let pages = getCurrentPages(); //页面栈
    let beforePage = pages[pages.length - 2];

    if (that.data.editAdd == 0) {
      utils.requestFun('/order/booking', ' ', ' ', data, 'POST', function(res) {
        wx.showToast({
          title: '创建成功',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,    // 返回上一级页面。
            success: function() {
              if (beforePage.route == 'pages/order/index') {
                beforePage.onLoad() //这个函数式调用接口的函数
              }
            }
          })
        }, 1500);
      })
    }else {
      data.roomId = data.rooms[0].id;
      console.log(that.data.id, data);
      // 编辑保存
      utils.requestFun('/order/'+that.data.id+'/booking', ' ', ' ', data, 'PUT', function(res) {
        wx.showToast({
          title: '修改成功',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,    // 返回上一级页面。
            success: function() {
              if (beforePage.route == 'pages/order/index') {
                beforePage.onLoad() //这个函数式调用接口的函数
              }
            }
          })
        }, 1500);
      })
    }
    
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