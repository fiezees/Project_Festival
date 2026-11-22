import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, User, LogOut, Search, Filter, RefreshCw, 
  FileText, Download, CheckCircle2, Clock, XCircle, AlertCircle, 
  Trash2, Eye, ExternalLink, ArrowLeft, Mail,
  MessageCircle, X, FileSpreadsheet, CheckSquare, Save, ChevronDown
} from 'lucide-react';
import { 
  adminLogin, getAdminProposals, updateProposalStatus, 
  deleteProposal, getProposalDownloadUrl, getProposalPreviewUrl,
  updateProposalNotes, bulkUpdateProposalStatus
} from '../services/api';

// Dynamic WhatsApp Templates by Status
function getWhatsAppTemplate(proposal, type = null) {
  if (!proposal) return '';
  const ketua = proposal.nama_ketua || 'Kak';
  const tim = proposal.nama_tim || '';
  const regId = proposal.nomor_registrasi || '-';
  const st = type || (proposal.status || 'Menunggu');

  switch (st) {
    case 'Diterima':
      return `Halo ${ketua} dari tim "${tim}". Selamat! Proposal Anda (No. Reg: ${regId}) dinyatakan DITERIMA pada seleksi Festival Tanam Hulu 2026. Mohon konfirmasi kesiapan tim Anda untuk mengikuti technical meeting dan persiapan aksi penanaman. Salam lestari!`;
    case 'Ditinjau':
      return `Halo ${ketua} dari tim "${tim}". Terkait proposal Anda (No. Reg: ${regId}), saat ini berkas sedang DITINJAU oleh dewan juri Festival Tanam Hulu 2026. Mohon pastikan kontak WhatsApp Anda selalu aktif untuk koordinasi.`;
    case 'Ditolak':
      return `Halo ${ketua} dari tim "${tim}". Terima kasih atas partisipasi dan pengajuan proposal tim Anda (No. Reg: ${regId}). Setelah proses kurasi mendalam, dengan berat hati kami sampaikan bahwa proposal tim Anda belum dapat diterima pada periode ini. Tetap semangat berkarya menjaga lingkungan!`;
    case 'Revisi':
      return `Halo ${ketua} dari tim "${tim}". Terkait proposal Anda (No. Reg: ${regId}), ada kelengkapan berkas/data yang perlu dikonfirmasi atau diperbaiki. Mohon kesediaannya menghubungi panitia kembali. Terima kasih.`;
    default:
      return `Halo ${ketua} dari tim "${tim}", kami dari Panitia Festival Tanam Hulu 2026 ingin mengonfirmasi terkait pendaftaran proposal Anda (No. Reg: ${regId}).`;
  }
}

