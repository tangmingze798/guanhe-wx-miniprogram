// 小程序入口：初始化云开发（请将 env 换成你自己的云开发环境 ID）
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('当前基础库不支持云开发，请使用 2.2.3 以上基础库');
      return;
    }
    wx.cloud.init({
      // TODO: 替换为你自己的云开发环境 ID（微信开发者工具 → 云开发 → 环境设置里复制）
      env: 'cloud1-d8godblrf5579a531',
      traceUser: true
    });
  },
  globalData: {}
});
