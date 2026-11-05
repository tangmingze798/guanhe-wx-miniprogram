// 小六壬 · 九宫真传 · 纯算法模块（无 DOM 依赖）
// 掌诀五行依师传掌图：留连木、病符土。

const { classify, toneBucket, LVKEY } = require('./category');

const XLR={
 1:{name:'大安',el:'木',dir:'正东',color:'青',lv:'吉',deity:'三清',kw:'稳 · 慢 · 守',
    plain:'安稳落定，节奏偏慢。求稳则吉，求快求变反而不利；宜静守、按部就班，稳中缓好。',
    verse:'大安事事昌，求谋在坤方；失物去不远，宅舍保安康；行人身未动，病者主无妨；将军回田野，仔细与推详。'},
 2:{name:'留连',el:'木',dir:'东南',color:'青绿',lv:'凶',deity:'文昌',kw:'拖 · 反复 · 未决',
    plain:'拖延反复、纠缠不清，事情卡住难有进展。想挽留则吉，求推进则难；三传两见留连，此事宜罢、勿再折腾。',
    verse:'留连事难成，求谋日未明；官事只宜缓，去者未回程；失物南方见，急讨方称心；更须防口舌，人口且平平。'},
 3:{name:'速喜',el:'火',dir:'正南',color:'红',lv:'吉',deity:'雷祖',kw:'快 · 消息 · 突然',
    plain:'喜讯速至、突现转机，推进加快或很快有消息。但来得快去得也快，要接得住；求稳之事遇速喜反主惊扰。',
    verse:'速喜喜来临，求财向南行；失物申未午，逢人路上寻；官事有福德，病者无祸侵；田家六畜吉，行人有音信。'},
 4:{name:'赤口',el:'金',dir:'正西',color:'白',lv:'凶',deity:'雷部将帅',kw:'争 · 冲 · 口舌',
    plain:'口舌是非、争执冲突，沟通摩擦、意见对立，九宫中最凶最恶。谨言慎行、防争吵官非；两见赤口，民俗谓防伤损（仅民俗象意，勿据此断伤病）。',
    verse:'赤口主口舌，官非切要防；失物急去寻，行人有惊慌；鸡犬多作怪，病者出西方；更须防咒诅，恐怕染瘟疫。'},
 5:{name:'小吉',el:'水',dir:'正北',color:'黑',lv:'吉',deity:'玄武',kw:'小成 · 合作 · 可行',
    plain:'小成小就，有基础、可操作，得人协调。约六七分满意，适合起步，宜小步渐进，勿求一步到位。',
    verse:'小吉最吉昌，路上好商量；阴人来报喜，失物在坤方；行人立便至，交关甚是强；凡事皆和合，病者祷上苍。'},
 6:{name:'空亡',el:'土',dir:'中央',color:'黄',lv:'凶',deity:'玉皇',kw:'空 · 缺条件 · 未落地',
    plain:'虚空不实、条件不足：承诺未兑现、信息待核实。尤忌钱财之事，投资借贷遇空亡宜收手；虚幻之事（创意、玄学）遇空亡反佳。',
    verse:'空亡事不祥，阴人多乖张；求财无利益，行人有灾殃；失物寻不见，官事有刑伤；病人逢暗鬼，禳解保安康。'},
 7:{name:'病符',el:'土',dir:'西南',color:'黄',lv:'凶',deity:'后土',kw:'异常 · 损耗 · 修复',
    plain:'某个环节出了问题、带病运转，需要休整修补。过程不好受、不会特别顺；先修整、再图进。健康仅作民俗提示，就医以专业诊断为准。',
    verse:'病符主虚损，先病而后医；事带三分恙，修补莫迟疑。（补诀）'},
 8:{name:'桃花',el:'土',dir:'东北',color:'黄',lv:'半',deity:'城隍',kw:'关系 · 吸引 · 人情',
    plain:'人际牵引、欲望纠缠。主感情、人缘、社交、审美与曝光：感情之事遇桃花可为吉，其余事遇桃花多被人情牵绊、节外生枝。',
    verse:'桃花主牵绊，人色两相缠；情事逢之喜，他事防流连。（补诀）'},
 9:{name:'天德',el:'金',dir:'西北',color:'白',lv:'吉',deity:'紫薇',kw:'助力 · 调和 · 贵人',
    plain:'贵人助力、调和补位：有长辈、上司、说话算数的人出手相帮。求人办事靠人成事，遇天德宜主动求助、借力而行。',
    verse:'天德降吉祥，贵人自西方；求谋借人力，大事可商量。（补诀）'}
};

