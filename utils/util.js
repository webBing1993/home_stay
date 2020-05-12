const app = getApp();
const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/*
* 参数说明
* url：域名后的数据请求接口
* data：提交的数据
* getPost：get请求还是post请求
* success：callback函数
* pageSize: 每页多少条
* currentPage: 当前页数
**/
function requestFun(url, pageSize, currentPage, data, getPost, success) {
  wx.showLoading({
    title: '加载中',
  });
  
  let urlOld = getApp().globalData.urlOld;   // 域名链接    hotel.fortrun.cn
  let urlNew = '';       // 完整数据请求链接
  let header = '';       // 请求头

  urlNew = urlOld + url;
  console.log('urlNew', urlNew)
  let date = {
    data: JSON.stringify(data),
  }

  if (getPost == 'POST') {
    // header = 'application/x-www-form-urlencoded'
    header = {
      'content-type': 'application/json'
    }
  } else { 
    header = {
      'content-type': 'application/json'
    }
  }
  if(url != '/auth/wx/jscode/login') {
    let value = wx.getStorageSync('xAuthToken');
    console.log('value', value)
    if (value) {
      header['X-auth-token'] = value
    }
  }
  if(currentPage != ' ') {
    header['X-Current-Page'] = currentPage;
    header['X-Page-Size'] = pageSize;
  }

  wx.request({
    url: urlNew,
    data: data,
    header: header,
    method: getPost,
    success: function (res) {
      console.log(res, 5666)
      wx.hideLoading();
      if (res.data.errcode == 0) {
        success(res)
      }else if (res.data.errcode == 100006 || res.data.status == 403) {
        wx.login({
          success: res => {
            console.log(res, 333);
            let date = {
              appId: wx.getStorageSync('app_id'),
              jscode: res.code
            };
            console.log(3333, data);
            if (url != '/auth/wx/jscode/login') {
              let url = url, pageSize = pageSize, currentPage = currentPage, data = data, getPost = getPost, success = success; 
            }
            requestFun('/auth/wx/jscode/login', '', '', date, 'POST', function(res) {
              wx.setStorageSync('xAuthToken', res.header['X-auth-token']);
              if (res.data.data.loginStatus == 'NAMED') {
                wx.redirectTo({
                  url: '/pages/index/index',
                })
              }else {
                // wx.redirectTo({
                //   url: '/pages/login/index',
                // })
                requestFun(url, pageSize, currentPage, data, getPost, success);
              }
            })
          }
        })
      } else if (res.data.errcode == 100003 || res.data.errcode == 100006) {
        wx.showToast({
          title: res.data.errmsg,
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/login/index',
          })
        }, 1500)
      } else {
        wx.showToast({
          title: res.data.errmsg,
          icon: 'none',
          duration: 2000
        });
      }
    },
    fail: function (res) {
      console.log(res);
      wx.hideLoading();
      if(res.errMsg && res.errMsg == 'request:fail timeout') {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
          duration: 2000
        });
      }else {
        wx.showToast({
          title: res.data.errmsg,
          icon: 'none',
          duration: 2000
        });
      }
    },
  })
}

//时间格式处理
function datetimeparse (timestamp, format, prefix) {
  if (typeof timestamp =='string'){
      timestamp=Number(timestamp)
  }
  //转换时区
  let currentZoneTime = new Date (timestamp);
  let currentTimestamp = currentZoneTime.getTime ();
  let offsetZone = currentZoneTime.getTimezoneOffset () / 60;//如果offsetZone>0是西区，西区晚
  let offset = null;
  //客户端时间与服务器时间保持一致，固定北京时间东八区。
  offset = offsetZone + 8;
  currentTimestamp = currentTimestamp + offset * 3600 * 1000;

  let newtimestamp = null;
  if (currentTimestamp) {
      if (currentTimestamp.toString ().length === 13) {
          newtimestamp = currentTimestamp.toString ()
      } else if (currentTimestamp.toString ().length === 10) {
          newtimestamp = currentTimestamp + '000'
      } else {
          newtimestamp = null
      }
  } else {
      newtimestamp = null
  }
  let dateobj = newtimestamp ? new Date (parseInt (newtimestamp)) : new Date ()
  let YYYY = dateobj.getFullYear ()
  let MM = dateobj.getMonth () > 8 ? dateobj.getMonth () + 1 : '0' + (dateobj.getMonth () + 1)
  let DD = dateobj.getDate () > 9 ? dateobj.getDate () : '0' + dateobj.getDate ()
  let HH = dateobj.getHours () > 9 ? dateobj.getHours () : '0' + dateobj.getHours ()
  let mm = dateobj.getMinutes () > 9 ? dateobj.getMinutes () : '0' + dateobj.getMinutes ()
  let ss = dateobj.getSeconds () > 9 ? dateobj.getSeconds () : '0' + dateobj.getSeconds ()
  let output = '';
  let separator = '/'
  if (format) {
      separator = format.match (/-/) ? '-' : '/'
      output += format.match (/yy/i) ? YYYY : ''
      output += format.match (/MM/) ? (output.length ? separator : '') + MM : ''
      output += format.match (/dd/i) ? (output.length ? separator : '') + DD : ''
      output += format.match (/hh/i) ? (output.length ? ' ' : '') + HH : ''
      output += format.match (/mm/) ? (output.length ? ':' : '') + mm : ''
      output += format.match (/ss/i) ? (output.length ? ':' : '') + ss : ''
  } else {
      output += YYYY + separator + MM + separator + DD
  }
  output = prefix ? (prefix + output) : output

  return newtimestamp ? output : ''
}

function isToday (value) {
  if (new Date(value).toDateString() === new Date().toDateString()) {
    return   '(今日)'
  }else{
    return '';
  }
}

module.exports = {
  formatTime: formatTime,
  requestFun: requestFun,
  datetimeparse: datetimeparse,
  isToday: isToday
}
