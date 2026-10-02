export const FESTIVAL_INFO = {
  title: "Festival Tanam Hulu",
  subtitle: "Gerakan Konservasi Hulu Sungai & Penghijauan Berkelanjutan Padang 2026",
  tagline: "Menanam Masa Depan, Menjaga Air Mata Kita di Hulu",
  targetLubangTanam: 60000,
  startDate: "10 Oktober 2026",
  totalPrize: 100000000,
  totalPrizeFormatted: "Rp 100.000.000",
  locationOverview: "Kecamatan Pauh & Kecamatan Kuranji, Kota Padang, Sumatera Barat"
};

export const LOCATIONS_DATA = [
  {
    id: "batu-busuak",
    name: "Batu Busuak",
    kecamatan: "Pauh",
    city: "Kota Padang",
    coordinates: [-0.9085, 100.4532],
    targetTrees: 18000,
    areaSize: "45 Hektar",
    description: "Area hulu sungai utama di kaki Bukit Barisan dengan lanskap perbukitan asri. Terkenal dengan sejarah PLTA lama dan keanekaragaman flora lokal. Konservasi fokus mencegah erosi tebing sungai.",
    treeTypes: ["Surian", "Mahoni", "Durian Unggul", "Pala"],
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80",
    badgeColor: "emerald"
  },
  {
    id: "lambung-bukit",
    name: "Lambung Bukit",
    kecamatan: "Pauh",
    city: "Kota Padang",
    coordinates: [-0.9168, 100.4410],
    targetTrees: 15000,
    areaSize: "38 Hektar",
    description: "Zona resapan air strategis yang menyuplai ketersediaan air bersih kawasan perkotaan Padang. Penghijauan ditujukan untuk penguatan vegetasi lereng bukit kritis.",
    treeTypes: ["Trembesi", "Bambu Betung", "Kayu Manis", "Alpukat"],
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
    badgeColor: "teal"
  },
  {
    id: "gunung-nago",
    name: "Gunung Nago",
    kecamatan: "Pauh",
    city: "Kota Padang",
    coordinates: [-0.9254, 100.4321],
    targetTrees: 14000,
    areaSize: "32 Hektar",
    description: "Kawasan penangkap air dekat intake jaringan irigasi hulu. Penanaman vegetasi berakar dalam membantu kestabilan struktur tanah dan pemeliharaan sumber mata air alami.",
    treeTypes: ["Pinus", "Surian", "Manggis", "Jambu Biji"],
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80",
    badgeColor: "green"
  },
  {
    id: "gunung-sarik",
    name: "Gunung Sarik",
    kecamatan: "Kuranji",
    city: "Kota Padang",
    coordinates: [-0.8872, 100.4180],
    targetTrees: 13000,
    areaSize: "30 Hektar",
    description: "Wilayah sub-DAS Kuranji yang mengolaborasikan masyarakat lokal dan pemuda hijau. Proyek penanaman difokuskan pada pemulihan lahan terdegradasi dan pencegahan sedimentasi.",
    treeTypes: ["Petai", "Rambutan", "Matoa", "Kayu Manis"],
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80",
    badgeColor: "lime"
  }
];

