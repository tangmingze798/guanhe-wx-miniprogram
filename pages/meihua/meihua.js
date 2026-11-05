const meihua = require('../../utils/meihua.js');
const { classify, toneBucket, LVKEY } = require('../../utils/category.js');

const NOTES = {
  rand: '随机起卦：以三枚之数摇出本卦、互卦、变卦，并定体用生克。',
  num: '数字起卦：上卦=上数%8，下卦=下数%8，动爻=(上数+下数)%6。',
  time: '时间起卦：以当前公历年、月、日、时之数起卦。'
};

function buildGua(lab, gua) {
  const [u, d] = gua.key.split('-').map(Number);
  const t = meihua.TRIGRAM;
  return {
    lab, name: gua.meta.n, tuan: gua.meta.t, yi: gua.meta.y, bai: gua.bai,
    upName: t[u].name, downName: t[d].name, dong: gua.dong,
    lines: gua.bits.map((b, i) => ({ yang: b === 1, dong: (i + 1) === gua.dong })).reverse()
  };
}

Page({
  data: {
    mode: 'rand',
    note: NOTES.rand,
    n1: '', n2: '',
    q: '',
    casting: false,
    showResult: false,
    shareTitle: '',
    guas: [],
    verdict: null,
    trend: '',
    analyze: [],
    catCard: null,
    principle: ''
  },

  setMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ mode, note: NOTES[mode] });
  },
  onN1(e) { this.setData({ n1: e.detail.value }); },
  onN2(e) { this.setData({ n2: e.detail.value }); },
  onQ(e)  { this.setData({ q: e.detail.value }); },

  cast() {
    if (this.data.casting) return;
    this.setData({ casting: true, showResult: false });
    const input = { mode: this.data.mode, n1: this.data.n1, n2: this.data.n2 };
    setTimeout(() => {
      const r = meihua.castMeihua(input);
      const v = r.verdict;
      const bm = r.ben.meta;

      const guas = [
        buildGua('本卦', r.ben),
        buildGua('互卦（过程）', r.hu),
        buildGua('变卦（结局）', r.bian)
      ];

      const an = [
        '一曰其象：本卦得 ' + bm.n + '，卦辞云「' + bm.t + '」。' + bm.y + '以此为事之基，所问之事大体落于此象之境。',
        '二曰其势：体用之间，' + v.tag + '而断为' + v.lv + '。' + (v.lv === '吉' || v.lv === '小吉' ? '势有相成或相济，宜因势而进；' : v.lv === '凶' ? '势有相制，外力掣肘，宜守拙待时、勿强为；' : '势平而无大得失，宜静观其变。') + '动爻居' + (r.dongInTi ? '体' : '用') + '，主' + (r.dongInTi ? '在我一方主动、变数由己' : '在彼一方主动、变数由境') + '。',
        '三曰其程：互卦 ' + r.hu.meta.n + '示其中节——' + r.hu.meta.y + '；变卦 ' + r.bian.meta.n + '示其归宿——' + r.bian.meta.y + '。由本而互而变，可见其事由起至结之脉络。',
        '四曰其宜：' + (v.lv === '凶' ? '事若强求多阻，不如先固根本、徐图后举；' : v.lv === '吉' || v.lv === '小吉' ? '事势相顺，可勉力为之，然满则招损，成而思守；' : '宜守不宜攻，待时而动为善。') + '兼取卦辞「' + bm.t + '」之戒，与时偕行。'
      ];

      let catCard = null;
      const catM = classify(this.data.q);
      if (catM) {
        const tbM = toneBucket(v.lv);
        const fitM = tbM === 'g' ? '与所占相宜' : tbM === 'm' ? '与所占平平' : '与所占相逆';
        catCard = {
          name: catM.name,
          text: catM.ask + '。今得 ' + bm.n + ' 之象' + fitM + '，' + catM[tbM] + '兼参卦辞「' + bm.t + '」之戒——此乃就所问之维度参详，非定论，真决断仍在你手。'
        };
      }

      const trend = '时序观：本卦 ' + bm.n + ' 为事之始；互卦 ' + r.hu.meta.n + '（' + r.hu.meta.t + '）为其中间情势——' + r.hu.meta.y + '；变卦 ' + r.bian.meta.n + '（' + r.bian.meta.t + '）为结局所归——' + r.bian.meta.y + '。若本吉而变凶，则先易后难，宜善始而慎终；若本凶而变吉，则先难后易，贵在坚持。';

      const principle = '推数明理：此断依《周易》卦象义理与梅花易数体用生克之法推得，数中有理、理中有象。同卦异断——同一卦象，因所占之事、外应、时位不同，其趋亦异，故此析仅供参详，不宜执为一尊。不动不占：心无实所问，则不必起；起而有疑，当以明理为先。';

      const tiName = meihua.TRIGRAM[r.down].name;
      const yongName = meihua.TRIGRAM[r.up].name;

      const shareTitle = '我起得一卦：' + bm.n + '，断为「' + v.lv + '」（' + v.tag + '）';

      this.setData({
        casting: false, showResult: true, guas,
        verdict: {
          lv: v.lv, tag: v.tag, desc: v.desc,
          plain: meihua.VPLAIN[v.lv], tagplain: meihua.TAGPLAIN[v.tag],
          tiEl: r.tiEl, yongEl: r.yongEl, tiName, yongName,
          dong: r.dong, dongInTi: r.dongInTi
        },
        trend, analyze: an, catCard, principle, shareTitle
      });

      this.saveHistory(bm, v, r);
    }, 850);
  },

  saveHistory(bm, v, r) {
    if (!wx.cloud || !wx.cloud.database) return;
    try {
      wx.cloud.database().collection('guanhe_records').add({
        data: {
          type: 'meihua',
          q: this.data.q || '',
          lv: v.lv,
          summary: '本卦' + bm.n + ' · 变卦' + r.bian.meta.n + ' · ' + v.tag,
          createTime: wx.cloud.database().serverDate()
        },
        fail(e) { console.log('卦例保存失败', e); }
      });
    } catch (e) { console.log('卦例保存异常', e); }
  },

  onShareAppMessage() {
    return {
      title: this.data.shareTitle || '观梅数 · 梅花易数',
      path: '/pages/meihua/meihua'
    };
  }
});
