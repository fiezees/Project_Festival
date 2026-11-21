import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
import { submitProposal } from '../services/api';

export default function ProposalModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    email: '',
    phone: '',
    notes: '',
    file: null,
    fileName: null,
  });

  const [registrationId, setRegistrationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMessage('Ukuran file maksimal 10MB.');
        return;
      }
      setErrorMessage('');
      setFormData((prev) => ({
        ...prev,
        file: selectedFile,
        fileName: selectedFile.name,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('teamName', formData.teamName);
      data.append('leaderName', formData.leaderName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('notes', formData.notes || '');

      if (formData.file) {
        data.append('proposalFile', formData.file);
      }

      const res = await submitProposal(data);
      const regId = res?.data?.nomor_registrasi || `FTH2026-REG-${Math.floor(1000 + Math.random() * 9000)}`;
      setRegistrationId(regId);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Submit proposal error:', err);
      setErrorMessage(err.message || 'Gagal mengirim proposal. Pastikan koneksi server backend aktif.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setErrorMessage('');
    setFormData({
      teamName: '',
      leaderName: '',
      email: '',
      phone: '',
      notes: '',
      file: null,
      fileName: null,
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) handleReset();
      }}
    >
      <div className="relative w-full max-w-xl bg-white text-[#1a1a1a] rounded-2xl shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden border border-gray-100 animate-scale-up">
        
        {isSubmitted ? (
          /* SUCCESS SCREEN */
          <div className="flex flex-col h-full overflow-y-auto p-6 sm:p-8 text-center space-y-5">
            <div className="flex justify-center pt-2">
              <div className="w-14 h-14 bg-emerald-100 text-[#2E8068] rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-bold text-[#063F35]">
                Proposal Berhasil Dikirim!
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Terima kasih, <strong>{formData.teamName || 'Tim Peserta'}</strong>! Data & dokumen Anda telah tercatat di sistem Festival Tanam Hulu 2026.
              </p>
            </div>

            <div className="bg-[#F7F5EF] border border-[#e5e7eb] p-3.5 sm:p-4 rounded-xl text-left text-xs sm:text-sm space-y-2 max-w-md mx-auto w-full">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="font-semibold text-[#063F35]">No. Registrasi:</span>
                <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-xs">
                  {registrationId}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-500">Nama Tim:</span>
                <span className="font-medium text-gray-900">{formData.teamName}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-500">Ketua Tim:</span>
                <span className="font-medium text-gray-900">{formData.leaderName}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-500">Kontak:</span>
                <span className="font-medium text-gray-900">{formData.phone}</span>
              </div>
              {formData.fileName && (
                <div className="flex justify-between py-0.5 border-t border-gray-200 pt-1.5">
                  <span className="text-gray-500">Berkas:</span>
                  <span className="font-medium text-[#2E8068] truncate max-w-[200px]">{formData.fileName}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="bg-[#F4B91F] hover:bg-[#e0a719] text-[#063F35] font-bold px-7 py-2.5 rounded-lg text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer"
              >
                Tutup & Selesai
              </button>
            </div>
          </div>
        ) : (
          /* FORM SUBMISSION SCREEN */
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            
            {/* FIXED HEADER (Never cut off or scrolled away) */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 bg-white flex-shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#063F35] leading-tight">
                  Ajukan Proposal Tim
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Festival Tanam Hulu Kota Padang 2026
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCROLLABLE BODY (Scrolls cleanly if height is limited) */}
            <div className="overflow-y-auto flex-1 px-5 py-4 sm:px-6 space-y-3.5">
              
              {errorMessage && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Baris 1: Nama Tim & Ketua */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Tim / Komunitas / Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pemuda Pauh Hijau"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Ketua / Penanggung Jawab <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Rinaldi"
                    value={formData.leaderName}
                    onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Baris 2: Email & No. WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Kontak <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@komunitas.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    No. WhatsApp / Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Baris 3: Catatan Ringkas */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ringkasan / Catatan Aksi <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ceritakan singkat rencana lokasi tanam, jenis pohon, atau anggota..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30 transition-all placeholder:text-gray-400 resize-none"
                />
              </div>

              {/* Baris 4: Upload File Box (Ringkas & Proporsional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dokumen Proposal <span className="text-gray-400 font-normal">(PDF / DOCX, maks 10MB)</span>
                </label>
                
                <div className="border border-dashed border-gray-300 bg-[#FBF9F4] hover:bg-[#F5F2EB] rounded-xl p-3 text-center transition-colors">
                  {formData.fileName ? (
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 overflow-hidden text-left">
                        <FileText className="w-5 h-5 text-[#2E8068] flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {formData.fileName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <label 
                          htmlFor="proposal-file-upload"
                          className="text-[11px] font-semibold text-[#063F35] bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded cursor-pointer"
                        >
                          Ganti
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, file: null, fileName: null })}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 px-1.5 py-1"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 flex flex-col items-center justify-center gap-1">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-xs text-gray-600">
                        Pilih file dokumen proposal Anda
                      </div>
                      <label 
                        htmlFor="proposal-file-upload" 
                        className="mt-1.5 inline-block bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-2xs hover:bg-gray-50 cursor-pointer transition-all active:scale-95"
                      >
                        Pilih File Dokumen
                      </label>
                    </div>
                  )}

                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="hidden"
                    id="proposal-file-upload"
                  />
                </div>
              </div>

            </div>

            {/* FIXED FOOTER (Always visible at the bottom) */}
            <div className="px-5 py-3 sm:px-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 bg-[#F4B91F] hover:bg-[#e0a719] text-[#063F35] font-bold px-5 py-2 rounded-lg text-xs sm:text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Proposal</span>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
