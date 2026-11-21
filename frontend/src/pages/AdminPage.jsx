import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, User, LogOut, Search, Filter, RefreshCw, 
  FileText, Download, CheckCircle2, Clock, XCircle, AlertCircle, 
  Trash2, Eye, ExternalLink, ArrowLeft, Phone, Mail, Check, ChevronDown
} from 'lucide-react';
import { 
  adminLogin, getAdminProposals, updateProposalStatus, 
  deleteProposal, getProposalDownloadUrl 
} from '../services/api';

export default function AdminPage({ onNavigateHome }) {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('fth_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fth_admin_user') || 'null');
    } catch {
      return null;
    }
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState({ total: 0, menunggu: 0, ditinjau: 0, diterima: 0, ditolak: 0 });
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Detail Modal state
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Load proposals when logged in or filters change
  useEffect(() => {
    if (token) {
      fetchProposals();
    }
  }, [token, statusFilter]);

  const fetchProposals = async (customQuery = null) => {
    setLoadingData(true);
    setDataError('');
    try {
      const q = customQuery !== null ? customQuery : searchQuery;
      const res = await getAdminProposals(token, { q, status: statusFilter });
      setProposals(res.data || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Fetch proposals error:', err);
      if (err.status === 401) {
        handleLogout();
        setLoginError('Sesi login telah berakhir. Silakan masuk kembali.');
      } else {
        setDataError(err.message || 'Gagal memuat data pendaftar.');
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProposals();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await adminLogin(loginForm.username, loginForm.password);
      setToken(res.token);
      setAdminUser(res.user);
      localStorage.setItem('fth_admin_token', res.token);
      localStorage.setItem('fth_admin_user', JSON.stringify(res.user));
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setAdminUser(null);
    localStorage.removeItem('fth_admin_token');
    localStorage.removeItem('fth_admin_user');
  };

  const handleFillDemoCreds = () => {
    setLoginForm({ username: 'admin', password: 'adminfestival2026' });
  };

  const handleStatusChange = async (proposalId, newStatus) => {
    setStatusUpdatingId(proposalId);
    setActionSuccessMsg('');
    try {
      await updateProposalStatus(token, proposalId, newStatus);
      // Update locally
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: newStatus } : p))
      );
      if (selectedProposal && selectedProposal.id === proposalId) {
        setSelectedProposal((prev) => ({ ...prev, status: newStatus }));
      }
      // Refresh stats
      fetchProposals();
      showNotification(`Status pendaftaran berhasil diubah menjadi "${newStatus}"`);
    } catch (err) {
      alert(`Gagal mengubah status: ${err.message}`);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async (proposalId) => {
    try {
      await deleteProposal(token, proposalId);
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
      if (selectedProposal && selectedProposal.id === proposalId) {
        setSelectedProposal(null);
      }
      setDeleteConfirmId(null);
      fetchProposals();
      showNotification('Data pendaftaran berhasil dihapus');
    } catch (err) {
      alert(`Gagal menghapus pendaftaran: ${err.message}`);
    }
  };

  const showNotification = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Diterima':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Diterima
          </span>
        );
      case 'Ditinjau':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
            <Clock className="w-3.5 h-3.5" />
            Ditinjau
          </span>
        );
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      case 'Menunggu':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Menunggu
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // VIEW 1: Login Portal (If not authenticated)
  // ─────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex flex-col justify-center items-center p-4">
        {/* Back to Home Button */}
        <div className="absolute top-6 left-6">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-sm font-semibold text-[#063F35] bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Website</span>
          </button>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3.5 bg-[#063F35] text-[#F4B91F] rounded-2xl shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-[#063F35]">
              Panel Khusus Admin
            </h1>
            <p className="text-sm text-gray-600">
              Masuk untuk mengelola pendaftar & dokumen proposal Festival Tanam Hulu 2026
            </p>
          </div>

          {loginError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Username Admin
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
                  placeholder="Masukkan username admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
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
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#063F35] hover:bg-[#084f43] text-[#F4B91F] font-bold rounded-lg shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? 'Memverifikasi...' : 'Masuk ke Panel Admin'}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="bg-[#F7F5EF] border border-[#e5e7eb] rounded-xl p-4 text-xs text-gray-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#063F35]">Akun Pengelola Bawaan:</span>
              <button
                type="button"
                onClick={handleFillDemoCreds}
                className="text-xs text-[#2E8068] hover:text-[#063F35] font-bold underline cursor-pointer"
              >
                Gunakan Otomatis
              </button>
            </div>
            <div className="font-mono text-[11px] bg-white p-2 rounded border border-gray-200">
              Username: <span className="font-bold text-[#063F35]">admin</span> | Password: <span className="font-bold text-[#063F35]">adminfestival2026</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW 2: Admin Dashboard (When Authenticated)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F2EB] text-[#1a1a1a]">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#063F35] text-white border-b border-emerald-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Title & Brand */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F4B91F] text-[#063F35] rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold leading-tight flex items-center gap-2">
                  <span>Panel Admin Festival</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 text-[#F4B91F] px-2 py-0.5 rounded">
                    Khusus Panitia
                  </span>
                </h1>
                <p className="text-xs text-white/70">
                  Data Pendaftar & Berkas Proposal Tim
                </p>
              </div>
            </div>

            {/* Actions & User Info */}
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateHome}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Lihat Website</span>
              </button>

              <div className="hidden md:flex items-center gap-2 text-xs bg-emerald-950/60 border border-white/10 px-3 py-1.5 rounded-lg">
                <User className="w-3.5 h-3.5 text-[#F4B91F]" />
                <span className="font-medium">{adminUser?.nama_lengkap || 'Administrator'}</span>
              </div>

              <button
                onClick={handleLogout}
                title="Keluar"
                className="flex items-center gap-1.5 text-xs font-semibold bg-red-600/90 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Success toast notification */}
        {actionSuccessMsg && (
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl shadow-sm animate-fade-in">
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button 
              onClick={() => setActionSuccessMsg('')} 
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <div 
            onClick={() => setStatusFilter('Semua')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'Semua' 
                ? 'bg-white border-[#063F35] shadow-md ring-2 ring-[#063F35]/20' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xs font-semibold text-gray-500 uppercase">Total Pendaftar</div>
            <div className="text-2xl font-black text-[#063F35] mt-1">{stats.total}</div>
            <div className="text-[11px] text-gray-400 mt-1">Semua Proposal Masuk</div>
          </div>

          <div 
            onClick={() => setStatusFilter('Menunggu')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'Menunggu' 
                ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xs font-semibold text-amber-600 uppercase flex items-center justify-between">
              <span>Menunggu</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">{stats.menunggu}</div>
            <div className="text-[11px] text-gray-400 mt-1">Perlu diverifikasi</div>
          </div>

          <div 
            onClick={() => setStatusFilter('Ditinjau')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'Ditinjau' 
                ? 'bg-white border-sky-500 shadow-md ring-2 ring-sky-500/20' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xs font-semibold text-sky-600 uppercase flex items-center justify-between">
              <span>Ditinjau</span>
              <Eye className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-sky-700 mt-1">{stats.ditinjau}</div>
            <div className="text-[11px] text-gray-400 mt-1">Dalam proses review</div>
          </div>

          <div 
            onClick={() => setStatusFilter('Diterima')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'Diterima' 
                ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xs font-semibold text-emerald-600 uppercase flex items-center justify-between">
              <span>Diterima</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.diterima}</div>
            <div className="text-[11px] text-gray-400 mt-1">Proposal disetujui</div>
          </div>

          <div 
            onClick={() => setStatusFilter('Ditolak')}
            className={`col-span-2 sm:col-span-1 p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'Ditolak' 
                ? 'bg-white border-rose-500 shadow-md ring-2 ring-rose-500/20' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xs font-semibold text-rose-600 uppercase flex items-center justify-between">
              <span>Ditolak</span>
              <XCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-rose-700 mt-1">{stats.ditolak}</div>
            <div className="text-[11px] text-gray-400 mt-1">Belum memenuhi syarat</div>
          </div>

        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tim, ketua, email, no. registrasi..."
              className="w-full pl-10 pr-20 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-[#063F35] text-white text-xs font-semibold rounded-md hover:bg-[#084f43] transition-colors"
            >
              Cari
            </button>
          </form>

          {/* Filters & Refresh */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:bg-white focus:outline-none focus:border-[#2E8068]"
              >
                <option value="Semua">Semua Status</option>
                <option value="Menunggu">Status: Menunggu</option>
                <option value="Ditinjau">Status: Ditinjau</option>
                <option value="Diterima">Status: Diterima</option>
                <option value="Ditolak">Status: Ditolak</option>
              </select>
            </div>

            <button
              onClick={() => fetchProposals()}
              disabled={loadingData}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>

        </div>

        {/* Proposals Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          
          {dataError && (
            <div className="p-4 bg-red-50 text-red-700 text-sm border-b border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{dataError}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">No. Registrasi</th>
                  <th className="py-3.5 px-4">Nama Tim & Catatan</th>
                  <th className="py-3.5 px-4">Ketua & Kontak</th>
                  <th className="py-3.5 px-4">Waktu Daftar</th>
                  <th className="py-3.5 px-4">Dokumen</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingData ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#063F35]" />
                        <span className="text-sm">Memuat data pendaftar proposal...</span>
                      </div>
                    </td>
                  </tr>
                ) : proposals.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-10 h-10 text-gray-300" />
                        <span className="font-semibold text-gray-700">Belum ada proposal pendaftar</span>
                        <p className="text-xs text-gray-400">
                          {searchQuery || statusFilter !== 'Semua' 
                            ? 'Tidak ada data yang sesuai dengan filter pencarian.' 
                            : 'Ketika peserta mendaftar melalui form proposal di website, datanya akan langsung muncul di sini.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  proposals.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      
                      {/* Nomor Registrasi */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold bg-gray-100 text-[#063F35] px-2.5 py-1 rounded border border-gray-300">
                          {item.nomor_registrasi}
                        </span>
                      </td>

                      {/* Nama Tim */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{item.nama_tim}</div>
                        {item.catatan ? (
                          <div className="text-xs text-gray-500 line-clamp-1 max-w-xs mt-0.5">
                            "{item.catatan}"
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Tanpa catatan</span>
                        )}
                      </td>

                      {/* Ketua & Kontak */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-800">{item.nama_ketua}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <a 
                            href={`mailto:${item.email}`} 
                            className="hover:text-[#2E8068] flex items-center gap-1"
                            title={item.email}
                          >
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="truncate max-w-[120px]">{item.email}</span>
                          </a>
                          <span>•</span>
                          <a 
                            href={`https://wa.me/${item.telepon.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-emerald-600 flex items-center gap-1 font-mono"
                            title="Buka WhatsApp"
                          >
                            <Phone className="w-3 h-3 text-emerald-500" />
                            <span>{item.telepon}</span>
                          </a>
                        </div>
                      </td>

                      {/* Waktu Daftar */}
                      <td className="py-3.5 px-4 text-xs text-gray-600 whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>

                      {/* Dokumen Proposal */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.file_path ? (
                          <a
                            href={getProposalDownloadUrl(item.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#063F35]/10 hover:bg-[#063F35]/20 text-[#063F35] text-xs font-semibold transition-colors"
                            title={item.nama_file || 'Unduh Berkas'}
                          >
                            <Download className="w-3.5 h-3.5 text-[#2E8068]" />
                            <span className="max-w-[100px] truncate">{item.nama_file || 'Unduh File'}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Tidak ada berkas</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <select
                            value={item.status}
                            disabled={statusUpdatingId === item.id}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="text-xs font-semibold rounded-lg pl-2 pr-6 py-1 bg-white border border-gray-300 shadow-sm cursor-pointer focus:outline-none focus:border-[#2E8068]"
                          >
                            <option value="Menunggu">🟡 Menunggu</option>
                            <option value="Ditinjau">🔵 Ditinjau</option>
                            <option value="Diterima">🟢 Diterima</option>
                            <option value="Ditolak">🔴 Ditolak</option>
                          </select>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Detail button */}
                          <button
                            onClick={() => setSelectedProposal(item)}
                            className="p-1.5 text-gray-600 hover:text-[#063F35] hover:bg-gray-100 rounded-md transition-colors"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Hapus Pendaftaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="py-3 px-4 bg-gray-50/70 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div>
              Menampilkan <strong>{proposals.length}</strong> data pendaftaran
            </div>
            <div>
              Diperbarui secara real-time dari database <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-700">pendaftaran_proposal</code>
            </div>
          </div>

        </div>

      </main>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: Detail Proposal Lengkap
      ───────────────────────────────────────────────────────────── */}
      {selectedProposal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProposal(null);
          }}
        >
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden text-left border border-gray-100 animate-scale-up">
            
            {/* Modal Header (Fixed) */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
              <div>
                <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded">
                  {selectedProposal.nomor_registrasi}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#063F35] mt-1.5">
                  {selectedProposal.nama_tim}
                </h3>
                <p className="text-xs text-gray-500">
                  Diajukan pada {formatDate(selectedProposal.created_at)}
                </p>
              </div>

              <button
                onClick={() => setSelectedProposal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4 text-xs sm:text-sm">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div>
                  <span className="text-[11px] text-gray-500 block uppercase font-semibold">Ketua / Penanggung Jawab</span>
                  <span className="font-medium text-gray-900">{selectedProposal.nama_ketua}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block uppercase font-semibold">Status Pendaftaran</span>
                  <div className="mt-1">{getStatusBadge(selectedProposal.status)}</div>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block uppercase font-semibold">Email Kontak</span>
                  <a href={`mailto:${selectedProposal.email}`} className="text-[#2E8068] hover:underline font-medium break-all">
                    {selectedProposal.email}
                  </a>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block uppercase font-semibold">WhatsApp / Telepon</span>
                  <a 
                    href={`https://wa.me/${selectedProposal.telepon.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-mono font-bold hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedProposal.telepon}</span>
                  </a>
                </div>
              </div>

              {/* Catatan Tim */}
              <div>
                <span className="text-[11px] text-gray-500 block uppercase font-semibold mb-1">Catatan / Ringkasan Aksi</span>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                  {selectedProposal.catatan || 'Tidak ada catatan tambahan yang dilampirkan oleh pendaftar.'}
                </div>
              </div>

              {/* Berkas Proposal */}
              <div>
                <span className="text-[11px] text-gray-500 block uppercase font-semibold mb-1">Berkas Dokumen Proposal</span>
                {selectedProposal.file_path ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-7 h-7 text-[#2E8068] flex-shrink-0" />
                      <div className="overflow-hidden">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm truncate">{selectedProposal.nama_file || 'Proposal.pdf'}</div>
                        <div className="text-[11px] text-gray-500">
                          {selectedProposal.file_size ? `${(selectedProposal.file_size / 1024 / 1024).toFixed(2)} MB` : 'Dokumen Terlampir'}
                        </div>
                      </div>
                    </div>
                    <a
                      href={getProposalDownloadUrl(selectedProposal.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#063F35] hover:bg-[#084f43] text-[#F4B91F] px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-95 flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-xs italic">
                    Pendaftar tidak mengunggah file dokumen proposal.
                  </div>
                )}
              </div>

              {/* Status Action Selector */}
              <div className="pt-1">
                <span className="text-[11px] text-gray-500 block uppercase font-semibold mb-1.5">Ubah Status Pendaftaran Ini</span>
                <div className="flex flex-wrap gap-2">
                  {['Menunggu', 'Ditinjau', 'Diterima', 'Ditolak'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedProposal.id, st)}
                      disabled={selectedProposal.status === st}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedProposal.status === st
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                          : st === 'Diterima'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : st === 'Ditinjau'
                          ? 'bg-sky-600 hover:bg-sky-700 text-white'
                          : st === 'Ditolak'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer (Fixed) */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: Konfirmasi Hapus Data
      ───────────────────────────────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-gray-900">Hapus Data Pendaftaran?</h4>
            <p className="text-xs text-gray-600">
              Tindakan ini akan menghapus data pendaftaran dan file proposal secara permanen dari server dan database.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
