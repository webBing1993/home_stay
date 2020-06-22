// pages/logon/index.js
import utils from '../../utils/util.js';

const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight,
    zm: '',   // 正面
    fm: '',   // 反面
    loading: false,
    id: null,
  },

  /**
   * 事件
   */
  // 拍照
  touchphoto: function (e) {
    var that = this;
    var no = e.currentTarget.id;
    if (no == "1") {
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
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
                  zm:JSON.parse(res.data).data
                })
              }
            }
          });
        }
      })
    } else {
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths;
          console.log(" wx.getStorageSync('xAuthToken')", wx.getStorageSync('xAuthToken'));
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
                  fm:JSON.parse(res.data).data
                })
              }
            }
          });
        }
      })
    }
  },

  // 提交认证
  logon_in: function (e) {
    console.log(e.detail.value);
    let that = this;
    if (e.detail.value.name === '') {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      });
      return
    }
    if (e.detail.value.idcard === '') {
      wx.showToast({
        title: '请输入身份证号',
        icon: 'none',
        duration: 2000
      });
      return
    }
    if (e.detail.value.idcard.length != 18) {
      wx.showToast({
        title: '请输入正确的身份证号码',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if (!utils.checkIdCard(e.detail.value.idcard)) {
      wx.showToast({
        title: '请输入正确的身份证号码',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (that.data.zm === '') {
      wx.showToast({
        title: '请拍摄身份证人像面',
        icon: 'none',
        duration: 2000
      });
      return
    }
    if (that.data.fm === '') {
      wx.showToast({
        title: '请拍摄身份证国徽面',
        icon: 'none',
        duration: 2000
      });
      return
    }
    that.setData({
      loading: true
    });
    
    let data = {
      realName: e.detail.value.name,
      id: that.data.id,
      phoneNumber: e.detail.value.idcard,
      idcardImgObverse: that.data.zm,
      idcardImgReverse: that.data.fm
    };
    console.log(data);
    utils.requestFun("/provider/user/audit/apply", ' ', ' ', data, 'PUT', function (msg) {
      console.log(msg);
      //注册房东 直接跳转至新增房源
      // wx.reLaunch({
      //   url: '../index/index'
      // })
      wx.reLaunch({
        url: '../installDetail/register'
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options,778);
    this.setData({ id: options.id });
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
    //wx.hideHomeButton();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      loading: false
    })
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