import React, { useState } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';

export default function ProposalModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    email: '',
    phone: '',
    notes: '',
    fileName: null
  });

  const [registrationId, setRegistrationId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setRegistrationId(`FTH2026-REG-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      teamName: '',
      leaderName: '',
      email: '',
      phone: '',
      notes: '',
      fileName: null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-[#1a1a1a] rounded-lg shadow-xl p-6 sm:p-8 my-8">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded text-[#6b7280] hover:text-[#1a1a1a] focus:outline-none transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-[#2E8068]" />
            </div>

            <h3 className="text-2xl font-bold text-[#063F35]">
              Proposal Berhasil Dikirim!
            </h3>

            <p className="text-[#374151] text-sm max-w-md mx-auto leading-relaxed">
              Terima kasih, <strong>{formData.teamName || 'Tim Peserta'}</strong>! Proposal aksi penanaman Anda telah terdata di sistem Festival Tanam Hulu 2026. Panitia akan mengonfirmasi via WhatsApp/Email.
            </p>

            <div className="bg-[#F7F5EF] border border-[#e5e7eb] p-4 rounded-lg text-left text-sm space-y-2 max-w-md mx-auto">
              <div><span className="font-semibold text-[#063F35]">Nomor Pendaftaran:</span> {registrationId}</div>
              <div><span className="font-semibold text-[#063F35]">Nama Tim:</span> {formData.teamName}</div>
              <div><span className="font-semibold text-[#063F35]">Ketua / Penanggung Jawab:</span> {formData.leaderName}</div>
              <div><span className="font-semibold text-[#063F35]">Kontak:</span> {formData.email} • {formData.phone}</div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="bg-[#F4B91F] hover:bg-[#e0a719] text-[#063F35] font-semibold px-8 py-3 rounded-lg text-sm transition-colors"
            >
              Tutup & Kembali
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-[#063F35]">
                Ajukan Proposal Tim
              </h3>
              <p className="text-sm text-[#374151]">
                Isi formulir berikut untuk mengajukan tim atau komunitas Anda sebagai peserta Festival Tanam Hulu 2026.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Nama Tim / Komunitas / Sekolah *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pemuda Pauh Hijau"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full bg-white border border-[#d1d5db] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Nama Ketua / Penanggung Jawab *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Rinaldi"
                    value={formData.leaderName}
                    onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                    className="w-full bg-white border border-[#d1d5db] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Email Kontak *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@komunitas.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-[#d1d5db] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    No. WhatsApp / Telepon *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-[#d1d5db] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  File Dokumen Proposal (PDF/DOCX)
                </label>
                <div className="border-2 border-dashed border-[#d1d5db] bg-[#F7F5EF] rounded-lg p-5 text-center transition-colors cursor-pointer hover:bg-gray-50">
                  <Upload className="w-6 h-6 text-[#6b7280] mx-auto mb-2" />
                  <span className="text-sm text-[#374151] block font-medium">
                    {formData.fileName ? `Dokumen: ${formData.fileName}` : 'Klik atau seret file proposal ke sini'}
                  </span>
                  <span className="text-xs text-[#6b7280] block mt-1">Format PDF / DOCX, maks 10MB</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setFormData({ ...formData, fileName: e.target.files[0].name });
                      }
                    }}
                    className="hidden"
                    id="proposal-file-upload"
                  />
                  <label htmlFor="proposal-file-upload" className="inline-block mt-3 bg-white border border-[#d1d5db] text-[#374151] hover:bg-gray-50 text-sm px-4 py-1.5 rounded-lg cursor-pointer">
                    Pilih File
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="bg-[#F4B91F] hover:bg-[#e0a719] text-[#063F35] font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Kirim Proposal
                </button>
              </div>

            </form>

          </div>
        )}

      </div>
    </div>
  );
}
