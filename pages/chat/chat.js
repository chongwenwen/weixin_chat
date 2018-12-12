// pages/chat/chat.js
const app = getApp()
var websocket = require('../../utils/websocket.js');
var utils = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
     newslist:[],
     userInfo: {},
     scrollTop: 0,
     increase:false,//图片添加区域隐藏
     aniStyle: true,//动画效果
     message:"",
     previewImgList:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    //调通接口
    websocket.connect(this.data.userInfo, function (res) {
      // console.log(JSON.parse(res.data))
      var list = []
      list = that.data.newslist
      list.push(JSON.parse(res.data))
      that.setData({
        newslist: list
      })
    })
  },
  // 页面卸载
  onUnload(){
    wx.closeSocket();
    wx.showToast({
      title: '连接已断开~',
      icon: "none",
      duration: 2000
    })
  },
  //事件处理函数
  send: function () {
    var flag = this
    if (this.data.message.trim() == ""){
      wx.showToast({
        title: '消息不能为空哦~',
        icon: "none",
        duration: 2000
      })
    }else {
      setTimeout(function(){
        flag.setData({
          increase: false
        })
      },500)
      websocket.send('{ "content": "' + this.data.message + '", "date": "' + utils.formatTime(new Date()) + '","type":"text", "nickName": "' + this.data.userInfo.nickName + '", "avatarUrl": "' + this.data.userInfo.avatarUrl+'" }')     
      this.bottom()
    }
  },
  //监听input值的改变
  bindChange(res) {
    this.setData({
      message : res.detail.value
    })
  },
  cleanInput(){
    //button会自动清空，所以不能再次清空而是应该给他设置目前的input值
    this.setData({
      message: this.data.message
    })
  },
  increase() {
    this.setData({
      increase: true,
      aniStyle: true
    })
  },
  //点击空白隐藏message下选框
  outbtn(){
    this.setData({
      increase: false,
      aniStyle: true
    })
  },
  chooseImage() {
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        // console.log(tempFilePaths)
        wx.uploadFile({
          url: 'http://192.168.137.91/index/index/upload', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          headers: {
            'Content-Type': 'form-data'
          },
          success: function (res) {
            if (res.data){
              that.setData({
                increase: false
              })
              websocket.send('{"images":"'+ res.data +'","date":"'+utils.formatTime(new Date())+'","type":"image","nickName":"'+that.data.userInfo.nickName+'","avatarUrl":"'+that.data.userInfo.avatarUrl+'"}')
              that.bottom()
            }
          }
        })   
       
      }
    })
  },
  //图片预览
  previewImg(e){
    var that = this
    //必须给对应的wxml的image标签设置data-set=“图片路径”，否则接收不到
    var res = e.target.dataset.src
    var list = this.data.previewImgList //页面的图片集合数组
    
    //判断res在数组中是否存在，不存在则push到数组中, -1表示res不存在
    if (list.indexOf(res) == -1 ) {
        this.data.previewImgList.push(res)
    }
    wx.previewImage({
      current: res, // 当前显示图片的http链接
      urls: that.data.previewImgList // 需要预览的图片http链接列表
    })
    
  },
  //聊天消息始终显示最底端
  bottom: function () {
    var query = wx.createSelectorQuery()
    query.select('#flag').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      wx.pageScrollTo({
        scrollTop: res[0].bottom  // #the-id节点的下边界坐标  
      })
      res[1].scrollTop // 显示区域的竖直滚动位置  
    })
  },  
})