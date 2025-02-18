Page({
  data: {
    musicList: [
      {
        id: 1,
        name: 'A New Beginning',
        artist: 'Bensound',
        cover: 'https://www.bensound.com/bensound-img/acousticbreeze.jpg',
        src: 'https://www.bensound.com/bensound-music/bensound-anewbeginning.mp3'
      },
      {
        id: 2,
        name: 'Creative Minds',
        artist: 'Bensound',
        cover: 'https://www.bensound.com/bensound-img/creativeminds.jpg',
        src: 'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3'
      },
      {
        id: 3,
        name: 'Happy Rock',
        artist: 'Bensound',
        cover: 'https://www.bensound.com/bensound-img/happyrock.jpg',
        src: 'https://www.bensound.com/bensound-music/bensound-happyrock.mp3'
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