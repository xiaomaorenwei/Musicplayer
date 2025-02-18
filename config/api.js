const BASE_URL = 'https://netease-cloud-music-api-gamma-woad.vercel.app'; // 或者使用您自己部署的API地址

export default {
  // 搜索音乐
  searchMusic: `${BASE_URL}/search`,
  // 获取音乐URL
  getMusicUrl: `${BASE_URL}/song/url/v1`,
  // 获取音乐详情
  getMusicDetail: `${BASE_URL}/song/detail`
}; 