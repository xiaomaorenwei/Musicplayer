import api from '../../config/api.js';

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
    ],
    audioManager: null,
    favoriteList: [], // 存储收藏的音乐
    searchResults: [], // 存储搜索结果
    searchKeyword: '', // 搜索关键词
    showSearchResults: false, // 是否显示搜索结果
    isLoading: false,
    currentSong: null,  // 当前播放的歌曲
    isPlaying: false,   // 是否正在播放
    playList: [],       // 播放列表
    currentIndex: -1    // 当前播放歌曲的索引
  },

  onLoad: function() {
    // 初始化背景音频管理器
    this.audioManager = wx.getBackgroundAudioManager();
    // 从本地存储加载收藏列表
    const favorites = wx.getStorageSync('favoriteMusic') || [];
    this.setData({ favoriteList: favorites });
    
    // 初始化音频管理器事件监听
    this.initAudioManagerListener();
  },

  initAudioManagerListener: function() {
    // 播放状态监听
    this.audioManager.onPlay(() => {
      this.setData({ isPlaying: true });
      console.log('开始播放');
    });

    this.audioManager.onPause(() => {
      this.setData({ isPlaying: false });
      console.log('暂停播放');
    });

    this.audioManager.onStop(() => {
      this.setData({ isPlaying: false });
      console.log('停止播放');
    });

    this.audioManager.onEnded(() => {
      this.playNext();
      console.log('播放结束，自动播放下一首');
    });

    this.audioManager.onError((err) => {
      console.error('播放错误', err);
      wx.showToast({
        title: '播放出错，自动播放下一首',
        icon: 'none'
      });
      this.playNext();
    });
  },

  // 搜索音乐
  onSearch: function(e) {
    const keyword = e.detail.value;
    if (!keyword.trim()) return;
    
    this.setData({ 
      searchKeyword: keyword,
      isLoading: true,
      showSearchResults: true 
    });

    // 调用网易云搜索接口
    wx.request({
      url: api.searchMusic,
      data: {
        keywords: keyword,
        limit: 30,    // 返回数量
        type: 1,      // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单
        offset: 0     // 分页偏移量
      },
      success: async (res) => {
        console.log('搜索结果：', res.data);
        if (res.data?.result?.songs) {
          const songs = res.data.result.songs;
          
          try {
            // 获取音乐URL
            const urlRes = await this.getMusicUrl(songs.map(song => song.id));
            console.log('音乐URL：', urlRes);

            // 整合数据
            const searchResults = songs.map(song => {
              const urlInfo = urlRes.data.find(u => u.id === song.id);
              return {
                id: song.id,
                name: song.name,
                artist: song.ar[0].name,  // ar 是歌手信息数组
                cover: song.al.picUrl,    // al 是专辑信息
                src: urlInfo?.url || '',
                fee: song.fee,            // 版权信息 0: 免费, 1: VIP
                duration: song.dt,        // 歌曲时长(毫秒)
                album: song.al.name       // 专辑名称
              };
            }).filter(song => song.src);  // 过滤掉没有音源的歌曲

            this.setData({
              searchResults,
              isLoading: false
            });

            if (searchResults.length === 0) {
              wx.showToast({
                title: '暂无可播放的音乐',
                icon: 'none'
              });
            }
          } catch (err) {
            console.error('获取音乐信息失败', err);
            this.setData({ isLoading: false });
            wx.showToast({
              title: '获取音乐信息失败',
              icon: 'none'
            });
          }
        }
      },
      fail: (err) => {
        console.error('搜索失败', err);
        this.setData({ isLoading: false });
        wx.showToast({
          title: '搜索失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 获取音乐URL
  getMusicUrl: function(ids) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: api.getMusicUrl,
        data: { 
          id: typeof ids === 'object' ? ids.join(',') : ids,
          level: 'standard',  // standard, higher, exhigh, lossless, hires
          cookie: api.cookie  // 用于获取 VIP 歌曲
        },
        success: (res) => {
          if (res.data && res.data.code === 200) {
            resolve(res.data);
          } else {
            reject(new Error('获取音乐URL失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 切换收藏状态
  toggleFavorite: function(e) {
    const musicId = e.currentTarget.dataset.id;
    const music = this.data.musicList.find(item => item.id === musicId) ||
                 this.data.searchResults.find(item => item.id === musicId);
    
    if (!music) return;

    let favorites = [...this.data.favoriteList];
    const index = favorites.findIndex(item => item.id === musicId);

    if (index === -1) {
      favorites.push(music);
      wx.showToast({ title: '已添加到收藏' });
    } else {
      favorites.splice(index, 1);
      wx.showToast({ title: '已取消收藏' });
    }

    this.setData({ favoriteList: favorites });
    wx.setStorageSync('favoriteMusic', favorites);
  },

  // 判断是否已收藏
  isFavorite: function(musicId) {
    return this.data.favoriteList.some(item => item.id === musicId);
  },

  // 修改播放功能
  playMusic: function(e) {
    const musicId = e.currentTarget.dataset.id;
    let playlist;
    
    // 确定播放列表来源
    if (this.data.showSearchResults && this.data.searchResults.length > 0) {
      playlist = this.data.searchResults;
    } else if (this.data.favoriteList.length > 0) {
      playlist = this.data.favoriteList;
    } else {
      playlist = this.data.musicList;
    }

    const currentIndex = playlist.findIndex(item => item.id === musicId);
    if (currentIndex === -1) return;

    const music = playlist[currentIndex];
    
    // 更新播放列表和当前索引
    this.setData({
      playList: playlist,
      currentIndex: currentIndex,
      currentSong: music
    });

    // 设置音频信息并播放
    this.audioManager.title = music.name;
    this.audioManager.singer = music.artist;
    this.audioManager.coverImgUrl = music.cover;
    this.audioManager.src = music.src;
  },

  // 播放/暂停切换
  togglePlay: function() {
    if (this.data.isPlaying) {
      this.audioManager.pause();
    } else {
      this.audioManager.play();
    }
  },

  // 播放上一首
  playPrev: function() {
    if (this.data.currentIndex <= 0) {
      // 如果是第一首，则循环到最后一首
      this.setData({ currentIndex: this.data.playList.length - 1 });
    } else {
      this.setData({ currentIndex: this.data.currentIndex - 1 });
    }
    
    const music = this.data.playList[this.data.currentIndex];
    if (music) {
      this.setData({ currentSong: music });
      this.audioManager.title = music.name;
      this.audioManager.singer = music.artist;
      this.audioManager.coverImgUrl = music.cover;
      this.audioManager.src = music.src;
    }
  },

  // 播放下一首
  playNext: function() {
    if (this.data.currentIndex >= this.data.playList.length - 1) {
      // 如果是最后一首，则循环到第一首
      this.setData({ currentIndex: 0 });
    } else {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
    }
    
    const music = this.data.playList[this.data.currentIndex];
    if (music) {
      this.setData({ currentSong: music });
      this.audioManager.title = music.name;
      this.audioManager.singer = music.artist;
      this.audioManager.coverImgUrl = music.cover;
      this.audioManager.src = music.src;
    }
  }
})