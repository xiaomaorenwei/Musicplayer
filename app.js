App({
  onLaunch: function () {
    this.globalData = {
      audioManager: wx.getBackgroundAudioManager()
    }
  },
  globalData: {}
})