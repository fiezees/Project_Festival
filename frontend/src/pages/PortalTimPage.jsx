import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sprout, MapPin, Camera, CheckCircle2, Clock, XCircle, 
  LogOut, Plus, Trash2, ArrowLeft, RefreshCw, AlertCircle,
  User, Lock, Compass, AlertTriangle, ShieldAlert, Edit
} from 'lucide-react';
import { 
  timLogin, getTimProfile, getTimPlantingPoints, 
  submitTimPlantingPoint, updateTimPlantingPoint, deleteTimPlantingPoint,
  getAssetUrl
} from '../services/api';
import { processAndCompressImage, IMAGE_FALLBACK_SVG } from '../utils/imageOptimizer';
import { validatePointGeofence } from '../utils/geofence';

const formatPointCode = (id) => `#TP-${String(id).padStart(3, '0')}`;

const LOKASI_OPTIONS = [
  { id: 'batu-busuak', nama: 'Batu Busuak, Pauh' },
  { id: 'lambung-bukit', nama: 'Lambung Bukit, Pauh' },
  { id: 'gunung-nago', nama: 'Gunung Nago, Pauh' },
  { id: 'gunung-sarik', nama: 'Gunung Sarik, Kuranji' },
];

const POHON_OPTIONS = [
  'Trembesi (Albizia saman)',
  'Mahoni (Swietenia mahagoni)',
  'Beringin (Ficus benjamina)',
  'Gaharu (Aquilaria malaccensis)',
  'Ketapang Kencana (Terminalia mantaly)',
  'Pohon Asli DAS Lokal',
];