export const TIMELINE_DATA = [
  {
    step: 1,
    title: "Focus Group Discussion (FGD)",
    date: "10 Oktober 2026",
    status: "Mendatang",
    description: "Pertemuan mendalam antara pakar tata lingkungan, tokoh adat Pauh & Kuranji, akademisi Unand/UNP, serta pemangku kebijakan untuk finalisasi zonasi dan metodologi tanam.",
    icon: "Users"
  },
  {
    step: 2,
    title: "Sosialisasi Festival Tanam Hulu",
    date: "18 Oktober 2026",
    status: "Mendatang",
    description: "Kampanye kesadaran publik di kampus, sekolah, dan balai desa. Penjelasan teknis mengenai kriteria keikutsertaan dan distribusi bibit tanaman.",
    icon: "Megaphone"
  },
  {
    step: 3,
    title: "Submit Proposal Peserta",
    date: "25 Okt - 10 Nov 2026",
    status: "Pendaftaran",
    description: "Pendaftaran resmi tim/komunitas/sekolah dan penyerahan proposal rencana aksi penanaman serta komitmen pemeliharaan 6 bulan pasca-tanam.",
    icon: "FileText"
  },
  {
    step: 4,
    title: "Pengumuman Peserta Lolos",
    date: "15 November 2026",
    status: "Mendatang",
    description: "Publikasi tim peserta terpilih yang berhak mendapatkan bantuan bibit unggul, pupuk organik, dan pendampingan WebGIS.",
    icon: "CheckCircle2"
  },
  {
    step: 5,
    title: "Festival Aksi Tanam Serentak",
    date: "25 - 27 Nov 2026",
    status: "Acara Utama",
    description: "Puncak aksi gotong royong penanaman 60.000 bibit di 4 zonasi (Batu Busuak, Lambung Bukit, Gunung Nago & Gunung Sarik) secara berseri selama 3 hari.",
    icon: "Sprout"
  },
  {
    step: 6,
    title: "Penjurian & Evaluasi Kelangsungan Hidup",
    date: "01 - 10 Des 2026",
    status: "Mendatang",
    description: "Monitoring dan verifikasi lapangan oleh dewan juri independen menggunakan geotagging WebGIS untuk mengukur tingkat kelangsungan hidup pohon.",
    icon: "Award"
  },
  {
    step: 7,
    title: "Pengumuman Pemenang & Anugerah",
    date: "15 Desember 2026",
    status: "Mendatang",
    description: "Malam penganugerahan pemenang, pembagian total hadiah Rp 100.000.000, serta penyerahan sertifikat apresiasi hijau.",
    icon: "Trophy"
  }
];

export const PRIZE_DATA = {
  total: 100000000,
  categories: [
    {
      rank: "Juara 1 (Terbaik Utama)",
      amount: "Rp 40.000.000",
      rawAmount: 40000000,
      rewards: [
        "Uang Pembinaan Rp 40.000.000",
        "Piala Bergilir Wali Kota Padang & Gubernur Sumatera Barat",
        "Sertifikat Penghargaan Konservasi Utama",
        "Paket Alat Perawatan & Pupuk Organik 1 Tahun",
        "Pendampingan WebGIS Komunitas Penuh"
      ],
      color: "from-amber-500 to-yellow-600",
      icon: "Crown"
    },
    {
      rank: "Juara 2 (Runner Up)",
      amount: "Rp 25.000.000",
      rawAmount: 25000000,
      rewards: [
        "Uang Pembinaan Rp 25.000.000",
        "Trofi Runner-Up & Piagam Kehormatan",
        "Paket Bibit Pohon Produksi Unggul (500 Bibit)",
        "Sertifikat Penghargaan Hijau"
      ],
      color: "from-slate-400 to-slate-600",
      icon: "Medal"
    },
    {
      rank: "Juara 3 (Juara III)",
      amount: "Rp 15.000.000",
      rawAmount: 15000000,
      rewards: [
        "Uang Pembinaan Rp 15.000.000",
        "Trofi Juara III & Piagam Kehormatan",
        "Paket Bibit Pohon Produksi Unggul (300 Bibit)",
        "Sertifikat Penghargaan Hijau"
      ],
      color: "from-amber-700 to-amber-900",
      icon: "Award"
    },
    {
      rank: "Harapan 1, 2, & 3",
      amount: "Rp 10.000.000",
      rawAmount: 10000000,
      rewards: [
        "Uang Pembinaan total Rp 10.000.000 (@ Rp 3.330.000)",
        "Plakat Harapan & Sertifikat Partisipasi Tingkat Provinsi"
      ],
      color: "from-emerald-600 to-teal-700",
      icon: "Star"
    },
    {
      rank: "Kategori Khusus (Inovasi & Favorit)",
      amount: "Rp 10.000.000",
      rawAmount: 10000000,
      rewards: [
        "Inovasi Teknik Penanaman Ramah Lingkungan (Rp 5.000.000)",
        "Komunitas Terfavorit Pilihan Warga (Rp 5.000.000)",
        "Plakat Khusus Dewan Juri"
      ],
      color: "from-indigo-600 to-purple-700",
      icon: "Sparkles"
    }
  ]
};

