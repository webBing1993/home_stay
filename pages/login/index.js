// login.js
// 获取应用实例
const app = getApp();
import utils from '../../utils/util.js';

Page({
  data: {
    disabled: true,       // 获取验证码倒计时不可点击了
    timeOut: true,        // 倒计时结束，button text为重新获取
    text: '获取验证码',
    time: null,           // 倒计时起始时间
    phone: '',            // 手机号
    code: '',             // 验证码
    loading: false,
    isCode: null,
    isPhoneInput: false,   // 判断是否是自动获取了手机号
  },

  // 事件处理函数

  // 获取用户手机号
  getPhoneNumber (e) {
    let that = this;
    wx.login({
      success: res => {
        console.log(res, 333);
        let isCode = res.code;
        that.setData({ isCode: isCode });
        console.log(e);
        console.log(e.detail.errMsg);
        console.log(e.detail.iv);
        console.log(e.detail.encryptedData);
        wx.setStorageSync('iv', e.detail.iv);
        wx.setStorageSync('encodeData', e.detail.encryptedData);
        let data = {
          iv: e.detail.iv,
          appId: wx.getStorageSync('app_id'),
          jscode: that.data.isCode,  // getApp().globalData.isCode,
          encodeData: e.detail.encryptedData
        };
        if (e.detail.iv) {
          console.log(data)
          utils.requestFun('/auth/wx/phoneNumber/login', '', '', data, 'POST', function(res) {
            console.log(res, '成功了');
            if(res.header['X-auth-token'] && res.header['X-auth-token'] != undefined) {
              wx.setStorageSync('xAuthToken', res.header['X-auth-token']);
            }
            utils.requestFun("/auth/info", '', '', '', 'GET', function (msg) {
              console.log(msg.data, 221);
              wx.setStorage({
                key: "phone",
                data: msg.data.data.account
              });
              if(msg.data.data.auditStatus && msg.data.data.auditStatus == 'PENDING' ) {
                console.log(333222, msg.data.data.userId)
                wx.navigateTo({
                  url: '/pages/logon/index?id='+msg.data.data.userId
                });
              }else {
                wx.redirectTo({
                  url: '/pages/index/index',
                })
              }
            });
          })
        }else {
          that.setData({
            isPhoneInput: true
          })
        }
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
   
  },

  // 手机号获取
  bindKeyInput: function (e) {
    let disabled = false;
    if (e.detail.value.length >= 11) {
      disabled = false;  // 这是为了满足点击获取验证码条件
    }else {
      disabled = true;
    }
    this.setData({
      phone: e.detail.value,
      disabled: disabled
    })
  },

  // 获取验证码
  getCode: function () {
    let that = this;
    let reg = 11 && /^((13|14|15|16|17|18|19)[0-9]{1}\d{8})$/;
    if(!reg.test(this.data.phone)){
      wx.showToast({
        title: '手机号格式不对',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    let data = {
      phoneNumber: this.data.phone
    };
    that.setData({ disabled: !this.data.disabled, })
    utils.requestFun("/auth/sms", ' ', ' ', data, 'POST', function (msg) {
      console.log(msg);
      that.setData({
        time: 120,
        timeOut: false
      });
      that.timeout();
    });

  },

  // 验证码获取
  bindKeyCode: function (e) {
    this.setData({
      code: e.detail.value
    })
  },

  // 倒计时
  timeout: function () {
    let time = this.data.time;
    let timeOut = this.data.timeOut;
    let text = '';
    if (time <= 0) {
      text = '重新获取';
      timeOut = !timeOut;
    }else {
      time--;
      setTimeout(this.timeout, 1000);
    }
    this.setData({
      time: time,
      timeOut: timeOut,
      text: text,
      disabled: !this.data.disabled
    });
  },

  // 登录
  login_in: function (e) {
    console.log(e.detail.value);
    let reg = 11 && /^((13|14|15|16|17|18|19)[0-9]{1}\d{8})$/;
    if (e.detail.value.phone.length == 0) {
      wx.showToast({
        title: '请输入11位手机号',
        icon: 'none',
        duration: 2000
      });
      return
    }else if (e.detail.value.phone.length != 11 || !reg.test(e.detail.value.phone)) {
      wx.showToast({
        title: '手机号格式不对',
        icon: 'none',
        duration: 2000
      });
      return
    }
    if (e.detail.value.code.length != 6) {
      wx.showToast({
        title: '请输入6位验证码',
        icon: 'none',
        duration: 2000
      });
      return
    }
    this.setData({
      // loading: true
    });
    let that = this;
    wx.login({
      success: res => {
        console.log(res, 333);
        let isCode = res.code;
        that.setData({ isCode: isCode });
        // 接口需要做个判断是否是注册过的账号，未注册的账号需要直接跳转到注册页面
        let data = {
          appId: wx.getStorageSync('app_id'),
          jscode: res.code,
          smsCode: this.data.code,
          phoneNumber: this.data.phone
        };
        console.log(data,556);
        utils.requestFun("/auth/sms/login", '', '', data, 'POST', function (res1) {
          console.log(res1,3222);
          wx.setStorageSync('xAuthToken', res1.header['X-auth-token']);
          utils.requestFun("/auth/info", '', '', '', 'GET', function (msg) {
            console.log(msg, 221);
            if(msg.data.auditStatus && msg.data.auditStatus != 'PENDING' ) {
              wx.navigateTo({
                url: '../logon/index/id='+msg.data.userId
              });
            }else {
              wx.redirectTo({
                url: '/pages/index/index',
              })
            }
          })
        });
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    
    wx.setStorage({
      key: "phone",
      data: e.detail.value.phone
    });
    
  },

  onLoad: function () {
    let that = this;
    wx.removeStorageSync('xAutoToken')
    
    // let isPhoneInput = that.isCode ? true : false;
    // this.setData({
    //   isPhoneInput: isPhoneInput
    // });
  },

  onHide: function () {
    this.setData({
      loading: false,
      code: ''
    });
  },
  
  onShow: function () {
    wx.hideHomeButton();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
})
