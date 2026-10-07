/* ============================================================
   CONFIG.JS — CẤU HÌNH HỆ THỐNG
   ============================================================ */

const CONFIG = {
  /* 🌐 URL BACKEND — KHÔNG có dấu / ở cuối */
  API_BASE: 'https://toolkiemlua2026.site/api',
  API_TIMEOUT: 15000,

  /* 🏦 THÔNG TIN NGÂN HÀNG */
  bank: {
    name: 'MB Bank',
    account: '0372834763',
    owner: 'BON SICOLA',
    qr: 'https://img.vietqr.io/image/MB-0372834763-compact2.png'
  },

  /* 💎 GÓI VIP */
  packages: [
    { id: 'p1d',  name: 'VIP 1 Ngày',  price: 10000,  days: 1  },
    { id: 'p3d',  name: 'VIP 3 Ngày',  price: 30000,  days: 3  },
    { id: 'p7d',  name: 'VIP 1 Tuần',  price: 80000,  days: 7  },
    { id: 'p30d', name: 'VIP 1 Tháng', price: 200000, days: 30 }
  ],

  /* 🎮 DANH SÁCH TOOL */
  tools: [
    { id: 't1', name: 'Tài Xỉu Sunwin', cat: 'game', url: 'https://google.com' },
    { id: 't2', name: 'Baccarat Kubet', cat: 'game', url: 'https://google.com' },
    { id: 't3', name: 'Tài Xỉu Go88',   cat: 'game', url: 'https://google.com' },
    { id: 't4', name: 'Tool Đọc Vị',    cat: 'tool', url: 'https://google.com' }
  ]
};

window.CONFIG = CONFIG;
window.APP_CONFIG = CONFIG;