export const NEWS_DATA = [
  {
    id: "berita-1",
    title: "60.000 Lubang Tanam Siap Disiapkan untuk Festival Tanam Hulu 2026",
    category: "Persiapan",
    date: "20 September 2026",
    author: "Dr. Hafiz",
    summary: "Panitia Festival Tanam Hulu mematangkan persiapan pemetaan 60.000 titik penggalian di kawasan Batu Busuak, Lambung Bukit, Gunung Nago, dan Gunung Sarik.",
    content: `KOTA PADANG — Menjelang pembukaan Festival Tanam Hulu 2026 pada Oktober mendatang, panitia pelaksana bekerja sama dengan Dinas Lingkungan Hidup dan komunitas pemuda lokal telah memulai tahap awal validasi titik tanam.

    Sebanyak 60.000 titik lubang tanam ditargetkan tersebar di 4 objek lokasi strategis, yaitu Batu Busuak (18.000 titik), Lambung Bukit (15.000 titik), Gunung Nago (14.000 titik), dan Gunung Sarik (13.000 titik). 

    Penyiapan titik ini memanfaatkan teknologi geospasial WebGIS untuk memastikan penanaman tidak hanya sekadar formalitas, namun memperhatikan topografi, kesuburan tanah, serta keamanan lereng dari potensi tanah longsor.

    "Kami ingin memastikan setiap bibit yang ditanam memiliki koordinat yang tercatat dan umur tanam yang dapat dipantau secara berkala melalui sistem GIS," ungkap ketua pelaksana dalam rapat kooperatif.`,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80",
    readTime: "4 menit"
  },
  {
    id: "berita-2",
    title: "Kerapuhan Hulu Sungai Padang: Mengapa Batu Busuak dan Lambung Bukit Jadi Fokus?",
    category: "Edukasi",
    date: "15 September 2026",
    author: "Dr. Fachri",
    summary: "Ulasan mendalam mengenai pentingnya tutupan vegetasi kayu keras di Daerah Aliran Sungai (DAS) Pauh untuk mencegah banjir bandang Kota Padang.",
    content: `Daerah Aliran Sungai (DAS) Pauh dan Kuranji merupakan dua benteng resapan air terpenting bagi Kota Padang. Namun, maraknya pembukaan lahan dan alih fungsi hutan di kawasan hulu seperti Batu Busuak dan Lambung Bukit menuntut perhatian ekstra.

    Pohon-pohon spesifik seperti Surian, Mahoni, Kayu Manis, dan Bambu Betung memiliki sistem perakaran serabut dan tunggang yang sanggup mencengkeram tanah hingga kedalaman puluhan meter.

    Dengan penanaman 60.000 bibit ini, diperkirakan tingkat retensi air hujan akan meningkat hingga 35%, mengurangi risiko debit limpasan ekstrem saat curah hujan tinggi di puncak musim penghujan.`,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80",
    readTime: "6 menit"
  },
  {
    id: "berita-3",
    title: "Total Hadiah Rp 100 Juta Siap Diperebutkan Komunitas Hijau & Sekolah",
    category: "Pengumuman",
    date: "10 September 2026",
    author: "Dr. Hafiz",
    summary: "Ajang apresiasi terbesar bagi pegiat lingkungan Sumatera Barat kembali hadir dengan total hadiah Rp 100.000.000 dan trofi bergilir.",
    content: `Festival Tanam Hulu 2026 tidak hanya menjadi gerakan konservasi, tetapi juga ruang apresiasi dan kompetisi positif bagi seluruh elemen masyarakat. Panitia mengalokasikan total hadiah sebesar Rp 100.000.000 untuk kategori kelompok terbaik, sekolah hijau, dan inovasi pemeliharaan pohon.

    Penilaian tidak hanya diambil dari jumlah pohon yang ditanam, tetapi juga kerapihan pengorganisasian, persentase daya tumbuh hidup (survival rate) dalam kurun waktu pemantauan, serta keterlibatan warga lokal.

    Pendaftaran proposal aksi tanam akan dibuka resmi mulai 25 Oktober 2026 mendatang melalui website resmi ini.`,
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1000&q=80",
    readTime: "3 menit"
  },
  {
    id: "berita-4",
    title: "Kolaborasi Pemuda Kuranji dan Pauh Siapkan Pembibitan Pohon Endemik",
    category: "Konservasi",
    date: "02 September 2026",
    author: "Dr. Fachri",
    summary: "Ratusan pemuda dari Gunung Nago dan Gunung Sarik bahu membahu menyiapkan rumah bibit swadaya untuk menyuplai bibit unggul berkualitas.",
    content: `Semangat gotong royong tampak menggelora di Kecamatan Pauh dan Kuranji. Pemuda karang taruna setempat telah mendirikan 4 titik persemaian bibit swadaya yang menampung jenis tanaman produktif dan kayu hutan.

    Bibit buah seperti Durian Unggul, Alpukat, Manggis, dan Matoa dipilih agar selain berfungsi menjaga daya serap air, juga memberikan manfaat ekonomi berjangka bagi warga di masa mendatang.`,
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80",
    readTime: "5 menit"
  }
];

