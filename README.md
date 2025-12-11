# 💰 SmartBudget - Asisten Keuangan Harian Pintar

**SmartBudget** adalah aplikasi web modern untuk mengelola keuangan pribadi dengan fitur-fitur AI yang cerdas dan canggih. Aplikasi ini dirancang untuk membantu Anda memahami pola pengeluaran, mendapat rekomendasi hemat, dan merencanakan keuangan dengan lebih baik.

## ✨ Fitur Utama

### 1. **Dashboard Interaktif**
- Tampilan ringkas pemasukan, pengeluaran, dan saldo
- Kartu-kartu informatif dengan animasi menarik
- Interface yang modern dan responsif

### 2. **Pencatatan Transaksi Otomatis**
- Tambah transaksi dengan mudah
- **🤖 Kategori Otomatis (NLP)** - Sistem AI mendeteksi kategori dari deskripsi
- Dukungan untuk pemasukan dan pengeluaran
- Tanggal dan waktu tercatat otomatis

### 3. **Analisis Arus Kas Cerdas**
- Visualisasi pengeluaran per kategori (Chart Pie)
- Tren pengeluaran 30 hari terakhir (Chart Line)
- Statistik detail dan perbandingan
- Identifikasi pola pengeluaran

### 4. **Rekomendasi Penghematan AI**
- 📊 Analisis kategori overspending
- 🍽️ Deteksi pengeluaran makanan tinggi
- 📈 Peringatan tren pengeluaran meningkat
- 🚗 Saran pengurangan biaya transportasi
- 🛍️ Identifikasi belanja impulse
- ✅ Pujian untuk pengeluaran terkontrol

### 5. **Prediksi Keuangan Bulan Ini**
- 🔮 Estimasi saldo akhir bulan
- ⚡ Status keuangan (Aman/Hati-hati/Kritis)
- 📅 Target pengeluaran harian optimal
- 💡 Saran finansial personal berdasarkan data

### 6. **Manajemen Transaksi**
- Riwayat transaksi lengkap
- Filter berdasarkan kategori
- Pencarian transaksi
- Hapus transaksi yang salah

## 🎨 Desain & UI

- **Modern & Responsif** - Bekerja sempurna di desktop, tablet, dan mobile
- **Gradient Colors** - Warna-warna indigo, hijau, dan emas yang elegan
- **Smooth Animations** - Transisi halus dan menyenangkan
- **Dark Mode Ready** - Siap untuk implementasi dark mode
- **Accessibility** - Teks yang jelas dan kontras baik

## 🚀 Cara Memulai

### 1. Setup Awal
```bash
# File sudah siap di folder
# Buka index.html di browser
```

### 2. Struktur File
```
smartbudget/
├── index.html          # File HTML utama
├── styles.css          # Styling CSS
├── app.js              # Logika aplikasi utama
├── utils.js            # Fungsi utility
├── nlp.js              # Auto-detection kategori (NLP)
├── ai.js               # Prediksi dan rekomendasi AI
└── README.md           # Dokumentasi
```

### 3. Membuka Aplikasi
```
1. Buka file index.html di browser
2. Atau buka di http://localhost/smartbudget (jika menggunakan Laragon)
```

## 📊 Cara Penggunaan

### Menambah Transaksi
1. Masukkan **Jumlah** (Rp)
2. Ketik **Deskripsi** (misal: "Beli Kopi", "Gaji Bulanan")
3. Pilih **Tipe** (Pemasukan/Pengeluaran)
4. **Kategori akan otomatis terdeteksi!** ✨ (bisa diubah manual)
5. Pilih **Tanggal**
6. Klik **Tambah Transaksi**

### Melihat Analisis
1. Buka tab **Dashboard** untuk ringkasan
2. Tab **Transaksi** untuk riwayat lengkap
3. Tab **Analisis** untuk chart dan statistik
4. Tab **Prediksi** untuk proyeksi keuangan

### Mendapat Rekomendasi
- Setiap kali Anda menambah transaksi, AI akan memberikan saran otomatis
- Rekomendasi muncul di bagian "Rekomendasi Penghematan"
- Hover card untuk melihat detail yang lebih jelas

## 🧠 Teknologi AI/ML

### 1. NLP Kategori Otomatis (nlp.js)
```javascript
// Mendeteksi kategori dari text deskripsi
detectCategory("Beli Kopi") // → "Makanan & Minuman" ✨
detectCategory("Isi Bensin") // → "Transportasi" ✨

// Fitur:
- Pattern matching dengan keyword database
- Levenshtein distance untuk similarity
- Confidence score untuk akurasi
- 9 kategori built-in
```

**Kategori yang didukung:**
- 🍽️ Makanan & Minuman
- 🚗 Transportasi
- 🛍️ Belanja & Kebutuhan
- 🏥 Kesehatan & Kebugaran
- 🎮 Hiburan & Rekreasi
- 📚 Pendidikan
- 💡 Utilitas & Tagihan
- 💼 Gaji & Pemasukan
- 📋 Lainnya

