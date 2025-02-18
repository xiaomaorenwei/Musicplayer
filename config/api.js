const BASE_URL = 'https://netease-cloud-music-api-rust.vercel.app'; // 更换为更稳定的API地址

export default {
  // 搜索音乐 (使用 cloudsearch 而不是 search，因为返回结果更完整)
  searchMusic: `${BASE_URL}/cloudsearch`,
  // 获取音乐URL (使用 v1 版本，支持 VIP 音乐试听)
  getMusicUrl: `${BASE_URL}/song/url/v1`,
  // 获取音乐详情 (获取更多音乐信息，如歌词等)
  getMusicDetail: `${BASE_URL}/song/detail`,
  // cookie用于访问VIP内容
  cookie: ''
}; 