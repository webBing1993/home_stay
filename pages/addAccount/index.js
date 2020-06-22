// pages/addAccount/index.js
const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;
import utils from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialogShow: false,
    buttons: [{
      text: '取消'
    }, {
      text: '确定'
    }],
    editAdd: 1, // 0新增，1编辑
    disabled: true, // 获取验证码倒计时不可点击了
    timeOut: true, // 倒计时结束，button text为重新获取
    text: '获取验证码',
    time: null, // 倒计时起始时间
    phone: '', // 手机号
    code: '', // 验证码
    houseList: [{
        id: 232323,
        checked: true,
        houseName: '房源名称1'
      },
      {
        id: 232323,
        checked: false,
        houseName: '房源名称1'
      },
      {
        id: 232323,
        checked: true,
        houseName: '房源名称1'
      }
    ],
    loading: false,
    navBarHeight,
    id: null,
  },

  // 手机号input
  bindKeyInput: function(e) {
    let disabled = false;
    if (e.detail.value.length >= 11) {
      disabled = false; // 这是为了满足点击获取验证码条件
    } else {
      disabled = true;
    }
    this.setData({
      phone: e.detail.value,
      disabled: disabled
    })
  },

  // 获取验证码
  getCode: function() {
    let that = this;
    let reg = 11 && /^((13|14|15|16|17|18|19)[0-9]{1}\d{8})$/;
    if (!reg.test(this.data.phone)) {
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
    that.setData({
      disabled: !this.data.disabled,
    })
    utils.requestFun("/auth/sms", ' ', ' ', data, 'POST', function(msg) {
      console.log(msg);
      that.setData({
        time: 60,
        timeOut: false
      });
      that.timeout();
    });
  },

  // 倒计时
  timeout: function() {
    let time = this.data.time;
    let timeOut = this.data.timeOut;
    let text = '';
    if (time <= 0) {
      text = '重新获取';
      timeOut = !timeOut;
    } else {
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

  // 删除
  deleteAccount: function(e) {
    this.setData({
      dialogShow: true
    });
  },

  // 删除弹框事件
  tapDialogButton: function(e) {
    console.log('dialog', e.detail.index)
    let that = this;
    if (e.detail.index == 1) {
      console.log('点击确认按钮啦', '');
      let data = {
        id: that.data.id,
        deleted: true
      };
      utils.requestFun("/provider/user/sub", ' ', ' ', data, 'PUT', function(msg) {
        console.log(msg);
        wx.showToast({
          title: '员工删除成功',
          icon: 'none',
          duration: 2000
        });
        let pages = getCurrentPages(); //页面栈
        let beforePage = pages[pages.length - 2];
        setTimeout(() => {
          wx.navigateBack({
            delta: 1, // 返回上一级页面。
            success: function() {
              beforePage.onLoad()
            }
          });
        }, 1500)
      });
      setTimeout(() => {
        that.setData({
          loading: false
        })
      }, 3000)
    } else {
      console.log('点击取消按钮啦', '')
    }
    this.setData({
      dialogShow: false
    });
  },

  // 保存
  saveBtn: function(e) {
    console.log(e.detail.value);
    let that = this;
    if (e.detail.value.name === '') {
      wx.showModal({
        title: '提示',
        content: '请输入姓名',
        showCancel: false
      });
      return
    }
    if (e.detail.value.phone === '') {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号',
        showCancel: false
      });
      return
    }
    if (e.detail.value.code === '') {
      wx.showModal({
        title: '提示',
        content: '请输入正确的验证码',
        showCancel: false
      });
      return
    }

    that.setData({
      loading: true
    });
    let data = {
      realName: e.detail.value.name,
      phoneNumber: e.detail.value.phone,
      smsCode: e.detail.value.code,
    };
    if (that.data.id) {
      data.id = that.data.id;
      console.log(332, data)
      utils.requestFun("/provider/user/sub", ' ', ' ', data, 'PUT', function(msg) {
        console.log(msg);
        wx.showToast({
          title: '员工修改成功',
          icon: 'none',
          duration: 2000
        });
        let pages = getCurrentPages(); //页面栈
        let beforePage = pages[pages.length - 2];
        setTimeout(() => {
          wx.navigateBack({
            delta: 1, // 返回上一级页面。
            success: function() {
              beforePage.onLoad()
            }
          });
        }, 1500)
      });
      setTimeout(() => {
        that.setData({
          loading: false
        })
      }, 3000)
    } else {
      utils.requestFun("/provider/user/sub", ' ', ' ', data, 'POST', function(msg) {
        console.log(msg);
        wx.showToast({
          title: '员工添加成功',
          icon: 'none',
          duration: 2000
        });
        let pages = getCurrentPages(); //页面栈
        let beforePage = pages[pages.length - 2];
        setTimeout(() => {
          wx.navigateBack({
            delta: 1, // 返回上一级页面。
            success: function() {
              beforePage.onLoad()
            }
          });
        }, 1500)
      });
      //修改权限
      // utils.requestFun("/authority/user/"+1+"/permission", ' ', ' ', data, 'POST', function (res) {

      // })
      // setTimeout(() => {
      //   that.setData({
      //     loading: false
      //   })
      // }, 3000)
    }
  },

  // 获取详情
  getDetail: function() {
    let that = this;
    utils.requestFun('/provider/user/' + that.data.id + '/info', ' ', ' ', ' ', 'GET', function(res) {
      console.log(res.data.data)
      that.setData({
        phone: res.data.data.phoneNumber,
        name: res.data.data.realName,
        disabled: false
      })
    })
  },

 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    if (options.id) {
      that.setData({
        id: options.id,
        editAdd: 1
      });
      that.getDetail();
    } else {
      that.setData({
        editAdd: 0
      })
    }
    //that.getPermission();
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
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
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