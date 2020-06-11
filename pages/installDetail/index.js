// pages/installDetail/index.js
const app = getApp();
import utils from '../../utils/util';
const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;

var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {
      houseName: '',
      startTime: '15:00',
      endTime: '12:00',
      police: '',
      size: '',
      roomNum: '',
      longitude: '',    // 经度
      latitude: '',    // 纬度
      address: '',
      addressDetail: '',
      groupImageList: [],
      name: '',
      phone: '',
      keeperPhone: '',
      mainImage: '../../utils/images/tianjiafengmianzhaopian.png',
      roomsList: [],
      notice: '',
      contactName: '',
      amount: '',
      contactPhone: '',
    },
    region: ['吴兴区'],
    policeList: [],   // 所属辖区
    loading: false,
    editAdd: null,       // 0表示新增，1表示拒绝，2表示审核通过，3表示审核中，4表示已撤销
    status: null,        // 0审核中，1审核不通过，2审核通过, 3提交失败
    status_: true,   // false下线 true上线
    activeAction: 0,        // tab切换
    navBarHeight,
    headerHeight: null,
    dialogShow: false,
    dialogText: null,
    dialogType: 1,        // 1表示下线提示，2表示撤销提示
    buttons: [{text: '取消'}, {text: '确定'}],
    id: null,
    showTemplate: false,      // 显示模板
  },

  /**
   * 
   * 事件
   */
  // 获取header height
  getHeaderHeight: function ()  {
    let that = this;
    //创建节点选择器
    var query = wx.createSelectorQuery();
    //选择id
    query.select('.houseInstall').boundingClientRect(function (rect) {
      console.log(111, rect);
      let heigth = 0;
      if (rect != null) {
        heigth = rect.height;
      }
      that.setData({
        headerHeight: heigth
      })
    }).exec();
  },

  // tab切换
  tabChange: function (e) {
    var id = e.currentTarget.id;
    this.setData({
      activeAction: id,
    })
  },

  // 住离时间选择
  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    let id = e.currentTarget.id;
    if (id == 1) {
      this.setData({
        'detail.startTime': e.detail.value
      })
    }else {
      this.setData({
        'detail.endTime': e.detail.value
      })
    }
  },

  // 选择
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
  },

  // 聚焦
  addressIstrue: function(e) {
    if (this.data.detail.address === '') {
      wx.showModal({
        title: '提示',
        content: '请先选择区县',
        showCancel: false
      });
    }
  },

  // 输入赋值
  inputVal: function (e) {
    let id = e.currentTarget.dataset.id;
    let that = this;
    if (id == 1) {
      that.setData({
        'detail.name': e.detail.value
      })
    }else if (id == 2) {
      that.setData({
        'detail.size': e.detail.value
      })
    }else if (id == 3) {
      that.setData({
        'detail.amount': e.detail.value
      })
    }else if (id == 4) {
      that.setData({
        'detail.addressDetail': e.detail.value
      })
    }else if (id == 5) {
      that.setData({
        'detail.contactName': e.detail.value
      })
    }else if (id == 6) {
      that.setData({
        'detail.contactPhone': e.detail.value
      })
    }else if (id == 7) {
      that.setData({
        'detail.keeperPhone': e.detail.value
      })
    }else if (id == 8) {
      let index = e.currentTarget.id;
      console.log(that.data.detail);
      let roomsList = that.data.detail.roomsList;
      roomsList.splice(index, 1, e.detail.value);
      console.log(roomsList);
      that.setData({
        'detail.roomsList': roomsList
      })
    }else if (id == 9) {
      that.setData({
        'detail.notice': e.detail.value
      })
    }
  },

  //通过地理位置获取经纬度
  autoGetLocation(e) {
    console.log(e);
    let that = this;
    qqmapsdk.geocoder({
      address: '浙江省湖州市'+ that.data.detail.addressDetail + e.detail.value,
      success: function(res) {
       
      },
      complete: res => {
        console.log(1212, res)
        if (res.status == 0) {
          console.log(res.result.location);
          that.setData({
            'detail.longitude': res.result.location.lng,
            'detail.latitude': res.result.location.lat,
          })
        }else {
          wx.showModal({
            title: '提示',
            content: res.message,
            showCancel: false
          });
          return
        }
      }
    })
  },
 

  // 选择区
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      'detail.address': this.data.region[e.detail.value]
    })
  },

   // 单张图片选择
   chooseImage: function (e) {
     let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        wx.uploadFile({
          url: getApp().globalData.urlOld + '/common/temp/pic', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          header: { "Content-Type": "application/json" , "X-auth-token" : wx.getStorageSync('xAuthToken')},
          success: function(res){
            console.log(res);
            if (res.statusCode != 200) { 
              wx.showModal({
                title: '提示',
                content: '上传失败',
                showCancel: false
              })
              return;
            }else {
              console.log(JSON.parse(res.data),4444);
              that.setData({
                'detail.mainImage':JSON.parse(res.data).data
              })
            }
          }
        });
      }
    })
  },

  // 多张选择图片
  choosePic: function (e) {
    console.log(112211);
    let that = this;
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        console.log(112211, res);
        tempFilePaths.forEach(item => {
          console.log(item);
          wx.uploadFile({
            url: getApp().globalData.urlOld + '/common/temp/pic', 
            filePath: item,
            name: 'file',
            header: { "Content-Type": "application/json" , "X-auth-token" : wx.getStorageSync('xAuthToken')},
            success: function(res){
              console.log(232323, res);
              let da = JSON.parse(res.data);
              if (da.errcode != 0) { 
                wx.showModal({
                  title: '提示',
                  content: '上传失败',
                  showCancel: false
                })
                return;
              }else {
                let imgList = that.data.detail.groupImageList;
                imgList.push(JSON.parse(res.data).data);
                if (imgList.length > 3) {
                  imgList.splice(3, imgList.length-3);
                }
                that.setData({
                  'detail.groupImageList': imgList
                })
              }
            }
          });
        })
      }
    })
  },

  // 删除图片
  deleteImage(event) {
    //获取数据绑定的data-id的数据
    const nowIndex = event.currentTarget.dataset.id;
    let images = this.data.detail.groupImageList;
    images.splice(nowIndex, 1);
    this.setData({
      'detail.groupImageList': images
    })
  },

  // 下线
  downLine: function (e) {
    this.setData({
      dialogShow: true,
      dialogType: 1,
      dialogText: '是否将此房源下线'
    })
  },

  // 上线
  onLine: function (e) {
    let that = this;
    utils.requestFun('/roomGroup/'+that.data.id+'/online', ' ', ' ', ' ', 'PUT', function(e) {
      console.log(e);
      wx.showToast({
        title: '成功上线',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        let pages = getCurrentPages(); //页面栈
        let beforePage = pages[pages.length - 2];
        wx.navigateBack({
          delta: 1,    // 返回上一级页面。
          success: function() {
            if (beforePage.route == 'pages/install/index') {
              beforePage.onLoad() //这个函数式调用接口的函数
            }
          }
        })
      }, 1500);
    })
  },

  // 提交
  submit: function (e) {
    console.log(e); 
    let that = this;
    if (that.data.detail.name === '') {
      wx.showModal({
        title: '提示',
        content: '请输入房源名称',
        showCancel: false
      })
      return;
    }
    console.log(that.data.detail.police, 555);
    if(that.data.detail.police === '') {
      wx.showModal({
        title: '提示',
        content: '请选择所属派出所',
        showCancel: false
      })
      return;
    }
    if (that.data.detail.size === '') {
      wx.showModal({
        title: '提示',
        content: '请输入建筑面积',
        showCancel: false
      })
      return;
    }
    if (that.data.detail.amount === '') {
      wx.showModal({
        title: '提示',
        content: '请输入房间数量',
        showCancel: false
      })
      return;
    }
    if (that.data.detail.address === '') {
      wx.showModal({
        title: '提示',
        content: '请选择区县',
        showCancel: false
      })
      return;
    }
    if (that.data.detail.addressDetail === '') {
      wx.showModal({
        title: '提示',
        content: '请输入详细地址',
        showCancel: false
      })
      return;
    }
    if (that.data.detail.groupImageList.length == 0) {
      wx.showModal({
        title: '提示',
        content: '请上传房源照片',
        showCancel: false
      })
      return;
    }
    if (that.data.detail.contactName === '') {
      wx.showModal({
        title: '提示',
        content: '请输入负责人姓名',
        showCancel: false
      })
      return;
    }
    if (that.data.detail.contactPhone === '') {
      wx.showModal({
        title: '提示',
        content: '请输入负责人电话',
        showCancel: false
      })
      return;
    }
    
    let data = {
      address: '浙江省#湖州市#'+that.data.detail.address,
      addressDetail: that.data.detail.addressDetail,
      contactName: that.data.detail.contactName,
      contactPhone: that.data.detail.contactPhone,
      groupImage: that.data.detail.groupImageList.join(","),
      amount: that.data.detail.amount,
      size: that.data.detail.size,
      name: that.data.detail.name,
      longitude: that.data.detail.longitude,
      latitude: that.data.detail.latitude,
      inspectCode: that.data.policeList[that.data.detail.police].code
    };
    
    if (that.data.id) {
      data.id = that.data.id;
    }
    
    this.setData({
      loading: true
    });
    setTimeout(() => {
      that.setData({
        loading: false
      });
    }, 30000)
    if (e.currentTarget.id) {
      console.log('that.data.detail', that.data.detail);
      if (that.data.detail.keeperPhone === '' || that.data.detail.keeperPhone == null) {
        wx.showModal({
          title: '提示',
          content: '请输入管家电话',
          showCancel: false
        })
        return;
      }
      if (that.data.detail.notice === '' || that.data.detail.notice == null) {
        wx.showModal({
          title: '提示',
          content: '请输入入住须知',
          showCancel: false
        })
        return;
      }
      if (that.data.detail.mainImage === '' || that.data.detail.mainImage == '../../utils/images/tianjiafengmianzhaopian.png') {
        wx.showModal({
          title: '提示',
          content: '请上传封面图片',
          showCancel: false
        })
        return;
      }
      if (that.data.detail.roomsList && that.data.detail.roomsList.length != 0) {
        let idx = 0;
        that.data.detail.roomsList.forEach((item, index) => {
          if(item == '') {
            idx++;
          }
        });
        
        if (idx == that.data.detail.roomsList.length) {
          wx.showModal({
            title: '提示',
            content: '房间号至少填一间',
            showCancel: false
          })
          return;
        }
      }
      console.log(data);
      let data1 = {};
      data1.rooms = [];
      if ( that.data.detail.roomsList && that.data.detail.roomsList.length != 0) {
        that.data.detail.roomsList.forEach((item, index) => {
          let obj = {};
          obj.name = item;
          if (that.data.detail.rooms != null && that.data.detail.rooms.length != 0) {
            that.data.detail.rooms.forEach((i, ix) => {
              if (item != '') {
                obj.name = item;
                if (index == ix) {
                  obj.id = i.id;
                }
              }
            });
          }
          if(obj.name !== '' ) {
            data1.rooms.push(obj);
          }
          
        });
      }
      
      data1.keeperPhone = that.data.detail.keeperPhone;
      data1.mainImage = that.data.detail.mainImage;
      data1.notice = that.data.detail.notice;
      data1.inTime = that.data.detail.startTime;
      data1.outTime = that.data.detail.endTime;
      console.log('data1', data1)
      utils.requestFun('/roomGroup/'+that.data.id+'/fill', ' ', ' ', data1, 'PUT', function(res) {
        console.log(res, 65556);
        wx.showToast({
          title: '房源信息补充成功',
          icon: 'none',
          duration: 2000
        })
        that.setData({
          loading: false
        });
        setTimeout(() => {
          let pages = getCurrentPages(); //页面栈
          let beforePage = pages[pages.length - 2];
          wx.navigateBack({
            delta: 1,    // 返回上一级页面。
            success: function() {
              console.log('beforePage', beforePage)
              if (beforePage.route == 'pages/install/index') {
                beforePage.onLoad() //这个函数式调用接口的函数
              }
            }
          })
        }, 1500);
      });
    }else {
      console.log('data', data);
      utils.requestFun('/roomGroup/apply', ' ', ' ', data, 'POST', function(res) {
        console.log(res, 65556);
        wx.showToast({
          title: '房源申请成功',
          icon: 'none',
          duration: 2000
        })
        that.setData({
          loading: false
        });
        setTimeout(() => {
          let pages = getCurrentPages(); //页面栈
          let beforePage = pages[pages.length - 2];
          wx.navigateBack({
            delta: 1,    // 返回上一级页面。
            success: function() {
              console.log('beforePage', beforePage)
              if (beforePage.route == 'pages/install/index') {
                beforePage.onLoad() //这个函数式调用接口的函数
              }
            }
          })
        }, 1500);
      });
    }
  },

  // 重新提交
  resetSubmit: function (e) {
    this.setData({
      editAdd: 0
    })
  },

  // 撤销
  cancelBtn: function (e) {
    this.setData({
      dialogShow: true,
      dialogType: 2,
      dialogText: '是否将此房源撤销'
    })
  },

  // 弹框
  tapDialogButton: function (e) {
    console.log(e);
    let index = e.detail.index;   // 0取消，1确定
    let that = this;
    
    if (that.data.dialogType == 2 && index == 1) {
      utils.requestFun('/roomGroup/'+that.data.id+'/apply/cancel', ' ', ' ', ' ', 'PUT', function(e) {
        console.log(e);
        wx.showToast({
          title: '撤销成功',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          let pages = getCurrentPages(); //页面栈
          let beforePage = pages[pages.length - 2];
          wx.navigateBack({
            delta: 1,    // 返回上一级页面。
            success: function() {
              if (beforePage.route == 'pages/install/index') {
                beforePage.onLoad() //这个函数式调用接口的函数
              }
            }
          })
        }, 1500);
      })
    }else if (that.data.dialogType == 1 && index == 1) {
      console.log(that.data.id)
      utils.requestFun('/roomGroup/'+that.data.id+'/offline', ' ', ' ', ' ', 'PUT', function(e) {
        console.log(e);
        wx.showToast({
          title: '成功下线',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          let pages = getCurrentPages(); //页面栈
          let beforePage = pages[pages.length - 2];
          wx.navigateBack({
            delta: 1,    // 返回上一级页面。
            success: function() {
              if (beforePage.route == 'pages/install/index') {
                beforePage.onLoad() //这个函数式调用接口的函数
              }
            }
          })
        }, 1500);
      })
    }

    that.setData({
      dialogShow: false
    })
  },

  // 获取房源信息
  getDetail: function () {
    let that = this;
    let data = {
      needRoom: true,
    };
    utils.requestFun('/roomGroup/'+that.data.id, ' ', ' ', data, 'GET', function(res) {
      console.log(111122211, res.data);
      let data = res.data.data;
      let editAdd = null, status = null;
      let activeAction = 0;
      if (data.auditStatus == 'REFUSED') {
        editAdd = 1;
        status = 1;
        activeAction = 1;
      }else if (data.auditStatus == 'FAILED') {
        editAdd = 1;
        status = 3;
        activeAction = 1;
      }else if (data.auditStatus == 'PASS') {
        editAdd = 2;
        status = 2;
        activeAction = 0;
      }else if (data.auditStatus == 'PENDING') {
        status = 0;
        editAdd = 3
        activeAction = 1;
      }else {
        editAdd = 4
      }
      let status_ = data.status == 'DISABLED' ? true : false;
      let rooms = [];
      for(var i = 0; i < data.amount; i++) {
        rooms.push('');
        if (data.rooms) {
          data.rooms.forEach((item, index) => {
            if (index == i) {
              rooms.splice(i, 1, item.name)
            }
          });
        }
      }
      if (data.mainImage == null) {
        data.mainImage = '../../utils/images/tianjiafengmianzhaopian.png';
      }
      console.log('rooms', rooms)
      data.roomsList = [];
      data.roomsList = rooms;
      data.police = '';
      that.data.policeList.forEach((item, index) => {
        if (item.code == data.inspectCode) {
          data.police = index
        }
      })
      data.updateTime = utils.datetimeparse(data.updateTime, 'yy/MM/dd hh:mm');
      data.address = data.address ? data.address.split('#')[2] : '';
      data.startTime = data.inTime ? data.inTime : '15:00';
      data.endTime = data.outTime ? data.outTime : '12:00';
      data.groupImageList = data.groupImage ? data.groupImage.split(',') : [];
      console.log(rooms);
      that.setData({
        editAdd: editAdd,
        status: status,
        status_: status_,
        activeAction: activeAction,
        detail: data,
        showTemplate: true
      });
      that.getHeaderHeight();
    });
    setTimeout(() => {
      that.setData({ showTemplate: true })
    }, 3000);
  },

  // 辖区选择
  bindPoliceChange: function(e) {
    console.log(e);
    this.setData({
      'detail.police': e.detail.value
    })
  },

  // 获取所属辖区列表
  getPoliceList: function() {
    console.log(333222);
    let that = this;
    utils.requestFun('/common/dict/police/station', ' ', ' ', ' ', 'GET', function(res) {
      console.log(332, res.data);
      that.setData({
        policeList: res.data.data,
        'detail.police': ''
      });
      if(that.data.id) {
        that.getDetail();
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: '65MBZ-DFO2O-IIVWZ-SLG5I-7B5AZ-V7FVB' //这里自己的secret秘钥进行填充
    });
    this.getPoliceList();
    if(options.id) {
      this.setData({ id: options.id });
    }else {
      this.setData({ editAdd: 0, showTemplate: true });
      this.getHeaderHeight();
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