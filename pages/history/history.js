// 卦例历史：读写云数据库 guanhe_records（仅创建者本人可见）
const { LVKEY } = require('../../utils/category.js');

const COL = 'guanhe_records';

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function fmtTime(t) {
  try {
    const dt = new Date(t);
    return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()) +
      ' ' + pad(dt.getHours()) + ':' + pad(dt.getMinutes());
  } catch (e) { return ''; }
}

Page({
  data: { list: [], loading: true, err: '' },

  onShow() { this.fetch(); },

  onPullDownRefresh() {
    this.fetch(() => wx.stopPullDownRefresh());
  },

  fetch(done) {
    if (!wx.cloud || !wx.cloud.database) {
      this.setData({ loading: false, err: '当前基础库不支持云开发，无法读取历史。' });
      if (done) done();
      return;
    }
    wx.cloud.database().collection(COL).orderBy('createTime', 'desc').limit(50).get()
      .then(res => {
        const list = res.data.map(d => ({
          _id: d._id,
          type: d.type,
          q: d.q || '',
          lv: d.lv || '平',
          lvKey: LVKEY[d.lv] || 'ping',
          summary: d.summary || '',
          t: fmtTime(d.createTime)
        }));
        this.setData({ list, loading: false, err: '' });
        if (done) done();
      })
      .catch(() => {
        this.setData({
          loading: false,
          err: '读取失败：请先在「云开发控制台 → 数据库」创建集合 ' + COL + '（权限默认即可）。'
        });
        if (done) done();
      });
  },

  onDel(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除这条卦例？',
      content: '删除后不可恢复。',
      confirmText: '删除',
      confirmColor: '#e07a5f',
      success: res => {
        if (!res.confirm) return;
        wx.cloud.database().collection(COL).doc(id).remove()
          .then(() => this.fetch())
          .catch(() => wx.showToast({ title: '删除失败', icon: 'none' }));
      }
    });
  },

  onShareAppMessage() {
    return { title: '观梅数 · 象数推演', path: '/pages/index/index' };
  }
});