/* 掌图：宫号 → 指节位置（SVG 360×430 坐标，用于小程序按比例还原掌诀） */
const XSEG={1:[55,130],2:[55,34],3:[145,24],4:[245,130],5:[145,216],6:[145,122],7:[245,34],8:[55,222],9:[245,216]};

const XDUPENOTE={
 1:'大安重见：稳字当头，但节奏更慢——宜守成，不宜求快。',
 2:'留连重见：反复纠缠之象极重，民俗谓"此事宜罢、勿再折腾"。',
 3:'速喜重见：快起快落，机会来得猛，接得住才算数。',
 4:'赤口重见：口舌争斗之象加重，谨言慎行、防冲突伤损（民俗说法）。',
 5:'小吉重见：小成叠加，宜积小胜、勿贪大。',
 6:'空亡重见：条件不足之象极强，先核实事实、补齐缺口再谈。',
 7:'病符重见：损耗修补的主题放大，宜先修整再图进。',
 8:'桃花重见：人情牵绊极重——关系是助力也是枷锁。',
 9:'天德重见：贵人助力之象极强，宜大胆借力、主动求人。'
};
const XSHENG={金:'水',木:'火',水:'木',火:'土',土:'金'};
const XKE={金:'木',木:'土',水:'火',火:'金',土:'水'};

/* 起数：起点本身算 1，九宫循环；0 按 9，余 0 按 9 */
function xnorm(n){ n=Math.abs(parseInt(n,10)||0); if(!n) return 9; const r=n%9; return r===0?9:r; }
function xland(start,count){ return ((start-1)+(xnorm(count)-1))%9+1; }
function xsteps(start,count){ const c=xnorm(count); const arr=[]; let p=start; for(let i=0;i<c;i++){arr.push(p); p=p%9+1;} return arr; }

/* 相邻两传生克解读（前传 → 后传） */
function xrelText(a,b){
  const A=XLR[a],B=XLR[b];
  if(A.el===B.el) return A.el+'——'+B.el+' 比和：两段五行相同，态势延续平稳。';
  if(XSHENG[A.el]===B.el) return A.el+'生'+B.el+'：前者生后者，我力灌注于后——铺路付出之象，虽耗而有进。';
  if(XSHENG[B.el]===A.el) return B.el+'生'+A.el+'：后者生前者，外援回流——有助力、贵人扶持之象，如得外援。';
  if(XKE[A.el]===B.el) return A.el+'克'+B.el+'：我克者为财——后段可控可收，费力而有得。';
  if(XKE[B.el]===A.el) return B.el+'克'+A.el+'：后者克前者——外力来制，阻力在此，宜避其锋、缓图之。';
  return '';
}

/* 起课（DOM 无关） */
function castXLR(input){
  input = input || {};
  const n1 = input.n1||0, n2 = input.n2||0, n3 = input.n3||0;
  const chu=xland(1,n1), zhong=xland(chu,n2), mo=xland(zhong,n3);
  const path=[...xsteps(1,n1),...xsteps(chu,n2),...xsteps(zhong,n3)];
  return {n1,n2,n3,chu,zhong,mo,path};
}