// Helper to format WhatsApp URL with country code & dynamic template
function getWhatsAppLink(phone, proposal = null, templateType = null) {
  if (!phone) return '#';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  
  const msg = proposal ? getWhatsAppTemplate(proposal, templateType) : '';
  return `https://wa.me/${cleaned}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
}

// Helper to format Email mailto link with pre-filled subject and body
function getEmailMailto(email, proposal = null) {
  if (!email) return '#';
  let subject = 'Festival Tanam Hulu 2026 - Konfirmasi Pendaftaran Proposal';
  let body = '';
  
  if (proposal) {
    subject = `[Festival Tanam Hulu 2026] Pendaftaran Proposal: ${proposal.nama_tim || ''} (${proposal.nomor_registrasi || ''})`;
    body = `Halo ${proposal.nama_ketua || 'Ketua Tim'},\n\nTerima kasih telah mendaftarkan proposal untuk Tim "${proposal.nama_tim || ''}" dalam ajang Festival Tanam Hulu 2026.\n\nDetail Pendaftaran:\n- Nomor Registrasi : ${proposal.nomor_registrasi || '-'}\n- Nama Tim         : ${proposal.nama_tim || '-'}\n- Status Saat Ini   : ${proposal.status || 'Menunggu'}\n\nJika ada dokumen perbaikan atau informasi yang ingin dikonfirmasi, silakan membalas email ini.\n\nSalam lestari,\nPanitia Festival Tanam Hulu 2026`;
  }
  
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

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

  // Detail Modal & Preview Modal state
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [previewPdfProposal, setPreviewPdfProposal] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Bulk actions & Admin internal notes
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatusUpdating, setBulkStatusUpdating] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Close export dropdown when clicking outside
  useEffect(() => {
    if (!exportDropdownOpen) return;
    const handleOutsideClick = () => setExportDropdownOpen(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [exportDropdownOpen]);

  // Helper to open detail modal and sync note
  const handleOpenDetail = (item) => {
    setSelectedProposal(item);
    setAdminNoteInput(item.catatan_admin || '');
  };

  // Helper to open PDF preview modal and sync note
  const handleOpenPreview = (item) => {
    setPreviewPdfProposal(item);
    setAdminNoteInput(item.catatan_admin || '');
  };

  // Handle ESC key to close open modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (previewPdfProposal) setPreviewPdfProposal(null);
        else if (selectedProposal) setSelectedProposal(null);
        else if (deleteConfirmId) setDeleteConfirmId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewPdfProposal, selectedProposal, deleteConfirmId]);

  const handleLogout = () => {
    setToken('');
    setAdminUser(null);
    localStorage.removeItem('fth_admin_token');
    localStorage.removeItem('fth_admin_user');
  };

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

  // Load proposals when logged in or filters change
  useEffect(() => {
    if (token) {
      fetchProposals();
    }
  }, [token, statusFilter]);

  // Save admin internal notes
  const handleSaveAdminNote = async (proposalId) => {
    if (!proposalId) return;
    setIsSavingNote(true);
    try {
      await updateProposalNotes(token, proposalId, adminNoteInput);
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, catatan_admin: adminNoteInput } : p))
      );
      if (selectedProposal && selectedProposal.id === proposalId) {
        setSelectedProposal((prev) => ({ ...prev, catatan_admin: adminNoteInput }));
      }
      if (previewPdfProposal && previewPdfProposal.id === proposalId) {
        setPreviewPdfProposal((prev) => ({ ...prev, catatan_admin: adminNoteInput }));
      }
      showNotification('Catatan reviewer berhasil disimpan.');
    } catch (err) {
      alert(`Gagal menyimpan catatan: ${err.message}`);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Bulk row selection
  const toggleSelectAll = () => {
    if (selectedIds.length === proposals.length && proposals.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(proposals.map((p) => p.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Ubah status ${selectedIds.length} proposal terpilih menjadi "${newStatus}"?`)) return;

    setBulkStatusUpdating(true);
    try {
      await bulkUpdateProposalStatus(token, selectedIds, newStatus);
      setProposals((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, status: newStatus } : p))
      );
      fetchProposals();
      showNotification(`Berhasil mengubah status ${selectedIds.length} proposal menjadi "${newStatus}".`);
      setSelectedIds([]);
    } catch (err) {
      alert(`Gagal mengubah status massal: ${err.message}`);
    } finally {
      setBulkStatusUpdating(false);
    }
  };

  // Helper to escape HTML characters for XML/Spreadsheet
  const escapeHtml = (val) => {
    if (val === null || val === undefined) return '-';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Export to Native Excel (.xls) - Formats cleanly into separate columns in WPS Office & MS Excel
  const handleExportExcel = (onlySelected = false) => {
    const list = onlySelected
      ? proposals.filter((p) => selectedIds.includes(p.id))
      : proposals;

    if (!list || list.length === 0) {
      alert('Tidak ada data pendaftaran untuk diekspor.');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const dateFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const getStatusStyle = (status) => {
      switch (status) {
        case 'Diterima':
          return 'background-color: #dcfce7; color: #166534; font-weight: bold; text-align: center;';
        case 'Ditinjau':
          return 'background-color: #e0f2fe; color: #075985; font-weight: bold; text-align: center;';
        case 'Ditolak':
          return 'background-color: #ffe4e6; color: #9f1239; font-weight: bold; text-align: center;';
        default:
          return 'background-color: #fef3c7; color: #92400e; font-weight: bold; text-align: center;';
      }
    };

    const tableRows = list
      .map(
        (item, index) => `
        <tr>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px 8px;">${index + 1}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px 8px; mso-number-format: '\\@'; font-weight: bold; color: #063F35;">${escapeHtml(item.nomor_registrasi)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: 600;">${escapeHtml(item.nama_tim)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${escapeHtml(item.nama_ketua)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; color: #1e40af;">${escapeHtml(item.email)}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px 8px; mso-number-format: '\\@'; font-weight: 500;">${escapeHtml(item.telepon)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; ${getStatusStyle(item.status)}">${escapeHtml(item.status)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; color: #475569;">${escapeHtml(item.nama_file || '-')}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${escapeHtml(item.catatan || '-')}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; background-color: #fafaf9;">${escapeHtml(item.catatan_admin || '-')}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 9pt; color: #64748b;">${escapeHtml(formatDate(item.created_at))}</td>
        </tr>`
      )
      .join('');

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Data Pendaftar Festival</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th {
            background-color: #063F35;
            color: #ffffff;
            font-weight: bold;
            font-size: 10.5pt;
            padding: 9px 10px;
            border: 1px solid #042822;
            text-align: left;
          }
          th.center { text-align: center; }
          td {
            font-size: 9.5pt;
            font-family: Calibri, 'Segoe UI', Arial, sans-serif;
            vertical-align: middle;
          }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th colspan="11" style="background-color: #063F35; color: #F4B91F; font-size: 13pt; font-weight: bold; padding: 12px; text-align: center; border: 1px solid #042822;">
                FESTIVAL POHON RIAU 2026 - REKAPITULASI PENDAFTARAN &amp; PROPOSAL
              </th>
            </tr>
            <tr>
              <td colspan="11" style="background-color: #f1f5f9; font-size: 9pt; color: #475569; padding: 6px 10px; border: 1px solid #cbd5e1; font-style: italic;">
                Waktu Unduh: ${dateFormatted} WIB | Total: ${list.length} Tim Pendaftar | Filter: ${statusFilter}
              </td>
            </tr>
            <tr>
              <th class="center" style="width: 45px;">No</th>
              <th class="center" style="width: 140px;">No. Registrasi</th>
              <th style="width: 200px;">Nama Tim</th>
              <th style="width: 160px;">Nama Ketua</th>
              <th style="width: 220px;">Email Kontak</th>
              <th class="center" style="width: 140px;">No. WhatsApp</th>
              <th class="center" style="width: 110px;">Status</th>
              <th style="width: 210px;">Nama File Proposal</th>
              <th style="width: 230px;">Catatan Pendaftar</th>
              <th style="width: 230px;">Catatan Reviewer / Admin</th>
              <th class="center" style="width: 150px;">Waktu Pendaftaran</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pendaftar_Festival_Pohon_${todayStr}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`Berhasil mengekspor ${list.length} data pendaftar ke file Excel (.xls).`);
  };

  // Export to CSV with semicolon separator and UTF-8 BOM (Windows Indonesian locale compatible)
  const handleExportCsv = (onlySelected = false) => {
    const list = onlySelected
      ? proposals.filter((p) => selectedIds.includes(p.id))
      : proposals;

    if (!list || list.length === 0) {
      alert('Tidak ada data pendaftaran untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'No. Registrasi',
      'Nama Tim',
      'Nama Ketua',
      'Email Kontak',
      'No. WhatsApp / Telepon',
      'Status Pendaftaran',
      'Nama File Proposal',
      'Catatan Pendaftar',
      'Catatan Reviewer / Admin',
      'Waktu Pendaftaran',
    ];

    const escapeCsv = (val, forceText = false) => {
      if (val === null || val === undefined) return '""';
      const clean = String(val).replace(/"/g, '""');
      if (forceText) {
        return `="""${clean}"""`;
      }
      return `"${clean}"`;
    };

    const csvRows = [
      'sep=;',
      headers.map((h) => `"${h}"`).join(';'),
      ...list.map((item, index) =>
        [
          index + 1,
          escapeCsv(item.nomor_registrasi, true),
          escapeCsv(item.nama_tim),
          escapeCsv(item.nama_ketua),
          escapeCsv(item.email),
          escapeCsv(item.telepon, true),
          escapeCsv(item.status),
          escapeCsv(item.nama_file || '-'),
          escapeCsv(item.catatan || '-'),
          escapeCsv(item.catatan_admin || '-'),
          escapeCsv(formatDate(item.created_at)),
        ].join(';')
      ),
    ];

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pendaftar_Festival_Pohon_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`Berhasil mengekspor ${list.length} data pendaftar ke file CSV (Pemisah Titik Koma).`);
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
      if (previewPdfProposal && previewPdfProposal.id === proposalId) {
        setPreviewPdfProposal((prev) => ({ ...prev, status: newStatus }));
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
      if (previewPdfProposal && previewPdfProposal.id === proposalId) {
        setPreviewPdfProposal(null);
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

            {/* Export Dropdown Group */}
            <div className="relative inline-flex items-center rounded-lg shadow-sm border border-emerald-300 bg-emerald-50">
              <button
                type="button"
                onClick={() => handleExportExcel(false)}
                disabled={loadingData || proposals.length === 0}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 px-3 py-2 rounded-l-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Ekspor ke Excel (.xls) - Format rapi berkolom otomatis untuk WPS Office & MS Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Ekspor Excel (.xls)</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExportDropdownOpen(!exportDropdownOpen);
                }}
                disabled={loadingData || proposals.length === 0}
                className="px-2 py-2 hover:bg-emerald-100 border-l border-emerald-200 text-emerald-800 rounded-r-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Pilihan format ekspor lain (CSV)"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {exportDropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-30 animate-fade-in text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Pilih Format Ekspor
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportExcel(false);
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-gray-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                      XLS
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Format Excel (.xls)</div>
                      <div className="text-[10px] text-emerald-700 font-medium">★ Rekomendasi (WPS &amp; Excel Rapi)</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportCsv(false);
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2.5 transition-colors border-t border-gray-100 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                      CSV
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Format CSV (.csv)</div>
                      <div className="text-[10px] text-gray-500">Pemisah titik-koma (Windows ID)</div>
                    </div>
                  </button>
                </div>
              )}
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

        {/* Floating Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-[#063F35] text-white p-3.5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-fade-in border border-[#F4B91F]/30">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <CheckSquare className="w-4 h-4 text-[#F4B91F]" />
              <span><strong>{selectedIds.length}</strong> proposal pendaftar dipilih</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-300 text-[11px] hidden md:inline">Ubah Status Terpilih:</span>
              {['Menunggu', 'Ditinjau', 'Diterima', 'Ditolak'].map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={bulkStatusUpdating}
                  onClick={() => handleBulkStatusChange(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    st === 'Diterima'
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
              <button
                type="button"
                onClick={() => handleExportExcel(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-[11px] font-semibold cursor-pointer transition-colors"
                title="Ekspor data proposal terpilih ke Excel (.xls)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#F4B91F]" />
                <span>Ekspor Terpilih (.xls)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 bg-black/40 hover:bg-black/60 text-gray-200 rounded-md text-[11px] cursor-pointer transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}

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
                  <th className="py-3.5 px-3 w-10 text-center">
                    <input 
                      type="checkbox"
                      aria-label="Pilih semua proposal"
                      checked={proposals.length > 0 && selectedIds.length === proposals.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-[#063F35] focus:ring-[#063F35] cursor-pointer"
                    />
                  </th>
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
                    <td colSpan="8" className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#063F35]" />
                        <span className="text-sm">Memuat data pendaftar proposal...</span>
                      </div>
                    </td>
                  </tr>
                ) : proposals.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500">
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
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${
                        selectedIds.includes(item.id) 
                          ? 'bg-emerald-50/60 hover:bg-emerald-50/80' 
                          : 'hover:bg-gray-50/80'
                      }`}
                    >
                      {/* Checkbox Kolom */}
                      <td className="py-3.5 px-3 text-center">
                        <input 
                          type="checkbox"
                          aria-label={`Pilih proposal ${item.nama_tim}`}
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectRow(item.id)}
                          className="rounded border-gray-300 text-[#063F35] focus:ring-[#063F35] cursor-pointer"
                        />
                      </td>

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
                        {item.catatan_admin && (
                          <div className="text-[11px] text-amber-700 font-medium line-clamp-1 max-w-xs mt-0.5 flex items-center gap-1">
                            <span>📝</span>
                            <span>{item.catatan_admin}</span>
                          </div>
                        )}
                      </td>

                      {/* Ketua & Kontak */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{item.nama_ketua}</div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs mt-1">
                          <a 
                            href={getEmailMailto(item.email, item)} 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer group"
                            title={`Klik untuk mengirim email langsung ke ${item.email}`}
                          >
                            <Mail className="w-3 h-3 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="truncate max-w-[120px] font-medium">{item.email}</span>
                          </a>
                          <a 
                            href={getWhatsAppLink(item.telepon, item)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-medium transition-colors cursor-pointer group"
                            title={`Klik untuk chat WhatsApp langsung ke ${item.telepon} (Pesan otomatis sesuai status: ${item.status})`}
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600 group-hover:scale-110 transition-transform" />
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
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(item)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#063F35] text-xs font-bold border border-emerald-200 transition-all hover:shadow-2xs active:scale-95 cursor-pointer group"
                              title="Klik untuk pratinjau (preview) pop-up langsung PDF dokumen ini"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#2E8068] group-hover:scale-110 transition-transform" />
                              <span className="max-w-[95px] truncate">{item.nama_file || 'Preview PDF'}</span>
                            </button>

                            <a
                              href={getProposalDownloadUrl(item.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-[#063F35] hover:bg-gray-100 rounded-md transition-colors"
                              title="Unduh file ke perangkat"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
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
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 text-gray-600 hover:text-[#063F35] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
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
                  <span className="text-[11px] text-gray-500 block uppercase font-semibold mb-1">Email Kontak</span>
                  <a 
                    href={getEmailMailto(selectedProposal.email, selectedProposal)} 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium transition-all group"
                    title={`Klik untuk kirim email langsung ke ${selectedProposal.email}`}
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="break-all">{selectedProposal.email}</span>
                  </a>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block uppercase font-semibold mb-1">WhatsApp / Telepon</span>
                  <a 
                    href={getWhatsAppLink(selectedProposal.telepon, selectedProposal)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-xs font-bold transition-all group"
                    title={`Klik untuk chat WhatsApp langsung ke ${selectedProposal.telepon} (Template otomatis sesuai status saat ini: ${selectedProposal.status})`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span>{selectedProposal.telepon}</span>
                  </a>

                  {/* Template Cepat WhatsApp Sesuai Status */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px]">
                    <span className="text-gray-400 text-[10px]">Pesan Cepat:</span>
                    <a
                      href={getWhatsAppLink(selectedProposal.telepon, selectedProposal, 'Diterima')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-medium transition-colors"
                      title="Kirim draf WhatsApp ucapan selamat lolos berkas (Diterima)"
                    >
                      ✓ Lolos
                    </a>
                    <a
                      href={getWhatsAppLink(selectedProposal.telepon, selectedProposal, 'Ditinjau')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-1.5 py-0.5 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 font-medium transition-colors"
                      title="Kirim draf WhatsApp info proses peninjauan"
                    >
                      ⏳ Ditinjau
                    </a>
                    <a
                      href={getWhatsAppLink(selectedProposal.telepon, selectedProposal, 'Revisi')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition-colors"
                      title="Kirim draf WhatsApp permintaan perbaikan berkas"
                    >
                      ✏️ Revisi
                    </a>
                    <a
                      href={getWhatsAppLink(selectedProposal.telepon, selectedProposal, 'Ditolak')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-medium transition-colors"
                      title="Kirim draf WhatsApp pemberitahuan penolakan santun"
                    >
                      ✕ Ditolak
                    </a>
                  </div>
                </div>
              </div>

              {/* Catatan Tim */}
              <div>
                <span className="text-[11px] text-gray-500 block uppercase font-semibold mb-1">Catatan / Ringkasan Aksi Peserta</span>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                  {selectedProposal.catatan || 'Tidak ada catatan tambahan yang dilampirkan oleh pendaftar.'}
                </div>
              </div>

              {/* Catatan Internal Panitia / Reviewer */}
              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-amber-900 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    <span>Catatan Internal Panitia / Reviewer</span>
                  </span>
                  {isSavingNote && <span className="text-[10px] text-amber-700 animate-pulse font-semibold">Menyimpan...</span>}
                </div>
                <textarea
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Tulis catatan evaluasi internal, kesepakatan dewan juri, atau catatan perbaikan (hanya dapat dilihat oleh admin)..."
                  className="w-full bg-white border border-amber-300 rounded-lg p-2.5 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 resize-none h-20 placeholder:text-gray-400"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveAdminNote(selectedProposal.id)}
                    disabled={isSavingNote}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#063F35] hover:bg-[#084f43] text-[#F4B91F] rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Catatan Reviewer</span>
                  </button>
                </div>
              </div>

              {/* Berkas Proposal */}
              <div>
                <span className="text-[11px] text-gray-500 block uppercase font-semibold mb-1">Berkas Dokumen Proposal</span>
                {selectedProposal.file_path ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-8 h-8 text-[#2E8068] flex-shrink-0" />
                      <div className="overflow-hidden">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm truncate" title={selectedProposal.nama_file}>
                          {selectedProposal.nama_file || 'Proposal.pdf'}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {selectedProposal.file_size ? `${(selectedProposal.file_size / 1024 / 1024).toFixed(2)} MB` : 'Dokumen Terlampir'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setPreviewPdfProposal(selectedProposal)}
                        className="flex items-center gap-1.5 bg-[#063F35] hover:bg-[#084f43] text-[#F4B91F] px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                        title="Buka pratinjau PDF langsung dalam bentuk jendela pop up"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview PDF (Pop-up)</span>
                      </button>
                      <a
                        href={getProposalDownloadUrl(selectedProposal.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                        title="Unduh File Berkas"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Unduh</span>
                      </a>
                    </div>
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
          MODAL: Preview PDF Pop-up Langsung (Modal Dialog)
      ───────────────────────────────────────────────────────────── */}
      {previewPdfProposal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewPdfProposal(null);
          }}
        >
          <div className="relative w-full max-w-5xl h-[92vh] max-h-[96vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-scale-up text-left">
            
            {/* Pop-up Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#063F35] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-[#2E8068]" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-[#063F35] text-[#F4B91F] px-2 py-0.5 rounded">
                      {previewPdfProposal.nomor_registrasi}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                      {previewPdfProposal.nama_file || 'Dokumen Proposal'}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    Tim: <strong className="text-gray-700">{previewPdfProposal.nama_tim}</strong> • Ketua: {previewPdfProposal.nama_ketua}
                    {previewPdfProposal.file_size ? ` • ${(previewPdfProposal.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </p>
                </div>
              </div>

              {/* Action Controls in Header */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Quick WA button */}
                <a
                  href={getWhatsAppLink(previewPdfProposal.telepon, previewPdfProposal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  title="Hubungi Ketua Tim via WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Hubungi WA</span>
                </a>

                {/* Quick Email button */}
                <a
                  href={getEmailMailto(previewPdfProposal.email, previewPdfProposal)}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  title="Kirim Email ke Kontak Pendaftar"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kirim Email</span>
                </a>

                {/* Open In New Tab */}
                <a
                  href={getProposalPreviewUrl(previewPdfProposal.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-medium transition-colors"
                  title="Buka pratinjau di tab baru peramban"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tab Baru</span>
                </a>

                {/* Download button */}
                <a
                  href={getProposalDownloadUrl(previewPdfProposal.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-medium transition-colors"
                  title="Unduh berkas fisik"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh</span>
                </a>

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setPreviewPdfProposal(null)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer ml-1"
                  title="Tutup Pratinjau (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pop-up Body: PDF Iframe / Viewer */}
            <div className="relative flex-1 w-full h-full bg-gray-100 flex flex-col overflow-hidden">
              {(() => {
                const fileName = (previewPdfProposal.nama_file || previewPdfProposal.file_path || '').toLowerCase();
                const isDoc = fileName.endsWith('.doc') || fileName.endsWith('.docx');

                if (isDoc) {
                  return (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">Berkas Microsoft Word (.doc/.docx)</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          Dokumen berformat Word tidak dapat dipratinjau langsung di peramban web tanpa pengaya. Anda dapat mengunduh berkas ini langsung ke komputer atau membukanya di Microsoft Office / Google Docs.
                        </p>
                      </div>
                      <div className="flex gap-2.5 pt-2">
                        <a
                          href={getProposalDownloadUrl(previewPdfProposal.id)}
                          className="flex items-center gap-1.5 bg-[#063F35] hover:bg-[#084f43] text-[#F4B91F] px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span>Unduh Dokumen Sekarang</span>
                        </a>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="w-full h-full flex flex-col bg-gray-100">
                    <iframe
                      src={`${getProposalPreviewUrl(previewPdfProposal.id)}#toolbar=1&navpanes=0`}
                      title={previewPdfProposal.nama_file || 'Pratinjau Proposal PDF'}
                      className="w-full h-full flex-1 border-0"
                    />
                  </div>
                );
              })()}
            </div>

            {/* Catatan Reviewer dalam Pratinjau PDF */}
            <div className="px-4 sm:px-6 py-2 bg-amber-50/90 border-t border-amber-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                <span>Catatan Reviewer:</span>
              </div>
              <input
                type="text"
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Tulis catatan evaluasi internal untuk proposal ini (hanya dapat dibaca admin)..."
                className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-1 text-xs text-gray-800 focus:outline-none focus:border-amber-500 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => handleSaveAdminNote(previewPdfProposal.id)}
                disabled={isSavingNote}
                className="flex items-center justify-center gap-1.5 px-3 py-1 bg-[#063F35] hover:bg-[#084f43] text-[#F4B91F] font-bold rounded-lg text-[11px] cursor-pointer flex-shrink-0 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3 h-3" />
                <span>{isSavingNote ? 'Menyimpan...' : 'Simpan Catatan'}</span>
              </button>
            </div>

            {/* Pop-up Footer: Quick Summary & Status Changer */}
            <div className="px-4 sm:px-6 py-2.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">Status Proposal:</span>
                {getStatusBadge(previewPdfProposal.status)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 hidden sm:inline">Ubah Status:</span>
                {['Menunggu', 'Ditinjau', 'Diterima', 'Ditolak'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(previewPdfProposal.id, st)}
                    disabled={previewPdfProposal.status === st}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      previewPdfProposal.status === st
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
                <button
                  type="button"
                  onClick={() => setPreviewPdfProposal(null)}
                  className="ml-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Tutup
                </button>
              </div>
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
