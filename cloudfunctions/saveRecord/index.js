// 云函数：保存卦例到云数据库（可选功能）
// 用途：用户在小程序里起卦后，可一键把本次卦象存档，便于日后回看。
// 使用前：微信开发者工具 → 云开发 → 数据库 → 新建集合「gua_records」。
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { type, payload } = event;
  try {
    const res = await db.collection('gua_records').add({
      data: {
        type: type || 'unknown',   // 'meihua' 或 'xlr'
        payload: payload || {},
        createTime: db.serverDate()
      }
    });
    return { ok: true, id: res._id };
  } catch (e) {
    return { ok: false, err: e.message };
  }
};
