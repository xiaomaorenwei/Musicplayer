const BASE_URL = 'https://autumnfish.cn';

export default {
  // 搜索音乐
  searchMusic: `${BASE_URL}/search`,
  // 获取音乐URL
  getMusicUrl: `${BASE_URL}/song/url`,
  // 获取音乐详情
  getMusicDetail: `${BASE_URL}/song/detail`,
  // 请求头
  headers: {
    'Content-Type': 'application/json'
  }
}; 