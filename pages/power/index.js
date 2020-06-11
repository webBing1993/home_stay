// pages/power/index.js
const navBarHeight = wx.getSystemInfoSync().statusBarHeight + 44;
import utils from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight,
    nodes: [],
    loading: false,
    id: null
  },

  /**
   * 
   * 事件绑定
   */
  oneTree: function (e) {
    console.log(e);
    console.info("index:"+e.target.dataset.index);
    let arr = e.detail.value;
    console.log('arr', arr);
    let that = this;
    let nodes = that.data.nodes;
    nodes.forEach((item, index) => {
      // item.checked = false;
      if (item.rooms) {
        item.rooms.forEach(j => {
          if(j.checked && j.roomGroupId != e.target.dataset.index) {

          }else {
            item.checked = false;
            j.checked = false;
          }
        })
      }
      if (arr.length != 0) {
        arr.forEach(i => {
          if (item.roomGroupId == i) {
            item.checked = !item.checked ;
            if (item.rooms) {
              item.rooms.forEach(j => {
                j.checked = item.checked;
              })
            }
          }
        })
      }
    });
    console.log(nodes);
    that.setData({ nodes: nodes })
  },

  // 二级
  checkboxTwoChange: function(e) {
    let idx = e.currentTarget.id;
    console.log(idx, 554);
    let that = this;
    let nodes = that.data.nodes;
    nodes.forEach((item, index) => {
      let index_ = 0;
      if (item.rooms) {
        item.rooms.forEach(j => {
          if (j.roomId == idx) {
            j.checked = !j.checked;
          }
          if (j.checked) {
            index_++;
            if(index_ == item.rooms.length) {
              item.checked = true;
            }else {
              item.checked = false;
            }
          }
        })
      }
    });
    that.setData({ nodes: nodes })
  },

  // 展开关闭
  changeOpenClose: function(e) {
    console.log(11112, e);
    let id = e.currentTarget.dataset.id;
    let that = this;
    let nodes = that.data.nodes;
    nodes.forEach((item, index) => {
      if (item.roomGroupId == id) {
        item.isClose = !item.isClose;
      }
    });
    that.setData({ nodes: nodes })
  },

  // 保存事件
  savePower: function() {
    let that = this;
    that.setData({ loading: true });
    setTimeout(() => {
      that.setData({ loading: false });
    }, 5000);
    let data = {
      id: that.data.id
    };
    data.roomGroups = [];
    
    that.data.nodes.forEach((item, index) => {
      let obj = {};
      obj.roomGroupId = item.roomGroupId;
      obj.rooms = [];
      if (item.rooms) {
        for(var i = 0; i < item.rooms.length; i++) {
          let obj_ = {};
          if (item.rooms[i].checked) {
            obj_.roomId = item.rooms[i].roomId;
            obj.rooms.push(obj_);
            console.log(obj_)
          }
        }
        if(obj.rooms.length != 0) {
          data.roomGroups.push(obj);
        }
      }
      
    });
    console.log(333, data);
    utils.requestFun('/provider/user/sub', ' ', ' ', data, 'PUT', function(res) {
      wx.showToast({
        title: '权限设置成功',
        icon: 'none',
        duration: 2000
      });
      let pages = getCurrentPages(); //页面栈
      let beforePage = pages[pages.length - 2];
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,    // 返回上一级页面。
          success: function() {
            beforePage.onLoad()
          }
        });
      }, 1500)
    });
  },

  // 获取所有房源树
  getTree: function() {
    let that = this;
    utils.requestFun('/roomGroup/room/lockDevice/tree', ' ', ' ', ' ', 'GET', function(res) {
      console.log(33344, res.data);
      let dataList = res.data.data;
      dataList.forEach((item, index) => {
        if (index == 0) {
          item.checked = false;
          item.isClose = true;
        }else {
          item.checked = false;
          item.isClose = true;
        }
        if (item.rooms) {
          item.rooms.forEach(i => {
            i.checked = false;
          })
        }
      })
      that.setData({
        nodes: res.data.data
      })
      that.getDetail();
    })
  },

  // 获取详情
  getDetail: function() {
    let that = this;
    utils.requestFun('/provider/user/'+that.data.id+'/info', ' ', ' ', ' ', 'GET', function(res) {
      console.log(44333, res.data.data);
      if (res.data.data.roomGroups && res.data.data.roomGroups.length != 0) {
        // 这需要进行数据匹配工作，当前员工所掌握的房间，房源开门权限
        let dataList = that.data.nodes;
        let dataList_ = res.data.data.roomGroups;
        dataList.forEach((item, index) => {
          let index_ = 0;
          dataList_.forEach((i, idx) => {
            if (item.roomGroupId == i.roomGroupId) {
              if(item.rooms) {
                item.rooms.forEach(j => {
                  if (i.rooms) {
                    i.rooms.forEach(p => {
                      if (p.roomId == j.roomId) {
                        j.checked = true;
                      }
                    });
                  }
                  if (j.checked) {
                    index_++;
                    if (index_ == item.rooms.length) {
                      item.checked = true;
                    }else {
                      item.checked = false;
                    }
                  }
                })
              }
            }
          })
        });
        that.setData({ nodes: dataList })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ id: options.id });
    this.getTree();
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