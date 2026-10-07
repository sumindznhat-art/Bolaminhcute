/* ============================================================
   CONFIG.JS — CẤU HÌNH MẶC ĐỊNH (Admin có thể sửa trên server)
   ============================================================ */

window.CONFIG = {
  API_BASE: 'https://toolkiemlua2026.site/api',
  API_TIMEOUT: 15000,

  /* Site */
  site_name: 'TOOL BONSICOLA',
  sub_text: 'Đăng nhập hệ thống',
  marquee: '🚀 Chào mừng đến với BONSICOLA TOOL — Nạp tiền để mở khoá!',
  footer: '© TOOL•BONIOS',
  logo: '',
  avatar: '',
  music_url: '',

  /* Bank */
  bank: {
    name: 'MB Bank',
    account: '0372834763',
    owner: 'BON SICOLA',
    qr: 'https://img.vietqr.io/image/MB-0372834763-compact2.png'
  },

  /* Gói VIP */
  packages: [
    { id: 'p1d',  name: 'VIP 1 Ngày',  price: 10000,  days: 1  },
    { id: 'p3d',  name: 'VIP 3 Ngày',  price: 30000,  days: 3  },
    { id: 'p7d',  name: 'VIP 1 Tuần',  price: 80000,  days: 7  },
    { id: 'p30d', name: 'VIP 1 Tháng', price: 200000, days: 30 }
  ],

  /* Tools — Admin có thể thêm/sửa/xoá */
  tools: [
    { id: 't1', name: 'Tài Xỉu Sunwin', cat: 'game', url: 'https://google.com', image: '' },
    { id: 't2', name: 'Baccarat Kubet', cat: 'game', url: 'https://google.com', image: '' },
    { id: 't3', name: 'Tài Xỉu Go88',   cat: 'game', url: 'https://google.com', image: '' },
    { id: 't4', name: 'Tool Đọc Vị',    cat: 'tool', url: 'https://google.com', image: '' }
  ]
};