export default function PortalTimPage({ onNavigateHome }) {
  // Auth state
  const [timToken, setTimToken] = useState(() => localStorage.getItem('fth_tim_token') || '');
  const [timUser, setTimUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fth_tim_user') || 'null');
    } catch {
      return null;
    }
  });

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [profileData, setProfileData] = useState(null);
  const [pointsList, setPointsList] = useState([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Add / Edit Point Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [clearExistingAfter, setClearExistingAfter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [gettingGps, setGettingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    lokasi_id: 'batu-busuak',
    lokasi_nama: 'Batu Busuak, Pauh',
    jenis_pohon: 'Trembesi (Albizia saman)',
    umur_tanam_bulan: 3,
    jangka_hidup_tahun: 50,
  });

  const [fotoBeforeFile, setFotoBeforeFile] = useState(null);
  const [fotoBeforePreview, setFotoBeforePreview] = useState('');
  const [fotoAfterFile, setFotoAfterFile] = useState(null);
  const [fotoAfterPreview, setFotoAfterPreview] = useState('');

  // Auto-compression & format normalization states
  const [optimizingBefore, setOptimizingBefore] = useState(false);
  const [optimizingAfter, setOptimizingAfter] = useState(false);
  const [beforeStats, setBeforeStats] = useState(null);
  const [afterStats, setAfterStats] = useState(null);

  // Geofence confirmation state
  const [overrideOutOfZone, setOverrideOutOfZone] = useState(false);

  // Evaluasi geofence realtime
  const geofenceCheck = useMemo(() => {
    if (!formData.latitude || !formData.longitude) return null;
    return validatePointGeofence(formData.latitude, formData.longitude, formData.lokasi_id);
  }, [formData.latitude, formData.longitude, formData.lokasi_id]);

  const speciesOptions = useMemo(() => {
    if (formData.jenis_pohon && !POHON_OPTIONS.includes(formData.jenis_pohon)) {
      return [formData.jenis_pohon, ...POHON_OPTIONS];
    }
    return POHON_OPTIONS;
  }, [formData.jenis_pohon]);

  const locationOptions = useMemo(() => {
    if (formData.lokasi_id && !LOKASI_OPTIONS.some((o) => o.id === formData.lokasi_id)) {
      return [
        { id: formData.lokasi_id, nama: formData.lokasi_nama || formData.lokasi_id },
        ...LOKASI_OPTIONS,
      ];
    }
    return LOKASI_OPTIONS;
  }, [formData.lokasi_id, formData.lokasi_nama]);

  // Photo viewer modal
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);

  // Fetch data on login
  useEffect(() => {
    if (timToken) {
      loadTeamData();
    }
  }, [timToken]);

  const loadTeamData = async () => {
    setLoadingPoints(true);
    try {
      const [profRes, pointsRes] = await Promise.all([
        getTimProfile(timToken),
        getTimPlantingPoints(timToken),
      ]);
      setProfileData(profRes);
      setPointsList(pointsRes.data || []);
    } catch (err) {
      console.error('Error loading team data:', err);
      if (err.status === 401 || err.message?.includes('Token')) {
        handleLogout();
      }
    } finally {
      setLoadingPoints(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await timLogin(loginForm.username, loginForm.password);
      setTimToken(res.token);
      setTimUser(res.team);
      localStorage.setItem('fth_tim_token', res.token);
      localStorage.setItem('fth_tim_user', JSON.stringify(res.team));
      setLoginForm({ username: '', password: '' });
    } catch (err) {
      setLoginError(err.message || 'Login gagal. Periksa username dan kata sandi tim Anda.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setTimToken('');
    setTimUser(null);
    setProfileData(null);
    setPointsList([]);
    localStorage.removeItem('fth_tim_token');
    localStorage.removeItem('fth_tim_user');
  };

  // Get current device GPS coordinates
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung fitur GPS.');
      return;
    }

    setGettingGps(true);
    setFormError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGettingGps(false);
      },
      (err) => {
        setGettingGps(false);
        console.warn('GPS Error:', err);
        setFormError(`Gagal membaca GPS: ${err.message}. Pastikan izin lokasi aktif di browser ponsel.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (type === 'before') {
      setOptimizingBefore(true);
      try {
        const result = await processAndCompressImage(file, 1280, 0.82);
        setFotoBeforeFile(result.file);
        setFotoBeforePreview(result.previewUrl);
        setBeforeStats(result);
      } catch (err) {
        console.error('Error optimizing before photo:', err);
        setFotoBeforeFile(file);
        setFotoBeforePreview(URL.createObjectURL(file));
      } finally {
        setOptimizingBefore(false);
      }
    } else {
      setClearExistingAfter(false);
      setOptimizingAfter(true);
      try {
        const result = await processAndCompressImage(file, 1280, 0.82);
        setFotoAfterFile(result.file);
        setFotoAfterPreview(result.previewUrl);
        setAfterStats(result);
      } catch (err) {
        console.error('Error optimizing after photo:', err);
        setFotoAfterFile(file);
        setFotoAfterPreview(URL.createObjectURL(file));
      } finally {
        setOptimizingAfter(false);
      }
    }
  };

  const resetModalMediaState = () => {
    setFotoBeforeFile(null);
    setFotoAfterFile(null);
    setBeforeStats(null);
    setAfterStats(null);
    setOptimizingBefore(false);
    setOptimizingAfter(false);
    setClearExistingAfter(false);
    setOverrideOutOfZone(false);
    setFormError('');
    setGpsAccuracy(null);
  };

  const handleOpenAddModal = () => {
    setEditingPoint(null);
    setFormData({
      latitude: '',
      longitude: '',
      lokasi_id: 'batu-busuak',
      lokasi_nama: 'Batu Busuak, Pauh',
      jenis_pohon: 'Trembesi (Albizia saman)',
      umur_tanam_bulan: 1,
      jangka_hidup_tahun: 50,
    });
    setFotoBeforePreview('');
    setFotoAfterPreview('');
    resetModalMediaState();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pt) => {
    const matchedLoc = LOKASI_OPTIONS.find((o) => o.id === pt.lokasi_id);
    setEditingPoint(pt);
    setFormData({
      latitude: pt.latitude != null ? String(pt.latitude) : '',
      longitude: pt.longitude != null ? String(pt.longitude) : '',
      lokasi_id: pt.lokasi_id || 'batu-busuak',
      lokasi_nama: pt.lokasi_nama || matchedLoc?.nama || 'Batu Busuak, Pauh',
      jenis_pohon: pt.jenis_pohon || 'Trembesi (Albizia saman)',
      umur_tanam_bulan: pt.umur_tanam_bulan ?? 1,
      jangka_hidup_tahun: pt.jangka_hidup_tahun ?? 50,
    });
    setFotoBeforePreview(pt.foto_before_url ? getAssetUrl(pt.foto_before_url) : '');
    setFotoAfterPreview(pt.foto_after_url ? getAssetUrl(pt.foto_after_url) : '');
    resetModalMediaState();
    setIsModalOpen(true);
  };

  const handleSubmitPoint = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.latitude || !formData.longitude) {
      setFormError('Koordinat GPS wajib diisi. Tekan tombol "Ambil Lokasi Saya" di atas.');
      return;
    }

    if (geofenceCheck && geofenceCheck.status === 'out_of_bounds' && !overrideOutOfZone) {
      setFormError(`🚨 Peringatan Geofence: Koordinat GPS Anda terdeteksi berjarak ${geofenceCheck.distanceFormatted} di luar area penanaman resmi ${geofenceCheck.zoneName}. Silakan centang kotak konfirmasi di bawah jika ini adalah lokasi khusus yang disetujui panitia.`);
      return;
    }

    if (!fotoBeforeFile && (!editingPoint || !fotoBeforePreview)) {
      setFormError('Foto awal saat pertama ditanam (Before) wajib diunggah. Foto After (setelah 6 bulan) boleh menyusul.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append('latitude', formData.latitude);
      formPayload.append('longitude', formData.longitude);
      formPayload.append('lokasi_id', formData.lokasi_id);
      formPayload.append('lokasi_nama', formData.lokasi_nama);
      formPayload.append('jenis_pohon', formData.jenis_pohon);
      formPayload.append('umur_tanam_bulan', formData.umur_tanam_bulan);
      formPayload.append('jangka_hidup_tahun', formData.jangka_hidup_tahun);
      if (fotoBeforeFile) {
        formPayload.append('foto_before', fotoBeforeFile);
      }
      if (fotoAfterFile) {
        formPayload.append('foto_after', fotoAfterFile);
      } else if (editingPoint && clearExistingAfter) {
        formPayload.append('clear_foto_after', 'true');
      }

      if (editingPoint) {
        await updateTimPlantingPoint(timToken, editingPoint.id, formPayload);
        setActionNotice(
          `Titik ${formatPointCode(editingPoint.id)} berhasil diperbarui dengan kode yang sama! Menunggu verifikasi ulang panitia.`
        );
      } else {
        await submitTimPlantingPoint(timToken, formPayload);
        setActionNotice('Titik penanaman berhasil dikirim! Menunggu verifikasi panitia.');
      }

      setIsModalOpen(false);
      setEditingPoint(null);
      setTimeout(() => setActionNotice(''), 6000);
      loadTeamData();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan titik penanaman.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePoint = async (pointId) => {
    if (!window.confirm('Yakin ingin menghapus titik penanaman ini?')) return;
    try {
      await deleteTimPlantingPoint(timToken, pointId);
      setActionNotice('Titik penanaman berhasil dihapus.');
      setTimeout(() => setActionNotice(''), 4000);
      loadTeamData();
    } catch (err) {
      alert(`Gagal menghapus titik: ${err.message}`);
    }
  };

  // =========================================================================
  // VIEW 1: Login Form (If not authenticated)
  // =========================================================================
  if (!timToken || !timUser) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex flex-col justify-between p-4 sm:p-6 text-gray-900">
        <header className="max-w-md mx-auto w-full flex items-center justify-between py-2">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#063F35] bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </button>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full">
            Portal Tim Penanam
          </span>
        </header>

        <div className="max-w-md mx-auto w-full bg-white rounded-2xl shadow-xl border border-gray-200/80 p-6 sm:p-8 my-auto">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex p-1.5 bg-white rounded-full shadow-lg border-2 border-[#F4B91F]/40 mb-2 w-20 h-20 items-center justify-center overflow-hidden mx-auto">
              <img
                src="/logo-festival.png"
                alt="Logo Festival Tanam Hulu"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-[#063F35] tracking-tight">
              Portal Tim Penanaman
            </h1>
            <p className="text-xs text-gray-600 max-w-xs mx-auto">
              Khusus 10 Tim Terpilih Festival Tanam Hulu 2026 untuk menginput titik koordinat dan foto aksi di lapangan.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Username Tim
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Contoh: reg1857"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Masukkan kata sandi tim"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#063F35] hover:bg-[#084f43] text-[#F4B91F] font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk ke Portal Tim</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Belum memiliki akun tim? Akun diberikan khusus oleh panitia kepada tim yang proposalnya dinyatakan <strong>Diterima</strong>.
            </p>
          </div>
        </div>

        <footer className="text-center text-xs text-gray-400 py-2">
          Festival Tanam Hulu 2026 &bull; Perkumpulan Galapagos
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: Team Dashboard (Field Planter Interface)
  // =========================================================================
  const stats = profileData?.stats || {
    target_pohon: timUser.target_pohon || 10,
    total_submitted: pointsList.length,
    total_approved: pointsList.filter((p) => p.status_verifikasi === 'approved').length,
    total_pending: pointsList.filter((p) => p.status_verifikasi === 'pending').length,
  };

  const progressPercent = Math.min(
    100,
    Math.round((stats.total_approved / (stats.target_pohon || 10)) * 100)
  );

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-gray-900 flex flex-col justify-between">
      {/* Team Portal Header */}
      <header className="sticky top-0 z-40 bg-[#063F35] text-white shadow-md border-b border-[#F4B91F]/20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white p-0.5 shadow-sm border border-[#F4B91F]/50 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo-festival.png" alt="Logo Festival Tanam Hulu" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-[#F4B91F] font-bold">
                Tim Penanaman
              </div>
              <div className="text-sm font-black truncate max-w-[180px] sm:max-w-xs leading-tight">
                {timUser.nama_tim}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadTeamData}
              disabled={loadingPoints}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Segarkan data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPoints ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold bg-rose-600/80 hover:bg-rose-700 px-3 py-1.5 rounded-lg text-white transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-3xl mx-auto w-full px-4 py-6 space-y-5 flex-grow">
        {/* Toast Action Notice */}
        {actionNotice && (
          <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice('')} className="text-emerald-700 font-bold">✕</button>
          </div>
        )}

        {/* Progress & Target Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-[#063F35]">
                Target Penanaman Pohon
              </h2>
              <p className="text-xs text-gray-500">
                Ketua Tim: {timUser.nama_ketua} &bull; No. WA: {timUser.telepon}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-700">
                {stats.total_approved}
              </span>
              <span className="text-xs font-bold text-gray-400">
                /{stats.target_pohon} Pohon Terverifikasi
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
            <div 
              className="bg-gradient-to-r from-emerald-600 to-[#F4B91F] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stat Pills */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-xs font-bold text-emerald-700">{stats.total_approved}</div>
              <div className="text-[10px] text-emerald-600 font-medium">Disetujui</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
              <div className="text-xs font-bold text-amber-700">{stats.total_pending}</div>
              <div className="text-[10px] text-amber-600 font-medium">Menunggu</div>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-xs font-bold text-gray-700">{stats.total_submitted}</div>
              <div className="text-[10px] text-gray-500 font-medium">Total Diinput</div>
            </div>
          </div>
        </div>

        {/* Big Action Button to Record New Point */}
        <button
          onClick={handleOpenAddModal}
          className="w-full py-4 px-6 bg-[#063F35] hover:bg-[#084f43] text-white rounded-2xl shadow-lg border-2 border-[#F4B91F]/40 flex items-center justify-center gap-3 transition-transform active:scale-98 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-[#F4B91F] text-[#063F35] flex items-center justify-center font-bold">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-black text-[#F4B91F] group-hover:underline">
              Catat Titik Tanam Baru
            </div>
            <div className="text-[11px] text-gray-200">
              Upload GPS &amp; foto pertama ditanam (Before); foto 6 bulan (After) bisa menyusul
            </div>
          </div>
        </button>

        {/* Planted Points List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Riwayat Titik Tanam Tim ({pointsList.length})
            </h3>
            <span className="text-[11px] text-gray-400">Urut terbaru</span>
          </div>

          {pointsList.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-700">Belum ada titik tanam terdata</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Saat Anda melakukan aksi penanaman di lapangan, tekan tombol "Catat Titik Tanam Baru" di atas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pointsList.map((pt, idx) => (
                <div 
                  key={pt.id} 
                  className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#063F35]">
                          Pohon #{pointsList.length - idx}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {formatPointCode(pt.id)}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          {pt.jenis_pohon}
                        </span>
                        {pt.status_verifikasi === 'pending' && pt.updated_at && (
                          <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                            Pembaruan • Verifikasi Ulang
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{pt.lokasi_nama}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {pt.status_verifikasi === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Tayang di Peta</span>
                        </span>
                      ) : pt.status_verifikasi === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Perlu Revisi</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Menunggu Verifikasi</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Photos Thumbnail Before (Tanam Awal) & After (Setelah 6 Bulan) */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div 
                      onClick={() => pt.foto_before_url && setPreviewPhotoUrl(pt.foto_before_url)}
                      className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[3/4] border border-gray-200 cursor-pointer group shadow-xs"
                      title="Klik untuk melihat foto saat pertama ditanam penuh"
                    >
                      <img
                        src={getAssetUrl(pt.foto_before_url)}
                        alt="Before (Saat Pertama Ditanam)"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = IMAGE_FALLBACK_SVG;
                        }}
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Before · Awal Tanam
                      </span>
                      <span className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        🔍 Perbesar
                      </span>
                    </div>

                    {pt.foto_after_url ? (
                      <div
                        onClick={() => setPreviewPhotoUrl(pt.foto_after_url)}
                        className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[3/4] border border-gray-200 cursor-pointer group shadow-xs"
                        title="Klik untuk melihat foto perkembangan setelah 6 bulan"
                      >
                        <img
                          src={getAssetUrl(pt.foto_after_url)}
                          alt="After (Setelah 6 Bulan Ditanam)"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = IMAGE_FALLBACK_SVG;
                          }}
                        />
                        <span className="absolute bottom-1.5 left-1.5 bg-emerald-950/85 backdrop-blur-xs text-[#F4B91F] text-[9px] font-bold px-1.5 py-0.5 rounded">
                          After · 6 Bulan
                        </span>
                        <span className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          🔍 Perbesar
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(pt)}
                        className="relative rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 aspect-[3/4] border-2 border-dashed border-emerald-300 cursor-pointer flex flex-col items-center justify-center p-3 text-center gap-1.5 transition-colors"
                        title="Klik untuk mengunggah foto perkembangan setelah 6 bulan"
                      >
                        <div className="w-8 h-8 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-[#063F35] leading-tight">
                          Foto After (6 Bulan)
                        </span>
                        <span className="text-[10px] text-emerald-800/80 leading-snug">
                          Belum diunggah. Klik Edit untuk melengkapi perkembangan tanaman.
                        </span>
                        <span className="mt-0.5 text-[10px] font-bold text-white bg-[#063F35] px-2.5 py-1 rounded-full">
                          + Upload After
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Coordinates & Always-Active Edit + Conditional Delete Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-gray-100 text-gray-500">
                    <a
                      href={`https://www.google.com/maps?q=${pt.latitude},${pt.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-emerald-700 underline font-mono text-[11px]"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{pt.latitude}, {pt.longitude}</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(pt)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#063F35] border border-emerald-200 text-[11px] font-bold cursor-pointer transition-colors"
                        title="Edit data atau lengkapi foto 6 bulan (kode tetap sama & diajukan verifikasi ulang)"
                      >
                        <Edit className="w-3 h-3" />
                        <span>{pt.foto_after_url ? 'Edit / Update' : 'Edit / Tambah After'}</span>
                      </button>

                      {pt.status_verifikasi !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleDeletePoint(pt.id)}
                          className="flex items-center gap-1 text-rose-600 hover:text-rose-800 text-[11px] font-semibold cursor-pointer px-1.5 py-1"
                          title="Hapus titik ini"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reviewer Note from Committee if any */}
                  {pt.catatan_verifikasi && (
                    <div className="p-2.5 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200">
                      <strong>Catatan Panitia:</strong> {pt.catatan_verifikasi}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: Form Catat / Edit Titik Tanam */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-bold">
                  <Sprout className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#063F35]">
                    {editingPoint
                      ? `Edit & Update Titik ${formatPointCode(editingPoint.id)}`
                      : 'Input Titik Pohon Baru'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {editingPoint
                      ? 'Perubahan menggunakan kode titik yang sama & memicu verifikasi ulang admin'
                      : 'Rekam koordinat GPS dan foto pertama ditanam (Before)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editingPoint && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] leading-relaxed">
                <strong>Pembaruan Titik {formatPointCode(editingPoint.id)}:</strong> Data tetap terhitung sebagai pengiriman yang sama. Setelah disimpan, status otomatis kembali <strong>Menunggu Verifikasi Admin</strong> untuk kurasi ulang sebelum tayang di peta.
              </div>
            )}

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPoint} className="space-y-4 text-xs">
              {/* Step 1: GPS Coordinates */}
              <div className="space-y-2 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#063F35] uppercase tracking-wider text-[11px]">
                    1. Koordinat Titik Tanam (GPS)
                  </label>
                  {gpsAccuracy && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Akurasi: ±{gpsAccuracy}m
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={gettingGps}
                  className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60 transition-colors"
                >
                  <MapPin className={`w-4 h-4 text-[#F4B91F] ${gettingGps ? 'animate-bounce' : ''}`} />
                  <span>{gettingGps ? 'Sedang Membaca GPS Ponsel...' : '📍 Ambil Lokasi Saya Sekarang (GPS)'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div>
                    <span className="text-[10px] text-gray-500 block mb-0.5">Latitude:</span>
                    <input
                      type="text"
                      required
                      placeholder="-0.908500"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block mb-0.5">Longitude:</span>
                    <input
                      type="text"
                      required
                      placeholder="100.453200"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Realtime Geofence Validation Badge */}
                {geofenceCheck && formData.latitude && formData.longitude && (
                  <div className={`mt-2 p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                    geofenceCheck.status === 'valid'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : geofenceCheck.status === 'warning'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      {geofenceCheck.status === 'valid' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>✅ Koordinat Valid di Dalam Zona {geofenceCheck.zoneName}</span>
                        </>
                      ) : geofenceCheck.status === 'warning' ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>⚠️ Perbatasan Zona (Jarak: ~{geofenceCheck.distanceFormatted})</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>🚨 Di Luar Zona Konservasi ({geofenceCheck.distanceFormatted})</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-gray-700">
                      {geofenceCheck.status === 'out_of_bounds'
                        ? `Posisi GPS Anda terdeteksi berjarak ${geofenceCheck.distanceFormatted} di luar batas resmi ${geofenceCheck.zoneName}. Mohon pastikan Anda mengambil foto dan merekam titik saat berada langsung di lokasi aksi penanaman di lapangan.`
                        : geofenceCheck.message}
                    </p>

                    {geofenceCheck.status === 'out_of_bounds' && (
                      <label className="flex items-start gap-2 pt-1 border-t border-rose-200 mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={overrideOutOfZone}
                          onChange={(e) => setOverrideOutOfZone(e.target.checked)}
                          className="mt-0.5 rounded text-rose-600"
                        />
                        <span className="text-[10px] text-rose-800 font-semibold leading-tight">
                          Saya konfirmasi titik ini adalah area tanam khusus yang telah dikoordinasikan dengan panitia (akan diverifikasi).
                        </span>
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Location & Tree Species */}
              <div className="space-y-3">
                <label className="font-bold text-gray-700 uppercase tracking-wider text-[11px] block">
                  2. Informasi Pohon &amp; Lokasi
                </label>

                <div>
                  <span className="text-gray-600 block mb-1">Zona Wilayah Penanaman:</span>
                  <select
                    value={formData.lokasi_id}
                    onChange={(e) => {
                      const sel = LOKASI_OPTIONS.find((o) => o.id === e.target.value);
                      setFormData({
                        ...formData,
                        lokasi_id: e.target.value,
                        lokasi_nama: sel ? sel.nama : e.target.value,
                      });
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-gray-600 block mb-1">Jenis Pohon:</span>
                  <select
                    value={formData.jenis_pohon}
                    onChange={(e) => setFormData({ ...formData, jenis_pohon: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                  >
                    {speciesOptions.map((tree) => (
                      <option key={tree} value={tree}>{tree}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600 block mb-1">Umur Tanam (Bulan):</span>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={formData.umur_tanam_bulan}
                      onChange={(e) => setFormData({ ...formData, umur_tanam_bulan: e.target.value })}
                      className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Estimasi Hidup (Tahun):</span>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={formData.jangka_hidup_tahun}
                      onChange={(e) => setFormData({ ...formData, jangka_hidup_tahun: e.target.value })}
                      className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Photos Before (Tanam Awal) & After (6 Bulan Opsional) */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[11px] block">
                    3. Unggah Bukti Foto Lapangan
                  </label>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Foto After (6 bulan) boleh menyusul
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Foto Before (Saat Pertama Ditanam — Wajib) */}
                  <div className="p-3 border border-gray-200 rounded-xl space-y-2 bg-gray-50/50">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="font-semibold text-gray-800 block">📷 Foto Before</span>
                        <span className="text-[10px] text-gray-500 block">Saat pertama ditanam (Wajib)</span>
                      </div>
                      {beforeStats ? (
                        <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-700" />
                          Hemat {beforeStats.savedPercentage}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded shrink-0">
                          Wajib
                        </span>
                      )}
                    </div>

                    {optimizingBefore && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengompresi &amp; menyelaraskan foto...</span>
                      </div>
                    )}

                    {fotoBeforePreview ? (
                      <div className="space-y-1.5">
                        <div className="relative rounded-lg overflow-hidden aspect-[3/4] max-h-64 mx-auto bg-gray-200">
                          <img src={fotoBeforePreview} alt="Before Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { 
                              setFotoBeforeFile(null); 
                              setFotoBeforePreview(''); 
                              setBeforeStats(null);
                            }}
                            title="Ganti foto Before"
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full text-[10px] cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                        {beforeStats && (
                          <div className="text-[10px] text-gray-500 flex items-center justify-between px-1">
                            <span>{beforeStats.originalSize} ➔ <strong className="text-emerald-700">{beforeStats.compressedSize}</strong></span>
                            <span className="text-emerald-600 font-medium">JPEG Standar</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      !optimizingBefore && (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-center">
                          <Camera className="w-5 h-5 text-gray-400 mb-1" />
                          <span className="text-[11px] text-gray-600 font-medium">Buka Kamera / Foto</span>
                          <span className="text-[9px] text-gray-400">Otomatis dikompres &amp; format apapun diterima</span>
                          <input
                            type="file"
                            accept="image/*,.heic,.heif"
                            capture="environment"
                            onChange={(e) => handleFileChange(e, 'before')}
                            className="hidden"
                          />
                        </label>
                      )
                    )}
                  </div>

                  {/* Foto After (Setelah 6 Bulan — Opsional Saat Awal) */}
                  <div className="p-3 border rounded-xl space-y-2 bg-emerald-50/40 border-emerald-200">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="font-semibold text-emerald-900 block">🌳 Foto After</span>
                        <span className="text-[10px] text-emerald-700 block">Setelah 6 bulan ditanam</span>
                      </div>
                      {afterStats ? (
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full shrink-0">
                          Hemat {afterStats.savedPercentage}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shrink-0">
                          Opsional
                        </span>
                      )}
                    </div>

                    {optimizingAfter && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengompresi &amp; menyelaraskan foto...</span>
                      </div>
                    )}

                    {fotoAfterPreview ? (
                      <div className="space-y-1.5">
                        <div className="relative rounded-lg overflow-hidden aspect-[3/4] max-h-64 mx-auto bg-gray-200">
                          <img src={fotoAfterPreview} alt="After Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { 
                              setFotoAfterFile(null); 
                              setFotoAfterPreview(''); 
                              setAfterStats(null);
                              if (editingPoint?.foto_after_url) {
                                setClearExistingAfter(true);
                              }
                            }}
                            title="Hapus / ganti foto After"
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full text-[10px] cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                        {afterStats && (
                          <div className="text-[10px] text-emerald-700 flex items-center justify-between px-1">
                            <span>{afterStats.originalSize} ➔ <strong className="text-emerald-900">{afterStats.compressedSize}</strong></span>
                            <span className="text-emerald-800 font-medium">JPEG Standar</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      !optimizingAfter && (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors text-center">
                          <Camera className="w-5 h-5 text-emerald-600 mb-1" />
                          <span className="text-[11px] text-emerald-800 font-medium">Upload Foto 6 Bulan</span>
                          <span className="text-[9px] text-emerald-700">Boleh dikosongkan dulu saat awal tanam</span>
                          <input
                            type="file"
                            accept="image/*,.heic,.heif"
                            capture="environment"
                            onChange={(e) => handleFileChange(e, 'after')}
                            className="hidden"
                          />
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || optimizingBefore || optimizingAfter}
                  className="px-5 py-2.5 rounded-xl bg-[#063F35] hover:bg-[#084f43] text-[#F4B91F] font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : editingPoint ? (
                    <span>Simpan &amp; Ajukan Verifikasi Ulang</span>
                  ) : (
                    <span>Kirim Titik Penanaman</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Fullsize Photo Viewer */}
      {previewPhotoUrl && (
        <div 
          onClick={() => setPreviewPhotoUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={getAssetUrl(previewPhotoUrl)} 
              alt="Foto Dokumentasi" 
              className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = IMAGE_FALLBACK_SVG;
              }}
            />
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white font-bold flex items-center justify-center hover:bg-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200/60 bg-white">
        Portal Aksi Lapangan Festival Tanam Hulu 2026 &bull; Perkumpulan Galapagos
      </footer>
    </div>
  );
}
