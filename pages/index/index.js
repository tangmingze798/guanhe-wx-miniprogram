Page({
  goMeihua()   { wx.navigateTo({ url: '/pages/meihua/meihua' }); },
  goXlr()      { wx.navigateTo({ url: '/pages/xlr/xlr' }); },
  goHistory()  { wx.navigateTo({ url: '/pages/history/history' }); },

  onShareAppMessage() {
    return { title: '观梅数 · 梅花易数 · 小六壬', path: '/pages/index/index' };
  }
});
