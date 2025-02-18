Page({
  data: {
    playing: false,
    musicInfo: null,
    progress: 0,
    currentTime: '00:00',
    duration: '00:00'
  },

  onLoad: function(options) {
    try {
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      const musicInfo = prevPage.data.musicList.find(item => item.id == options.id)
      
      if (!musicInfo) {
        wx.showToast({
          title: '未找到音乐信息',
          icon: 'none'
        })
        return
      }

      this.setData({ musicInfo })
      
      const app = getApp()
      if (!app.globalData.audioManager) {
        app.globalData.audioManager = wx.getBackgroundAudioManager()
      }
      this.audioManager = app.globalData.audioManager
      
      this.setupAudioManager()
      this.setupAudioListeners()
    } catch (error) {
      console.error('初始化播放器失败:', error)
      wx.showToast({
        title: '初始化播放器失败',
        icon: 'none'
      })
    }
  },

  setupAudioManager: function() {
    if (!this.audioManager || !this.data.musicInfo) return
    
    this.audioManager.title = this.data.musicInfo.name
    this.audioManager.singer = this.data.musicInfo.artist
    this.audioManager.coverImgUrl = this.data.musicInfo.cover
    this.audioManager.src = this.data.musicInfo.src
  },

  setupAudioListeners: function() {
    this.audioManager.onPlay(() => {
      this.setData({ playing: true })
    })
    
    this.audioManager.onPause(() => {
      this.setData({ playing: false })
    })

    this.audioManager.onTimeUpdate(() => {
      const currentTime = this.audioManager.currentTime
      const duration = this.audioManager.duration
      const progress = (currentTime / duration) * 100

      this.setData({
        progress,
        currentTime: this.formatTime(currentTime),
        duration: this.formatTime(duration)
      })
    })
  },

  togglePlay: function() {
    if (!this.audioManager) return
    
    if (this.data.playing) {
      this.audioManager.pause()
    } else {
      this.audioManager.play()
    }
  },

  previousSong: function() {
    wx.showToast({
      title: '上一首',
      icon: 'none'
    })
  },

  nextSong: function() {
    wx.showToast({
      title: '下一首',
      icon: 'none'
    })
  },

  onSliderChange: function(e) {
    const position = e.detail.value
    const duration = this.audioManager.duration
    const seekTime = (position / 100) * duration
    this.audioManager.seek(seekTime)
  },

  formatTime: function(seconds) {
    const minutes = Math.floor(seconds / 60)
    seconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  },

  goBack: function() {
    wx.navigateBack()
  },

  onUnload: function() {
    if (this.audioManager) {
      this.audioManager.stop()
    }
  }
})