### 2. Prediksi Keuangan (ai.js)
```javascript
// Prediksi saldo akhir bulan
predictEndMonthBalance(transactions, currentBalance)

// Menggunakan:
- Rata-rata pengeluaran harian
- Hari yang tersisa di bulan
- Trend pengeluaran terakhir
- Proyeksi linear
```

### 3. Rekomendasi Cerdas (ai.js)
```javascript
// Generate rekomendasi otomatis
generateRecommendations(transactions)

// Analisis:
- Kategori overspending (>150% rata-rata)
- Persentase pengeluaran makanan (>35%)
- Trend pengeluaran meningkat (>130% rata-rata)
- Biaya transportasi tinggi (>20% budget)
- Belanja impulse (>25% budget)
- Entertainment spending (>20% budget)
```

## 💾 Penyimpanan Data

- **LocalStorage** - Semua data disimpan di browser
- **Otomatis** - Data tersimpan setiap menambah transaksi
- **Aman** - Tidak ada data yang dikirim ke server
- **Portable** - Backup dengan export localStorage

### Backup Data
```javascript
// Di console browser:
// Export
copy(localStorage.getItem('smartbudget_transactions'))

// Import
localStorage.setItem('smartbudget_transactions', '[...]')
```

## 🎯 Fitur Unggulan

### ✅ Kategori Otomatis
- Ketik deskripsi "beli kopi" → otomatis jadi "Makanan & Minuman"
- Confidence score menunjukkan seberapa yakin AI
- Bisa diubah manual jika salah

### ✅ Rekomendasi Real-time
- Saran muncul saat Anda menambah transaksi
- Prioritas tinggi untuk masalah serius
- Icon emoji untuk mudah dipahami

### ✅ Prediksi Akurat
- Estimasi saldo akhir bulan
- Target pengeluaran harian
- Status keuangan (Aman/Hati-hati/Kritis)
- Potensi tabungan

### ✅ Analisis Mendalam
- Chart distribusi pengeluaran
- Trend 30 hari terakhir
- Statistik kategori
- Rata-rata transaksi

## 📱 Responsif & Mobile-Friendly

- Dioptimalkan untuk semua ukuran layar
- Touch-friendly buttons
- Fast loading
- Offline first (bekerja tanpa internet setelah loading pertama)

## 🛠️ Customization

### Menambah Kategori Baru
Edit di `nlp.js`:
```javascript
const CATEGORY_KEYWORDS = {
    'Kategori Baru': [
        'keyword1', 'keyword2', 'keyword3'
    ],
    // ...
};
```

### Mengubah Warna
Edit di `styles.css`:
```css
:root {
    --primary: #6366f1;      /* Warna utama */
    --success: #10b981;      /* Warna sukses */
    --danger: #ef4444;       /* Warna bahaya */
    /* ... */
}
```

### Mengubah Currency
Edit `utils.js`:
```javascript
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {  // Ubah locale
        style: 'currency',
        currency: 'IDR',  // Ubah currency code
        minimumFractionDigits: 0,
    }).format(amount);
}
```

## 🐛 Troubleshooting

### Data tidak tersimpan?
- Pastikan localStorage tidak disable di browser
- Cek di DevTools → Application → LocalStorage

### Kategori tidak terdeteksi?
- Tambahkan keyword ke `CATEGORY_KEYWORDS` di nlp.js
- Gunakan kata-kata yang umum

### Chart tidak muncul?
- Pastikan Chart.js library sudah loaded
- Cek console untuk error messages

## 📈 Roadmap Fitur

- [ ] Export ke CSV/PDF
- [ ] Multi-currency support
- [ ] Budget target per kategori
- [ ] Recurring transactions
- [ ] Goal tracking
- [ ] Advanced analytics (dashboard)
- [ ] Mobile app version
- [ ] Cloud sync
- [ ] Multi-user support
- [ ] Receipt OCR

## 🎓 Learning Resources

- **HTML/CSS** - Struktur dan styling modern
- **JavaScript** - Event handling, DOM manipulation
- **LocalStorage API** - Penyimpanan data lokal
- **Chart.js** - Data visualization
- **NLP Basics** - Text processing dan pattern matching

## 📝 License

Bebas digunakan untuk keperluan personal dan komersial.

## 💡 Tips & Trick

1. **Rutin Input Data** - Semakin banyak data, semakin akurat prediksi
2. **Deskripsi Detail** - "Beli Kopi Melati" lebih baik dari "Belanja"
3. **Cek Rekomendasi** - Baca saran AI setiap hari
4. **Monitor Trend** - Lihat chart untuk lihat pola pengeluaran
5. **Set Target** - Gunakan prediksi untuk target pengeluaran harian

## 🎉 Selamat Menggunakan!

SmartBudget siap membantu Anda mengelola keuangan dengan lebih cerdas dan efisien. Semoga aplikasi ini membantu Anda mencapai target finansial! ✨

---

**Dibuat dengan ❤️ untuk membantu Anda mengelola keuangan lebih baik.**
