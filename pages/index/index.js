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
    isLoading: false
  },

  onLoad: function() {
    // 初始化背景音频管理器
    this.audioManager = wx.getBackgroundAudioManager();
    // 从本地存储加载收藏列表
    const favorites = wx.getStorageSync('favoriteMusic') || [];
    this.setData({ favoriteList: favorites });
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

    // 使用 cloudsearch 接口搜索
    wx.request({
      url: api.searchMusic,
      data: {
        keywords: keyword,
        limit: 20,
        type: 1
      },
      success: async (res) => {
        if (res.data && res.data.result && res.data.result.songs) {
          const songs = res.data.result.songs;
          
          try {
            // 获取音乐URL
            const urlRes = await this.getMusicUrl(songs.map(song => song.id).join(','));
            
            // 整合数据（cloudsearch 已经包含了详细信息，不需要额外请求详情）
            const searchResults = songs.map(song => {
              const urlInfo = urlRes.data.find(u => u.id === song.id);
              return {
                id: song.id,
                name: song.name,
                artist: song.ar[0].name,
                cover: song.al.picUrl,
                src: urlInfo?.url || ''
              };
            }).filter(song => song.src); // 只保留有效的音乐链接

            this.setData({
              searchResults,
              isLoading: false
            });

            if (searchResults.length === 0) {
              wx.showToast({
                title: '未找到可播放的音乐',
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
        } else {
          this.setData({ 
            searchResults: [],
            isLoading: false 
          });
          wx.showToast({
            title: '未找到相关音乐',
            icon: 'none'
          });
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

  // 获取音乐URL（简化版本）
  getMusicUrl: function(ids) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: api.getMusicUrl,
        data: { 
          id: ids,
          br: 320000 // 获取较高音质
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

  // 修改播放功能以支持搜索结果的播放
  playMusic: function(e) {
    const musicId = e.currentTarget.dataset.id;
    const music = this.data.musicList.find(item => item.id === musicId) ||
                 this.data.searchResults.find(item => item.id === musicId) ||
                 this.data.favoriteList.find(item => item.id === musicId);
    
    if (!music) return;
    
    // 设置音频信息
    this.audioManager.title = music.name;
    this.audioManager.singer = music.artist;
    this.audioManager.coverImgUrl = music.cover;
    this.audioManager.src = music.src;
    
    // 监听播放状态
    this.audioManager.onPlay(() => {
      console.log('开始播放');
    });
    
    this.audioManager.onError((err) => {
      console.error('播放错误', err);
      wx.showToast({
        title: '播放出错，请稍后重试',
        icon: 'none'
      });
    });
  }
})