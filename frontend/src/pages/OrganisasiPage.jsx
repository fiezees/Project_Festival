import React, { useEffect } from 'react';
import { ArrowDown, ArrowLeft, Leaf, Users } from 'lucide-react';

const ORGANIZATION_LEVELS = [
  {
    id: 'yayasan',
    label: 'Yayasan',
    description: 'Menaungi arah, nilai, dan tujuan gerakan Galapagos.',
    roles: [
      ['Ketua Yayasan', 'nama1'],
      ['Sekretaris Yayasan', 'nama2'],
      ['Bendahara Yayasan', 'nama3'],
    ],
  },
  {
    id: 'perkumpulan',
    label: 'Perkumpulan',
    description: 'Menghubungkan anggota dan pengurus dalam kegiatan bersama.',
    roles: [
      ['Ketua Perkumpulan', 'nama4'],
      ['Sekretaris Perkumpulan', 'nama5'],
      ['Anggota Perkumpulan', 'nama6'],
    ],
  },
  {
    id: 'sispala',
    label: 'SISPALA (Simpala)',
    description: 'Ruang pembinaan siswa pecinta alam dan kaderisasi generasi muda.',
    roles: [
      ['Pembina SISPALA', 'nama7'],
      ['Pengurus SISPALA', 'nama8'],
      ['Anggota SISPALA', 'nama9'],
    ],
  },
];

export default function OrganisasiPage({ initialSection, onNavigateHome }) {
  useEffect(() => {
    if (!initialSection) return;
    document.getElementById(`organisasi-${initialSection}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [initialSection]);

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#1B3226]">
      <header className="sticky top-0 z-30 border-b border-[#1B3226]/10 bg-[#F7F3E8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 font-bold text-[#1B3226] transition-colors hover:text-[#5C7457]"
          >
            <ArrowLeft size={18} />
            Kembali ke Galapagos
          </button>
          <nav aria-label="Tingkatan organisasi" className="flex flex-wrap gap-2">
            {ORGANIZATION_LEVELS.map((level) => (
              <a
                key={level.id}
                href={`#organisasi-${level.id}`}
                className="rounded-full border border-[#5C7457]/25 bg-white/70 px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#E5A93C]/20"
              >
                {level.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#5C7457]/10 px-4 py-2 text-sm font-semibold text-[#5C7457]">
            <Users size={16} />
            Struktur Organisasi Galapagos
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Satu gerakan, tiga tingkatan
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#4A443B] sm:text-lg">
            Galapagos bergerak melalui Yayasan, Perkumpulan, dan SISPALA
            (Simpala). Pilih tingkatan untuk melihat susunan pengurus dan anggota.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {ORGANIZATION_LEVELS.map((level, index) => (
            <React.Fragment key={level.id}>
              <a
                href={`#organisasi-${level.id}`}
                className="w-full max-w-xs rounded-2xl border border-[#1B3226]/10 bg-white px-6 py-5 text-left shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md sm:w-auto"
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-[#5C7457]">
                  Tingkat {index + 1}
                </span>
                <span className="mt-1 block text-lg font-extrabold">{level.label}</span>
              </a>
              {index < ORGANIZATION_LEVELS.length - 1 && (
                <ArrowDown className="shrink-0 text-[#E5A93C] sm:rotate-[-90deg]" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-14 space-y-8">
          {ORGANIZATION_LEVELS.map((level, index) => (
            <section
              key={level.id}
              id={`organisasi-${level.id}`}
              className="scroll-mt-28 rounded-3xl border border-[#1B3226]/10 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1B3226]/10 pb-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-[#5C7457]">
                    Tingkat {index + 1}
                  </p>
                  <h2 className="mt-1 text-2xl font-black sm:text-3xl">{level.label}</h2>
                  <p className="mt-2 max-w-2xl text-[#4A443B]">{level.description}</p>
                </div>
                <Leaf className="text-[#5C7457]" size={28} aria-hidden="true" />
              </div>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {level.roles.map(([role, name]) => (
                  <li
                    key={role}
                    className="rounded-2xl bg-[#F7F3E8] px-5 py-4"
                  >
                    <span className="block text-sm font-semibold text-[#5C7457]">{role}</span>
                    <span className="mt-1 block font-bold text-[#1B3226]">{name}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
