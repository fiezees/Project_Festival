# Rekap Perubahan Website Galapagos & Festival Tanam Hulu

Dokumen ini merangkum perubahan website yang telah diterapkan berdasarkan catatan revisi. Catatan revisi asli tetap disimpan terpisah sebagai sumber kebutuhan.

## Identitas dan navigasi

- Identitas halaman utama diperbarui menjadi **Perkumpulan Galapagos**, termasuk headline, judul tab, metadata halaman, marquee, footer, dan label pada halaman terkait.
- Tombol menuju **Festival Tanam Hulu (FTH)** dibuat menonjol di navigasi dan bagian hero halaman Galapagos. Keduanya membuka halaman utama FTH.
- Navigasi organisasi mencakup tingkat Yayasan, Perkumpulan, dan SISPALA. Halaman organisasi khusus dibuat untuk menjelaskan tingkatan tersebut dan menampilkan nama placeholder seperti `nama1`, `nama2`, dan seterusnya.
- Halaman pendukung yang sudah ada tetap dipertahankan.

## Branding dan tampilan

- Logo Festival Tanam Hulu yang diberikan digunakan pada website dan elemen terkait.
- Watermark halaman Galapagos menggunakan empat aset watermark dalam pola berulang.
- Headline halaman FTH diselaraskan dengan tagline **“Menyemai Lereng, Selamatkan Padang.”**
- Versi cache aset PWA dan favicon diperbarui agar logo baru lebih cepat terlihat setelah website diperbarui.

## Konten Festival dan kawasan aksi

- Istilah wilayah diseragamkan menjadi **Kawasan Aksi Tanam Hulu**.
- Kartu kawasan, popup peta, dan bar fokus tidak lagi menampilkan jumlah lubang tanam. Deskripsi kartu dan popup menampilkan kondisi dampak bencana November 2025.
- Ringkasan dampak yang digunakan adalah data khusus banjir Batu Busuak: 327 jiwa (110 KK) terdampak, 172 jiwa (77 KK) mengungsi, dan dua rumah hanyut. Data tersebut diberi keterangan sebagai data Batu Busuak pada semua kartu; bukan klaim bahwa angka tersebut merupakan data terpisah untuk setiap kawasan.
- Bagian jenis pohon pada kartu kawasan dihilangkan.
- Statistik jumlah tanam pada halaman utama Galapagos dihapus dan narasi berita terkait diperbarui. Target atau angka yang masih menjadi bagian dari agenda Festival di halaman FTH tidak otomatis dihapus oleh perubahan ini.

## Organisasi, agenda, dan pendaftaran

- Bagian hadiah dihapus dari halaman utama, termasuk komponen hadiah, data terkait, dan konten seed/mock yang berkaitan.
- Teks timeline, status pendaftaran, dan notifikasi admin yang sebelumnya menyebut dewan juri, penjurian, atau penganugerahan diperbarui menjadi verifikasi berkas dan pemantauan kegiatan.
- Istilah “kurasi” untuk pemeriksaan titik WebGIS diganti menjadi “verifikasi”; alur pemeriksaan lokasi tetap tersedia.
- Data jumlah lubang tidak lagi digunakan pada komponen lokasi setelah informasi tersebut dihapus dari tampilan.

## Validasi

- `npm.cmd --prefix frontend run build` berhasil. Build masih menampilkan peringatan bahwa bundle JavaScript utama melebihi 500 kB.
- `npm.cmd --prefix frontend run lint` selesai tanpa error, dengan sejumlah warning lint yang tercatat pada kode.
- `git diff --check` berhasil.
- Perilaku tombol FTH pada hero diuji di browser dan membuka halaman `/#home`.
