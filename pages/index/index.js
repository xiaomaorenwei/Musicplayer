Page({
  data: {
    musicList: [
      {
        id: 1,
        name: "Ocean Blue",
        artist: "Wave Masters",
        src: "你的音频地址",
        cover: "你的封面图片地址"
      },
      {
        id: 2,
        name: "Deep Waters",
        artist: "The Currents",
        src: "你的音频地址",
        cover: "你的封面图片地址"
      },
      {
        id: 3,
        name: "Azure Dreams",
        artist: "Sky Collective",
        src: "你的音频地址",
        cover: "你的封面图片地址"
      }
    ]
  },

  playMusic: function(e) {
    const musicId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/player/player?id=${musicId}`
    })
  }
})