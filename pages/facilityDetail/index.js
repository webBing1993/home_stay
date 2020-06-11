// pages/facilityDetail/index.js
const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;
import utils from '../../utils/util'
var dateTimePicker = require('../../utils/dateTimePicker.js');

var blePlugin = requirePlugin('bleSdk-plugin');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight,
    headerHeight: '',
    containerHeight: '',
    active: 1,
    tabIndex: 1,
    detail: {
      roomNo: '',
      roomId: '',
      openList: [],       // 开门记录列表
    },
    startTime: null,
    endTime: null,
    dateTimeArray: null,
    startYear: 2020,
    endYear: 2080,
    openPowerClick: true,
    oneButton: [{text: '确定'}],
    showText: null,
    showOneButtonDialog: false,
    id: null,
    userType: 'TENANT',  // 判断住客 TENANT 还是员工 STAFF
    page: 1,
    status: null,
  },

   // tab
   handleTabClick: function (e) {
    console.log(e);
    let that = this;
    var index = e.currentTarget.id;
    that.setData({ 
      active: index 
    });
    if (index == 2) {
      that.getReCode();
    }else {
      that.getDoolInfo();
    }
    that.getHeaderHeight(0);
  },

  // 获取门锁信息
  getDoolInfo: function (e) {
    let that = this;
    console.log(that.data.detail.roomId, 2222);
    utils.requestFun('/room/'+that.data.detail.roomId+'/lock', ' ', ' ', ' ', 'GET', function(res) {
      let bluetoothName = res.data.data.bluetoothName;
      let sn = res.data.data.sn;
      let data = res.data.data.data;
      that.setData({
        bluetoothName: bluetoothName,
        sn: sn,
        secret: data,
        unlockRecordId: res.data.data.unlockRecordId
      });
    })
  },

  tabChange: function (e) {
    console.log(e)
    var index = e.currentTarget.dataset.id;
    let userType = null;
    if (index == 1) {
      userType = 'TENANT'
    }else {
      userType = 'PROVIDER'
    }
    this.setData({ 
      tabIndex: index,
      page: 1 ,
      userType: userType
    });
    this.getReCode()
  },

  // 获取开门记录
  getReCode: function() {
    let that = this;
    let startTime = that.data.dateTimeArray[0][that.data.startTime[0]] + '/' + that.data.dateTimeArray[1][that.data.startTime[1]] + '/' + that.data.dateTimeArray[2][that.data.startTime[2]] + ' ' + that.data.dateTimeArray[3][that.data.startTime[3]] + ':' + that.data.dateTimeArray[4][that.data.startTime[4]];
    let endTime = that.data.dateTimeArray[0][that.data.endTime[0]] + '/' + that.data.dateTimeArray[1][that.data.endTime[1]] + '/' + that.data.dateTimeArray[2][that.data.endTime[2]] + ' ' + that.data.dateTimeArray[3][that.data.endTime[3]] + ':' + that.data.dateTimeArray[4][that.data.endTime[4]]
    console.log(startTime, endTime)
    let data = {
      roomId: that.data.detail.roomId,
      userType: that.data.userType,
      openTimeStart: new Date(startTime).getTime(),
      openTimeEnd: new Date(endTime).getTime(),
      orderBy: 'create_time',
      desc: true
    };
    console.log(data)
    utils.requestFun('/room/lock/record', 200, that.data.page, data, 'POST', function(res) {
      res.data.data.forEach(item => {
        item.time = utils.datetimeparse(item.openTime, 'yy/MM/dd hh:mm:ss');
      });
      that.setData({ 'detail.openList': res.data.data });
      that.getHeaderHeight(1);
    });
  },

  // 触底事件
  scrollbot: function () {
    console.log('到达底部了,加载更多电影文件内容')
  },

  // 日期选择
  bindDateChange: function (e) {
    console.log(e);
    let id = e.currentTarget.dataset.id;
    if(id == 1) {
      this.setData({ startTime: e.detail.value});
    }else {
      this.setData({ endTime: e.detail.value});
    }
    
  },

  // 获取header height
  getHeaderHeight: function (type)  {
    let that = this;
    //创建节点选择器
    var query = wx.createSelectorQuery();
    let selectName = '';
    if(type == 0) {
      selectName = '.header_tabs'
    }else {
      selectName = '.lists'
    }
    //选择id
    query.select(selectName).boundingClientRect(function (rect) {
      console.log(111, rect);
      if (type == 0) {
        that.setData({
          headerHeight: rect.height,
          containerHeight: 'calc(100vh - '+(rect.height + navBarHeight)+'px)'
        });
      }else {
        that.setData({
          containerHeight: rect.height+'px',
        })
      }
    }).exec();
  },

  // 弹框消失
  tapDialogButton: function (e) {
    this.setData({
      showOneButtonDialog: false
    });
  }, 

  // 开门
  openDool: function (e) {
    let that = this;

    //点击之后3秒之内不能点击
    that.setData({
      openPowerClick: false
    });

    if (that.data.openPowerClick == false) {
      setTimeout(function () {
        that.setData({
          openPowerClick: true
        });
      }, 3000);
    }

    var bluetoothName = that.data.bluetoothName;
    var sn = that.data.sn;
    var secret = that.data.secret;
    that.setData({ status: 'NONE' });
    wx.showLoading({
      title: '正在开门。。。',
    });
    //搜索当前门锁蓝牙
    var bleSdk = blePlugin.initBleSdk({
      debug: true, //是否打开调试
      retryCount: 0, //操作设备失败的重试次数
      connectionTimeout: 30, //尝试与设备建立连接的超时时间
    });
    var bluetoothRssiInfo = "{\"" + bluetoothName + "\":{\"max\":99,\"min\":1}}";
    var bluetoothRssi = JSON.parse(bluetoothRssiInfo)
    var r = bleSdk.startTask(
      ['' + bluetoothName + ''],
      bluetoothRssi, [{
        "sn": sn,
        bluetoothName: bluetoothName,
        commandKey: secret,
        lastLogTimestamp: 1540294526000
      }],
      '01',
      null, {
        "controlPara": 0x00,
        "fixDeviceRtc": function(random, sn, func) {
          console.warn(random);
          console.warn(sn)
          func(null, null)

        },
        "stepFunc": function(step) {
          if (step != 0) {
            that.setData({
              number: (step - 1) * 20
            });
          }
          console.error("步骤：" + step)
        },
        "uploadLog": function(logData) {
          console.warn(logData);
        }
      },
      (obj) => {
        that.feedbackResults(obj, that);
      },
      function() {
        return true;
      }
    )
  },
  feedbackResults: function(obj) {
    console.log('obj', obj);
    wx.hideLoading();
    let that = this;
    if (obj.code == 0) {
      that.setData({ status: 'SUCCESS' });
      wx.showToast({
        title: '开门成功',
        icon: 'none',
        duration: 2000
      });
      if (obj.data.a) {
        setTimeout(() => {
          wx.hideLoading();
          that.bindBattery(obj.data.a);
        }, 1500)
      }

    } else if (obj.code == 1) {
      console.log('啦啦啦');
      that.setData({ status: 'FAILDE' });
      wx.showToast({
        title: '距离过远，未搜索到设备',
        icon: 'none',
        duration: 2000
      })
    } else {
      console.log('yayayya')
      that.setData({ status: 'FAILDE' });
      wx.showToast({
        title: obj.msg,
        icon: 'none',
        duration: 2000
      })
    }

  },

  bindBattery: function(data) {
    let that = this;
    console.log(data, 3334)
    var voltage = that.getBatteryLevel(data);
    var battery = (voltage / (2500 * 4)).toFixed(2) * 100;
    console.log('电压值a为:' + battery);
    // 上传开门日志
    let date = {
      status: that.data.status,
      deviceLock: {
        deviceName: that.data.bluetoothName,
        sn: that.data.sn,
        voltage: voltage,
        battery: battery,
      }
    };
    console.log(date, 2221);
    utils.requestFun('/room/lock/use/record/'+that.data.unlockRecordId, ' ', ' ', date, 'POST', function(res) {

    })
  },
  getBatteryLevel: function(data) {
    var arrs = data.split(" ");
    if (arrs.length < 4) {
      return -1;
    }
    return parseInt(arrs[3] + arrs[2], 16);
  },

  // 初始化获取房间号
  getRoomDetail: function () {
    let that = this;
    utils.requestFun('/order/'+that.data.id, ' ', ' ', ' ', 'GET', function (res) {
      console.log(121212, res.data);
      that.setData({
        'detail.roomNo': res.data.data.roomName,
        'detail.roomId': res.data.data.roomId
      })
    })
  },

  /**, 
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHeaderHeight(0);
    let that = this;
    let obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    let lastArray = obj.dateTimeArray.pop();
    let lastTime = obj.dateTime.pop();
    
    let startTime = JSON.parse( JSON.stringify(obj.dateTime));
    startTime[3] = 0;
    startTime[4] = 0;
    that.setData({
      startTime: startTime,
      endTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray
    });
    console.log(options)
    that.setData({ id: options.id, 'detail.roomNo': options.roomNo, 'detail.roomId': options.roomId });
    that.getDoolInfo();
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
  onReachBottom: function (e) {
    console.log('到底啦！！', e)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})