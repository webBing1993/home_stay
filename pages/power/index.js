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
    id: null,
    currentPermission: []
  },

  /**
   * 
   * 事件绑定
   */
  oneTree: function(e) {
    console.log(e);
    console.info("index:" + e.target.dataset.index);
    let arr = e.detail.value;
    console.log('arr', arr);
    let that = this;
    let nodes = that.data.nodes;
    nodes.forEach((item, index) => {
      // item.checked = false;
      if (item.rooms) {
        item.rooms.forEach(j => {
          if (j.checked && j.roomGroupId != e.target.dataset.index) {

          } else {
            item.checked = false;
            j.checked = false;
          }
        })
      }
      if (arr.length != 0) {
        arr.forEach(i => {
          if (item.roomGroupId == i) {
            item.checked = !item.checked;
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
    that.setData({
      nodes: nodes
    })
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
            if (index_ == item.rooms.length) {
              item.checked = true;
            } else {
              item.checked = false;
            }
          }
        })
      }
    });
    that.setData({
      nodes: nodes
    })
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
    that.setData({
      nodes: nodes
    })
  },

  // 保存事件
  savePower: function() {
    let that = this;
    that.setData({
      loading: true
    });
    setTimeout(() => {
      that.setData({
        loading: false
      });
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
        for (var i = 0; i < item.rooms.length; i++) {
          let obj_ = {};
          if (item.rooms[i].checked) {
            obj_.roomId = item.rooms[i].roomId;
            obj.rooms.push(obj_);
            console.log(obj_)
          }
        }
        if (obj.rooms.length != 0) {
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
          delta: 1, // 返回上一级页面。
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
        } else {
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
    utils.requestFun('/provider/user/' + that.data.id + '/info', ' ', ' ', ' ', 'GET', function(res) {
      console.log(44333, res.data.data);
      if (res.data.data.roomGroups && res.data.data.roomGroups.length != 0) {
        // 这需要进行数据匹配工作，当前员工所掌握的房间，房源开门权限
        let dataList = that.data.nodes;
        let dataList_ = res.data.data.roomGroups;
        dataList.forEach((item, index) => {
          let index_ = 0;
          dataList_.forEach((i, idx) => {
            if (item.roomGroupId == i.roomGroupId) {
              if (item.rooms) {
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
                    } else {
                      item.checked = false;
                    }
                  }
                })
              }
            }
          })
        });
        that.setData({
          nodes: dataList
        })
      }
    })
  },
  //获取用户权限
  getPermissionByUserId: function() {
    let that = this;
    utils.requestFun('/authority/user/' + that.data.id + '/permission', ' ', ' ', ' ', 'GET', function(res) {
      that.setData({
        currentPermission: res.data.data.data
      });
      that.getPermission();
    });
  },
  //获取当前民宿所有权限
  getPermission: function() {
    let that = this;
    var nodeList = [];
    utils.requestFun('/authority/provider/permission', ' ', ' ', ' ', 'GET', function(res) {
      for (var i = 0; i < res.data.data.length; i++) {
        var item = res.data.data[i];
        if (item.parentId == '0' && item.name != '员工管理' && item.name != '房源管理') { //一级目录  员工管理和房源管理不显示
          nodeList.push({
            id: item.id,
            name: item.name,
            isClose: true,
            checked:that.getNodeChecked(item.id),
            child: []
          })
        }
      }
      for (var i = 0; i < nodeList.length; i++) {
        var node = nodeList[i];
        for (var j = 0; j < res.data.data.length; j++) {
          var item = res.data.data[j];
          if (item.parentId == node.id) { //二级目录
            nodeList[i].child.push({
              id: item.id,
              name: item.name,
              isClose: true,
              checked: that.getNodeChecked(item.id),
              child: []
            })
          }
        }
      }
      that.setData({
        nodes: nodeList
      });
    });
  },

  changeOpenClose: function(e) {
    console.log(11112, e);
    let id = e.currentTarget.dataset.id;
    let that = this;
    let nodes = that.data.nodes;
    nodes.forEach((item, index) => {
      if (item.id == id) {
        item.isClose = !item.isClose;
      }
    });
    that.setData({
      nodes: nodes
    })
  },
  getNodeChecked: function(id) {
    let that = this;
    if (that.data.currentPermission!=null){
      for (var i = 0; i < that.data.currentPermission.length; i++) {
        if (id == that.data.currentPermission[i].id) {
          return true;
        }
      }
    }
    return false;
  },
  changeChecked: function(e) {
    let id = e.currentTarget.dataset.id;
    let that = this;
    let nodes = that.data.nodes;
    var isMatching = false;
    for (var j = 0; j < that.data.nodes.length; j++) {
      if (that.data.nodes[j].id == id) {
        that.data.nodes[j].checked = !that.data.nodes[j].checked;
        for (var i = 0; i < that.data.nodes[j].child.length; i++) {
          that.data.nodes[j].child[i].checked = that.data.nodes[j].checked;
        }
        isMatching = true;
        break
      }
    }
    if (!isMatching) { //未匹配上 查找子目录
      for (var i = 0; i < that.data.nodes.length; i++) {
        for (var j = 0; j < that.data.nodes[i].child.length; j++) {
          if (that.data.nodes[i].child[j].id == id) {
            that.data.nodes[i].child[j].checked = !that.data.nodes[i].child[j].checked;
            that.data.nodes[i].checked = that.data.nodes[i].child[j].checked;
            break;
          }
        }
      }
      //判断子目录是否有选中
      for (var i = 0; i < that.data.nodes.length; i++) {
        for (var j = 0; j < that.data.nodes[i].child.length; j++) {
          if (that.data.nodes[i].child[j].checked) {
            that.data.nodes[i].checked = true;
            break;
          }
        }
      }
    }
    that.setData({
      nodes: nodes
    })
  },
  savePermission: function() {
    var that = this;
    var data = [];
    for (var i = 0; i < that.data.nodes.length; i++) {
      if (that.data.nodes[i].checked) {
        data.push(that.data.nodes[i].id);
        for (var j = 0; j < that.data.nodes[i].child.length; j++) {
          if (that.data.nodes[i].child[j].checked) {
            data.push(that.data.nodes[i].child[j].id);
          }
        }
      }
    }
    utils.requestFun('/authority/user/' + that.data.id + '/permission', ' ', ' ', data, 'POST', function(res) {
      wx.navigateBack();
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      id: options.id
    });
    //获取当前用户权限
    this.getPermissionByUserId();
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