export const MOCK_GIS_POINTS = [
  {
    id: "TH-BB-001",
    namaPenanam: "Kelompok Tani Batu Busuak",
    lokasi: "Batu Busuak",
    kecamatan: "Pauh",
    koordinat: [-0.9085, 100.4532],
    jenisPohon: "Surian (Toona sinensis)",
    umurTanam: "2 Bulan",
    jangkaHidup: "80 - 100 Tahun",
    status: "Sehat / Tumbuh Baik",
    tinggi: "1.2 Meter"
  },
  {
    id: "TH-BB-002",
    namaPenanam: "Komunitas Pemuda Pauh Hijau",
    lokasi: "Batu Busuak",
    kecamatan: "Pauh",
    koordinat: [-0.9062, 100.4560],
    jenisPohon: "Mahoni (Swietenia mahagoni)",
    umurTanam: "1 Bulan",
    jangkaHidup: "70 - 90 Tahun",
    status: "Sehat / Tumbuh Baik",
    tinggi: "0.9 Meter"
  },
  {
    id: "TH-LB-015",
    namaPenanam: "Pramuka Peduli Lingkungan Padang",
    lokasi: "Lambung Bukit",
    kecamatan: "Pauh",
    koordinat: [-0.9168, 100.4410],
    jenisPohon: "Trembesi (Samanea saman)",
    umurTanam: "3 Bulan",
    jangkaHidup: "100+ Tahun",
    status: "Sehat / Tumbuh Baik",
    tinggi: "1.8 Meter"
  },
  {
    id: "TH-LB-016",
    namaPenanam: "Masyarakat Peduli DAS Pauh",
    lokasi: "Lambung Bukit",
    kecamatan: "Pauh",
    koordinat: [-0.9190, 100.4442],
    jenisPohon: "Bambu Betung (Dendrocalamus asper)",
    umurTanam: "1.5 Bulan",
    jangkaHidup: "50 - 80 Tahun",
    status: "Sehat / Tumbuh Baik",
    tinggi: "1.5 Meter"
  },
  {
    id: "TH-GN-088",
    namaPenanam: "Mapala Universitas Andalas",
    lokasi: "Gunung Nago",
    kecamatan: "Pauh",
    koordinat: [-0.9254, 100.4321],
    jenisPohon: "Pinus (Pinus merkusii)",
    umurTanam: "2 Bulan",
    jangkaHidup: "100+ Tahun",
    status: "Sehat / Tumbuh Baik",
    tinggi: "1.1 Meter"
  },
  {
    id: "TH-GS-104",
    namaPenanam: "Karang Taruna Kuranji Mandiri",
    lokasi: "Gunung Sarik",
    kecamatan: "Kuranji",
    koordinat: [-0.8872, 100.4180],
    jenisPohon: "Kayu Manis (Cinnamomum burmannii)",
    umurTanam: "1 Bulan",
    jangkaHidup: "60 - 80 Tahun",
    status: "Sehat / Tumbuh Baik",
    tinggi: "0.8 Meter"
  },
  {
    id: "TH-GS-105",
    namaPenanam: "Komunitas Tanam Pohon Nusantara",
    lokasi: "Gunung Sarik",
    kecamatan: "Kuranji",
    koordinat: [-0.8895, 100.4215],
    jenisPohon: "Durian Unggul (Durio zibethinus)",
    umurTanam: "2 Bulan",
    jangkaHidup: "100+ Tahun",
    status: "Sehat / Tumbuh Baik",
    tinggi: "1.3 Meter"
  }
];
