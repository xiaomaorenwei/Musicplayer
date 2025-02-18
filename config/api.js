const BASE_URL = 'https://service-irzuinkk-1320869466.cd.apigw.tencentcs.com/release';

export default {
  // 搜索音乐
  searchMusic: `${BASE_URL}/search`,
  // 获取音乐URL
  getMusicUrl: `${BASE_URL}/song/url`,
  // 获取音乐详情
  getMusicDetail: `${BASE_URL}/song/detail`,
  // 添加请求头，避免被限制
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  }
}; 