/* 三传卡片（结构化，供 WXML 渲染） */
function chuanCard(lab,num,extra){
  const d=XLR[num];
  return {
    lab, name:d.name, el:d.el, dir:d.dir, color:d.color, lv:d.lv, lvKey:LVKEY[d.lv]||'ping',
    plain:d.plain, verse:(num<=6?'古诀：':'补诀：')+'「'+d.verse+'」',
    extra:extra||''
  };
}

/* 完整解读（返回结构化数据，不含 HTML） */
function buildXLRResult(res, q){
  const c1=XLR[res.chu], c2=XLR[res.zhong], c3=XLR[res.mo];
  const chuan=[
    chuanCard('初传 · 前（起因）', res.chu, '从大安数 '+res.n1),
    chuanCard('中传 · 中（过程）', res.zhong, '从'+c1.name+'数 '+res.n2),
    chuanCard('末传 · 后（结果）', res.mo, '从'+c2.name+'数 '+res.n3)
  ];
  const chain=[
    {label:'初 → 中', a:c1.name, ae:c1.el, b:c2.name, be:c2.el, rel:xrelText(res.chu,res.zhong)},
    {label:'中 → 末', a:c2.name, ae:c2.el, b:c3.name, be:c3.el, rel:xrelText(res.zhong,res.mo)}
  ];
  const cnt={}; [res.chu,res.zhong,res.mo].forEach(x=>cnt[x]=(cnt[x]||0)+1);
  const dupes=Object.keys(cnt).filter(k=>cnt[k]>1);
  const dupe = dupes.length
    ? {has:true, items: dupes.map(k=>({name:XLR[k].name, cnt:cnt[k], note:XDUPENOTE[k]}))}
    : {has:false, items:[]};
  const endTone = c3.lv==='吉'?'末传落吉宫，结局偏向顺成，可善始善终。'
    : c3.lv==='半'?'末传毁誉参半，有所得亦有所牵，成中带欠。'
    : '末传偏滞，结局须早做盘算、降低预期，宜守不宜进。';
  const story=[
    '初传 '+c1.name+'（'+c1.kw+'）：'+c1.plain,
    '中传 '+c2.name+'（'+c2.kw+'）：'+c2.plain,
    '末传 '+c3.name+'（'+c3.kw+'）：'+c3.plain,
    '连起来看：前段'+c1.kw+' → 中段'+c2.kw+' → 末段'+c3.kw+'。'+endTone+'此为符号叙事之读法，非现实因果之证明——真决定结果的，是你手里的条件、证据与行动。'
  ];
  // 按所问解读（分类在 category.js）
  let catCard=null;
  const cat=classify(q);
  if(cat){
    const tb=toneBucket(c3.lv);
    const endWord=c3.lv==='吉'?'顺成':c3.lv==='半'?'参半':'滞';
    catCard={name:cat.name, text: cat.ask+'。末传落 '+c3.name+'（'+endWord+'），'+cat[tb]+'此就所问之维度参详，非定论，真决断仍在你手。'};
  }
  const resolve=[
    '初传 '+c1.name+'：五行'+c1.el+'，旧俗谓此宫受克时拜'+c1.deity+'可解——纯属民间习俗，作文化了解即可。',
    '中传 '+c2.name+'：五行'+c2.el+'，旧俗谓此宫受克时拜'+c2.deity+'可解——纯属民间习俗，作文化了解即可。',
    '末传 '+c3.name+'：五行'+c3.el+'，旧俗谓此宫受克时拜'+c3.deity+'可解——纯属民间习俗，作文化了解即可。'
  ];
  return {
    chu:res.chu, zhong:res.zhong, mo:res.mo,
    nums:'取数：'+res.n1+'、'+res.n2+'、'+res.n3,
    chuan, chain, dupe, story, catCard, resolve
  };
}

module.exports = {
  XLR, XSEG, XDUPENOTE, XSHENG, XKE,
  xnorm, xland, xsteps, xrelText, castXLR, buildXLRResult
};
