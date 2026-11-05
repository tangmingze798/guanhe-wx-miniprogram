const xlr = require('../../utils/xlr.js');

const XNOTES = {
  num: '报数起课：任意三个正整数（可大于9，自动按九宫循环化简）。一心一念，报定不悔。',
  time: '时间起课：农历月、农历日、时辰地支序号（子=1…亥=12）三数起课。',
  rand: '随机起课：心念所问，随手指落定三数。'
};
function xrnd(n) { return Math.floor(Math.random() * n) + 1; }

const SCALE = 600 / 360;
function buildPalm() {
  const XSEG = xlr.XSEG;
  const XLR = xlr.XLR;
  const cells = [];
  for (let n = 1; n <= 9; n++) {
    const p = XSEG[n];
    const left = p[0] * SCALE;
    const top = p[1] * SCALE;
    const w = 82 * SCALE;
    const h = 92 * SCALE;
    cells.push({
      n,
      name: XLR[n].name,
      el: XLR[n].el,
      style: 'left:' + left + 'rpx;top:' + top + 'rpx;width:' + w + 'rpx;height:' + h + 'rpx;',
      cx: left + w / 2,
      cy: top + h / 2
    });
  }
  return cells;
}

Page({
  data: {
    xmode: 'num',
    xnote: XNOTES.num,
    x1: '', x2: '', x3: '',
    xm: 0, xd: 0, xt: 0,
    monthArr: ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'],
    dayArr: Array.from({ length: 30 }, (_, i) => (i + 1 === 10 ? '初十' : i + 1 === 20 ? '二十' : i + 1 === 30 ? '三十' : (i + 1 < 10 ? '初' : '廿') + '一二三四五六七八九十'[(i) % 10])),
    hourArr: ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'],
    xq: '',
    palmCells: [],
    litMap: {}, landedMap: {}, thumbStyle: '', status: '',
    casting: false, showResult: false, shareTitle: '',
    nums: '', chuan: [], chain: [], dupe: {}, story: [], catCard: null, resolve: []
  },

  onLoad() {
    this.setData({ palmCells: buildPalm() });
  },

  setXMode(e) {
    const xmode = e.currentTarget.dataset.xmode;
    this.setData({ xmode, xnote: XNOTES[xmode] });
  },
  onX1(e) { this.setData({ x1: e.detail.value }); },
  onX2(e) { this.setData({ x2: e.detail.value }); },
  onX3(e) { this.setData({ x3: e.detail.value }); },
  onXm(e) { this.setData({ xm: Number(e.detail.value) }); },
  onXd(e) { this.setData({ xd: Number(e.detail.value) }); },
  onXt(e) { this.setData({ xt: Number(e.detail.value) }); },
  onXq(e) { this.setData({ xq: e.detail.value }); },

  moveThumb(n) {
    const c = this.data.palmCells.find(x => x.n === n);
    if (c) this.setData({ thumbStyle: 'left:' + (c.cx - 30) + 'rpx;top:' + (c.cy - 30) + 'rpx;opacity:1;' });
  },

  cast() {
    if (this.data.casting) return;
    const m = this.data.xmode;
    let n1, n2, n3;
    if (m === 'num') {
      n1 = parseInt(this.data.x1, 10) || 0;
      n2 = parseInt(this.data.x2, 10) || 0;
      n3 = parseInt(this.data.x3, 10) || 0;
    } else if (m === 'time') {
      n1 = this.data.xm + 1;
      n2 = this.data.xd + 1;
      n3 = this.data.xt + 1;
    } else {
      n1 = xrnd(12); n2 = xrnd(30); n3 = xrnd(12);
    }

    const res = xlr.castXLR({ n1, n2, n3 });
    this.setData({ casting: true, showResult: false, litMap: {}, landedMap: {}, thumbStyle: '', status: '拇指掐指…' });

    const XLR = xlr.XLR;
    const path = res.path;
    let i = 0;
    const timer = setInterval(() => {
      if (i > 0) {
        const prev = path[i - 1];
        const lm = this.data.litMap; lm[prev] = true;
        this.setData({ litMap: lm });
      }
      if (i >= path.length) {
        clearInterval(timer);
        const lm = this.data.litMap; const landed = {};
        [res.chu, res.zhong, res.mo].forEach(x => { lm[x] = true; landed[x] = true; });
        this.setData({ litMap: lm, landedMap: landed });
        this.moveThumb(res.mo);
        this.setData({ status: '三传落定：初传' + XLR[res.chu].name + '（前）→ 中传' + XLR[res.zhong].name + '（中）→ 末传' + XLR[res.mo].name + '（后）' });
        setTimeout(() => {
          const result = xlr.buildXLRResult(res, this.data.xq);
          const chuName = result.chuan[0].name, zhongName = result.chuan[1].name, moName = result.chuan[2].name;
          const moLv = result.chuan[2].lv;
          const shareTitle = '我掐得一课：初传' + chuName + ' · 中传' + zhongName + ' · 末传' + moName + '，末传断「' + moLv + '」';
          this.setData({
            casting: false, showResult: true, nums: result.nums, chuan: result.chuan,
            chain: result.chain, dupe: result.dupe, story: result.story,
            catCard: result.catCard, resolve: result.resolve, shareTitle
          });
          this.saveHistory(res, result, moLv);
        }, 420);
        return;
      }
      const cur = path[i];
      const lm = this.data.litMap; lm[cur] = true;
      this.setData({ litMap: lm });
      this.moveThumb(cur);
      this.setData({ status: '拇指掐至：' + XLR[cur].name + '（第' + cur + '宫）' });
      i++;
    }, 160);
  },

  saveHistory(res, result, moLv) {
    if (!wx.cloud || !wx.cloud.database) return;
    try {
      wx.cloud.database().collection('guanhe_records').add({
        data: {
          type: 'xlr',
          q: this.data.xq || '',
          lv: moLv,
          summary: '初传' + result.chuan[0].name + ' · 中传' + result.chuan[1].name + ' · 末传' + result.chuan[2].name,
          createTime: wx.cloud.database().serverDate()
        },
        fail(e) { console.log('卦例保存失败', e); }
      });
    } catch (e) { console.log('卦例保存异常', e); }
  },

  onShareAppMessage() {
    return {
      title: this.data.shareTitle || '观梅数 · 小六壬九宫真传',
      path: '/pages/xlr/xlr'
    };
  }
});
