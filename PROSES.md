# Ruang Anggaran — Personal Money Management

**Nama:** Aurelia Nurdiansyah Putri  
**NRP:** 5053251006  
**Persona:** Ibu rumah tangga

## Deskripsi
Ruang Anggaran adalah aplikasi web sederhana untuk
mencatat pemasukan dan pengeluaran rumah tangga,
memantau saldo, serta mengelola anggaran kebutuhan keluarga.

# PROSES PENGERJAAN RUANG ANGGARAN

## 1. Persona dan Masalah

Persona aplikasi ini adalah ibu rumah tangga yang perlu mengatur keuangan keluarga sehari-hari. Pengeluaran untuk belanja dapur, transportasi, pendidikan, tagihan rumah, dan kebutuhan lainnya perlu dicatat agar kondisi keuangan lebih mudah dipantau.

Masalah yang ingin diselesaikan adalah kesulitan mencatat pemasukan dan pengeluaran secara teratur, menghitung saldo secara manual, serta memantau sisa anggaran untuk kebutuhan rumah tangga. Oleh karena itu, dibuat aplikasi Ruang Anggaran yang membantu pengguna mencatat transaksi, melihat ringkasan keuangan, dan mengatur anggaran berdasarkan kategori kebutuhan.

## 2. Rancangan Struktur Data

Data transaksi disimpan dalam bentuk array JavaScript. Setiap transaksi direpresentasikan sebagai objek dengan struktur berikut:

* `id`: identitas transaksi.
* `tanggal`: tanggal transaksi.
* `jenis`: jenis transaksi, yaitu pemasukan atau pengeluaran.
* `kategori`: kategori transaksi.
* `nominal`: jumlah uang transaksi.
* `catatan`: keterangan tambahan transaksi.

Contoh struktur data transaksi:

```javascript
{
  id: 1720000000000,
  tanggal: "2026-10-19",
  jenis: "pengeluaran",
  kategori: "Belanja Dapur",
  nominal: 50000,
  catatan: "Belanja sayur"
}
```

Data transaksi disimpan menggunakan `localStorage` agar tetap tersedia ketika halaman dimuat ulang pada browser yang sama.

Data anggaran digunakan untuk menentukan batas pengeluaran berdasarkan kategori, seperti Belanja Dapur, Transportasi, dan Pendidikan.

## 3. Keputusan Desain dan Alasannya

Keputusan desain yang dipilih adalah menggunakan `localStorage` untuk menyimpan data transaksi di browser.

Alasannya, aplikasi ini merupakan aplikasi web sederhana yang menggunakan HTML, CSS, dan JavaScript tanpa memerlukan server atau database eksternal. Dengan `localStorage`, data dapat tetap tersedia setelah halaman dimuat ulang pada browser dan perangkat yang sama.

## 4. Bug dan Kendala yang Ditemui

### Kendala 1: Validasi Input Transaksi

Saat menguji formulir transaksi, perlu dipastikan bahwa nominal kosong, nol, dan negatif tidak dapat disimpan, serta tanggal wajib diisi.

Cara mengatasi:

* Menggunakan atribut validasi HTML seperti `required` dan `min`.
* Menambahkan validasi JavaScript untuk memeriksa nominal harus lebih besar dari nol.
* Menguji input tidak valid dan input valid sebelum melanjutkan pengembangan.

Hasil pengujian yang telah dilaporkan: nominal nol, nominal negatif, nominal kosong, dan tanggal kosong berhasil ditolak; input valid berhasil diproses.

### Kendala 2: Perubahan Kode dan Penyimpanan File

Saat mengedit `script.js`, muncul peringatan bahwa isi file di disk lebih baru daripada versi yang sedang terbuka di VS Code. Kondisi ini berisiko menyebabkan perubahan kode yang diinginkan tertimpa.

Cara mengatasi:

* Memeriksa perbedaan versi sebelum memilih tindakan penyimpanan.
* Mengembalikan `script.js` ke versi commit terakhir menggunakan Git ketika memutuskan untuk memakai versi tersebut.
* Menyimpan perubahan setelah memastikan isi file sudah sesuai.

### Kendala 3: Tampilan Website Tidak Sesuai

Setelah perubahan kode, tampilan website sempat menjadi polos dan tidak lagi menampilkan desain seperti sebelumnya. Terdapat pula teks yang menyerupai penanda perbedaan kode Git pada halaman.

Cara mengatasi:

* Memeriksa pemanggilan file `style.css` pada `index.html`.
* Memastikan file HTML, CSS, dan JavaScript berada di lokasi yang sesuai.
* Memeriksa dan menghapus penanda diff yang tidak sengaja masuk ke HTML jika ditemukan.
* Menghindari penggantian seluruh kode sebelum penyebab masalah dipastikan.

Catatan: kendala tampilan tersebut perlu diperiksa kembali pada versi akhir aplikasi untuk memastikan penyebabnya sudah benar-benar teratasi.

## 5. Pengujian Fitur

Pengujian manual yang telah dilakukan mencakup:

* Menyimpan transaksi pemasukan dan pengeluaran.
* Menguji validasi nominal dan tanggal.
* Menguji nominal desimal.
* Memeriksa kategori sesuai jenis transaksi.
* Menguji catatan dengan karakter khusus.
* Menguji tanggal masa depan.
* Menghapus transaksi.
* Memeriksa data setelah halaman dimuat ulang.
* Menyimpan anggaran dan memeriksa sisa anggaran ketika pengeluaran bertambah.

Hasil akhir setiap fitur perlu dipastikan kembali pada versi aplikasi yang akan dikumpulkan.
